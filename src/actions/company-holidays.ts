"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { canManageCompanyHolidays } from "@/lib/auth/permissions";
import type { Profile } from "@/types/app";
import { translateZodIssue } from "@/lib/validations/translate";
import {
  companyHolidaySchema,
  companyHolidayUpdateSchema,
} from "@/lib/validations/company-holidays";

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

export async function createCompanyHoliday(formData: FormData) {
  const tErr = await getTranslations("errors");
  const me = await actor();
  if (!canManageCompanyHolidays(me?.role)) return { error: tErr("forbidden") };

  const parsed = companyHolidaySchema.safeParse({
    name: formData.get("name"),
    holiday_date: formData.get("holiday_date"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("company_holidays").insert({
    name: parsed.data.name,
    holiday_date: parsed.data.holiday_date,
    note: parsed.data.note || null,
    created_by: me!.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/settings/holidays");
  return { ok: true as const };
}

export async function updateCompanyHoliday(formData: FormData) {
  const tErr = await getTranslations("errors");
  const me = await actor();
  if (!canManageCompanyHolidays(me?.role)) return { error: tErr("forbidden") };

  const parsed = companyHolidayUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    holiday_date: formData.get("holiday_date"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: await translateZodIssue(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_holidays")
    .update({
      name: parsed.data.name,
      holiday_date: parsed.data.holiday_date,
      note: parsed.data.note || null,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/holidays");
  return { ok: true as const };
}

export async function deleteCompanyHoliday(holidayId: string) {
  const tErr = await getTranslations("errors");
  const me = await actor();
  if (!canManageCompanyHolidays(me?.role)) return { error: tErr("forbidden") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_holidays")
    .delete()
    .eq("id", holidayId);
  if (error) return { error: error.message };

  revalidatePath("/settings/holidays");
  return { ok: true as const };
}
