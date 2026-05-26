"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clockIn, clockOut } from "@/actions/attendance";
import { Home, LogIn, LogOut, Loader2 } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { AttendanceStatus } from "@/types/app";

interface Props {
  today: {
    status: AttendanceStatus | null;
    clock_in: string | null;
    clock_out: string | null;
  } | null;
}

export function ClockInOutCard({ today }: Props) {
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hasClockedIn = !!today?.clock_in;
  const hasClockedOut = !!today?.clock_out;

  function submit(intent?: "present" | "wfh") {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("intent", intent ?? "present");
      const result = await clockIn(fd);
      if (result?.error) setError(result.error);
    });
  }

  function out() {
    setError(null);
    startTransition(async () => {
      const result = await clockOut();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Today
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
            <p className="text-xs text-muted-foreground">Clock In</p>
            <p className="font-semibold tabular-nums">
              {today?.clock_in ? formatTime(today.clock_in) : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">Clock Out</p>
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

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {!hasClockedIn ? (
            <>
              <Button
                size="xl"
                onClick={() => submit("present")}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                Clock In
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => submit("wfh")}
                disabled={isPending}
                className="w-full"
              >
                <Home className="h-5 w-5" />
                Clock In (WFH)
              </Button>
            </>
          ) : !hasClockedOut ? (
            <Button
              size="xl"
              variant="destructive"
              onClick={out}
              disabled={isPending}
              className="w-full sm:col-span-2"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
              Clock Out
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground sm:col-span-2">
              You have completed today’s attendance. See you tomorrow.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
