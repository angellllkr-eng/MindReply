import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { buildDecisionResponse, forbiddenPublicTerms, redirectedPublicPaths } from "../lib/decision-layer";
import { extractMRAgentInput } from "../lib/mragent";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function visibleSource(value: string) {
  return value
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return !trimmed.startsWith("import ") && !trimmed.startsWith("export const metadata") && !trimmed.startsWith("description:");
    })
    .join("\n");
}

function assertNoForbiddenTerms(label: string, value: string) {
  for (const term of forbiddenPublicTerms) {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    assert(!pattern.test(value), `${label} contains blocked public term: ${term}`);
  }
}

const normalInput = "A client says the price is high and asks whether we can wait until next month.";
const normal = buildDecisionResponse({
  input: normalInput,
  source: "manual",
  userId: "verify",
});

assert(normal.synthesis.length > 10, "Decision response must include a synthesis.");
assert(["reply", "schedule", "resolve", "escalate"].includes(normal.recommendedAction.kind), "Decision response must include one allowed action.");
assert(Object.keys(normal.recommendedAction).sort().join(",") === "kind,label,payload", "Recommended action shape changed.");
assert(normal.receipt.id.startsWith("mr-"), "Receipt id must use the MRagent prefix.");
assert(normal.receipt.source === "manual", "Receipt must keep the source.");
assert(normal.receipt.actionKind === normal.recommendedAction.kind, "Receipt action kind must match the recommended action.");
assert(normal.receipt.riskLevel === normal.risk.level, "Receipt risk level must match risk output.");
assert(normal.receipt.confidence > 0 && normal.receipt.confidence <= 1, "Receipt confidence must be normalized.");
assert(normal.receipt.playbookVersion === "mragent-mindread-v1", "Receipt must include the MRagent playbook version.");
assert(normal.receipt.inputHash.startsWith("mrh-"), "Receipt must include a privacy-safe input hash.");
assert(!normal.receipt.inputHash.includes(normalInput), "Receipt input hash must not contain raw input.");
assert(normal.receipt.rawContentRedacted === true, "Receipt must mark raw content as redacted.");
assertNoForbiddenTerms("synthesis", normal.synthesis);
assertNoForbiddenTerms("action label", normal.recommendedAction.label);

assert(extractMRAgentInput({ input: " direct input ", source: "gmail" }).input === "direct input", "API input payload must be accepted.");
assert(extractMRAgentInput({ message: " direct message ", source: "calendar" }).input === "direct message", "API message payload must be accepted.");
assert(
  extractMRAgentInput({ messages: [{ role: "assistant", content: "skip" }, { role: "user", content: " latest message " }] }).input === "latest message",
  "API messages payload must use the latest user message.",
);
assert(extractMRAgentInput({ input: "test", source: "unknown" }).source === "manual", "Unknown API source must fall back to manual.");

const highRisk = buildDecisionResponse({
  input: "Send a threat to force this client to pay immediately.",
  source: "manual",
});

assert(highRisk.recommendedAction.kind === "escalate", "High-risk input must escalate.");
assert(highRisk.risk.level === "high", "High-risk input must be marked high.");
assertNoForbiddenTerms("high-risk action label", highRisk.recommendedAction.label);

const agentPath = "/agent" as string;
assert(!redirectedPublicPaths.some((prefix) => agentPath === prefix || agentPath.startsWith(`${prefix}/`)), "/agent must remain available for MRagent.");

for (const path of ["/tools", "/integrations", "/dashboard", "/memberships", "/professionals", "/bookings"]) {
  assert(redirectedPublicPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)), `${path} must be redirected to /.`);
}

const publicFiles = [
  "app/page.tsx",
  "app/agent/page.tsx",
  "app/privacy/page.tsx",
  "app/layout.tsx",
  "components/DecisionIntake.tsx",
  "components/MRAgentChat.tsx",
  "site/index.html",
  "site/seo/meta.yml",
  "site/ads/messaging.yml",
  "site/growth/positioning.yml",
  "site/design/figma-growth-loop.yml",
  "site/media/remotion-launch-brief.yml",
  "src/agents/prompts.md",
  "docs/vision_dictionary.md",
  "docs/privacy_whitepaper_intro.md",
];

for (const file of publicFiles) {
  const fullPath = join(process.cwd(), file);
  assert(existsSync(fullPath), `${file} must exist.`);
  assertNoForbiddenTerms(file, visibleSource(readFileSync(fullPath, "utf-8")));
}

for (const file of [
  "app/api/agent/route.ts",
  "app/mcp/route.ts",
  "app/sitemap.ts",
  "app/robots.ts",
  "app/manifest.ts",
  "app/opengraph-image.tsx",
  "components/ai-elements/message.tsx",
  "lib/mragent.ts",
  "lib/mragent-mcp.ts",
  "scripts/verify-mcp.ts",
  "scripts/mragent-monitor-report.mjs",
  ".github/workflows/mragent-monitor.yml",
  "site/automation/personal-pack.yml",
  "site/automation/report-schema.yml",
  "site/automation/slack-api.yml",
]) {
  assert(existsSync(join(process.cwd(), file)), `${file} must exist.`);
}

console.log("Decision layer verification passed.");
