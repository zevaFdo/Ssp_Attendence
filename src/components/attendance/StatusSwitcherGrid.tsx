"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { setAttendanceStatus } from "@/actions/attendance";
import {
  EMPLOYEE_STATUS_BUTTONS,
  type EmployeeStatus,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/app";

export interface StatusSwitcherGridToday {
  status: AttendanceStatus | null;
  clock_in: string | null;
  clock_out: string | null;
}

interface StatusSwitcherGridProps {
  today: StatusSwitcherGridToday | null;
  /** Called after a successful submission (e.g. to close a wrapping dialog). */
  onSettled?: () => void;
  /** Tighter padding/font for use inside small surfaces like dialogs. */
  compact?: boolean;
  /** Hide the heading line above the buttons. */
  hideHeading?: boolean;
}

/**
 * Mirrors the server-side state machine in setAttendanceStatus so the
 * UI greys out tiles that the server would reject. Keeps the buttons
 * and the server perfectly in sync.
 */
function isAllowed(
  target: EmployeeStatus,
  today: StatusSwitcherGridToday | null,
): boolean {
  if (today?.clock_out) return false;
  const clockedIn = !!today?.clock_in;
  if (!clockedIn) {
    return (
      target === "present" ||
      target === "wfh" ||
      target === "late" ||
      target === "on_leave"
    );
  }
  return true;
}

export function StatusSwitcherGrid({
  today,
  onSettled,
  compact = false,
  hideHeading = false,
}: StatusSwitcherGridProps) {
  const t = useTranslations("attendance");
  const tStatus = useTranslations("attendanceStatus");
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<EmployeeStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(status: EmployeeStatus) {
    setError(null);
    setPendingKey(status);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("status", status);
      const result = await setAttendanceStatus(fd);
      setPendingKey(null);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      onSettled?.();
    });
  }

  const finalized = !!today?.clock_out;

  return (
    <div>
      {error ? (
        <p
          className={cn(
            "rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-600/20",
            compact ? "mb-3" : "mb-4",
          )}
        >
          {error}
        </p>
      ) : null}

      {hideHeading ? null : (
        <p
          className={cn(
            "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
          )}
        >
          {finalized ? t("alreadyDone") : t("chooseStatus")}
        </p>
      )}

      <div
        className={cn(
          "grid gap-2",
          compact
            ? "grid-cols-4"
            : "grid-cols-4 sm:grid-cols-8",
        )}
      >
        {EMPLOYEE_STATUS_BUTTONS.map(({ key, Icon, tileClass }) => {
          const allowed = isAllowed(key, today);
          const isActive = today?.status === key;
          const isLoading = isPending && pendingKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => submit(key)}
              disabled={!allowed || isPending}
              data-active={isActive}
              aria-pressed={isActive}
              aria-label={tStatus(key)}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 rounded-lg font-semibold ring-1 transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                tileClass,
                "data-[active=true]:scale-[1.03] data-[active=true]:ring-2 data-[active=true]:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-inherit",
                compact ? "p-2 text-[11px]" : "p-3 text-xs",
              )}
            >
              {isLoading ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    compact ? "h-4 w-4" : "h-5 w-5",
                  )}
                />
              ) : (
                <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
              )}
              <span className="leading-tight">{tStatus(key)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
