"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requestCreateSchema } from "@/lib/validations/requests";
import { translateZodIssue } from "@/lib/validations/translate";
import { postRequestToTeams } from "@/lib/teams/webhook";
import { isLocale } from "@/i18n/config";

export async function createRequest(formData: FormData) {
  const tErr = await getTranslations("errors");
  const parsed = requestCreateSchema.safeParse({
    type: formData.get("type"),
    date: formData.get("date"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tErr("notAuthenticated") };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, preferred_language")
    .eq("id", user.id)
    .single();

  const { data: inserted, error } = await supabase
    .from("requests")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      date: parsed.data.date,
      reason: parsed.data.reason,
    })
    .select("id")
    .single();
  if (error || !inserted) {
    return { error: error?.message ?? tErr("failedToCreate") };
  }

  // Fire-and-forget: post to Microsoft Teams. Don't fail the whole action if it errors.
  void postRequestToTeams({
    employeeName: profile?.full_name ?? user.email ?? "Employee",
    type: parsed.data.type,
    date: parsed.data.date,
    reason: parsed.data.reason,
    appUrl: process.env.APP_URL,
    requestId: inserted.id,
    locale: isLocale(profile?.preferred_language)
      ? profile.preferred_language
      : "ja",
  });

  revalidatePath("/requests");
  revalidatePath("/approvals");
  redirect(`/requests/${inserted.id}`);
}
