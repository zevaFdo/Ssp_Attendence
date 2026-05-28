import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { StatusBoard } from "@/components/dashboard/StatusBoard";
import type { StatusCardEmployee } from "@/components/dashboard/StatusCard";
import { ClockInOutCard } from "@/components/attendance/ClockInOutCard";
import { todayISO, formatLocalized } from "@/lib/utils/date";
import { getCurrentProfile } from "@/lib/auth/session";
import type { AttendanceStatus } from "@/types/app";
import type { Locale as AppLocale } from "@/i18n/config";

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: `${t("dashboard.title")} · ${t("common.appName")}`,
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const today = todayISO();
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("dashboard");
  const profile = await getCurrentProfile();

  const [
    { data: profiles },
    { data: attendance },
    { data: sections },
    { data: teams },
    mineTodayResult,
  ] = await Promise.all([
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
    profile
      ? supabase
          .from("attendance")
          .select("status, clock_in, clock_out")
          .eq("user_id", profile.id)
          .eq("date", today)
          .maybeSingle()
      : Promise.resolve({ data: null }),
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

  const mineToday = mineTodayResult?.data ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", {
            date: formatLocalized(new Date(), "longDate", locale),
          })}
        </p>
      </div>
      {profile ? <ClockInOutCard today={mineToday} /> : null}
      <StatusBoard
        employees={employees}
        currentUserId={profile?.id ?? null}
        currentUserToday={mineToday}
      />
    </div>
  );
}
