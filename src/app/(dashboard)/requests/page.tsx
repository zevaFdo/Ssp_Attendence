import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { hasMasterView } from "@/lib/auth/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { formatLocalized } from "@/lib/utils/date";
import { Plus, FileText } from "lucide-react";
import type { Locale as AppLocale } from "@/i18n/config";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("requests.metaList") };
}

export default async function RequestsListPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const masterView = hasMasterView(profile.role);
  const t = await getTranslations("requests");
  const tApprovals = await getTranslations("approvals.labels");
  const locale = (await getLocale()) as AppLocale;

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
            {masterView ? t("listTitleAll") : t("listTitleMine")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {masterView ? t("listSubtitleAll") : t("listSubtitleMine")}
          </p>
        </div>
        <Button asChild>
          <Link href="/requests/new">
            <Plus className="h-4 w-4" />
            {t("newRequest")}
          </Link>
        </Button>
      </div>

      {(rows ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("emptyBody")}
            </p>
            <Button asChild>
              <Link href="/requests/new">{t("submitRequest")}</Link>
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
                      {t("for", {
                        date: formatLocalized(r.date, "mediumDate", locale),
                      })}{" "}
                      ·{" "}
                      {t("submitted", {
                        date: formatLocalized(
                          r.created_at,
                          "shortDate",
                          locale,
                        ),
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <RequestStatusBadge
                      label={tApprovals("hr")}
                      status={r.hr_approval}
                    />
                    <RequestStatusBadge
                      label={tApprovals("sectionHead")}
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
