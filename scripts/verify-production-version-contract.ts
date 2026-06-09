import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(path: string) {
  const fullPath = join(process.cwd(), path);
  assert(existsSync(fullPath), `${path} must exist.`);
  return readFileSync(fullPath, "utf-8");
}

function includes(label: string, value: string, expected: string) {
  assert(value.includes(expected), `${label} must include: ${expected}`);
}

const packageJson = read("package.json");
const versionRoute = read("app/api/version/route.ts");
const healthRoute = read("app/api/health/route.ts");
const monitorReport = read("scripts/mragent-monitor-report.mjs");
const monitorWorkflow = read(".github/workflows/mragent-monitor.yml");
const incidentProbe = read("scripts/production-domain-incident.mjs");
const incidentWorkflow = read(".github/workflows/mragent-domain-incident.yml");
const growthPulse = read("scripts/mragent-growth-pulse.mjs");
const growthWorkflow = read(".github/workflows/mragent-growth-pulse.yml");
const shortDigest = read("scripts/mragent-short-digest.mjs");
const vercelIgnore = read("scripts/vercel-ignore-build.mjs");
const vercelGuardWorkflow = read(".github/workflows/vercel-guard-verify.yml");
const reportSchema = read("site/automation/report-schema.yml");
const vercelRunbook = read("site/automation/vercel-build-limit-runbook.yml");

includes("package scripts", packageJson, "\"incident:domain\"");
includes("package scripts", packageJson, "\"growth:pulse\"");
includes("package scripts", packageJson, "\"report:digest\"");
includes("version route", versionRoute, "VERCEL_GIT_COMMIT_SHA");
includes("version route", versionRoute, "VERCEL_PROJECT_PRODUCTION_URL");
includes("version route", versionRoute, "shortSha");
includes("health route", healthRoute, "version:");
includes("health route", healthRoute, "\"/api/version\"");
includes("monitor report", monitorReport, "{ label: \"version\"");
includes("monitor report", monitorReport, "{ label: \"agent-api\"");
includes("monitor report", monitorReport, "{ label: \"intake-api\"");
includes("monitor report", monitorReport, "hasAgentShape");
includes("monitor report", monitorReport, "hasDecisionShape");
includes("monitor report", monitorReport, "functionalChecks");
includes("monitor report", monitorReport, "decisionApi");
includes("monitor report", monitorReport, "productionVersion");
includes("monitor report", monitorReport, "production is stale");
includes("monitor report", monitorReport, "matchesRun");
includes("monitor workflow", monitorWorkflow, "*/15 * * * *");
includes("monitor workflow", monitorWorkflow, "scripts/mragent-monitor-report.mjs");
includes("monitor workflow", monitorWorkflow, "scripts/mragent-growth-pulse.mjs");
includes("monitor workflow", monitorWorkflow, "scripts/mragent-short-digest.mjs");
includes("monitor workflow", monitorWorkflow, "mragent-monitor-status.json");
includes("monitor workflow", monitorWorkflow, "mragent-growth-pulse.json");
includes("monitor workflow", monitorWorkflow, "mragent-short-digest.json");
includes("monitor workflow", monitorWorkflow, "mragent-short-digest.md");
includes("incident probe", incidentProbe, "fallback-only-domain");
includes("incident probe", incidentProbe, "stale-production-domain");
includes("incident probe", incidentProbe, "mragent-domain-incident.json");
includes("incident probe", incidentProbe, "preferred-agent-api");
includes("incident probe", incidentProbe, "fallback-intake-api");
includes("incident workflow", incidentWorkflow, "workflow_dispatch");
includes("incident workflow", incidentWorkflow, "scripts/production-domain-incident.mjs");
includes("incident workflow", incidentWorkflow, "mragent-domain-incident");
includes("growth pulse", growthPulse, "mragent-growth-pulse.json");
includes("growth pulse", growthPulse, "primaryLane");
includes("growth pulse", growthPulse, "copyTests");
includes("growth pulse", growthPulse, "recommendedAction");
includes("growth workflow", growthWorkflow, "workflow_dispatch");
includes("growth workflow", growthWorkflow, "18 9 * * 1");
includes("growth workflow", growthWorkflow, "scripts/mragent-growth-pulse.mjs");
includes("growth workflow", growthWorkflow, "mragent-growth-pulse");
includes("short digest", shortDigest, "mragent-short-digest.json");
includes("short digest", shortDigest, "mragent-short-digest.md");
includes("short digest", shortDigest, "MRagent short digest");
includes("short digest", shortDigest, "Blocker:");
includes("short digest", shortDigest, "Promise:");
includes("short digest", shortDigest, "Next:");
includes("vercel ignore", vercelIgnore, "scripts/mragent-monitor-report.mjs");
includes("vercel ignore", vercelIgnore, "scripts/mragent-growth-pulse.mjs");
includes("vercel ignore", vercelIgnore, "scripts/mragent-short-digest.mjs");
includes("vercel ignore", vercelIgnore, "scripts/production-domain-incident.mjs");
includes("vercel ignore", vercelIgnore, "Reporting-only script changes must be skipped.");
includes("vercel guard workflow", vercelGuardWorkflow, "Vercel Guard Verify");
includes("vercel guard workflow", vercelGuardWorkflow, "workflow_dispatch");
includes("vercel guard workflow", vercelGuardWorkflow, "node scripts/vercel-ignore-build.mjs --self-test");
includes("vercel guard workflow", vercelGuardWorkflow, "scripts/vercel-ignore-build.mjs");
includes("report schema", reportSchema, "productionVersion:");
includes("report schema", reportSchema, "functionalChecks:");
includes("report schema", reportSchema, "growth_pulse:");
includes("report schema", reportSchema, "short_digest:");
includes("report schema", reportSchema, "vercel_guard:");
includes("report schema", reportSchema, "fast Vercel guard verification");
includes("report schema", reportSchema, "every 15 minutes, weekly monday");
includes("report schema", reportSchema, "short digest artifact for fast status updates");
includes("report schema", reportSchema, "preferred_agent_api: https://www.mind-reply.com/api/agent");
includes("report schema", reportSchema, "fallback_intake_api: https://www.mind-reply.com/api/intake");
includes("report schema", reportSchema, "https://www.mind-reply.com/api/version");
includes("vercel runbook", vercelRunbook, "incident_probe:");
includes("vercel runbook", vercelRunbook, ".github/workflows/mragent-domain-incident.yml");
includes("vercel runbook", vercelRunbook, ".github/workflows/vercel-guard-verify.yml");
includes("vercel runbook", vercelRunbook, "scripts/production-domain-incident.mjs");
includes("vercel runbook", vercelRunbook, "scripts/mragent-growth-pulse.mjs");
includes("vercel runbook", vercelRunbook, "scripts/mragent-short-digest.mjs");

console.log("Production version contract verification passed.");
