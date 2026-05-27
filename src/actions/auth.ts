"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale } from "@/i18n/config";
import { setLocaleCookie } from "@/i18n/locale";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", data.user.id)
      .single();
    if (profile && isLocale(profile.preferred_language)) {
      await setLocaleCookie(profile.preferred_language);
    }
  }

  revalidatePath("/", "layout");
  redirect(next || "/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Server-side helper used in client components that want to localize the
// sign-in error returned by Supabase. Kept here for symmetry with other
// auth flows; not currently invoked.
export async function getAuthErrorMessage(_code: string): Promise<string> {
  const t = await getTranslations("errors");
  return t("notAuthenticated");
}
