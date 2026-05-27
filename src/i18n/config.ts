export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
};
