import { NextResponse } from "next/server";
import { agentRosterSummary } from "@/lib/agent-roster";
import { isOpsReportingConfigured } from "@/lib/ops-report-config";
import { isProductionRequirementConfigured, summarizeProductionRequirements } from "@/lib/production-requirements";
import { isSlackConfigured } from "@/lib/slack";
import { areCoreIntegrationsConfigured } from "@/lib/integrations";

export async function GET() {
  const siteUrlConfigured = isProductionRequirementConfigured("siteUrl");
  const databaseConfigured = isProductionRequirementConfigured("database");
  const authConfigured = isProductionRequirementConfigured("auth");
  const stripeConfigured = isProductionRequirementConfigured("stripe");
  const stripeWebhookConfigured = isProductionRequirementConfigured("stripeWebhook");
  const bookingPaymentsConfigured = isProductionRequirementConfigured("bookingPayments");
  const analyticsConfigured = isProductionRequirementConfigured("analytics");
  const monitoringConfigured = isProductionRequirementConfigured("monitoring");
  const slackConfigured = isSlackConfigured();
  const coreIntegrationsConfigured = areCoreIntegrationsConfigured();
  const opsReportsConfigured = isOpsReportingConfigured();
  const azureOpenAIConfigured = isProductionRequirementConfigured("azureOpenAI");
  const agentSummary = agentRosterSummary();

  const checks = {
    app: "ok",
    database: databaseConfigured ? "configured" : "fallback",
    databaseConfigured,
    auth: authConfigured ? "configured" : "fallback",
    authConfigured,
    stripe: stripeConfigured ? "configured" : "fallback",
    stripeConfigured,
    stripeWebhook: stripeWebhookConfigured ? "configured" : "fallback",
    stripeWebhookConfigured,
    bookingPayments: bookingPaymentsConfigured ? "configured" : "fallback",
    bookingPaymentsConfigured,
    analytics: analyticsConfigured ? "configured" : "fallback",
    analyticsConfigured,
    monitoring: monitoringConfigured ? "configured" : "fallback",
    monitoringConfigured,
    slack: slackConfigured ? "configured" : "fallback",
    slackConfigured,
    coreIntegrations: coreIntegrationsConfigured ? "configured" : "fallback",
    coreIntegrationsConfigured,
    opsReports: opsReportsConfigured ? "configured" : "fallback",
    opsReportsConfigured,
    siteUrl: siteUrlConfigured ? "configured" : "fallback",
    siteUrlConfigured,
    azureOpenAI: azureOpenAIConfigured ? "configured" : "fallback",
    orchestrator: "ready",
    backgroundReasoning: "ready",
    agentRoster: "ready",
    agentRosterRoles: agentSummary.totalRoles,
    nodeEnv: process.env.NODE_ENV ?? "development",
  };

  return NextResponse.json({
    status: "ok",
    service: "mindreply",
    timestamp: new Date().toISOString(),
    checks,
    requirements: summarizeProductionRequirements(checks),
  });
}
