import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { UserRow } from "@/components/admin/UserRow";
import type { Profile } from "@/types/app";

export const metadata = { title: "Admin · Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile?.role)) redirect("/");

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
        <h1 className="text-2xl font-bold tracking-tight">Admin · Users</h1>
        <p className="text-sm text-muted-foreground">
          Promote roles, assign sections and teams, or deactivate accounts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3">Employee</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Section</th>
              <th className="px-3 py-3">Team</th>
              <th className="px-3 py-3">Active</th>
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
