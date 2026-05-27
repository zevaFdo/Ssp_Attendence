import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";

interface RequestCardPayload {
  employeeName: string;
  type: "leave" | "late";
  date: string;
  reason: string;
  appUrl?: string;
  requestId?: string;
  locale: Locale;
}

/**
 * Posts an Adaptive-Card-style MessageCard to a Microsoft Teams Incoming Webhook.
 * Falls back gracefully (logs only) if TEAMS_WEBHOOK_URL is not configured.
 */
export async function postRequestToTeams(payload: RequestCardPayload) {
  const url = process.env.TEAMS_WEBHOOK_URL;
  if (!url) {
    console.warn(
      "[teams.webhook] TEAMS_WEBHOOK_URL not set — skipping Teams notification.",
    );
    return { ok: false, reason: "webhook_not_configured" as const };
  }

  const t = await getTranslations({
    locale: payload.locale,
    namespace: "teams",
  });

  const titleType =
    payload.type === "leave" ? t("leaveTitle") : t("lateTitle");
  const summary =
    payload.type === "leave"
      ? t("summaryLeave", { name: payload.employeeName })
      : t("summaryLate", { name: payload.employeeName });

  const themeColor = payload.type === "leave" ? "0EA5E9" : "F59E0B";

  const body = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    themeColor,
    summary,
    title: titleType,
    sections: [
      {
        activityTitle: payload.employeeName,
        activitySubtitle: t("subtitleDate", { date: payload.date }),
        facts: [
          { name: t("factType"), value: titleType },
          { name: t("factDate"), value: payload.date },
          { name: t("factReason"), value: payload.reason },
        ],
        markdown: true,
      },
    ],
    potentialAction:
      payload.appUrl && payload.requestId
        ? [
            {
              "@type": "OpenUri",
              name: t("openInApp"),
              targets: [
                {
                  os: "default",
                  uri: `${payload.appUrl}/requests/${payload.requestId}`,
                },
              ],
            },
          ]
        : undefined,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[teams.webhook] non-OK response", res.status, text);
      return { ok: false, reason: "webhook_failed" as const };
    }
    return { ok: true as const };
  } catch (err) {
    console.error("[teams.webhook] error", err);
    return { ok: false, reason: "webhook_threw" as const };
  }
}
