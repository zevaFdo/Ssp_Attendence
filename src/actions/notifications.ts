"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export async function markRead(formData: FormData) {
  const tErr = await getTranslations("errors");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: tErr("missingId") };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tErr("notAuthenticated") };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function markAllRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
