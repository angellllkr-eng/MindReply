import { existsSync, writeFileSync } from "node:fs";

const siteUrl = process.env.MRAGENT_SITE_URL || "https://www.mind-reply.com";
const endpoints = [
  { label: "home", url: `${siteUrl}/` },
  { label: "agent", url: `${siteUrl}/agent` },
  { label: "mcp", url: `${siteUrl}/mcp` },
  { label: "api-mcp", url: `${siteUrl}/api/mcp` },
  { label: "health", url: `${siteUrl}/api/health` },
  { label: "version", url: `${siteUrl}/api/version` },
  { label: "sitemap", url: `${siteUrl}/sitemap.xml` },
  { label: "robots", url: `${siteUrl}/robots.txt` },
  { label: "manifest", url: `${siteUrl}/manifest.webmanifest` },
  { label: "social-preview", url: `${siteUrl}/opengraph-image` },
];

const packSources = [
  { label: "personal-pack", path: "site/automation/personal-pack.yml" },
  { label: "slack-api", path: "site/automation/slack-api.yml" },
  { label: "vercel-build-limit", path: "site/automation/vercel-build-limit-runbook.yml" },
  { label: "verification-runbook", path: "site/automation/verification-runbook.yml" },
  { label: "preview-capture-script", path: "scripts/mragent-preview-capture.mjs" },
  { label: "preview-capture-workflow", path: ".github/workflows/mragent-preview-capture.yml" },
  { label: "growth-positioning", path: "site/growth/positioning.yml" },
  { label: "visibility-plan", path: "site/growth/visibility-plan.yml" },
  { label: "search-intents", path: "site/growth/search-intents.yml" },
  { label: "live-copy-sync", path: "site/growth/live-copy-sync.yml" },
  { label: "preview-qa", path: "site/growth/preview-qa.yml" },
  { label: "preview-results", path: "site/growth/preview-results.yml" },
  { label: "ad-messaging", path: "site/ads/messaging.yml" },
  { label: "ad-copy-tests", path: "site/ads/copy-tests.yml" },
  { label: "figma-loop", path: "site/design/figma-growth-loop.yml" },
  { label: "remotion-brief", path: "site/media/remotion-launch-brief.yml" },
];

function githubRun() {
  const repository = process.env.GITHUB_REPOSITORY || "Mind-Reply/MindReply";
  const runId = process.env.GITHUB_RUN_ID || "local";
  return {
    repository,
    ref: process.env.GITHUB_REF || "local",
    branch: process.env.GITHUB_REF_NAME || "local",
    sha: process.env.GITHUB_SHA || "local",
    runId,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT || "local",
    runUrl: runId === "local" ? null : `https://github.com/${repository}/actions/runs/${runId}`,
  };
}

function chooseDeploymentStatus(statuses) {
  const vercelStatuses = statuses.filter((status) => /vercel/i.test(status.context || ""));
  const active = vercelStatuses.find((status) => /mind-reply/i.test(status.context || ""));
  const legacy = vercelStatuses.find((status) => /mindreply/i.test(status.context || ""));
  const quotaLimited = vercelStatuses.find((status) => /build-rate-limit|upgradeToPro/i.test(status.targetUrl || ""));
  return {
    primary: active || vercelStatuses[0] || null,
    legacy: legacy || null,
    quotaLimited: quotaLimited || null,
    all: vercelStatuses,
  };
}

