"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/utils/date";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  StatusSwitcherGrid,
  type StatusSwitcherGridToday,
} from "@/components/attendance/StatusSwitcherGrid";

interface Props {
  today: StatusSwitcherGridToday | null;
}

export function ClockInOutCard({ today }: Props) {
  const t = useTranslations("attendance");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

        <div className="mt-5">
          <StatusSwitcherGrid today={today} />
        </div>
      </CardContent>
    </Card>
  );
}
