import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { hasMasterView } from "@/lib/auth/permissions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AttendanceHistoryFilters } from "@/components/attendance/AttendanceHistoryFilters";
import { formatTime, formatLocalized } from "@/lib/utils/date";
import type { Locale as AppLocale } from "@/i18n/config";

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: `${t("attendance.history.title")} · ${t("common.appName")}`,
  };
}

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; q?: string }>;
}

export default async function AttendanceHistoryPage({ searchParams }: PageProps) {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const masterView = hasMasterView(profile.role);
  const sp = await searchParams;
  const t = await getTranslations("attendance.history");
  const locale = (await getLocale()) as AppLocale;

  const supabase = await createClient();
  let query = supabase
    .from("attendance")
    .select(
      "id, user_id, date, clock_in, clock_out, status, notes, profiles!attendance_user_id_fkey(full_name, email, role)",
    )
    .order("date", { ascending: false })
    .limit(500);

  if (!masterView) {
    query = query.eq("user_id", profile.id);
  }
  if (sp.from) query = query.gte("date", sp.from);
  if (sp.to) query = query.lte("date", sp.to);

  const { data: rows, error } = await query;

  let filtered = rows ?? [];
  if (masterView && sp.q) {
    const q = sp.q.toLowerCase();
    filtered = filtered.filter((r) =>
      (r.profiles?.full_name ?? "").toLowerCase().includes(q),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {masterView ? t("masterSubtitle") : t("selfSubtitle")}
        </p>
      </div>

      <AttendanceHistoryFilters showSearch={masterView} />

      {error ? (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {masterView ? (
                  <th className="px-4 py-3">{t("employee")}</th>
                ) : null}
                <th className="px-4 py-3">{t("date")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("in")}</th>
                <th className="px-4 py-3">{t("out")}</th>
                <th className="px-4 py-3">{t("notes")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={masterView ? 6 : 5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {t("noRecords")}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    {masterView ? (
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {r.profiles?.full_name ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.profiles?.email ?? ""}
                        </div>
                      </td>
                    ) : null}
                    <td className="px-4 py-3 tabular-nums">
                      {formatLocalized(r.date, "mediumDate", locale)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {r.clock_in ? formatTime(r.clock_in) : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {r.clock_out ? formatTime(r.clock_out) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.notes ?? ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ul className="divide-y md:hidden">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("noRecords")}
            </li>
          ) : (
            filtered.map((r) => (
              <li key={r.id} className="space-y-1 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    {masterView ? (
                      <p className="font-medium">
                        {r.profiles?.full_name ?? "—"}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {formatLocalized(r.date, "mediumDate", locale)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>
                    {t("in")}: {r.clock_in ? formatTime(r.clock_in) : "—"}
                  </span>
                  <span>
                    {t("out")}: {r.clock_out ? formatTime(r.clock_out) : "—"}
                  </span>
                </div>
                {r.notes ? (
                  <p className="text-xs text-muted-foreground">{r.notes}</p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
