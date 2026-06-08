import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mindreply-decision-layer",
    timestamp: new Date().toISOString(),
    checks: {
      intakeLayer: "ready",
      actionLayer: "ready",
      memoryLayer: "ready",
      triageAgent: "ready",
      replyAgent: "ready",
      followUpAgent: "ready",
      riskAgent: "ready",
      privacyDefaults: "ready",
    },
  });
}
