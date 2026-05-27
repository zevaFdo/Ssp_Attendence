import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  canApproveAsHR,
  canApproveAsSectionHead,
} from "@/lib/auth/permissions";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalActions } from "@/components/requests/ApprovalActions";
import { formatLocalized } from "@/lib/utils/date";
import type { Locale as AppLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("approvals.metaTitle") };
}

export default async function ApprovalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const isHR = canApproveAsHR(profile.role);
  const isSH = canApproveAsSectionHead(profile.role);
  if (!isHR && !isSH) redirect("/");

  const t = await getTranslations("approvals");
  const locale = (await getLocale()) as AppLocale;

  const supabase = await createClient();

  const [{ data: hrPending }, { data: shPending }, { data: completed }] =
    await Promise.all([
      isHR
        ? supabase
            .from("requests")
            .select(
              "id, type, date, reason, created_at, profiles!requests_user_id_fkey(full_name, email)",
            )
            .eq("hr_approval", "pending")
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] }),
      isSH
        ? supabase
            .from("requests")
            .select(
              "id, type, date, reason, created_at, hr_approval, section_head_approval, profiles!requests_user_id_fkey(full_name, email)",
            )
            .eq("hr_approval", "approved")
            .eq("section_head_approval", "pending")
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] }),
      supabase
        .from("requests")
        .select(
          "id, type, date, reason, created_at, hr_approval, section_head_approval, profiles!requests_user_id_fkey(full_name)",
        )
        .or(
          "hr_approval.eq.rejected,section_head_approval.eq.approved,section_head_approval.eq.rejected",
        )
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

  const defaultTab = isHR ? "hr" : "sh";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {isHR ? (
            <TabsTrigger value="hr">
              {t("hrQueue", { count: hrPending?.length ?? 0 })}
            </TabsTrigger>
          ) : null}
          {isSH ? (
            <TabsTrigger value="sh">
              {t("shQueue", { count: shPending?.length ?? 0 })}
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="done">{t("recentlyDecided")}</TabsTrigger>
        </TabsList>

        {isHR ? (
          <TabsContent value="hr">
            <RequestQueue
              rows={hrPending ?? []}
              stage="hr"
              emptyMessage={t("noHrPending")}
              locale={locale}
            />
          </TabsContent>
        ) : null}

        {isSH ? (
          <TabsContent value="sh">
            <RequestQueue
              rows={shPending ?? []}
              stage="section_head"
              emptyMessage={t("noShPending")}
              locale={locale}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="done">
          <ul className="grid gap-3">
            {(completed ?? []).length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  {t("nothingDecided")}
                </CardContent>
              </Card>
            ) : (
              (completed ?? []).map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/requests/${r.id}`}
                    className="block rounded-lg border bg-card p-4 hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {r.profiles?.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.type.toUpperCase()} ·{" "}
                          {formatLocalized(r.date, "mediumDate", locale)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {r.reason}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <ApprovalSummary
                          hr={r.hr_approval}
                          sh={r.section_head_approval}
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QueueRow {
  id: string;
  type: "leave" | "late";
  date: string;
  reason: string;
  created_at: string;
  profiles?: { full_name?: string; email?: string } | null;
}

async function RequestQueue({
  rows,
  stage,
  emptyMessage,
  locale,
}: {
  rows: QueueRow[];
  stage: "hr" | "section_head";
  emptyMessage: string;
  locale: AppLocale;
}) {
  const t = await getTranslations("requests");
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }
  return (
    <ul className="grid gap-3">
      {rows.map((r) => (
        <li
          key={r.id}
          className="rounded-lg border bg-card p-4 transition hover:shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
                  {r.type}
                </span>
                <Link
                  href={`/requests/${r.id}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {r.profiles?.full_name ?? "—"}
                </Link>
              </div>
              <p className="mt-1 text-sm">{r.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("for", {
                  date: formatLocalized(r.date, "mediumDate", locale),
                })}{" "}
                ·{" "}
                {t("submitted", {
                  date: formatLocalized(
                    r.created_at,
                    "shortDateTime",
                    locale,
                  ),
                })}
              </p>
            </div>
            <ApprovalActions requestId={r.id} stage={stage} />
          </div>
        </li>
      ))}
    </ul>
  );
}

async function ApprovalSummary({
  hr,
  sh,
}: {
  hr: string;
  sh: string;
}) {
  const tStatus = await getTranslations("approvalStatus");
  const tLabels = await getTranslations("approvals.labels");
  return (
    <>
      <p>
        {tLabels("hr")}:{" "}
        <span className="font-medium">{tStatus(hr)}</span>
      </p>
      <p>
        {tLabels("sectionHead")}:{" "}
        <span className="font-medium">{tStatus(sh)}</span>
      </p>
    </>
  );
}
