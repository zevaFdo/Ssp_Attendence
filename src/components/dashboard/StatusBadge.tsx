"use client";

import { useTranslations } from "next-intl";
import {
  ATTENDANCE_STATUS_CLASSES,
  ATTENDANCE_STATUS_DOT_CLASSES,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/app";

interface StatusBadgeProps {
  status: AttendanceStatus | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("attendanceStatus");
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
          ATTENDANCE_STATUS_DOT_CLASSES[effective],
        )}
      />
      {t(effective)}
    </span>
  );
}
