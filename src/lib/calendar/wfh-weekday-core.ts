import { getTokyoJsDay, toTokyoDateString } from "./timezone";

/** profiles.default_wfh_weekday (0=Mon…4=Fri) → JS getDay (1=Mon…5=Fri) */
export function profileWeekdayToJsDay(weekday: number): number {
  return weekday + 1;
}

export function isDefaultWfhDay(
  defaultWfhWeekday: number | null | undefined,
  dateInput: string | Date,
): boolean {
  if (defaultWfhWeekday === null || defaultWfhWeekday === undefined) {
    return false;
  }
  const dateStr = toTokyoDateString(dateInput);
  return getTokyoJsDay(dateStr) === profileWeekdayToJsDay(defaultWfhWeekday);
}
