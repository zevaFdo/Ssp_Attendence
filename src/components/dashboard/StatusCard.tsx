"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_TILE_CLASSES,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  StatusSwitcherGrid,
  type StatusSwitcherGridToday,
} from "@/components/attendance/StatusSwitcherGrid";
import type { AttendanceStatus } from "@/types/app";

export interface StatusCardEmployee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  section_name?: string | null;
  team_name?: string | null;
  status: AttendanceStatus | null;
  clock_in: string | null;
  clock_out: string | null;
}

interface StatusCardProps {
  employee: StatusCardEmployee;
  /** When true, the card acts as a quick-switch shortcut for the current user. */
  isSelf?: boolean;
  /** Current user's today attendance row, used by the quick-switch dialog. */
  selfToday?: StatusSwitcherGridToday | null;
}

function formatStamp(iso: string, locale: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function pickStamp(
  status: AttendanceStatus,
  clockIn: string | null,
  clockOut: string | null,
): string | null {
  if (status === "clocked_out") return clockOut ?? clockIn ?? null;
  if (status === "on_leave" || status === "absent") return null;
  return clockIn ?? null;
}

export function StatusCard({ employee, isSelf, selfToday }: StatusCardProps) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("attendanceStatus");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const effective: AttendanceStatus = employee.status ?? "absent";
  const Icon = ATTENDANCE_STATUS_ICONS[effective];
  const tileClass = ATTENDANCE_STATUS_TILE_CLASSES[effective];
  const isMuted = effective === "absent";
  const stampIso = pickStamp(effective, employee.clock_in, employee.clock_out);
  const stamp = stampIso ? formatStamp(stampIso, locale) : null;

  const cardInner = (
    <>
      <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {employee.full_name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {employee.section_name ?? t("noSection")}
            {employee.team_name ? ` · ${employee.team_name}` : ""}
          </p>
        </div>
        {isSelf ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/20">
            {t("you")}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "relative flex flex-1 items-center gap-2 px-3 py-3",
          tileClass,
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="truncate text-sm font-bold">{tStatus(effective)}</span>
        {stamp ? (
          <span
            className={cn(
              "ml-auto self-end pl-2 text-[11px] tabular-nums",
              isMuted ? "text-zinc-600" : "text-white/85",
            )}
          >
            {stamp}
          </span>
        ) : null}
      </div>
    </>
  );

  const baseClasses =
    "flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition hover:shadow-md";

  if (!isSelf) {
    return <div className={baseClasses}>{cardInner}</div>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t("quickSwitchTitle")}
          className={cn(
            baseClasses,
            "cursor-pointer text-left ring-2 ring-primary/40 hover:ring-primary/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          {cardInner}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("quickSwitchTitle")}</DialogTitle>
          <DialogDescription>{t("quickSwitchSubtitle")}</DialogDescription>
        </DialogHeader>
        <StatusSwitcherGrid
          today={selfToday ?? null}
          compact
          onSettled={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
