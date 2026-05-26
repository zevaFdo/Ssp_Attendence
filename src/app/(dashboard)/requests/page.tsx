import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { hasMasterView } from "@/lib/auth/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { format, parseISO } from "date-fns";
import { Plus, FileText } from "lucide-react";

export const metadata = { title: "Requests · Attendance Web" };

export default async function RequestsListPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const masterView = hasMasterView(profile.role);

  const supabase = await createClient();
  let query = supabase
    .from("requests")
    .select(
      "id, type, date, reason, hr_approval, section_head_approval, created_at, profiles!requests_user_id_fkey(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (!masterView) query = query.eq("user_id", profile.id);

  const { data: rows } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {masterView ? "All Requests" : "My Requests"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {masterView
              ? "Every leave/late submission across the organization."
              : "Your submitted leave and late-arrival requests."}
          </p>
        </div>
        <Button asChild>
          <Link href="/requests/new">
            <Plus className="h-4 w-4" />
            New request
          </Link>
        </Button>
      </div>

      {(rows ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No requests yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Submit a leave or late-arrival request and we’ll route it through
              the approval workflow automatically.
            </p>
            <Button asChild>
              <Link href="/requests/new">Submit a request</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {(rows ?? []).map((r) => (
            <li key={r.id}>
              <Link
                href={`/requests/${r.id}`}
                className="block rounded-lg border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
                        {r.type}
                      </span>
                      {masterView ? (
                        <span className="truncate text-sm font-medium">
                          {r.profiles?.full_name ?? "—"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {r.reason}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      For {format(parseISO(r.date), "MMM d, yyyy")} · submitted{" "}
                      {format(parseISO(r.created_at), "MMM d")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <RequestStatusBadge label="HR" status={r.hr_approval} />
                    <RequestStatusBadge
                      label="Section Head"
                      status={r.section_head_approval}
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
