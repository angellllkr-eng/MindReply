import { NextRequest, NextResponse } from "next/server";
import { analyzeCommunication } from "@/lib/agent-engine";
import { isAzureOpenAIConfigured } from "@/lib/azure-openai";
import { logMetric } from "@/lib/metrics";

function subconsciousSignals(analysis: ReturnType<typeof analyzeCommunication>) {
  const resistanceRisk =
    analysis.emotionalValence === "pressured" ? "high" :
    analysis.emotionalValence === "uncertain" ? "medium" :
    "low";

  const persuasionFrame =
    analysis.powerDistance === "upward" ? "evidence-first with concise executive ask" :
    analysis.powerDistance === "downward" ? "stability-first with explicit ownership" :
    analysis.powerDistance === "external" ? "trust-first with commercial clarity" :
    "mutuality-first with direct next action";

  return {
    resistanceRisk,
    persuasionFrame,
    behavioralInstruction: "Lead with the intended outcome, remove weak qualifiers, name the constraint, and close with timing.",
  };
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    service: "mindreply-intelligence",
    azureOpenAI: isAzureOpenAIConfigured() ? "configured" : "fallback",
    frameworks: ["intent", "emotional_valence", "power_distance", "clarity_framework", "persuasion_frame"],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { text?: unknown; userId?: unknown } | null;
  const text = String(body?.text ?? "").trim();

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const analysis = analyzeCommunication(text);
  const metric = await logMetric({
    userId: typeof body?.userId === "number" ? body.userId : null,
    eventName: "intelligence.analyze",
    eventValue: {
      inputLength: text.length,
      intent: analysis.intent,
      emotionalValence: analysis.emotionalValence,
      powerDistance: analysis.powerDistance,
      azureOpenAI: isAzureOpenAIConfigured() ? "configured" : "fallback",
    },
  });

  return NextResponse.json({
    status: "ready",
    source: "local-analysis",
    azureOpenAI: isAzureOpenAIConfigured() ? "configured" : "fallback",
    analysis,
    subconsciousSignals: subconsciousSignals(analysis),
    metricLogged: metric.logged,
  });
}
