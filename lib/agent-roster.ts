export type AgentRosterEntry = {
  id: string;
  field: string;
  role: string;
  coverage: string;
  responsibility: string;
  escalation: "P0" | "P1" | "P2";
};

const fields = [
  {
    field: "Clinical Communication",
    roles: [
      "Clinical Boundary Reviewer",
      "Client Follow-up Specialist",
      "Crisis Language Triage",
      "Referral Note Specialist",
      "Therapeutic Tone Auditor",
      "Practice Intake Coordinator",
    ],
  },
  {
    field: "Executive Advisory",
    roles: [
      "Board Memo Architect",
      "Restructuring Message Specialist",
      "Founder Escalation Coach",
      "Chief-of-Staff Operator",
      "Investor Update Reviewer",
      "Leadership Presence Analyst",
    ],
  },
  {
    field: "Legal Communication",
    roles: [
      "Contract Language Reviewer",
      "Employment Risk Messenger",
      "Compliance Note Auditor",
      "Negotiation Follow-up Specialist",
      "Dispute De-escalation Analyst",
      "Policy Communication Operator",
    ],
  },
  {
    field: "Finance And Advisory",
    roles: [
      "Market Update Specialist",
      "Client Reassurance Analyst",
      "Runway Planning Communicator",
      "Portfolio Review Writer",
      "Risk Explanation Reviewer",
      "Financial Decision Note Operator",
    ],
  },
  {
    field: "Growth And Sales",
    roles: [
      "Landing Page Conversion Analyst",
      "Google Ads Monitor",
      "Meta Pixel Monitor",
      "Referral Loop Operator",
      "Sales Follow-up Writer",
      "Pipeline Signal Analyst",
    ],
  },
  {
    field: "Platform Operations",
    roles: [
      "Vercel Deployment Watch",
      "GitHub CI Watch",
      "CircleCI Build Watch",
      "Azure Service Watch",
      "Database Health Operator",
      "Incident Commander",
    ],
  },
  {
    field: "Payments And Membership",
    roles: [
      "Stripe Checkout Monitor",
      "Webhook Delivery Auditor",
      "Subscription Retention Operator",
      "Failed Payment Triage",
      "Membership Activation Specialist",
      "Refund And Dispute Triage",
    ],
  },
  {
    field: "Auth And Security",
    roles: [
      "Clerk Session Auditor",
      "Admin Access Reviewer",
      "Secret Rotation Coordinator",
      "Security Header Auditor",
      "Abuse Signal Triage",
      "Access Log Reviewer",
    ],
  },
  {
    field: "Content And SEO",
    roles: [
      "Search Console Monitor",
      "Sitemap Submission Operator",
      "Solution Page Copywriter",
      "Lexicon Content Curator",
      "Case Study Editor",
      "Metadata Auditor",
    ],
  },
  {
    field: "Data And Intelligence",
    roles: [
      "Dashboard Metrics Analyst",
      "Tool Usage Analyst",
      "Booking Funnel Analyst",
      "Member Cohort Reviewer",
      "MRagent Quality Auditor",
      "Daily Executive Reporter",
    ],
  },
] as const;

export const agentRoster: AgentRosterEntry[] = fields.flatMap((group, groupIndex) =>
  group.roles.map((role, roleIndex) => {
    const sequence = groupIndex * 6 + roleIndex + 1;
    return {
      id: `MR-OPS-${String(sequence).padStart(2, "0")}`,
      field: group.field,
      role,
      coverage: sequence % 3 === 0 ? "overnight on-call" : sequence % 2 === 0 ? "US business hours" : "EU/UK business hours",
      responsibility: `Own ${role.toLowerCase()} for MindReply production and write evidence-based handoffs.`,
      escalation: sequence % 10 === 0 ? "P0" : sequence % 2 === 0 ? "P1" : "P2",
    };
  }),
);

export function agentRosterSummary() {
  return {
    totalRoles: agentRoster.length,
    fields: fields.map((group) => ({
      field: group.field,
      roles: group.roles.length,
    })),
  };
}
