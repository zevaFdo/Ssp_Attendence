"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  canRegisterEmployees,
  isAdmin,
} from "@/lib/auth/permissions";
import type { Profile, UserRole } from "@/types/app";
import { translateZodIssue } from "@/lib/validations/translate";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("validation.emailInvalid"),
  full_name: z.string().min(2, "validation.fullNameMin"),
  role: z.enum([
    "admin",
    "hr_supervisor",
    "section_head",
    "team_leader",
    "employee",
  ]),
  section_id: z.string().uuid().optional().or(z.literal("")),
  team_id: z.string().uuid().optional().or(z.literal("")),
});

async function actor(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data ?? null) as Profile | null;
}

export async function inviteEmployee(formData: FormData) {
  const tErr = await getTranslations("errors");
  const me = await actor();
  if (!canRegisterEmployees(me?.role)) return { error: tErr("forbidden") };

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    section_id: formData.get("section_id") || undefined,
    team_id: formData.get("team_id") || undefined,
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }

  // Non-admins can only invite employees, not promote.
  if (!isAdmin(me?.role) && parsed.data.role !== "employee") {
    return { error: tErr("adminOnlyInvite") };
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: {
        full_name: parsed.data.full_name,
        role: parsed.data.role,
      },
      redirectTo: `${process.env.APP_URL ?? ""}/login`,
    },
  );
  if (inviteErr || !invited.user) {
    return { error: inviteErr?.message ?? tErr("invitedFailed") };
  }

  // Trigger handle_new_auth_user has already created the profile row.
  // Update section/team assignment.
  const updates: Partial<Profile> = {};
  if (parsed.data.section_id) updates.section_id = parsed.data.section_id;
  if (parsed.data.team_id) updates.team_id = parsed.data.team_id;
  if (Object.keys(updates).length > 0) {
    await admin
      .from("profiles")
      .update(updates)
      .eq("id", invited.user.id);
  }

  revalidatePath("/employees");
  revalidatePath("/admin/users");
  return { ok: true as const };
}

const updateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, "validation.fullNameMin"),
  role: z.enum([
    "admin",
    "hr_supervisor",
    "section_head",
    "team_leader",
    "employee",
  ]),
  section_id: z.string().uuid().nullable().optional(),
  team_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function updateEmployee(formData: FormData) {
  const tErr = await getTranslations("errors");
  const me = await actor();
  if (!canRegisterEmployees(me?.role)) return { error: tErr("forbidden") };

  const sectionRaw = formData.get("section_id");
  const teamRaw = formData.get("team_id");

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    section_id: sectionRaw ? String(sectionRaw) : null,
    team_id: teamRaw ? String(teamRaw) : null,
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }

  // Use admin client for the update so RLS column-lock triggers can be enforced
  // by the SECURITY DEFINER trigger logic (caller role is preserved via auth.uid).
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      role: parsed.data.role as UserRole,
      section_id: parsed.data.section_id ?? null,
      team_id: parsed.data.team_id ?? null,
      is_active: parsed.data.is_active ?? true,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/employees");
  revalidatePath("/admin/users");
  return { ok: true as const };
}
