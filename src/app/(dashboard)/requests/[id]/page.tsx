import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  canApproveAsHR,
  canApproveAsSectionHead,
} from "@/lib/auth/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApprovalActions } from "@/components/requests/ApprovalActions";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { formatLocalized } from "@/lib/utils/date";
import { Download, FileText, ArrowLeft } from "lucide-react";
import type { Locale as AppLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("requests.metaDetail") };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: r, error } = await supabase
    .from("requests")
    .select(
      `id, type, date, reason, created_at, document_path,
       hr_approval, hr_approved_at,
       section_head_approval, section_head_approved_at,
       user_id,
       profiles!requests_user_id_fkey ( full_name, email, role ),
       hr:profiles!requests_hr_approved_by_fkey ( full_name ),
       sh:profiles!requests_section_head_approved_by_fkey ( full_name )`,
    )
    .eq("id", id)
    .single();

  if (error || !r) notFound();

  const canHR =
    canApproveAsHR(profile.role) && r.hr_approval === "pending";
  const canSH =
    canApproveAsSectionHead(profile.role) &&
    r.hr_approval === "approved" &&
    r.section_head_approval === "pending";

  const fullyApproved =
    r.hr_approval === "approved" && r.section_head_approval === "approved";

  const t = await getTranslations("requests.detail");
  const tApprovals = await getTranslations("approvals.labels");
  const locale = (await getLocale()) as AppLocale;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/requests">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
                {r.type}
              </span>
              <h1 className="mt-2 text-2xl font-bold">
                {r.profiles?.full_name ?? "—"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {r.profiles?.email ?? ""}
              </p>
            </div>
            <div className="flex flex-col gap-2">
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

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t("date")}</p>
              <p className="font-medium">
                {formatLocalized(r.date, "mediumDate", locale)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("submitted")}</p>
              <p className="font-medium">
                {formatLocalized(r.created_at, "mediumDate", locale)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("reason")}
            </p>
            <p className="mt-1 whitespace-pre-line rounded-md bg-muted/50 p-3 text-sm">
              {r.reason}
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                {t("hrDecision")}
              </p>
              <p className="text-sm">
                {r.hr?.full_name ?? t("awaiting")}
                {r.hr_approved_at ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ·{" "}
                    {formatLocalized(r.hr_approved_at, "shortDateTime", locale)}
                  </span>
                ) : null}
              </p>
              {canHR ? (
                <div className="mt-2">
                  <ApprovalActions requestId={r.id} stage="hr" />
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                {t("sectionHeadDecision")}
              </p>
              <p className="text-sm">
                {r.sh?.full_name ?? t("awaiting")}
                {r.section_head_approved_at ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ·{" "}
                    {formatLocalized(
                      r.section_head_approved_at,
                      "shortDateTime",
                      locale,
                    )}
                  </span>
                ) : null}
              </p>
              {canSH ? (
                <div className="mt-2">
                  <ApprovalActions requestId={r.id} stage="section_head" />
                </div>
              ) : null}
              {!canSH && r.hr_approval !== "approved" ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("shAvailableAfterHr")}
                </p>
              ) : null}
            </div>
          </div>

          {fullyApproved ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {t("approvalDocumentReady")}
                  </p>
                  <p className="text-xs text-emerald-800">
                    {t("approvalDocumentSubtitle")}
                  </p>
                </div>
              </div>
              {r.document_path ? (
                <Button asChild>
                  <Link href={`/api/requests/${r.id}/pdf`}>
                    <Download className="h-4 w-4" />
                    {t("downloadPdf")}
                  </Link>
                </Button>
              ) : (
                <span className="text-xs text-emerald-800">
                  {t("generating")}
                </span>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
