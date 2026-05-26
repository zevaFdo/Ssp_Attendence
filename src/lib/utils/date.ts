import { format, formatDistanceToNow, isToday, parseISO } from "date-fns";

export function formatDate(input: string | Date, pattern = "yyyy-MM-dd") {
  const d = typeof input === "string" ? parseISO(input) : input;
  return format(d, pattern);
}

export function formatTime(input: string | Date) {
  const d = typeof input === "string" ? parseISO(input) : input;
  return format(d, "HH:mm");
}

export function formatDateTime(input: string | Date) {
  const d = typeof input === "string" ? parseISO(input) : input;
  return format(d, "yyyy-MM-dd HH:mm");
}

export function relativeTime(input: string | Date) {
  const d = typeof input === "string" ? parseISO(input) : input;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function isTodayISO(input: string) {
  return isToday(parseISO(input));
}
