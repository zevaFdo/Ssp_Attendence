"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

interface Props {
  showSearch: boolean;
}

export function AttendanceHistoryFilters({ showSearch }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("attendance.history");
  const [, startTransition] = useTransition();

  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");

  function apply() {
    const sp = new URLSearchParams(params.toString());
    if (from) sp.set("from", from);
    else sp.delete("from");
    if (to) sp.set("to", to);
    else sp.delete("to");
    if (q && showSearch) sp.set("q", q);
    else sp.delete("q");
    startTransition(() => {
      router.push(`?${sp.toString()}`);
    });
  }

  function reset() {
    setFrom("");
    setTo("");
    setQ("");
    startTransition(() => {
      router.push("?");
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="from" className="text-xs">{t("from")}</Label>
        <Input
          id="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="to" className="text-xs">{t("to")}</Label>
        <Input
          id="to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      {showSearch ? (
        <div className="space-y-1.5">
          <Label htmlFor="q" className="text-xs">{t("searchByName")}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              placeholder={t("searchPlaceholder")}
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div />
      )}
      <div className="flex gap-2">
        <Button onClick={apply} className="flex-1 md:flex-none">
          {t("apply")}
        </Button>
        <Button onClick={reset} variant="ghost" size="icon" aria-label={t("reset")}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
