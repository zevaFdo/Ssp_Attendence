"use client";

import { useTranslations } from "next-intl";
import { StatusCard, type StatusCardEmployee } from "./StatusCard";
import { StatusBoardRealtime } from "./StatusBoardRealtime";
import {
  ATTENDANCE_STATUS_DOT_CLASSES,
  ATTENDANCE_STATUS_VALUES,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils";
import type { StatusSwitcherGridToday } from "@/components/attendance/StatusSwitcherGrid";

interface StatusBoardProps {
  employees: StatusCardEmployee[];
  currentUserId?: string | null;
  currentUserToday?: StatusSwitcherGridToday | null;
}

export function StatusBoard({
  employees,
  currentUserId,
  currentUserToday,
}: StatusBoardProps) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("attendanceStatus");

  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  const counts = employees.reduce(
    (acc, e) => {
      const key = e.status ?? "absent";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <StatusBoardRealtime />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {employees.map((e) => {
          const isSelf = !!currentUserId && e.id === currentUserId;
          return (
            <StatusCard
              key={e.id}
              employee={e}
              isSelf={isSelf}
              selfToday={isSelf ? currentUserToday ?? null : null}
            />
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {ATTENDANCE_STATUS_VALUES.map((s) => (
          <span key={s} className="inline-flex items-center gap-1">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ATTENDANCE_STATUS_DOT_CLASSES[s],
              )}
            />
            <span>{tStatus(s)}</span>
            <span className="tabular-nums font-medium text-foreground">
              {counts[s] ?? 0}
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
