import { createClient } from "@supabase/supabase-js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/types/database.types";
import { getSupabaseTestKey, getSupabaseAnonKey, hasSupabaseTestEnv } from "./helpers/env";

const describeIfSupabase = hasSupabaseTestEnv() ? describe : describe.skip;
const hasAnonKey = Boolean(getSupabaseAnonKey());

const DEMO_PASSWORD = "Password123!";

describeIfSupabase("company calendar & WFH (integration)", () => {
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseTestKey(),
  );

  const createdHolidayIds: string[] = [];
  let employeeId: string;
  let hrId: string;
  let sectionHeadId: string;
  let originalEmployeeWfh: number | null;

  async function signInClient(email: string) {
    const anonKey = getSupabaseAnonKey();
    if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY required for auth tests");
    const client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey,
    );
    const { error } = await client.auth.signInWithPassword({
      email,
      password: DEMO_PASSWORD,
    });
    if (error) throw error;
    return client;
  }

  beforeAll(async () => {
    const { data: employee } = await admin
      .from("profiles")
      .select("id, default_wfh_weekday")
      .eq("role", "employee")
      .eq("is_active", true)
      .limit(1)
      .single();
    if (!employee) throw new Error("No employee profile for integration test");
    employeeId = employee.id;
    originalEmployeeWfh = employee.default_wfh_weekday ?? null;

    const { data: hr } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "hr_supervisor")
      .eq("is_active", true)
      .limit(1)
      .single();
    if (!hr) throw new Error("No hr_supervisor profile for integration test");
    hrId = hr.id;

    const { data: sh } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "section_head")
      .eq("is_active", true)
      .limit(1)
      .single();
    if (!sh) throw new Error("No section_head profile for integration test");
    sectionHeadId = sh.id;
  });

  afterEach(async () => {
    if (createdHolidayIds.length > 0) {
      await admin.from("company_holidays").delete().in("id", createdHolidayIds);
      createdHolidayIds.length = 0;
    }
    await admin
      .from("profiles")
      .update({ default_wfh_weekday: originalEmployeeWfh })
      .eq("id", employeeId);
  });

  it.skipIf(!hasAnonKey)("allows HR to insert custom company holiday", async () => {
    const hrClient = await signInClient("hr1@demo.com");
    const { data, error } = await hrClient
      .from("company_holidays")
      .insert({
        name: "integration test holiday",
        holiday_date: "2099-06-15",
        created_by: hrId,
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    createdHolidayIds.push(data!.id);
  });

  it.skipIf(!hasAnonKey)("denies employee insert on company_holidays (RLS)", async () => {
    const empClient = await signInClient("emp.bk1@demo.com");
    const { error } = await empClient.from("company_holidays").insert({
      name: "forbidden holiday",
      holiday_date: "2099-06-16",
    });
    expect(error).not.toBeNull();
  });

  it.skipIf(!hasAnonKey)("allows HR to update default_wfh_weekday on another profile", async () => {
    const hrClient = await signInClient("hr1@demo.com");
    const { error } = await hrClient
      .from("profiles")
      .update({ default_wfh_weekday: 2 })
      .eq("id", employeeId);
    expect(error).toBeNull();

    const { data } = await admin
      .from("profiles")
      .select("default_wfh_weekday")
      .eq("id", employeeId)
      .single();
    expect(data?.default_wfh_weekday).toBe(2);
  });

  it.skipIf(!hasAnonKey)("reverts employee self-update of default_wfh_weekday", async () => {
    await admin
      .from("profiles")
      .update({ default_wfh_weekday: 1 })
      .eq("id", employeeId);

    const empClient = await signInClient("emp.bk1@demo.com");
    const { error } = await empClient
      .from("profiles")
      .update({ default_wfh_weekday: 3 })
      .eq("id", employeeId);
    expect(error).toBeNull();

    const { data } = await admin
      .from("profiles")
      .select("default_wfh_weekday")
      .eq("id", employeeId)
      .single();
    expect(data?.default_wfh_weekday).toBe(1);
  });

  it.skipIf(!hasAnonKey)("reverts section_head update of default_wfh_weekday on others", async () => {
    await admin
      .from("profiles")
      .update({ default_wfh_weekday: 0 })
      .eq("id", employeeId);

    const shClient = await signInClient("eng.head@demo.com");
    const { error } = await shClient
      .from("profiles")
      .update({ default_wfh_weekday: 4 })
      .eq("id", employeeId);
    expect(error).toBeNull();

    const { data } = await admin
      .from("profiles")
      .select("default_wfh_weekday")
      .eq("id", employeeId)
      .single();
    expect(data?.default_wfh_weekday).toBe(0);
  });
});
