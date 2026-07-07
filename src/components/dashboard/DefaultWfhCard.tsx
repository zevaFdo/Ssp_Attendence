import { getTranslations } from "next-intl/server";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri"] as const;

interface Props {
  weekday: number | null;
}

export async function DefaultWfhCard({ weekday }: Props) {
  const t = await getTranslations("dashboard.wfh");
  const tWeekdays = await getTranslations("weekdays");

  const label =
    weekday === null || weekday === undefined
      ? tWeekdays("unassigned")
      : tWeekdays(WEEKDAY_KEYS[weekday] ?? "unassigned");

  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-sm">
      <p className="text-muted-foreground">{t("defaultWeekday")}</p>
      <p className="mt-1 font-medium">{label}</p>
    </div>
  );
}
