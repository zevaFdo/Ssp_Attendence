"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signIn } from "@/actions/auth";
import { Loader2 } from "lucide-react";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/"} />
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t("emailPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder={t("passwordPlaceholder")}
            />
          </div>

          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-600/20">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isPending ? t("signingIn") : t("signIn")}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t("inviteOnly")}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
