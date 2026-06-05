type MonitoringContext = Record<string, string | number | boolean | null | undefined>;

function getSentryDsn() {
  return process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "";
}

function toEventId() {
  return crypto.randomUUID().replace(/-/g, "");
}

function getSentryEnvelopeUrl(dsn: string) {
  const parsed = new URL(dsn);
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  const projectId = pathParts.at(-1);
  if (!projectId) throw new Error("SENTRY_DSN is missing a project id");

  const pathPrefix = pathParts.slice(0, -1).join("/");
  const prefix = pathPrefix ? `/${pathPrefix}` : "";
  const key = encodeURIComponent(parsed.username);
  return `${parsed.origin}${prefix}/api/${projectId}/envelope/?sentry_key=${key}&sentry_version=7&sentry_client=mindreply-next`;
}

export function isMonitoringConfigured() {
  return Boolean(getSentryDsn());
}

export async function reportMonitoringEvent(message: string, context: MonitoringContext = {}) {
  const dsn = getSentryDsn();
  if (!dsn) {
    return { configured: false, sent: false, eventId: null };
  }

  const eventId = toEventId();
  const timestamp = new Date().toISOString();
  const envelope = [
    JSON.stringify({ event_id: eventId, sent_at: timestamp, dsn }),
    JSON.stringify({ type: "event" }),
    JSON.stringify({
      event_id: eventId,
      timestamp,
      platform: "javascript",
      level: "info",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
      server_name: "mindreply",
      message,
      extra: context,
      tags: {
        service: "mindreply",
        runtime: "nextjs",
      },
    }),
  ].join("\n");

  const response = await fetch(getSentryEnvelopeUrl(dsn), {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body: envelope,
  });

  return { configured: true, sent: response.ok, eventId, status: response.status };
}
