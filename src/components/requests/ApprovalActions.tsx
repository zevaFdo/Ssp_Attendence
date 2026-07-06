"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { hrDecide, sectionHeadDecide } from "@/actions/approvals";
import { Check, Loader2, X } from "lucide-react";

interface Props {
  requestId: string;
  stage: "hr" | "section_head";
  disabled?: boolean;
}

export function ApprovalActions({ requestId, stage, disabled }: Props) {
  const t = useTranslations("approvals");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  function decide(decision: "approved" | "rejected", reason?: string) {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("requestId", requestId);
      fd.set("decision", decision);
      if (reason) fd.set("rejectionReason", reason);
      const result =
        stage === "hr" ? await hrDecide(fd) : await sectionHeadDecide(fd);
      if (result?.error) setError(result.error);
      if (
        result &&
        "warning" in result &&
        typeof result.warning === "string"
      ) {
        setWarning(result.warning);
      }
      if (result && "ok" in result && result.ok) {
        setRejectOpen(false);
        setRejectionReason("");
      }
    });
  }

  function submitReject() {
    if (rejectionReason.trim().length < 5) {
      setError(t("rejectionReasonTooShort"));
      return;
    }
    decide("rejected", rejectionReason.trim());
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          className="min-h-11 min-w-11"
          onClick={() => decide("approved")}
          disabled={disabled || isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {t("approve")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="min-h-11 min-w-11"
          onClick={() => {
            setError(null);
            setRejectOpen(true);
          }}
          disabled={disabled || isPending}
        >
          <X className="h-4 w-4" />
          {t("reject")}
        </Button>
      </div>
      {error ? (
        <p className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700">
          {error}
        </p>
      ) : null}
      {warning ? (
        <p className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
          {warning}
        </p>
      ) : null}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("rejectionDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`reject-reason-${requestId}`}>
              {t("rejectionReasonLabel")}
            </Label>
            <textarea
              id={`reject-reason-${requestId}`}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t("rejectionReasonPlaceholder")}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={1000}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setRejectOpen(false)}
              disabled={isPending}
            >
              {t("rejectionDialogCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              onClick={submitReject}
              disabled={isPending}
            >
              {t("rejectionDialogConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
