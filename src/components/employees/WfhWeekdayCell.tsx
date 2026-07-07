"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEmployeeWfhWeekday } from "@/actions/employees";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri"] as const;

interface Props {
  profileId: string;
  value: number | null;
  editable: boolean;
}

export function WfhWeekdayCell({ profileId, value, editable }: Props) {
  const tWeekdays = useTranslations("weekdays");
  const tEmployees = useTranslations("employees.wfh");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const display =
    value === null || value === undefined
      ? tWeekdays("unassigned")
      : tWeekdays(WEEKDAY_KEYS[value] ?? "unassigned");

  if (!editable) {
    return <span className="text-muted-foreground">{display}</span>;
  }

  return (
    <div className="space-y-1">
      <Select
        disabled={isPending}
        value={value === null ? "null" : String(value)}
        onValueChange={(next) => {
          setError(null);
          const formData = new FormData();
          formData.set("profileId", profileId);
          formData.set("weekday", next === "null" ? "" : next);
          startTransition(async () => {
            const result = await updateEmployeeWfhWeekday(formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        <SelectTrigger
          className="h-11 min-w-[7rem] max-w-[10rem]"
          aria-label={tEmployees("assign")}
        >
          <SelectValue>{display}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">{tWeekdays("unassigned")}</SelectItem>
          {WEEKDAY_KEYS.map((key, index) => (
            <SelectItem key={key} value={String(index)}>
              {tWeekdays(key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
