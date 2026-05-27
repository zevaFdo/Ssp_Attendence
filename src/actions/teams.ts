"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { translateZodIssue } from "@/lib/validations/translate";
import { z } from "zod";

const teamSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  section_id: z.string().uuid(),
  team_leader_id: z.string().uuid().nullable().optional(),
});

export async function upsertTeam(formData: FormData) {
  const leaderRaw = formData.get("team_leader_id");
  const parsed = teamSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    section_id: formData.get("section_id"),
    team_leader_id: leaderRaw ? String(leaderRaw) : null,
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }
  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    section_id: parsed.data.section_id,
    team_leader_id: parsed.data.team_leader_id ?? null,
  };
  if (parsed.data.id) {
    const { error } = await supabase
      .from("teams")
      .update(payload)
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("teams").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/teams");
  return { ok: true as const };
}

export async function deleteTeam(formData: FormData) {
  const tErr = await getTranslations("errors");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: tErr("missingId") };
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/teams");
  return { ok: true as const };
}
