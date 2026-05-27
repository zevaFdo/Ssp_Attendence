import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ClockInOutCard } from "@/components/attendance/ClockInOutCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { todayISO, formatLocalized } from "@/lib/utils/date";
import { getCurrentProfile } from "@/lib/auth/session";
import { History } from "lucide-react";
import type { Locale as AppLocale } from "@/i18n/config";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: `${t("attendance.title")} · ${t("common.appName")}` };
}

export default async function AttendancePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: today } = await supabase
    .from("attendance")
    .select("status, clock_in, clock_out")
    .eq("user_id", profile.id)
    .eq("date", todayISO())
    .maybeSingle();

  const t = await getTranslations("attendance");
  const locale = (await getLocale()) as AppLocale;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {formatLocalized(todayISO(), "longDate", locale)}
        </p>
      </div>

      <ClockInOutCard today={today ?? null} />

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-semibold">{t("reviewTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("reviewSubtitle")}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/attendance/history">
              <History className="h-4 w-4" />
              {t("viewHistory")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
