import { NextResponse } from "next/server";

import { extractMRAgentInput, prepareMindRead } from "@/lib/mragent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { input, source } = extractMRAgentInput(body);

  if (!input) {
    return NextResponse.json({ error: "Input is required." }, { status: 400 });
  }

  const result = await prepareMindRead({ input, source });
  return NextResponse.json(result);
}
