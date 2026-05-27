import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_S,
  defaultLocale,
  isLocale,
  type Locale,
} from "@/i18n/config";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

function detectFromAcceptLanguage(headerValue: string | null): Locale {
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

function ensureLocaleCookie(request: NextRequest): {
  locale: Locale;
  needsWrite: boolean;
} {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) {
    return { locale: existing, needsWrite: false };
  }
  const locale = detectFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  return { locale, needsWrite: true };
}

export async function updateSession(request: NextRequest) {
  const { locale, needsWrite } = ensureLocaleCookie(request);
  if (needsWrite) {
    request.cookies.set(LOCALE_COOKIE, locale);
  }

  let supabaseResponse = NextResponse.next({ request });
  if (needsWrite) {
    supabaseResponse.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: LOCALE_COOKIE_MAX_AGE_S,
      sameSite: "lax",
      path: "/",
    });
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          if (needsWrite) {
            supabaseResponse.cookies.set(LOCALE_COOKIE, locale, {
              maxAge: LOCALE_COOKIE_MAX_AGE_S,
              sameSite: "lax",
              path: "/",
            });
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/api/health") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/favicon.ico";

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
