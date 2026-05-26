import {
  ATTENDANCE_STATUS_CLASSES,
  ATTENDANCE_STATUS_LABEL,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/app";

interface StatusBadgeProps {
  status: AttendanceStatus | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const effective: AttendanceStatus = status ?? "absent";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        ATTENDANCE_STATUS_CLASSES[effective],
        className,
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          effective === "present" && "bg-emerald-500",
          effective === "wfh" && "bg-sky-500",
          effective === "late" && "bg-orange-500",
          effective === "on_leave" && "bg-slate-500",
          effective === "absent" && "bg-zinc-400",
        )}
      />
      {ATTENDANCE_STATUS_LABEL[effective]}
    </span>
  );
}
