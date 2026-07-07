import * as holiday_jp from "@holiday-jp/holiday_jp";
import { toTokyoDateString } from "./timezone";

/** 日本の祝日（@holiday-jp/holiday_jp — サーバー専用） */
export function isJapanNationalHoliday(input: string | Date): boolean {
  const dateStr = toTokyoDateString(input);
  const d = new Date(`${dateStr}T12:00:00+09:00`);
  return holiday_jp.isHoliday(d);
}

/** 指定年の祝日一覧（管理 UI 用） */
export function listJapanNationalHolidays(year: number) {
  const start = new Date(`${year}-01-01T12:00:00+09:00`);
  const end = new Date(`${year}-12-31T12:00:00+09:00`);
  return holiday_jp.between(start, end);
}
