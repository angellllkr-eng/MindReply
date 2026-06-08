import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { buildDecisionResponse, forbiddenPublicTerms, redirectedPublicPaths } from "../lib/decision-layer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertNoForbiddenTerms(label: string, value: string) {
  for (const term of forbiddenPublicTerms) {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    assert(!pattern.test(value), `${label} contains blocked public term: ${term}`);
  }
}

const normal = buildDecisionResponse({
  input: "A client says the price is high and asks whether we can wait until next month.",
  source: "manual",
  userId: "verify",
});

assert(normal.synthesis.length > 10, "Decision response must include a synthesis.");
assert(["reply", "schedule", "resolve", "escalate"].includes(normal.recommendedAction.kind), "Decision response must include one allowed action.");
assert(Object.keys(normal.recommendedAction).sort().join(",") === "kind,label,payload", "Recommended action shape changed.");
assertNoForbiddenTerms("synthesis", normal.synthesis);
assertNoForbiddenTerms("action label", normal.recommendedAction.label);

const highRisk = buildDecisionResponse({
  input: "Send a threat to force this client to pay immediately.",
  source: "manual",
});

assert(highRisk.recommendedAction.kind === "escalate", "High-risk input must escalate.");
assert(highRisk.risk.level === "high", "High-risk input must be marked high.");
assertNoForbiddenTerms("high-risk action label", highRisk.recommendedAction.label);

for (const path of ["/agent", "/tools", "/integrations", "/dashboard", "/memberships", "/professionals", "/bookings"]) {
  assert(redirectedPublicPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)), `${path} must be redirected to /.`);
}

const publicFiles = [
  "app/page.tsx",
  "app/privacy/page.tsx",
  "app/layout.tsx",
  "components/DecisionIntake.tsx",
  "site/index.html",
  "site/seo/meta.yml",
  "src/agents/prompts.md",
  "docs/vision_dictionary.md",
  "docs/privacy_whitepaper_intro.md",
];

for (const file of publicFiles) {
  const fullPath = join(process.cwd(), file);
  assert(existsSync(fullPath), `${file} must exist.`);
  assertNoForbiddenTerms(file, readFileSync(fullPath, "utf-8"));
}

console.log("Decision layer verification passed.");
