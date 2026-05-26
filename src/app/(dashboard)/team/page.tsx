import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { canManageTeam } from "@/lib/auth/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { TeamMemberRow } from "@/components/team/TeamMemberRow";
import { todayISO } from "@/lib/utils/date";
import type { AttendanceStatus } from "@/types/app";

export const metadata = { title: "My Team · Attendance Web" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (!canManageTeam(profile.role)) redirect("/");
  if (!profile.team_id) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">You aren’t assigned to a team yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask an admin to assign you a team.
          </p>
        </CardContent>
      </Card>
    );
  }

  const supabase = await createClient();
  const today = todayISO();
  const [{ data: members }, { data: attendance }, { data: team }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .eq("team_id", profile.team_id)
        .eq("is_active", true)
        .order("full_name"),
      supabase.from("attendance").select("user_id, status").eq("date", today),
      supabase
        .from("teams")
        .select("name, sections(name)")
        .eq("id", profile.team_id)
        .single(),
    ]);

  const statusMap = new Map(
    (attendance ?? []).map((a) => [a.user_id, a.status as AttendanceStatus]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
        <p className="text-sm text-muted-foreground">
          {team?.name ?? "Team"}
          {team?.sections?.name ? ` · ${team.sections.name}` : ""}
          {" · today’s status"}
        </p>
      </div>

      {(members ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No team members yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-2">
          {(members ?? []).map((m) => (
            <TeamMemberRow
              key={m.id}
              member={{
                id: m.id,
                full_name: m.full_name,
                avatar_url: m.avatar_url,
                email: m.email,
                status: statusMap.get(m.id) ?? null,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
