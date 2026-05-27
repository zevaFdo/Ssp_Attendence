import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { NotificationsRealtime } from "@/components/notifications/NotificationsRealtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markAllRead } from "@/actions/notifications";
import { Bell, CheckCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("notifications.metaTitle") };
}

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const t = await getTranslations("notifications");
  const tCommon = await getTranslations("common");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("notifications")
    .select("id, title, message, is_read, created_at, related_request_id")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const unread = (rows ?? []).filter((r) => !r.is_read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <NotificationsRealtime />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? t("unread", { count: unread }) : tCommon("all_caught_up")}
          </p>
        </div>
        {unread > 0 ? (
          <form action={markAllRead}>
            <Button variant="outline" type="submit">
              <CheckCheck className="h-4 w-4" />
              {t("markAllRead")}
            </Button>
          </form>
        ) : null}
      </div>

      {(rows ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyBody")}</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-2">
          {(rows ?? []).map((n) => (
            <NotificationItem key={n.id} {...n} />
          ))}
        </ul>
      )}
    </div>
  );
}
