import { NextResponse } from "next/server";
import { activeAgentRoster } from "@/lib/agent-roster";

export async function GET() {
  const byLane = activeAgentRoster.reduce<Record<string, number>>((acc, agent) => {
    acc[agent.lane] = (acc[agent.lane] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    status: "ready",
    objective: "30 active operating desks for production, revenue, trust, and intelligence acceleration.",
    totalActiveAgents: activeAgentRoster.length,
    byLane,
    agents: activeAgentRoster,
  });
}
