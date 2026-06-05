import { activeAgentRoster } from "@/lib/agent-roster";

const directActions = [
  { label: "Production smoke", href: "/api/health", owner: "Vercel Deployment Watch", access: "public", outcome: "Confirm site and API health before scaling traffic." },
  { label: "MRagent sales check", href: "/agent", owner: "MRagent Quality Auditor", access: "public", outcome: "Confirm broad chat, credits, booking, and Growth/Pro routing." },
  { label: "Buy credits", href: "/tools", owner: "Stripe Checkout Monitor", access: "public", outcome: "Move tool users directly into 5-credit or 20-credit checkout." },
  { label: "Book video session", href: "/professionals", owner: "Membership Activation Specialist", access: "public", outcome: "Route urgent users to field professional video/voice/text rooms." },
  { label: "Upgrade memory", href: "/memberships", owner: "Subscription Retention Operator", access: "public", outcome: "Convert Signal to Growth and Growth to Pro." },
  { label: "Ops status", href: "/api/ops/status", owner: "Incident Commander", access: "public", outcome: "Expose provider fallbacks, owners, and next actions." },
  { label: "Integration status", href: "/api/integrations/status", owner: "Slack/Gmail/Notion Operators", access: "public", outcome: "Show Pro integration readiness and missing provider setup." },
  { label: "Revenue observer", href: "/api/revenue/observer", owner: "Pipeline Signal Analyst", access: "owner", outcome: "Track 10-sales/day gap and revenue action queue without exposing owner revenue data." },
] as const;

const laneObjectives = [
  { lane: "revenue", priority: "P0", targetMinutes: 15, directive: "Push every qualified visitor to credits, booking, Growth, or Pro within one interaction." },
  { lane: "platform", priority: "P0", targetMinutes: 10, directive: "Keep deploy, health, auth, checkout, and integration status visible without silent failures." },
  { lane: "trust", priority: "P1", targetMinutes: 20, directive: "Route high-stakes clinical, legal, finance, and executive cases to professional review." },
  { lane: "intelligence", priority: "P1", targetMinutes: 20, directive: "Improve MRagent quality, usage insight, SEO reach, and daily executive reporting." },
] as const;

export type AgentAccelerationOptions = {
  activated?: boolean;
  requestedBy?: string;
  now?: Date;
};

export function getAgentAccelerationCommand(options: AgentAccelerationOptions = {}) {
  const now = options.now ?? new Date();
  const byLane = activeAgentRoster.reduce<Record<string, number>>((acc, agent) => {
    acc[agent.lane] = (acc[agent.lane] ?? 0) + 1;
    return acc;
  }, {});

  return {
    status: options.activated ? "activated" : "ready",
    generatedAt: now.toISOString(),
    mode: "x66 acceleration",
    multiplier: 66,
    totalActiveAgents: activeAgentRoster.length,
    command: "Collapse observation to action: every desk must report owner, route, evidence, and next revenue move.",
    target: "Faster paid conversion, faster provider issue detection, faster session delivery, and less passive UX.",
    activation: {
      active: true,
      requestedBy: options.requestedBy ?? "system",
      cycleMinutes: 15,
      immediateOrder: "All desks operate in 15-minute revenue, health, and satisfaction loops until checkout, tracking, and delivery are green.",
      evidenceRequired: [
        "route checked",
        "owner assigned",
        "next revenue action selected",
        "provider fallback or proof recorded",
      ],
      ownerOnlyEndpoints: [
        "/api/revenue/observer",
        "/api/agents/permanent",
        "/api/ops/report",
      ],
    },
    byLane,
    laneObjectives,
    directActions,
    nowQueue: [
      "Protect production health before scaling traffic.",
      "Move every qualified visitor toward credits, bookings, Growth, or Pro.",
      "Keep Slack, Gmail, and Notion framed as Pro dependency triggers.",
      "Record twice-daily owner reports when provider envs are configured.",
    ],
    operatingRules: [
      "No passive observation without a linked action route.",
      "Revenue desks prioritize credits, bookings, Growth, and Pro before broad marketing.",
      "Platform desks verify health, checkout, auth, integrations, and smoke routes first.",
      "Trust desks route regulated or high-risk cases to professional review.",
      "Every handoff records evidence, owner, and next action.",
    ],
  };
}
