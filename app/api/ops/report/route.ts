import { NextRequest, NextResponse } from "next/server";
import { buildOpsReport, relayOpsReportToAzure, sendOpsReportEmail } from "@/lib/ops-report";

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET() {
  return NextResponse.json(await buildOpsReport());
}

export async function POST(req: NextRequest) {
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
    report,
    email,
    azureRelay,
  });
}
