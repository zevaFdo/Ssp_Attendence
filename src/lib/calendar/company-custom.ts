import "server-only";

import { createClient } from "@/lib/supabase/server";
import { toTokyoDateString } from "./timezone";

/** company_holidays テーブルから単日休日を取得 */
export async function fetchCustomHolidayDates(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_holidays")
    .select("holiday_date");
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.holiday_date));
}

export async function hasCustomHoliday(input: string | Date): Promise<boolean> {
  const dateStr = toTokyoDateString(input);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_holidays")
    .select("id")
    .eq("holiday_date", dateStr)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
