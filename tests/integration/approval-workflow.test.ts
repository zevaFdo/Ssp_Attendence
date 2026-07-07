import { createClient } from "@supabase/supabase-js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/types/database.types";
import { getSupabaseTestKey, hasSupabaseTestEnv } from "./helpers/env";

const describeIfSupabase = hasSupabaseTestEnv() ? describe : describe.skip;

describeIfSupabase("approval workflow (integration)", () => {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseTestKey(),
  );

  const createdRequestIds: string[] = [];

  let employeeId: string;
  let sectionHeadIds: string[] = [];
  let hrIds: string[] = [];

  beforeAll(async () => {
    const { data: employee } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "employee")
      .eq("is_active", true)
      .limit(1)
      .single();
    if (!employee) throw new Error("No employee profile for integration test");
    employeeId = employee.id;

    const { data: shs } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "section_head")
      .eq("is_active", true);
    sectionHeadIds = (shs ?? []).map((r) => r.id);
    if (sectionHeadIds.length === 0) {
      throw new Error("No section_head profiles for integration test");
    }

    const { data: hrs } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "hr_supervisor")
      .eq("is_active", true);
    hrIds = (hrs ?? []).map((r) => r.id);
    if (hrIds.length === 0) {
      throw new Error("No hr_supervisor profiles for integration test");
    }
  });

  afterEach(async () => {
    if (createdRequestIds.length === 0) return;
    await supabase
      .from("notifications")
      .delete()
      .in("related_request_id", createdRequestIds);
    await supabase.from("requests").delete().in("id", createdRequestIds);
    createdRequestIds.length = 0;
  });

  async function insertRequest() {
    const { data, error } = await supabase
      .from("requests")
      .insert({
        user_id: employeeId,
        type: "leave",
        date: "2026-12-01",
        reason: "integration test request",
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    createdRequestIds.push(data!.id);
    return data!.id;
  }

  it("notifies section heads (not HR only) on new request insert", async () => {
    const requestId = await insertRequest();

    const { data: notes } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("related_request_id", requestId);

    const notified = new Set((notes ?? []).map((n) => n.user_id));
    for (const shId of sectionHeadIds) {
      expect(notified.has(shId)).toBe(true);
    }
    for (const hrId of hrIds) {
      expect(notified.has(hrId)).toBe(false);
    }
  });

  it("requires rejection_reason when section head rejects", async () => {
    const requestId = await insertRequest();

    const { error } = await supabase
      .from("requests")
      .update({ section_head_approval: "rejected" })
      .eq("id", requestId);

    expect(error).not.toBeNull();
  });

  it("section head reject notifies applicant only (not HR)", async () => {
    const requestId = await insertRequest();

    const { error: upErr } = await supabase
      .from("requests")
      .update({
        section_head_approval: "rejected",
        rejection_reason: "テスト却下理由です",
      })
      .eq("id", requestId);
    expect(upErr).toBeNull();

    const { data: notes } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("related_request_id", requestId)
      .order("created_at", { ascending: false });

    const notified = new Set((notes ?? []).map((n) => n.user_id));
    expect(notified.has(employeeId)).toBe(true);
    for (const hrId of hrIds) {
      expect(notified.has(hrId)).toBe(false);
    }
  });

  it("section head approve then HR approve completes both stages", async () => {
    const requestId = await insertRequest();

    const { error: shErr } = await supabase
      .from("requests")
      .update({ section_head_approval: "approved" })
      .eq("id", requestId);
    expect(shErr).toBeNull();

    const { data: mid } = await supabase
      .from("requests")
      .select("section_head_approval, hr_approval")
      .eq("id", requestId)
      .single();
    expect(mid?.section_head_approval).toBe("approved");
    expect(mid?.hr_approval).toBe("pending");

    const { error: hrErr } = await supabase
      .from("requests")
      .update({ hr_approval: "approved" })
      .eq("id", requestId);
    expect(hrErr).toBeNull();

    const { data: done } = await supabase
      .from("requests")
      .select("section_head_approval, hr_approval")
      .eq("id", requestId)
      .single();
    expect(done?.section_head_approval).toBe("approved");
    expect(done?.hr_approval).toBe("approved");
  });
});
