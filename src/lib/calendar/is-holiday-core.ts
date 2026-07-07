import { isCompanySpecialHoliday } from "./company-special";
import { isJapanNationalHoliday } from "./jp-national";
import { isWeekend, toTokyoDateString } from "./timezone";

/** ユニットテスト用: カスタム休日集合を注入して同期判定 */
export function isHolidaySync(
  input: string | Date,
  customDates: Set<string>,
): boolean {
  const dateStr = toTokyoDateString(input);
  if (isWeekend(dateStr)) return true;
  if (isCompanySpecialHoliday(dateStr)) return true;
  if (isJapanNationalHoliday(dateStr)) return true;
  if (customDates.has(dateStr)) return true;
  return false;
}
