import { isClerkConfigured } from "@/lib/admin";
import { activeAgentRoster, type ActiveAgentEntry } from "@/lib/agent-roster";
import { isAzureOpenAIConfigured } from "@/lib/azure-openai";
import { hasDatabaseUrl } from "@/lib/db";
import { isMonitoringConfigured } from "@/lib/monitoring";
import { productionRequirements } from "@/lib/production-requirements";

type ServiceCheck = {
  service: string;
  key: string;
  status: "configured" | "fallback";
  owner: ActiveAgentEntry | null;
  requirementKeys: string[];
  unlocks: string;
  nextAction: string;
};

function configuredChecks() {
  return {
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    database: hasDatabaseUrl(),
    auth: isClerkConfigured(),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && (process.env.STRIPE_PRICE_CURATOR || process.env.STRIPE_PRICE_STRATEGIST)),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    analytics: Boolean(process.env.NEXT_PUBLIC_GTM_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID),
    monitoring: isMonitoringConfigured(),
    azureOpenAI: isAzureOpenAIConfigured(),
  } as Record<string, boolean>;
}

function ownerFor(requirement: string) {
  const byRole = (match: RegExp) => activeAgentRoster.find((agent) => match.test(`${agent.field} ${agent.role}`)) ?? null;

  if (requirement === "database") return byRole(/Database Health/i);
  if (requirement === "auth") return byRole(/Clerk Session|Admin Access/i);
  if (requirement === "stripe") return byRole(/Stripe Checkout|Membership Activation/i);
  if (requirement === "stripeWebhook") return byRole(/Webhook Delivery/i);
  if (requirement === "analytics") return byRole(/Google Ads|Meta Pixel|Landing Page Conversion/i);
  if (requirement === "monitoring") return byRole(/Incident Commander|Vercel Deployment/i);
  if (requirement === "azureOpenAI") return byRole(/MRagent Quality|Dashboard Metrics/i);
  if (requirement === "siteUrl") return byRole(/Vercel Deployment|Search Console/i);
  return null;
}

function nextActionFor(status: ServiceCheck["status"], requirement: string) {
  if (status === "configured") return "Monitor and verify with scheduled smoke checks.";
  if (requirement === "siteUrl") return "Set NEXT_PUBLIC_SITE_URL in production and redeploy.";
  if (requirement === "database") return "Set DATABASE_URL, run migrations and seed, then verify /api/health.";
  if (requirement === "auth") return "Set Clerk keys and ADMIN_CLERK_IDS, then verify login, signup, dashboard, and admin.";
  if (requirement === "stripe") return "Set Stripe secret and tier price IDs, then run a checkout test.";
  if (requirement === "stripeWebhook") return "Set Stripe webhook signing secret and verify signed checkout events.";
  if (requirement === "analytics") return "Set GTM, Google Ads, checkout conversion, and Meta Pixel IDs, then verify events.";
  if (requirement === "monitoring") return "Set SENTRY_DSN and trigger /api/monitoring/test.";
  if (requirement === "azureOpenAI") return "Set Azure OpenAI endpoint, key, deployment, and API version.";
  return "Configure required provider environment and rerun production audit.";
}

export function getOpsStatus() {
  const configured = configuredChecks();
  const serviceChecks: ServiceCheck[] = productionRequirements.map((requirement) => {
    const ready = configured[requirement.healthCheck] === true;
    const status = ready ? "configured" : "fallback";
    return {
      service: requirement.service,
      key: requirement.healthCheck,
      status,
      owner: ownerFor(requirement.healthCheck),
      requirementKeys: requirement.keys,
      unlocks: requirement.unlocks,
      nextAction: nextActionFor(status, requirement.healthCheck),
    };
  });

  const fallbackServices = serviceChecks.filter((check) => check.status === "fallback");
  const p0Owners = serviceChecks
    .filter((check) => check.status === "fallback" && check.owner?.escalation === "P0")
    .map((check) => check.owner)
    .filter((owner): owner is ActiveAgentEntry => Boolean(owner));

  return {
    status: fallbackServices.length === 0 ? "green" : "amber",
    service: "mindreply-ops-status",
    generatedAt: new Date().toISOString(),
    activeAgentCount: activeAgentRoster.length,
    configuredCount: serviceChecks.length - fallbackServices.length,
    fallbackCount: fallbackServices.length,
    serviceChecks,
    p0Owners,
    nextActions: fallbackServices.map((check) => ({
      service: check.service,
      owner: check.owner ? `${check.owner.id} ${check.owner.role}` : "MR-Core Operator",
      action: check.nextAction,
      requirementKeys: check.requirementKeys,
    })),
  };
}
