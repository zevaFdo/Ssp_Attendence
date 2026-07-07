"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCompanyHoliday } from "@/actions/company-holidays";
import type { CompanyHoliday } from "@/types/app";

interface Props {
  holidays: CompanyHoliday[];
}

export function CustomHolidaysTable({ holidays }: Props) {
  const t = useTranslations("holidays");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (holidays.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("date")}</th>
            <th className="px-4 py-3">{t("name")}</th>
            <th className="px-4 py-3">{t("note")}</th>
            <th className="px-4 py-3 w-16" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {holidays.map((h) => (
            <tr key={h.id}>
              <td className="px-4 py-3 whitespace-nowrap">{h.holiday_date}</td>
              <td className="px-4 py-3">{h.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{h.note ?? "—"}</td>
              <td className="px-4 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  disabled={isPending}
                  aria-label={t("delete")}
                  onClick={() => {
                    startTransition(async () => {
                      await deleteCompanyHoliday(h.id);
                      router.refresh();
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
