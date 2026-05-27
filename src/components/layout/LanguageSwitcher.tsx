"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/actions/locale";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface Props {
  variant?: "icon" | "compact";
  className?: string;
}

export function LanguageSwitcher({ variant = "icon", className }: Props) {
  const current = useLocale() as Locale;
  const t = useTranslations("common");
  const tLocales = useTranslations("locales");
  const [isPending, startTransition] = useTransition();

  function change(value: string) {
    if (value === current) return;
    if (value !== "ja" && value !== "en") return;
    startTransition(async () => {
      await setLocale(value);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
          className,
        )}
        aria-label={t("language")}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Languages className="h-3.5 w-3.5" />
        )}
        {variant === "compact" ? (
          <span>{current.toUpperCase()}</span>
        ) : (
          <span>{tLocales(current)}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={current} onValueChange={change}>
          {locales.map((loc) => (
            <DropdownMenuRadioItem key={loc} value={loc}>
              {tLocales(loc)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
