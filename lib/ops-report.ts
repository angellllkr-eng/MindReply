import { activeAgentRoster, agentRoster, agentRosterSummary } from "@/lib/agent-roster";
import { getGrowthPlan } from "@/lib/growth-engine";
import { logMetric } from "@/lib/metrics";
import { getOpsStatus } from "@/lib/ops-status";
import { getOpsReportFrom, getOpsReportRecipient } from "@/lib/ops-report-config";
import { getRevenueObservation, type RevenueObservation } from "@/lib/revenue-observer";

type EmailResult = {
  sent: boolean;
  provider: "resend";
  id?: string;
  reason?: string;
  status?: number;
};

type RelayResult = {
  sent: boolean;
  provider: "azure-functions";
  reason?: string;
  status?: number;
};

export type OpsReport = {
  status: "green" | "amber" | "red";
  service: "mindreply-permanent-ops";
  generatedAt: string;
  reportCadence: "twice daily";
  recipient: string;
  salesObserver: RevenueObservation;
  agents: {
    totalPermanentRoles: number;
    activeAutomationDesks: number;
    hiringBacklog: number;
    recruiterMission: string;
    fields: ReturnType<typeof agentRosterSummary>["fields"];
    activeByLane: Record<string, number>;
    learningRhythm: string[];
  };
  operations: ReturnType<typeof getOpsStatus>;
  growth: {
    rhythm: string;
    conversionFunnel: string[];
    p0Actions: string[];
  };
  engagement: {
    objective: string;
    checks: string[];
  };
  nextActions: string[];
};

function activeByLane() {
  return activeAgentRoster.reduce<Record<string, number>>((acc, agent) => {
    acc[agent.lane] = (acc[agent.lane] ?? 0) + 1;
    return acc;
  }, {});
}

function reportStatus(opsStatus: ReturnType<typeof getOpsStatus>, revenue: RevenueObservation): OpsReport["status"] {
  if (opsStatus.status === "green" && revenue.status === "green") return "green";
  if (revenue.status === "red" || revenue.status === "blocked" || opsStatus.fallbackCount > 0) return "red";
  return "amber";
}

