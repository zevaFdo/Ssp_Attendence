"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const sectionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  section_head_id: z.string().uuid().nullable().optional(),
});

export async function upsertSection(formData: FormData) {
  const headRaw = formData.get("section_head_id");
  const parsed = sectionSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    section_head_id: headRaw ? String(headRaw) : null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    section_head_id: parsed.data.section_head_id ?? null,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("sections")
      .update(payload)
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("sections").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/sections");
  return { ok: true as const };
}

export async function deleteSection(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };
  const supabase = await createClient();
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sections");
  return { ok: true as const };
}
