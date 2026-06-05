import { NextRequest, NextResponse } from "next/server";
import { isMonitoringConfigured, reportMonitoringEvent } from "@/lib/monitoring";

export async function POST(req: NextRequest) {
  if (!isMonitoringConfigured()) {
    return NextResponse.json({
      configured: false,
      sent: false,
      message: "SENTRY_DSN is not configured.",
    }, { status: 501 });
  }

  const body = await req.json().catch(() => ({})) as { source?: string };
  const result = await reportMonitoringEvent("MindReply production monitoring test", {
    source: body.source || "manual",
    route: "/api/monitoring/test",
  });

  return NextResponse.json(result, { status: result.sent ? 200 : 502 });
}
