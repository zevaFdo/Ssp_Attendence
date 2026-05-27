import "server-only";
import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_S,
  defaultLocale,
  isLocale,
  type Locale,
} from "./config";

export async function readLocaleFromCookie(): Promise<Locale | null> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : null;
}

export function detectFromAcceptLanguage(headerValue: string | null): Locale {
  if (!headerValue) return defaultLocale;
  const first = headerValue
    .split(",")[0]
    ?.trim()
    .toLowerCase()
    .split(";")[0];
  if (!first) return defaultLocale;
  if (first.startsWith("ja")) return "ja";
  if (first.startsWith("en")) return "en";
  return defaultLocale;
}

export async function resolveRequestLocale(): Promise<Locale> {
  const fromCookie = await readLocaleFromCookie();
  if (fromCookie) return fromCookie;
  const h = await headers();
  return detectFromAcceptLanguage(h.get("accept-language"));
}

export async function setLocaleCookie(locale: Locale): Promise<void> {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE_S,
    sameSite: "lax",
    path: "/",
  });
}
