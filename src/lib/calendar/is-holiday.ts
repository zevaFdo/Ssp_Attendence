import "server-only";

import { fetchCustomHolidayDates } from "./company-custom";
import { isHolidaySync } from "./is-holiday-core";
import { toTokyoDateString } from "./timezone";

/** 休日判定（土日・特別休日・祝日・会社独自休日） */
export async function isHoliday(input: string | Date): Promise<boolean> {
  const customDates = await fetchCustomHolidayDates();
  return isHolidaySync(input, customDates);
}

export { isHolidaySync, toTokyoDateString };
