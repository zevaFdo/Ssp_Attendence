"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { setAttendanceStatus } from "@/actions/attendance";
import { formatTime } from "@/lib/utils/date";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  EMPLOYEE_STATUS_BUTTONS,
  type EmployeeStatus,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/app";

interface Props {
  today: {
    status: AttendanceStatus | null;
    clock_in: string | null;
    clock_out: string | null;
  } | null;
}

/**
 * Mirrors the server-side state machine in setAttendanceStatus so the
 * UI greys out tiles that the server would reject. Keeps the buttons
 * and the server perfectly in sync.
 */
function isAllowed(target: EmployeeStatus, today: Props["today"]): boolean {
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

export function ClockInOutCard({ today }: Props) {
  const t = useTranslations("attendance");
  const tStatus = useTranslations("attendanceStatus");
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<EmployeeStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function submit(status: EmployeeStatus) {
    setError(null);
    setPendingKey(status);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("status", status);
      const result = await setAttendanceStatus(fd);
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
      setPendingKey(null);
    });
  }

  const finalized = !!today?.clock_out;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("today")}
            </p>
            <p className="text-3xl font-bold tabular-nums tracking-tight">
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
          {today ? <StatusBadge status={today.status} /> : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">{t("clockInLabel")}</p>
            <p className="font-semibold tabular-nums">
              {today?.clock_in ? formatTime(today.clock_in) : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">{t("clockOutLabel")}</p>
            <p className="font-semibold tabular-nums">
              {today?.clock_out ? formatTime(today.clock_out) : "—"}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-600/20">
            {error}
          </p>
        ) : null}

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {finalized ? t("alreadyDone") : t("chooseStatus")}
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
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
                    "group flex flex-col items-center justify-center gap-1 rounded-lg p-3 text-xs font-semibold ring-1 transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    tileClass,
                    "data-[active=true]:scale-[1.03] data-[active=true]:ring-2 data-[active=true]:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-inherit",
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="leading-tight">{tStatus(key)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
