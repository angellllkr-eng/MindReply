import { activeAgentRoster, type ActiveAgentEntry } from "@/lib/agent-roster";
import { getAgentAccelerationCommand } from "@/lib/agent-acceleration";
import { getOpsStatus } from "@/lib/ops-status";

export type AgentExecutionQueueItem = {
  id: string;
  priority: "P0" | "P1";
  lane: ActiveAgentEntry["lane"];
  ownerId: string;
  ownerRole: string;
  service: string;
  action: string;
  actionRoute: string;
  evidenceRequired: string[];
  etaMinutes: number;
  revenueImpact: "direct" | "protective" | "enablement";
  source: "provider-readiness" | "revenue-motion";
};

function findOwner(match: RegExp, lane: ActiveAgentEntry["lane"] = "platform") {
  return activeAgentRoster.find((agent) => match.test(`${agent.field} ${agent.role}`))
    ?? activeAgentRoster.find((agent) => agent.lane === lane)
    ?? activeAgentRoster[0];
}

function laneForService(key: string): ActiveAgentEntry["lane"] {
  if (["stripe", "stripeWebhook", "bookingPayments", "analytics"].includes(key)) return "revenue";
  if (["auth", "database", "monitoring", "siteUrl", "slack", "coreIntegrations", "opsReports"].includes(key)) return "platform";
  if (key === "azureOpenAI") return "intelligence";
  return "trust";
}

function routeForService(key: string) {
  const routes: Record<string, string> = {
    siteUrl: "/api/config/requirements",
    database: "/api/health",
    auth: "/login",
    stripe: "/memberships",
    stripeWebhook: "/api/config/requirements",
    bookingPayments: "/professionals",
    analytics: "/solutions/psychologists",
    monitoring: "/api/ops/status",
    slack: "/integrations",
    coreIntegrations: "/integrations",
    opsReports: "/api/ops/status",
    azureOpenAI: "/agent",
  };

  return routes[key] ?? "/api/ops/status";
}

function priorityForService(key: string, owner: ActiveAgentEntry | null): AgentExecutionQueueItem["priority"] {
  if (owner?.escalation === "P0") return "P0";
  if (["database", "stripe", "stripeWebhook", "bookingPayments", "analytics", "auth"].includes(key)) return "P0";
  return "P1";
}

function etaFor(priority: AgentExecutionQueueItem["priority"], source: AgentExecutionQueueItem["source"]) {
  if (priority === "P0") return source === "revenue-motion" ? 15 : 10;
  return source === "revenue-motion" ? 20 : 30;
}

function revenueImpactFor(key: string): AgentExecutionQueueItem["revenueImpact"] {
  if (["stripe", "bookingPayments", "analytics"].includes(key)) return "direct";
  if (["auth", "database", "stripeWebhook", "monitoring"].includes(key)) return "protective";
  return "enablement";
}

const revenueMotions = [
  {
    id: "revenue-credits",
    service: "Credit Checkout",
    action: "Verify the 5-credit and 20-credit path moves users from tools to confirmed dashboard delivery.",
    actionRoute: "/tools",
    owner: /Stripe Checkout Monitor/i,
  },
  {
    id: "revenue-membership",
    service: "Membership Upgrade",
    action: "Push qualified users to Growth or Pro when repeated usage, memory, integrations, or priority support is needed.",
    actionRoute: "/memberships",
    owner: /Subscription Retention Operator/i,
  },
  {
    id: "revenue-booking",
    service: "Professional Booking",
    action: "Route high-stakes questions to a paid professional session with clear delivery expectation.",
    actionRoute: "/professionals",
    owner: /Membership Activation Specialist/i,
  },
  {
    id: "revenue-agent",
    service: "MRagent Sales Assist",
    action: "Confirm MRagent answers broad questions naturally and discreetly guides users to credits, bookings, Growth, or Pro.",
    actionRoute: "/agent",
    owner: /MRagent Quality Auditor/i,
  },
] as const;

function evidenceFor(source: AgentExecutionQueueItem["source"]) {
  if (source === "revenue-motion") {
    return ["route checked", "conversion action identified", "payment or signup path verified", "handoff recorded"];
  }

  return ["provider status checked", "owner assigned", "next action recorded", "verification route linked"];
}

export function getAgentExecutionQueue() {
  const opsStatus = getOpsStatus();
  const acceleration = getAgentAccelerationCommand();

  const fallbackItems: AgentExecutionQueueItem[] = opsStatus.serviceChecks
    .filter((check) => check.status === "fallback")
    .map((check) => {
      const owner = check.owner ?? findOwner(/Incident Commander|Vercel Deployment/i, laneForService(check.key));
      const priority = priorityForService(check.key, owner);
      return {
        id: `provider-${check.key}`,
        priority,
        lane: owner.lane,
        ownerId: owner.id,
        ownerRole: owner.role,
        service: check.service,
        action: check.nextAction,
        actionRoute: routeForService(check.key),
        evidenceRequired: evidenceFor("provider-readiness"),
        etaMinutes: etaFor(priority, "provider-readiness"),
        revenueImpact: revenueImpactFor(check.key),
        source: "provider-readiness",
      };
    });

  const revenueItems: AgentExecutionQueueItem[] = revenueMotions.map((motion, index) => {
    const owner = findOwner(motion.owner, "revenue");
    const priority: AgentExecutionQueueItem["priority"] = index < 3 ? "P0" : "P1";
    return {
      id: motion.id,
      priority,
      lane: owner.lane,
      ownerId: owner.id,
      ownerRole: owner.role,
      service: motion.service,
      action: motion.action,
      actionRoute: motion.actionRoute,
      evidenceRequired: evidenceFor("revenue-motion"),
      etaMinutes: etaFor(priority, "revenue-motion"),
      revenueImpact: "direct",
      source: "revenue-motion",
    };
  });

  const items = [...fallbackItems, ...revenueItems].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === "P0" ? -1 : 1;
    if (a.revenueImpact !== b.revenueImpact) return a.revenueImpact === "direct" ? -1 : 1;
    return a.etaMinutes - b.etaMinutes;
  });

  return {
    status: opsStatus.fallbackCount === 0 ? "green" : "action-required",
    service: "mindreply-agent-execution-queue",
    mode: "x66 execution queue",
    generatedAt: opsStatus.generatedAt,
    totalActiveAgents: activeAgentRoster.length,
    multiplier: acceleration.multiplier,
    fallbackCount: opsStatus.fallbackCount,
    itemCount: items.length,
    target: "Every active desk has a visible route, owner, evidence requirement, and next revenue or provider action.",
    items,
  };
}
