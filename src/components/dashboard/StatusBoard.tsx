"use client";

import { useTranslations } from "next-intl";
import { StatusCard, type StatusCardEmployee } from "./StatusCard";
import { StatusBoardRealtime } from "./StatusBoardRealtime";
import {
  ATTENDANCE_STATUS_CLASSES,
  ATTENDANCE_STATUS_DOT_CLASSES,
  ATTENDANCE_STATUS_VALUES,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils";

interface StatusBoardProps {
  employees: StatusCardEmployee[];
}

export function StatusBoard({ employees }: StatusBoardProps) {
  const t = useTranslations("dashboard");
  const tCounts = useTranslations("dashboard.counts");

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

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {ATTENDANCE_STATUS_VALUES.map((s) => (
          <span
            key={s}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium ring-1",
              ATTENDANCE_STATUS_CLASSES[s],
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ATTENDANCE_STATUS_DOT_CLASSES[s],
              )}
            />
            {tCounts(s, { count: counts[s] ?? 0 })}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {employees.map((e) => (
          <StatusCard key={e.id} employee={e} />
        ))}
      </div>
    </>
  );
}
