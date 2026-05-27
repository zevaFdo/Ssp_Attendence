"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { createRequest } from "@/actions/requests";
import { todayISO } from "@/lib/utils/date";

export function RequestForm() {
  const t = useTranslations("requests.form");
  const [type, setType] = useState<"leave" | "late">("leave");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("type", type);
    startTransition(async () => {
      const result = await createRequest(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("type")}</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "leave" | "late")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leave">{t("leave")}</SelectItem>
                <SelectItem value="late">{t("late")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t("date")}</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={todayISO()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder={t("reasonPlaceholder")}
              rows={5}
              required
              minLength={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{t("reasonHint")}</p>
          </div>

          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-600/20">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
