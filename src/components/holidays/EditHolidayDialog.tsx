"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Pencil } from "lucide-react";
import { updateCompanyHoliday } from "@/actions/company-holidays";
import type { CompanyHoliday } from "@/types/app";

interface Props {
  holiday: CompanyHoliday;
}

export function EditHolidayDialog({ holiday }: Props) {
  const t = useTranslations("holidays");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("id", holiday.id);
    startTransition(async () => {
      const result = await updateCompanyHoliday(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11"
          aria-label={t("edit")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("edit")}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-holiday-name-${holiday.id}`}>{t("name")}</Label>
            <Input
              id={`edit-holiday-name-${holiday.id}`}
              name="name"
              required
              defaultValue={holiday.name}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-holiday-date-${holiday.id}`}>{t("date")}</Label>
            <Input
              id={`edit-holiday-date-${holiday.id}`}
              name="holiday_date"
              type="date"
              required
              defaultValue={holiday.holiday_date}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-holiday-note-${holiday.id}`}>{t("note")}</Label>
            <Input
              id={`edit-holiday-note-${holiday.id}`}
              name="note"
              defaultValue={holiday.note ?? ""}
              className="min-h-11"
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={isPending} className="min-h-11 w-full">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              tCommon("save")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
