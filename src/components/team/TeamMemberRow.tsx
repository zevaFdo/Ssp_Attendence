"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teamLeaderOverride } from "@/actions/attendance";
import { initials } from "@/lib/utils/format";
import { todayISO } from "@/lib/utils/date";
import { Loader2, Save } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ATTENDANCE_STATUS_VALUES } from "@/lib/utils/status";
import type { AttendanceStatus } from "@/types/app";

interface Member {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  status: AttendanceStatus | null;
}

export function TeamMemberRow({ member }: { member: Member }) {
  const tTeam = useTranslations("team");
  const tStatus = useTranslations("attendanceStatus");

  const [next, setNext] = useState<AttendanceStatus>(member.status ?? "present");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setOk(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("userId", member.id);
      fd.set("date", todayISO());
      fd.set("status", next);
      const result = await teamLeaderOverride(fd);
      if (result?.error) setError(result.error);
      else setOk(true);
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          {member.avatar_url ? (
            <AvatarImage src={member.avatar_url} alt={member.full_name} />
          ) : null}
          <AvatarFallback>{initials(member.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{member.full_name}</p>
          <div className="mt-0.5">
            <StatusBadge status={member.status} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={next}
          onValueChange={(v) => setNext(v as AttendanceStatus)}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ATTENDANCE_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {tStatus(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={save} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {tTeam("set")}
        </Button>
        {error ? (
          <span className="text-xs text-rose-700">{error}</span>
        ) : ok ? (
          <span className="text-xs text-emerald-700">{tTeam("saved")}</span>
        ) : null}
      </div>
    </li>
  );
}
