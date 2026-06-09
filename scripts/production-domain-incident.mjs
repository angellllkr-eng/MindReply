import { writeFileSync } from "node:fs";

const siteUrl = process.env.MRAGENT_SITE_URL || "https://www.mind-reply.com";
const outputPath = process.env.MRAGENT_DOMAIN_INCIDENT_JSON || "mragent-domain-incident.json";
const samplePressure = "A client says the fee is high and wants an answer today.";

const probes = [
  { label: "agent-page", url: `${siteUrl}/agent`, method: "GET" },
  { label: "preferred-agent-api", url: `${siteUrl}/api/agent`, method: "POST", body: { message: samplePressure, source: "manual" } },
  { label: "fallback-intake-api", url: `${siteUrl}/api/intake`, method: "POST", body: { input: samplePressure, source: "manual" } },
  { label: "version", url: `${siteUrl}/api/version`, method: "GET" },
  { label: "health", url: `${siteUrl}/api/health`, method: "GET" },
  { label: "mcp", url: `${siteUrl}/mcp`, method: "GET" },
  { label: "api-mcp", url: `${siteUrl}/api/mcp`, method: "GET" },
];

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function hasPreferredAgentShape(data) {
  return Boolean(data?.reply && data?.decision?.recommendedAction?.kind && data?.decision?.risk?.level && data?.receipt?.id);
}

function hasFallbackDecisionShape(data) {
  return Boolean(data?.synthesis && data?.recommendedAction?.kind && data?.risk?.level && data?.receipt?.id);
}

function compactData(label, data) {
  if (!data) return null;
  if (label === "preferred-agent-api") {
    return {
      hasReply: Boolean(data.reply),
      action: data.decision?.recommendedAction?.kind || null,
      risk: data.decision?.risk?.level || null,
      receiptId: data.receipt?.id || null,
    };
  }
  if (label === "fallback-intake-api") {
    return {
      hasSynthesis: Boolean(data.synthesis),
      action: data.recommendedAction?.kind || null,
      risk: data.risk?.level || null,
      receiptId: data.receipt?.id || null,
    };
  }
  if (label === "version") {
    return {
      shortSha: data.deployment?.shortSha || null,
      commitSha: data.deployment?.commitSha || null,
      environment: data.deployment?.environment || null,
      url: data.deployment?.url || null,
      projectProductionUrl: data.deployment?.projectProductionUrl || null,
    };
  }
  if (label === "health") {
    return {
      status: data.status || null,
      hasVersion: Boolean(data.version),
      mcpApp: data.checks?.mcpApp || null,
      connectionUrls: data.connectionUrls || null,
    };
  }
  return data;
}

function classifyProbe(label, response, text, data) {
  if (!response.ok) {
    if (response.status === 410) return "stale-or-retired-route";
    if (response.status === 404) return "missing-route";
    return "http-error";
  }
  if (label === "agent-page") return /MRagent|Mind Read|MindReply/i.test(text) ? "page-visible" : "page-unexpected";
  if (label === "preferred-agent-api") return hasPreferredAgentShape(data) ? "functional" : "bad-shape";
  if (label === "fallback-intake-api") return hasFallbackDecisionShape(data) ? "functional" : "bad-shape";
  if (label === "version") return data?.deployment ? "version-visible" : "bad-shape";
  if (label === "health") return data?.checks ? "health-visible" : "bad-shape";
  if (label === "mcp" || label === "api-mcp") return /prepare_mindread|render_mindread|fetch_receipt/i.test(text) ? "mcp-visible" : "reachable";
  return "reachable";
}

async function probe(target) {
  const started = Date.now();
  try {
    const init = target.method === "POST"
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(target.body || {}),
          redirect: "follow",
        }
      : { method: "GET", redirect: "follow" };
    const response = await fetch(target.url, init);
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text().catch(() => "");
    const data = /json/i.test(contentType) ? parseJson(text) : null;
    return {
      label: target.label,
      method: target.method,
      url: target.url,
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - started,
      classification: classifyProbe(target.label, response, text, data),
      data: compactData(target.label, data),
    };
  } catch (error) {
    return {
      label: target.label,
      method: target.method,
      url: target.url,
      ok: false,
      status: "error",
      latencyMs: Date.now() - started,
      classification: "request-error",
      error: error instanceof Error ? error.message : "request failed",
      data: null,
    };
  }
}

const generatedAt = new Date().toISOString();
const results = await Promise.all(probes.map(probe));
const byLabel = new Map(results.map((result) => [result.label, result]));
const pageVisible = byLabel.get("agent-page")?.classification === "page-visible";
const preferredApiWorks = byLabel.get("preferred-agent-api")?.classification === "functional";
const fallbackApiWorks = byLabel.get("fallback-intake-api")?.classification === "functional";
const versionVisible = byLabel.get("version")?.classification === "version-visible";
const healthHasVersion = byLabel.get("health")?.data?.hasVersion === true;
const mcpWorks = ["mcp", "api-mcp"].some((label) => byLabel.get(label)?.classification === "mcp-visible");

const incident = !versionVisible || !healthHasVersion || !preferredApiWorks || !mcpWorks;
const diagnosis = !pageVisible
  ? "public-agent-page-down"
  : fallbackApiWorks && !preferredApiWorks
    ? "fallback-only-domain"
    : !versionVisible || !healthHasVersion
      ? "stale-production-domain"
      : !mcpWorks
        ? "mcp-surface-missing"
        : "healthy";
const nextAction = diagnosis === "healthy"
  ? "Run preview capture and attach desktop/mobile artifacts."
  : diagnosis === "fallback-only-domain"
    ? "Retarget www.mind-reply.com to the active mind-reply Vercel project or promote the latest deployment; fallback route works but preferred route is stale."
    : diagnosis === "stale-production-domain"
      ? "Retarget www.mind-reply.com to the active mind-reply Vercel project, then rerun this incident probe."
      : "Fix the failing public surface, then rerun this incident probe.";

const report = {
  generatedAt,
  siteUrl,
  incident,
  diagnosis,
  summary: {
    pageVisible,
    preferredApiWorks,
    fallbackApiWorks,
    versionVisible,
    healthHasVersion,
    mcpWorks,
    nextAction,
  },
  probes: results,
};

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

console.log(`# MRagent production-domain incident probe`);
console.log("");
console.log(`Time: ${generatedAt}`);
console.log(`Site: ${siteUrl}`);
console.log(`Diagnosis: ${diagnosis}`);
console.log(`Incident: ${incident ? "yes" : "no"}`);
console.log(`Next action: ${nextAction}`);
console.log("");
console.log("| Probe | Result | Status | Latency | URL |");
console.log("| --- | --- | ---: | ---: | --- |");
for (const result of results) {
  console.log(`| ${result.label} | ${result.classification} | ${result.status} | ${result.latencyMs}ms | ${result.url} |`);
}

if (incident) process.exitCode = 1;
