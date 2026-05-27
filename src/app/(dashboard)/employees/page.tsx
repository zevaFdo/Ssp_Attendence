import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { canRegisterEmployees, isAdmin } from "@/lib/auth/permissions";
import { InviteEmployeeForm } from "@/components/employees/InviteEmployeeForm";
import { EmployeeTable } from "@/components/employees/EmployeeTable";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("employees.metaTitle") };
}

export default async function EmployeesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (!canRegisterEmployees(profile.role)) redirect("/");

  const t = await getTranslations("employees");
  const supabase = await createClient();
  const [{ data: employees }, { data: sections }, { data: teams }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("full_name"),
      supabase.from("sections").select("*").order("name"),
      supabase.from("teams").select("*").order("name"),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <InviteEmployeeForm
        isAdmin={isAdmin(profile.role)}
        sections={sections ?? []}
        teams={teams ?? []}
      />

      <EmployeeTable
        employees={employees ?? []}
        sections={sections ?? []}
        teams={teams ?? []}
      />
    </div>
  );
}