export async function buildOpsReport(): Promise<OpsReport> {
  const generatedAt = new Date().toISOString();
  const summary = agentRosterSummary();
  const operations = getOpsStatus();
  const salesObserver = await getRevenueObservation(new Date(generatedAt));
  const growth = getGrowthPlan();

  return {
    status: reportStatus(operations, salesObserver),
    service: "mindreply-permanent-ops",
    generatedAt,
    reportCadence: "twice daily",
    recipient: getOpsReportRecipient(),
    salesObserver,
    agents: {
      totalPermanentRoles: agentRoster.length,
      activeAutomationDesks: activeAgentRoster.length,
      hiringBacklog: Math.max(0, agentRoster.length - activeAgentRoster.length),
      recruiterMission: "Keep hiring and onboarding field operators until every permanent role has an owner, backup, evidence cadence, and escalation path.",
      fields: summary.fields,
      activeByLane: activeByLane(),
      learningRhythm: [
        "Daily: read production runbook, health requirements, and previous handoff before action.",
        "Twice daily: file evidence-based report with health, revenue, analytics, payments, satisfaction, and risks.",
        "Weekly: add skill notes from incidents, ad performance, user objections, and conversion wins.",
      ],
    },
    operations,
    growth: {
      rhythm: growth.rhythm,
      conversionFunnel: growth.conversionFunnel,
      p0Actions: growth.actions.filter((action) => action.priority === "P0").map((action) => action.action),
    },
    engagement: {
      objective: "Keep members engaged after purchase through immediate product delivery, dashboard activation, referral prompts, and support triage.",
      checks: [
        "Checkout success confirms Stripe session before paid conversion tracking.",
        "Dashboard displays active product access after payment confirmation.",
        "Operators review failed payments and booking issues during every report cycle.",
        "MRagent and tools remain available so visitors can experience value before checkout.",
      ],
    },
    nextActions: [
      ...operations.nextActions.slice(0, 5).map((item) => `${item.service}: ${item.action}`),
      ...salesObserver.nextActions.slice(0, 3),
    ],
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderOpsReportText(report: OpsReport) {
  return [
    `MindReply Ops Report - ${report.generatedAt}`,
    `Status: ${report.status}`,
    `Recipient: ${report.recipient}`,
    "",
    `Sales today: ${report.salesObserver.todaySales ?? "unmeasured"} / ${report.salesObserver.targetPerDay}`,
    `First-week sales: ${report.salesObserver.firstWeek.actualSales ?? "unmeasured"} / ${report.salesObserver.firstWeek.targetSales}`,
    `Production fallback checks: ${report.operations.fallbackCount}`,
    `Permanent roles: ${report.agents.totalPermanentRoles}`,
    `Active automation desks: ${report.agents.activeAutomationDesks}`,
    `Hiring backlog: ${report.agents.hiringBacklog}`,
    "",
    "Next actions:",
    ...report.nextActions.map((action) => `- ${action}`),
  ].join("\n");
}

export function renderOpsReportHtml(report: OpsReport) {
  const nextActions = report.nextActions.map((action) => `<li>${escapeHtml(action)}</li>`).join("");
  const fallbackServices = report.operations.serviceChecks
    .filter((check) => check.status === "fallback")
    .map((check) => `<li><strong>${escapeHtml(check.service)}</strong>: ${escapeHtml(check.nextAction)}</li>`)
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f3ee;color:#14233f;font-family:Arial,sans-serif;">
    <main style="max-width:720px;margin:0 auto;padding:28px;">
      <h1 style="margin:0 0 8px;font-size:26px;">MindReply Permanent Ops Report</h1>
      <p style="margin:0 0 24px;color:#536178;">${escapeHtml(report.generatedAt)} - status: <strong>${escapeHtml(report.status)}</strong></p>
      <section style="background:#14233f;color:#fff6df;border-radius:14px;padding:20px;margin-bottom:18px;">
        <h2 style="margin:0 0 12px;">Revenue Observer</h2>
        <p style="font-size:18px;margin:0 0 8px;">Today: <strong>${report.salesObserver.todaySales ?? "unmeasured"}</strong> / ${report.salesObserver.targetPerDay} sales</p>
        <p style="margin:0;">First week: <strong>${report.salesObserver.firstWeek.actualSales ?? "unmeasured"}</strong> / ${report.salesObserver.firstWeek.targetSales}; gap: ${report.salesObserver.firstWeek.gap ?? "unmeasured"}</p>
      </section>
      <section style="background:#fff;border-radius:14px;padding:20px;margin-bottom:18px;">
        <h2 style="margin:0 0 12px;">Agents And Hiring</h2>
        <p>Permanent roles: <strong>${report.agents.totalPermanentRoles}</strong>. Active automation desks: <strong>${report.agents.activeAutomationDesks}</strong>. Hiring backlog: <strong>${report.agents.hiringBacklog}</strong>.</p>
        <p>${escapeHtml(report.agents.recruiterMission)}</p>
      </section>
      <section style="background:#fff;border-radius:14px;padding:20px;margin-bottom:18px;">
        <h2 style="margin:0 0 12px;">Fallback Services</h2>
        <ul>${fallbackServices || "<li>None. Required checks are configured.</li>"}</ul>
      </section>
      <section style="background:#fff;border-radius:14px;padding:20px;">
        <h2 style="margin:0 0 12px;">Next Actions</h2>
        <ul>${nextActions}</ul>
      </section>
    </main>
  </body>
</html>`;
}

async function parseJsonResponse(response: Response) {
  try {
    return await response.json() as { id?: string; message?: string; error?: string };
  } catch {
    return {};
  }
}

export async function sendOpsReportEmail(report: OpsReport): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getOpsReportFrom();

  if (!apiKey) return { sent: false, provider: "resend", reason: "RESEND_API_KEY is not configured." };
  if (!from) return { sent: false, provider: "resend", reason: "OPS_REPORT_FROM is not configured." };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [report.recipient],
      subject: `MindReply ${report.status.toUpperCase()} ops report - ${report.salesObserver.todaySales ?? "unmeasured"}/${report.salesObserver.targetPerDay} sales today`,
      html: renderOpsReportHtml(report),
      text: renderOpsReportText(report),
    }),
  });

  const payload = await parseJsonResponse(response);
  const result: EmailResult = response.ok
    ? { sent: true, provider: "resend", id: payload.id, status: response.status }
    : { sent: false, provider: "resend", reason: payload.message ?? payload.error ?? response.statusText, status: response.status };

  await logMetric({
    eventName: "ops.report.email",
    eventValue: {
      sent: result.sent,
      provider: result.provider,
      status: result.status ?? null,
      recipientDomain: report.recipient.split("@")[1] ?? "unknown",
    },
  });

  return result;
}

export async function relayOpsReportToAzure(report: OpsReport): Promise<RelayResult> {
  const url = process.env.AZURE_OPS_REPORT_WEBHOOK_URL;
  if (!url) return { sent: false, provider: "azure-functions", reason: "AZURE_OPS_REPORT_WEBHOOK_URL is not configured." };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.AZURE_OPS_REPORT_WEBHOOK_KEY ? { "x-functions-key": process.env.AZURE_OPS_REPORT_WEBHOOK_KEY } : {}),
    },
    body: JSON.stringify(report),
  });

  return response.ok
    ? { sent: true, provider: "azure-functions", status: response.status }
    : { sent: false, provider: "azure-functions", reason: response.statusText, status: response.status };
}
