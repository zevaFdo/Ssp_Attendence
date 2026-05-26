import { createClient } from "@/lib/supabase/server";
import { StatusBoard } from "@/components/dashboard/StatusBoard";
import type { StatusCardEmployee } from "@/components/dashboard/StatusCard";
import { todayISO } from "@/lib/utils/date";
import { format } from "date-fns";
import type { AttendanceStatus } from "@/types/app";

export const metadata = { title: "Status Board · Attendance Web" };

export default async function HomePage() {
  const supabase = await createClient();
  const today = todayISO();

  const [{ data: profiles }, { data: attendance }, { data: sections }, { data: teams }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, section_id, team_id")
        .eq("is_active", true)
        .order("full_name", { ascending: true }),
      supabase
        .from("attendance")
        .select("user_id, status, clock_in, clock_out")
        .eq("date", today),
      supabase.from("sections").select("id, name"),
      supabase.from("teams").select("id, name"),
    ]);

  const sectionMap = new Map((sections ?? []).map((s) => [s.id, s.name]));
  const teamMap = new Map((teams ?? []).map((t) => [t.id, t.name]));
  const attendanceMap = new Map(
    (attendance ?? []).map((a) => [a.user_id, a]),
  );

  const employees: StatusCardEmployee[] = (profiles ?? []).map((p) => {
    const att = attendanceMap.get(p.id);
    let status: AttendanceStatus | null = att?.status ?? null;
    if (!att) status = "absent";
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      avatar_url: p.avatar_url,
      role: p.role,
      section_name: p.section_id ? (sectionMap.get(p.section_id) ?? null) : null,
      team_name: p.team_id ? (teamMap.get(p.team_id) ?? null) : null,
      status,
      clock_in: att?.clock_in ?? null,
      clock_out: att?.clock_out ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daily Status Board</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")} · live updates
        </p>
      </div>
      <StatusBoard employees={employees} />
    </div>
  );
}
