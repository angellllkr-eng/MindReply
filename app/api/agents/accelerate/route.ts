import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAgentAccelerationCommand } from "@/lib/agent-acceleration";

export async function GET() {
  return NextResponse.json(getAgentAccelerationCommand());
}

export async function POST(req: NextRequest) {
  let requestedBy = "owner-command";

  try {
    const body = await req.json();
    if (typeof body?.requestedBy === "string" && body.requestedBy.trim()) {
      requestedBy = body.requestedBy.trim().slice(0, 80);
    }
  } catch {
    // Empty body is valid for a stateless acceleration trigger.
  }

  return NextResponse.json({
    accepted: true,
    message: "x66 acceleration activated for all active MindReply desks.",
    command: getAgentAccelerationCommand({ activated: true, requestedBy }),
  });
}
