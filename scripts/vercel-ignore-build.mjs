import { execSync } from "node:child_process";

const allowedProductionHosts = new Set([
  "www.mind-reply.com",
  "mind-reply.com",
  "mind-reply-angellllkr-engs-projects.vercel.app",
  "mind-reply-git-main-angellllkr-engs-projects.vercel.app",
]);

const automationOnlyPrefixes = [
  ".github/",
  "site/automation/",
  "site/design/",
  "site/media/",
];

const automationOnlyFiles = new Set([
  "scripts/mragent-monitor-report.mjs",
]);

function normalizeHost(value = "") {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
}

function changedFiles(env = process.env) {
  if (env.MRAGENT_CHANGED_FILES) {
    return env.MRAGENT_CHANGED_FILES.split("\n").map((file) => file.trim()).filter(Boolean);
  }

  try {
    const previousSha = env.VERCEL_GIT_PREVIOUS_SHA || "HEAD~1";
    const output = execSync(`git diff --name-only ${previousSha} HEAD`, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
    return output.split("\n").map((file) => file.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function isAutomationOnly(file) {
  return automationOnlyFiles.has(file) || automationOnlyPrefixes.some((prefix) => file.startsWith(prefix));
}

function changeScope(env = process.env) {
  const files = changedFiles(env);
  if (files.length === 0) return { known: false, files, automationOnly: false };
  return { known: true, files, automationOnly: files.every(isAutomationOnly) };
}

export function shouldBuild(env = process.env) {
  const vercelEnv = env.VERCEL_ENV || "";
  const commitRef = env.VERCEL_GIT_COMMIT_REF || "";
  const productionHost = normalizeHost(env.VERCEL_PROJECT_PRODUCTION_URL || "");

  if (vercelEnv !== "production") {
    return { build: false, reason: `Skipping ${vercelEnv || "unknown"} deployment.` };
  }

  if (commitRef !== "main") {
    return { build: false, reason: `Skipping non-main branch ${commitRef || "unknown"}.` };
  }

  if (productionHost && !allowedProductionHosts.has(productionHost)) {
    return { build: false, reason: `Skipping duplicate Vercel project ${productionHost}.` };
  }

  const scope = changeScope(env);
  if (scope.known && scope.automationOnly) {
    return { build: false, reason: `Skipping automation-only change: ${scope.files.join(", ")}.` };
  }

  return { build: true, reason: "Building canonical MindReply production deployment." };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  assert(shouldBuild({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "main" }).build === false, "Preview deployments must be skipped.");
  assert(shouldBuild({ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: "feature" }).build === false, "Non-main production branches must be skipped.");
  assert(
    shouldBuild({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_PROJECT_PRODUCTION_URL: "mind-reply-lox1-angellllkr-engs-projects.vercel.app",
    }).build === false,
    "Duplicate Vercel projects must be skipped.",
  );
  assert(
    shouldBuild({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_PROJECT_PRODUCTION_URL: "mind-reply-angellllkr-engs-projects.vercel.app",
      MRAGENT_CHANGED_FILES: "site/automation/report-schema.yml\nscripts/mragent-monitor-report.mjs",
    }).build === false,
    "Automation-only changes must be skipped.",
  );
  assert(
    shouldBuild({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_PROJECT_PRODUCTION_URL: "mind-reply-angellllkr-engs-projects.vercel.app",
      MRAGENT_CHANGED_FILES: "app/page.tsx\nsite/automation/report-schema.yml",
    }).build === true,
    "App changes must build.",
  );
  assert(
    shouldBuild({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_PROJECT_PRODUCTION_URL: "mind-reply-angellllkr-engs-projects.vercel.app",
    }).build === true,
    "Canonical production project must build when change scope is unknown.",
  );
  console.log("Vercel ignore-build guard verification passed.");
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const result = shouldBuild();
  console.log(result.reason);
  process.exit(result.build ? 1 : 0);
}
