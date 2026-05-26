import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { hasMasterView } from "@/lib/auth/permissions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AttendanceHistoryFilters } from "@/components/attendance/AttendanceHistoryFilters";
import { formatTime } from "@/lib/utils/date";
import { format, parseISO } from "date-fns";

export const metadata = { title: "Attendance History · Attendance Web" };

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; q?: string }>;
}

export default async function AttendanceHistoryPage({ searchParams }: PageProps) {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const masterView = hasMasterView(profile.role);
  const sp = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("attendance")
    .select(
      "id, user_id, date, clock_in, clock_out, status, notes, profiles(full_name, email, role)",
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
        <h1 className="text-2xl font-bold tracking-tight">Attendance History</h1>
        <p className="text-sm text-muted-foreground">
          {masterView
            ? "Master view — all employees. Filter by date range or search by name."
            : "Your personal attendance records."}
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
                {masterView ? <th className="px-4 py-3">Employee</th> : null}
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">In</th>
                <th className="px-4 py-3">Out</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={masterView ? 6 : 5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No records found.
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
                      {format(parseISO(r.date), "MMM d, yyyy")}
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
              No records found.
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
                      {format(parseISO(r.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>In: {r.clock_in ? formatTime(r.clock_in) : "—"}</span>
                  <span>Out: {r.clock_out ? formatTime(r.clock_out) : "—"}</span>
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
