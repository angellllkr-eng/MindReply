import { NextResponse } from "next/server";
import { getAgentExecutionQueue } from "@/lib/agent-execution-queue";

export async function GET() {
  return NextResponse.json(getAgentExecutionQueue());
}
