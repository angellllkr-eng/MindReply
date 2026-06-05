import { NextResponse } from "next/server";
import { areCoreIntegrationsConfigured, getIntegrationStatuses } from "@/lib/integrations";

export async function GET() {
  const integrations = getIntegrationStatuses();

  return NextResponse.json({
    status: areCoreIntegrationsConfigured() ? "configured" : "fallback",
    service: "mindreply-core-integrations",
    integrations,
    upgradeNarrative: "Pro turns MindReply from a temporary assistant into a permanent operational brain inside Slack, Gmail, and Notion.",
  });
}
