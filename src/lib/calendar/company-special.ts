import { toTokyoDateString } from "./timezone";

/** 年末年始 12/29–1/4、お盆 8/14–8/16（毎年繰り返し） */
export function isCompanySpecialHoliday(input: string | Date): boolean {
  const dateStr = toTokyoDateString(input);
  const [, month, day] = dateStr.split("-").map(Number);

  if (month === 12 && day >= 29) return true;
  if (month === 1 && day <= 4) return true;
  if (month === 8 && day >= 14 && day <= 16) return true;

  return false;
}
