import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { UserRow } from "@/components/admin/UserRow";
import type { Profile } from "@/types/app";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("admin.users.metaTitle") };
}

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile?.role)) redirect("/");

  const t = await getTranslations("admin.users");
  const tEmployees = await getTranslations("employees.table");

  const supabase = await createClient();
  const [{ data: profiles }, { data: sections }, { data: teams }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("sections").select("*").order("name"),
      supabase.from("teams").select("*").order("name"),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3">{tEmployees("employee")}</th>
              <th className="px-3 py-3">{tEmployees("role")}</th>
              <th className="px-3 py-3">{tEmployees("section")}</th>
              <th className="px-3 py-3">{tEmployees("team")}</th>
              <th className="px-3 py-3">{t("active")}</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {(profiles ?? []).map((p) => (
              <UserRow
                key={p.id}
                profile={p as Profile}
                sections={sections ?? []}
                teams={teams ?? []}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
