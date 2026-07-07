/** Asia/Tokyo 暦日（YYYY-MM-DD）への正規化 */

const TOKYO_OFFSET = "+09:00";

export function toTokyoDateString(input: string | Date): string {
  if (typeof input === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(input);
    if (match) return match[1];
  }
  const d = typeof input === "string" ? new Date(input) : input;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

/** JS getDay() in Asia/Tokyo: 0=Sun … 6=Sat */
export function getTokyoJsDay(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00${TOKYO_OFFSET}`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(d);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? d.getUTCDay();
}

export function isWeekend(dateStr: string): boolean {
  const day = getTokyoJsDay(dateStr);
  return day === 0 || day === 6;
}
