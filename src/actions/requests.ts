"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestCreateSchema } from "@/lib/validations/requests";
import { postRequestToTeams } from "@/lib/teams/webhook";

export async function createRequest(formData: FormData) {
  const parsed = requestCreateSchema.safeParse({
    type: formData.get("type"),
    date: formData.get("date"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
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
    return { error: error?.message ?? "Failed to create request" };
  }

  // Fire-and-forget: post to Microsoft Teams. Don't fail the whole action if it errors.
  void postRequestToTeams({
    employeeName: profile?.full_name ?? user.email ?? "Employee",
    type: parsed.data.type,
    date: parsed.data.date,
    reason: parsed.data.reason,
    appUrl: process.env.APP_URL,
    requestId: inserted.id,
  });

  revalidatePath("/requests");
  revalidatePath("/approvals");
  redirect(`/requests/${inserted.id}`);
}
