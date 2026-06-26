import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database.types";
import { getSupabaseTestKey, hasSupabaseTestEnv } from "./helpers/env";

const describeIfSupabase = hasSupabaseTestEnv() ? describe : describe.skip;

describeIfSupabase("Supabase connectivity (smoke)", () => {
  it("reads sections table via real PostgreSQL", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient<Database>(url, getSupabaseTestKey());

    const { data, error } = await supabase
      .from("sections")
      .select("id")
      .limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