async function fetchCommitStatus(run) {
  if (!run.repository || run.sha === "local") {
    return { state: "local", statuses: [], deployment: { primary: null, legacy: null, quotaLimited: null, all: [] }, signal: "Commit status unavailable outside GitHub Actions." };
  }

  try {
    const headers = { "Accept": "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const response = await fetch(`https://api.github.com/repos/${run.repository}/commits/${run.sha}/status`, { headers });
    if (!response.ok) {
      return { state: "unknown", statuses: [], deployment: { primary: null, legacy: null, quotaLimited: null, all: [] }, signal: `GitHub status API returned ${response.status}.` };
    }
    const data = await response.json();
    const statuses = Array.isArray(data.statuses)
      ? data.statuses.map((status) => ({
          context: status.context,
          state: status.state,
          targetUrl: status.target_url,
          description: status.description,
        }))
      : [];
    const deployment = chooseDeploymentStatus(statuses);
    return {
      state: data.state || "unknown",
      statuses,
      deployment,
      signal: deployment.primary ? `${deployment.primary.context}: ${deployment.primary.state}` : "No Vercel status context found.",
    };
  } catch (error) {
    return {
      state: "error",
      statuses: [],
      deployment: { primary: null, legacy: null, quotaLimited: null, all: [] },
      signal: error instanceof Error ? error.message : "GitHub status request failed.",
    };
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function checkEndpoint(endpoint) {
  const started = Date.now();
  try {
    const response = await fetch(endpoint.url, { redirect: "follow" });
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text().catch(() => "");
    const data = /json/i.test(contentType) ? parseJson(text) : null;
    return {
      ...endpoint,
      status: response.status,
      ok: response.ok,
      ms: Date.now() - started,
      signal: summarize(endpoint.label, response.status, text, contentType, data),
      data,
    };
  } catch (error) {
    return {
      ...endpoint,
      status: "error",
      ok: false,
      ms: Date.now() - started,
      signal: error instanceof Error ? error.message : "request failed",
      data: null,
    };
  }
}

function summarize(label, status, text, contentType = "", data = null) {
  if ((label === "mcp" || label === "api-mcp") && status === 404) return "MCP route not live on production yet.";
  if (label === "health" && status === 404) return "Health route not live on production yet.";
  if (label === "version" && status === 404) return "Version route not live on production yet.";
  if (label === "sitemap" && status === 404) return "Sitemap not live on production yet.";
  if (label === "robots" && status === 404) return "Robots file not live on production yet.";
  if (label === "manifest" && status === 404) return "Manifest not live on production yet.";
  if (label === "social-preview" && status === 404) return "Social preview image not live on production yet.";
  if (status >= 500) return "Server error.";
  if (status >= 400) return "Blocked or missing.";
  if (label === "agent" && /MRagent|Mind Read|MindReply/i.test(text)) return "MRagent page visible.";
  if ((label === "mcp" || label === "api-mcp") && /prepare_mindread|render_mindread|fetch_receipt/i.test(text)) return "MCP tools visible.";
  if (label === "health" && /mcpApp|privacyDefaults|status/i.test(text)) return "Health JSON visible.";
  if (label === "version" && data?.deployment) return `Version visible: ${data.deployment.shortSha || "unknown sha"}.`;
  if (label === "sitemap" && /<urlset|\/agent|\/privacy/i.test(text)) return "Sitemap visible.";
  if (label === "robots" && /Sitemap|Allow/i.test(text)) return "Robots file visible.";
  if (label === "manifest" && /MindReply|MRagent/i.test(text)) return "Manifest visible.";
  if (label === "social-preview" && /^image\//i.test(contentType)) return "Social preview image visible.";
  return "Reachable.";
}

function row(result) {
  const mark = result.ok ? "ok" : "check";
  return `| ${result.label} | ${mark} | ${result.status} | ${result.ms}ms | ${result.signal.replace(/\|/g, "/")} |`;
}

function statusRow(status) {
  return `| ${status.context || "unknown"} | ${status.state || "unknown"} | ${status.targetUrl || ""} |`;
}

function sourceRow(source) {
  return `| ${source.label} | ${source.present ? "ok" : "check"} | ${source.path} |`;
}

function deploymentBlocker(commitStatus) {
  const primary = commitStatus.deployment?.primary;
  const quota = commitStatus.deployment?.quotaLimited;
  if (primary?.state === "failure") return `${primary.context}: failure`;
  if (primary?.state === "pending") return `${primary.context}: pending`;
  if (primary?.state === "success" && quota && quota.context !== primary.context) {
    return `legacy ${quota.context} is quota-limited; active ${primary.context} is success`;
  }
  if (commitStatus.state === "failure") return commitStatus.signal;
  return null;
}

function shortSha(value) {
  return typeof value === "string" && value.length > 0 ? value.slice(0, 12) : "unknown";
}

function chooseNextAction({ mcpLive, healthLive, versionLive, discoveryLive, packReady, commitStatus, productionMatchesRun }) {
  const primary = commitStatus.deployment?.primary;
  if (productionMatchesRun === false) return "Retarget the production domain to the active Vercel deployment, then rerun the monitor.";
  if (primary?.state === "failure") return "Fix the active Vercel deployment first, then rerun production checks.";
  if (primary?.state === "pending") return "Wait for the active Vercel deployment, then rerun production checks.";
  if (!mcpLive || !healthLive || !versionLive || !discoveryLive) return "Verify missing production surfaces after the active deployment is live.";
  if (!packReady) return "Restore missing personal-pack source files.";
  if (commitStatus.deployment?.quotaLimited && primary?.state === "success") return "Clean up the legacy quota-limited Vercel context or leave it documented as non-active.";
  return "Run MRagent Preview Capture, then attach desktop and mobile screenshots to the next status report.";
}

const generatedAt = new Date().toISOString();
const run = githubRun();
const [results, commitStatus] = await Promise.all([Promise.all(endpoints.map(checkEndpoint)), fetchCommitStatus(run)]);
const sourceResults = packSources.map((source) => ({ ...source, present: existsSync(source.path) }));
const byLabel = new Map(results.map((result) => [result.label, result]));
const liveCore = byLabel.get("agent")?.ok === true;
const mcpLive = byLabel.get("mcp")?.ok === true || byLabel.get("api-mcp")?.ok === true;
const healthLive = byLabel.get("health")?.ok === true;
const versionLive = byLabel.get("version")?.ok === true;
const versionData = byLabel.get("version")?.data;
const productionSha = versionData?.deployment?.commitSha || null;
const productionMatchesRun = run.sha === "local" || !productionSha ? null : productionSha === run.sha;
const discoveryLive = ["sitemap", "robots", "manifest", "social-preview"].every((label) => byLabel.get(label)?.ok === true);
const packReady = sourceResults.every((source) => source.present);
const staleBlocker = productionMatchesRun === false ? `production is stale: ${shortSha(productionSha)} live, ${shortSha(run.sha)} expected` : null;
const deployBlocker = deploymentBlocker(commitStatus);
const blocker = staleBlocker || deployBlocker || (mcpLive && healthLive && versionLive && discoveryLive ? "none detected" : "latest GitHub main is not fully deployed to production yet");
const nextAction = chooseNextAction({ mcpLive, healthLive, versionLive, discoveryLive, packReady, commitStatus, productionMatchesRun });
const opinion = staleBlocker
  ? "The active Vercel build can be green while the public domain still serves an older build; the version check now makes that visible."
  : packReady
    ? "The repo has a workable personal pack; active deployment health is now separated from legacy quota noise."
    : "The personal pack is incomplete.";

const report = {
  generatedAt,
  siteUrl,
  run,
  commitStatus,
  productionVersion: {
    liveSha: productionSha,
    expectedSha: run.sha === "local" ? null : run.sha,
    matchesRun: productionMatchesRun,
    data: versionData,
  },
  summary: {
    coreAgent: liveCore ? "live" : "check",
    mcpApp: mcpLive ? "live" : "not live",
    health: healthLive ? "live" : "not live",
    version: versionLive ? "live" : "not live",
    discoveryAssets: discoveryLive ? "live" : "not live",
    personalPack: packReady ? "ready" : "check",
    currentBlocker: blocker,
    opinion,
    nextAction,
  },
  surfaces: results.map(({ label, url, status, ok, ms, signal, data }) => ({ label, url, status, ok, latencyMs: ms, signal, data })),
  packSources: sourceResults,
};

if (process.env.MRAGENT_REPORT_JSON) {
  writeFileSync(process.env.MRAGENT_REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
}

console.log(`# MRagent 15-minute report`);
console.log("");
console.log(`Time: ${generatedAt}`);
console.log(`Site: ${siteUrl}`);
console.log(`Run: ${run.branch} ${run.sha.slice(0, 12)}`);
console.log(`Commit status: ${commitStatus.state} - ${commitStatus.signal}`);
console.log(`Production version: ${shortSha(productionSha)}${productionMatchesRun === false ? " (stale)" : productionMatchesRun === true ? " (current)" : " (unknown)"}`);
console.log(`Core agent: ${report.summary.coreAgent}`);
console.log(`MCP app: ${report.summary.mcpApp}`);
console.log(`Health: ${report.summary.health}`);
console.log(`Version: ${report.summary.version}`);
console.log(`Discovery assets: ${report.summary.discoveryAssets}`);
console.log(`Personal pack: ${report.summary.personalPack}`);
console.log(`Current blocker: ${blocker}`);
console.log("");
console.log("| Commit context | State | Target |");
console.log("| --- | --- | --- |");
for (const status of commitStatus.statuses) console.log(statusRow(status));
console.log("");
console.log("| Surface | Result | Status | Latency | Signal |");
console.log("| --- | --- | ---: | ---: | --- |");
for (const result of results) console.log(row(result));
console.log("");
console.log("| Pack source | Result | File |");
console.log("| --- | --- | --- |");
for (const source of sourceResults) console.log(sourceRow(source));
console.log("");
console.log(`Opinion: ${opinion}`);
console.log(`Next action: ${nextAction}`);
