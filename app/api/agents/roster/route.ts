import { NextResponse } from "next/server";
import { agentRoster, agentRosterSummary } from "@/lib/agent-roster";

export async function GET() {
  return NextResponse.json({
    status: "ready",
    summary: agentRosterSummary(),
    roster: agentRoster,
  });
}
