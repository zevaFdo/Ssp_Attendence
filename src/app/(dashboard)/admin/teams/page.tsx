import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { TeamForm } from "@/components/admin/TeamForm";
import type { Profile } from "@/types/app";

export const metadata = { title: "Admin · Teams" };
export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile?.role)) redirect("/");

  const supabase = await createClient();
  const [{ data: sections }, { data: teams }, { data: profiles }] =
    await Promise.all([
      supabase.from("sections").select("*").order("name"),
      supabase.from("teams").select("*").order("name"),
      supabase
        .from("profiles")
        .select("*")
        .in("role", ["team_leader", "admin"])
        .order("full_name"),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin · Teams</h1>
        <p className="text-sm text-muted-foreground">
          Group employees into teams and assign Team Leaders.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">New team</h2>
        <TeamForm
          sections={sections ?? []}
          candidates={(profiles ?? []) as Profile[]}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Existing teams</h2>
        <div className="grid gap-3">
          {(teams ?? []).map((t) => (
            <TeamForm
              key={t.id}
              team={t}
              sections={sections ?? []}
              candidates={(profiles ?? []) as Profile[]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
