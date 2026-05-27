"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/i18n/locale";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return { error: "Invalid locale" };

  await setLocaleCookie(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("profiles")
      .update({ preferred_language: locale })
      .eq("id", user.id);
  }

  revalidatePath("/", "layout");
  return { ok: true as const };
}
