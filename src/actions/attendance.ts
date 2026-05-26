"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils/date";
import { overrideAttendanceSchema } from "@/lib/validations/attendance";

const LATE_HOUR_CUTOFF = 9;
const LATE_MINUTE_CUTOFF = 15;

function isLateNow() {
  const d = new Date();
  return (
    d.getHours() > LATE_HOUR_CUTOFF ||
    (d.getHours() === LATE_HOUR_CUTOFF && d.getMinutes() > LATE_MINUTE_CUTOFF)
  );
}

export async function clockIn(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const intent = String(formData.get("intent") ?? "present"); // 'present' | 'wfh'
  const today = todayISO();
  const now = new Date().toISOString();

  let status: "present" | "wfh" | "late" =
    intent === "wfh" ? "wfh" : "present";
  if (status === "present" && isLateNow()) status = "late";

  const { data: existing } = await supabase
    .from("attendance")
    .select("id, clock_in")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (existing?.clock_in) {
    return { error: "Already clocked in today." };
  }

  if (existing) {
    const { error } = await supabase
      .from("attendance")
      .update({ clock_in: now, status })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("attendance").insert({
      user_id: user.id,
      date: today,
      clock_in: now,
      status,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/attendance");
  return { ok: true as const };
}

export async function clockOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const today = todayISO();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("attendance")
    .select("id, clock_out")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (!existing) {
    return { error: "You haven’t clocked in yet today." };
  }
  if (existing.clock_out) {
    return { error: "Already clocked out today." };
  }

  const { error } = await supabase
    .from("attendance")
    .update({ clock_out: now })
    .eq("id", existing.id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/attendance");
  return { ok: true as const };
}

/**
 * Team-leader override: insert/update an attendance record for a member of
 * the leader's team. RLS allows this only when the target shares the team_id.
 */
export async function teamLeaderOverride(formData: FormData) {
  const parsed = overrideAttendanceSchema.safeParse({
    userId: formData.get("userId"),
    date: formData.get("date"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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
