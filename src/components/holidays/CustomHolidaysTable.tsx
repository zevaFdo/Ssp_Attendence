"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCompanyHoliday } from "@/actions/company-holidays";
import { EditHolidayDialog } from "@/components/holidays/EditHolidayDialog";
import type { CompanyHoliday } from "@/types/app";

interface Props {
  holidays: CompanyHoliday[];
}

export function CustomHolidaysTable({ holidays }: Props) {
  const t = useTranslations("holidays");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (holidays.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("date")}</th>
              <th className="px-4 py-3">{t("name")}</th>
              <th className="px-4 py-3">{t("note")}</th>
              <th className="px-4 py-3 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {holidays.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-3 whitespace-nowrap">{h.holiday_date}</td>
                <td className="px-4 py-3">{h.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {h.note ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditHolidayDialog holiday={h} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="min-h-11 min-w-11"
                      disabled={isPending}
                      aria-label={t("delete")}
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const result = await deleteCompanyHoliday(h.id);
                          if (result?.error) {
                            setError(result.error);
                            return;
                          }
                          router.refresh();
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
