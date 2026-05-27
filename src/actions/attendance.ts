"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils/date";
import {
  overrideAttendanceSchema,
  setStatusSchema,
} from "@/lib/validations/attendance";
import { translateZodIssue } from "@/lib/validations/translate";
import type { AttendanceStatus } from "@/types/app";

const LATE_HOUR_CUTOFF = 9;
const LATE_MINUTE_CUTOFF = 15;

function isLateNow() {
  const d = new Date();
  return (
    d.getHours() > LATE_HOUR_CUTOFF ||
    (d.getHours() === LATE_HOUR_CUTOFF && d.getMinutes() > LATE_MINUTE_CUTOFF)
  );
}

// Statuses that, when chosen as the very first action of the day,
// imply the employee has now started working (sets clock_in).
const CLOCK_IN_STATUSES = new Set<AttendanceStatus>([
  "present",
  "wfh",
  "late",
]);

// Mid-day "presence broadcast" statuses: only valid while clocked in
// and not yet clocked out. Status-only update, no timestamp changes.
const INTERMEDIATE_STATUSES = new Set<AttendanceStatus>([
  "present",
  "wfh",
  "meeting",
  "break",
  "out_of_office",
]);

/**
 * Unified server action behind the multi-status switcher on
 * ClockInOutCard. Implements the day-level state-machine:
 *
 *   NoRecord  --present/wfh/late-->  ClockedIn       (sets clock_in)
 *   NoRecord  --on_leave---------->  OnLeave         (terminal)
 *   ClockedIn --intermediate------>  ClockedIn       (status only)
 *   ClockedIn --clocked_out------->  ClockedOut      (sets clock_out)
 *   ClockedOut/OnLeave            -> terminal — rejects further changes
 */
export async function setAttendanceStatus(formData: FormData) {
  const tErr = await getTranslations("errors");

  const parsed = setStatusSchema.safeParse({
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }

  let nextStatus = parsed.data.status as AttendanceStatus;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tErr("notAuthenticated") };

  const today = todayISO();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("attendance")
    .select("id, clock_in, clock_out, status")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  // After clock_out the day is finalized — no further switching.
  if (existing?.clock_out) {
    return { error: tErr("dayFinalized") };
  }

  // No row yet today: only first-action statuses are allowed.
  if (!existing) {
    if (CLOCK_IN_STATUSES.has(nextStatus)) {
      if (nextStatus === "present" && isLateNow()) {
        nextStatus = "late";
      }
      const { error } = await supabase.from("attendance").insert({
        user_id: user.id,
        date: today,
        clock_in: now,
        status: nextStatus,
      });
      if (error) return { error: error.message };
    } else if (nextStatus === "on_leave") {
      const { error } = await supabase.from("attendance").insert({
        user_id: user.id,
        date: today,
        status: "on_leave",
      });
      if (error) return { error: error.message };
    } else {
      // meeting / break / out_of_office / clocked_out without a clock-in
      return { error: tErr("notClockedIn") };
    }

    revalidatePath("/");
    revalidatePath("/attendance");
    return { ok: true as const };
  }

  // Row exists but no clock_in yet (e.g. previously-set on_leave row).
  if (!existing.clock_in) {
    if (CLOCK_IN_STATUSES.has(nextStatus)) {
      if (nextStatus === "present" && isLateNow()) {
        nextStatus = "late";
      }
      const { error } = await supabase
        .from("attendance")
        .update({ clock_in: now, status: nextStatus })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else if (nextStatus === "on_leave") {
      const { error } = await supabase
        .from("attendance")
        .update({ status: "on_leave" })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      return { error: tErr("notClockedIn") };
    }

    revalidatePath("/");
    revalidatePath("/attendance");
    return { ok: true as const };
  }

  // Currently clocked in (no clock_out yet).
  if (nextStatus === "clocked_out") {
    const { error } = await supabase
      .from("attendance")
      .update({ clock_out: now, status: "clocked_out" })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else if (INTERMEDIATE_STATUSES.has(nextStatus)) {
    const { error } = await supabase
      .from("attendance")
      .update({ status: nextStatus })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else if (nextStatus === "late") {
    // Already clocked in — reclassifying as late is a status-only change.
    const { error } = await supabase
      .from("attendance")
      .update({ status: "late" })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else if (nextStatus === "on_leave") {
    // Switching to on_leave after starting work is unusual but allowed;
    // do not wipe the existing clock_in.
    const { error } = await supabase
      .from("attendance")
      .update({ status: "on_leave" })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    return { error: tErr("invalidStatusTransition") };
  }

  revalidatePath("/");
  revalidatePath("/attendance");
  return { ok: true as const };
}

/**
 * Team-leader override: insert/update an attendance record for a member of
 * the leader's team. RLS allows this only when the target shares the team_id.
 */
export async function teamLeaderOverride(formData: FormData) {
  const tErr = await getTranslations("errors");
  const parsed = overrideAttendanceSchema.safeParse({
    userId: formData.get("userId"),
    date: formData.get("date"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tErr("notAuthenticated") };

  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("user_id", parsed.data.userId)
    .eq("date", parsed.data.date)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("attendance")
      .update({
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
        recorded_by: user.id,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("attendance").insert({
      user_id: parsed.data.userId,
      date: parsed.data.date,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      recorded_by: user.id,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/team");
  revalidatePath("/");
  return { ok: true as const };
}
