import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { isClerkConfigured } from "@/lib/admin";
import { isMonitoringConfigured } from "@/lib/monitoring";
import { agentRosterSummary } from "@/lib/agent-roster";

export async function GET() {
  const databaseConfigured = hasDatabaseUrl();
  const authConfigured = isClerkConfigured();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY && (process.env.STRIPE_PRICE_CURATOR || process.env.STRIPE_PRICE_STRATEGIST));
  const stripeWebhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const analyticsConfigured = Boolean(process.env.NEXT_PUBLIC_GTM_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID);
  const siteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
  const agentSummary = agentRosterSummary();

  return NextResponse.json({
    status: "ok",
    service: "mindreply",
    timestamp: new Date().toISOString(),
    checks: {
      app: "ok",
      database: databaseConfigured ? "configured" : "fallback",
      databaseConfigured,
      auth: authConfigured ? "configured" : "fallback",
      authConfigured,
      stripe: stripeConfigured ? "configured" : "fallback",
      stripeConfigured,
      stripeWebhook: stripeWebhookConfigured ? "configured" : "fallback",
      stripeWebhookConfigured,
      analytics: analyticsConfigured ? "configured" : "fallback",
      analyticsConfigured,
      monitoring: isMonitoringConfigured() ? "configured" : "fallback",
      monitoringConfigured: isMonitoringConfigured(),
      siteUrl: siteUrlConfigured ? "configured" : "fallback",
      siteUrlConfigured,
      azureOpenAI: process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT ? "configured" : "fallback",
      orchestrator: "ready",
      backgroundReasoning: "ready",
      agentRoster: "ready",
      agentRosterRoles: agentSummary.totalRoles,
      nodeEnv: process.env.NODE_ENV ?? "development",
    },
  });
}
