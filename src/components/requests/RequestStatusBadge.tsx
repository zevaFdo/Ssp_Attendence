"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { APPROVAL_STATUS_CLASSES } from "@/lib/utils/status";
import type { ApprovalStatus } from "@/types/app";

export function RequestStatusBadge({
  label,
  status,
}: {
  label: string;
  status: ApprovalStatus;
}) {
  const t = useTranslations("approvalStatus");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        APPROVAL_STATUS_CLASSES[status],
      )}
    >
      <span className="font-semibold">{label}:</span>
      {t(status)}
    </span>
  );
}
