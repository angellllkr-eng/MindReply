import { NextResponse } from "next/server";
import { buildDecisionResponse, type IntakeSource } from "@/lib/decision-layer";

const sources = new Set<IntakeSource>(["manual", "gmail", "calendar", "extension"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const input = typeof body?.input === "string" ? body.input : "";
  const source = sources.has(body?.source) ? body.source : "manual";
  const userId = typeof body?.userId === "string" ? body.userId : undefined;

  if (!input.trim()) {
    return NextResponse.json({ error: "Input is required." }, { status: 400 });
  }

  return NextResponse.json(buildDecisionResponse({ input, source, userId }));
}
