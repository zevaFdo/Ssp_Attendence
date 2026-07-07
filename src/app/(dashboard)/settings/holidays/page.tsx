import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { canManageCompanyHolidays } from "@/lib/auth/permissions";
import { listJapanNationalHolidays } from "@/lib/calendar/jp-national";
import { AddHolidayDialog } from "@/components/holidays/AddHolidayDialog";
import { CustomHolidaysTable } from "@/components/holidays/CustomHolidaysTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyHoliday } from "@/types/app";
import type { Locale as AppLocale } from "@/i18n/config";
import { formatLocalized } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("holidays.metaTitle") };
}

export default async function HolidaysSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (!canManageCompanyHolidays(profile.role)) redirect("/");

  const t = await getTranslations("holidays");
  const locale = (await getLocale()) as AppLocale;
  const year = new Date().getFullYear();

  const supabase = await createClient();
  const { data: customHolidays } = await supabase
    .from("company_holidays")
    .select("*")
    .order("holiday_date");

  const national = listJapanNationalHolidays(year);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <AddHolidayDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("specialTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("specialYearEnd")}</p>
          <p>{t("specialObon")}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("nationalTitle", { year })}</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {national.map((h) => (
            <div
              key={h.date.toString()}
              className="rounded-md border bg-card px-3 py-2 text-sm"
            >
              <p className="font-medium">
                {locale === "en" ? h.name_en : h.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatLocalized(h.date, "mediumDate", locale)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("customTitle")}</h2>
        <CustomHolidaysTable
          holidays={(customHolidays ?? []) as CompanyHoliday[]}
        />
      </section>
    </div>
  );
}
