import Link from "next/link";
import { notFound } from "next/navigation";
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
import { format, parseISO } from "date-fns";
import { Download, FileText, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/requests">
            <ArrowLeft className="h-4 w-4" />
            Back to requests
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
              <RequestStatusBadge label="HR" status={r.hr_approval} />
              <RequestStatusBadge
                label="Section Head"
                status={r.section_head_approval}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(parseISO(r.date), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="font-medium">
                {format(parseISO(r.created_at), "MMM d, yyyy HH:mm")}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Reason
            </p>
            <p className="mt-1 whitespace-pre-line rounded-md bg-muted/50 p-3 text-sm">
              {r.reason}
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                HR Decision
              </p>
              <p className="text-sm">
                {r.hr?.full_name ?? "Awaiting"}
                {r.hr_approved_at ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    · {format(parseISO(r.hr_approved_at), "MMM d HH:mm")}
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
                Section Head Decision
              </p>
              <p className="text-sm">
                {r.sh?.full_name ?? "Awaiting"}
                {r.section_head_approved_at ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ·{" "}
                    {format(parseISO(r.section_head_approved_at), "MMM d HH:mm")}
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
                  Available after HR approval.
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
                    Approval document ready
                  </p>
                  <p className="text-xs text-emerald-800">
                    PDF stored in Supabase Storage.
                  </p>
                </div>
              </div>
              {r.document_path ? (
                <Button asChild>
                  <Link href={`/api/requests/${r.id}/pdf`}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Link>
                </Button>
              ) : (
                <span className="text-xs text-emerald-800">
                  Generating…
                </span>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
