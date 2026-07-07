import "server-only";

import { createClient } from "@/lib/supabase/server";

export {
  isDefaultWfhDay,
  profileWeekdayToJsDay,
} from "./wfh-weekday-core";

export async function getDefaultWfhWeekday(
  userId: string,
): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("default_wfh_weekday")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data?.default_wfh_weekday ?? null;
}
