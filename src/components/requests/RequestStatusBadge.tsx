import { cn } from "@/lib/utils";
import {
  APPROVAL_STATUS_CLASSES,
  APPROVAL_STATUS_LABEL,
} from "@/lib/utils/status";
import type { ApprovalStatus } from "@/types/app";

export function RequestStatusBadge({
  label,
  status,
}: {
  label: string;
  status: ApprovalStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        APPROVAL_STATUS_CLASSES[status],
      )}
    >
      <span className="font-semibold">{label}:</span>
      {APPROVAL_STATUS_LABEL[status]}
    </span>
  );
}
