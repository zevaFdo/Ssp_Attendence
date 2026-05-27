import { format, formatDistanceToNow, isToday, parseISO } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import type { Locale as AppLocale } from "@/i18n/config";

const dfLocale = (loc: AppLocale | undefined) =>
  loc === "en" ? enUS : ja;

function parse(input: string | Date) {
  return typeof input === "string" ? parseISO(input) : input;
}

export function formatDate(
  input: string | Date,
  pattern = "yyyy-MM-dd",
  locale?: AppLocale,
) {
  return format(parse(input), pattern, { locale: dfLocale(locale) });
}

export function formatTime(input: string | Date, locale?: AppLocale) {
  return format(parse(input), "HH:mm", { locale: dfLocale(locale) });
}

export function formatDateTime(input: string | Date, locale?: AppLocale) {
  const pattern =
    locale === "en" ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd HH:mm";
  return format(parse(input), pattern, { locale: dfLocale(locale) });
}

export function relativeTime(input: string | Date, locale?: AppLocale) {
  return formatDistanceToNow(parse(input), {
    addSuffix: true,
    locale: dfLocale(locale),
  });
}

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function isTodayISO(input: string) {
  return isToday(parseISO(input));
}

/**
 * Locale-aware date pattern presets. Useful when a single semantic
 * format ("long-date", "short-date") needs different layouts per locale.
 */
export const DATE_PATTERNS = {
  longDate: { ja: "yyyy年M月d日(EEE)", en: "EEEE, MMMM d, yyyy" },
  mediumDate: { ja: "yyyy年M月d日", en: "MMM d, yyyy" },
  shortDate: { ja: "M月d日", en: "MMM d" },
  shortDateTime: { ja: "M月d日 HH:mm", en: "MMM d HH:mm" },
} as const;

export type DatePatternKey = keyof typeof DATE_PATTERNS;

export function formatLocalized(
  input: string | Date,
  key: DatePatternKey,
  locale: AppLocale,
) {
  const pattern = DATE_PATTERNS[key][locale];
  return format(parse(input), pattern, { locale: dfLocale(locale) });
}
