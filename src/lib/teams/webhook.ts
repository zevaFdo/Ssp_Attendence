import "server-only";

interface RequestCardPayload {
  employeeName: string;
  type: "leave" | "late";
  date: string;
  reason: string;
  appUrl?: string;
  requestId?: string;
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

  const titleType = payload.type === "leave" ? "Leave Request" : "Late Arrival";
  const themeColor = payload.type === "leave" ? "0EA5E9" : "F59E0B";

  const body = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    themeColor,
    summary: `New ${titleType} from ${payload.employeeName}`,
    title: `New ${titleType}`,
    sections: [
      {
        activityTitle: payload.employeeName,
        activitySubtitle: `Date: ${payload.date}`,
        facts: [
          { name: "Type", value: titleType },
          { name: "Date", value: payload.date },
          { name: "Reason", value: payload.reason },
        ],
        markdown: true,
      },
    ],
    potentialAction:
      payload.appUrl && payload.requestId
        ? [
            {
              "@type": "OpenUri",
              name: "Open in Attendance Web",
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
