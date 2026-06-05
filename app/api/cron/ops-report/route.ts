import { NextRequest, NextResponse } from "next/server";
import { buildOpsReport, relayOpsReportToAzure, sendOpsReportEmail } from "@/lib/ops-report";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await buildOpsReport();
  const [email, azureRelay] = await Promise.all([
    sendOpsReportEmail(report),
    relayOpsReportToAzure(report),
  ]);

  return NextResponse.json({
    status: email.sent ? "sent" : "not_sent",
    generatedAt: report.generatedAt,
    recipient: report.recipient,
    email,
    azureRelay,
    salesObserver: report.salesObserver,
  });
}
