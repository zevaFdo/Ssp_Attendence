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
import { Loader2, Plus } from "lucide-react";
import { createCompanyHoliday } from "@/actions/company-holidays";

export function AddHolidayDialog() {
  const t = useTranslations("holidays");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCompanyHoliday(formData);
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
        <Button className="min-h-11 gap-2" type="button">
          <Plus className="h-4 w-4" />
          {t("add")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("add")}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holiday-name">{t("name")}</Label>
            <Input id="holiday-name" name="name" required className="min-h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holiday-date">{t("date")}</Label>
            <Input
              id="holiday-date"
              name="holiday_date"
              type="date"
              required
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holiday-note">{t("note")}</Label>
            <Input id="holiday-note" name="note" className="min-h-11" />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={isPending} className="min-h-11 w-full">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("add")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
