import { existsSync } from "node:fs";

const siteUrl = process.env.MRAGENT_SITE_URL || "https://www.mind-reply.com";
const endpoints = [
  { label: "home", url: `${siteUrl}/` },
  { label: "agent", url: `${siteUrl}/agent` },
  { label: "mcp", url: `${siteUrl}/mcp` },
  { label: "health", url: `${siteUrl}/api/health` },
  { label: "sitemap", url: `${siteUrl}/sitemap.xml` },
  { label: "robots", url: `${siteUrl}/robots.txt` },
  { label: "manifest", url: `${siteUrl}/manifest.webmanifest` },
  { label: "social-preview", url: `${siteUrl}/opengraph-image` },
];

const packSources = [
  { label: "personal-pack", path: "site/automation/personal-pack.yml" },
  { label: "growth-positioning", path: "site/growth/positioning.yml" },
  { label: "ad-messaging", path: "site/ads/messaging.yml" },
  { label: "figma-loop", path: "site/design/figma-growth-loop.yml" },
  { label: "remotion-brief", path: "site/media/remotion-launch-brief.yml" },
];

async function checkEndpoint(endpoint) {
  const started = Date.now();
  try {
    const response = await fetch(endpoint.url, { redirect: "follow" });
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text().catch(() => "");
    return {
      ...endpoint,
      status: response.status,
      ok: response.ok,
      ms: Date.now() - started,
      signal: summarize(endpoint.label, response.status, text, contentType),
    };
  } catch (error) {
    return {
      ...endpoint,
      status: "error",
      ok: false,
      ms: Date.now() - started,
      signal: error instanceof Error ? error.message : "request failed",
    };
  }
}

function summarize(label, status, text, contentType = "") {
  if (label === "mcp" && status === 404) return "MCP route not live on production yet.";
  if (label === "health" && status === 404) return "Health route not live on production yet.";
  if (label === "sitemap" && status === 404) return "Sitemap not live on production yet.";
  if (label === "robots" && status === 404) return "Robots file not live on production yet.";
  if (label === "manifest" && status === 404) return "Manifest not live on production yet.";
  if (label === "social-preview" && status === 404) return "Social preview image not live on production yet.";
  if (status >= 500) return "Server error.";
  if (status >= 400) return "Blocked or missing.";
  if (label === "agent" && /MRagent|Mind Read|MindReply/i.test(text)) return "MRagent page visible.";
  if (label === "mcp" && /prepare_mindread|render_mindread|fetch_receipt/i.test(text)) return "MCP tools visible.";
  if (label === "health" && /mcpApp|privacyDefaults|status/i.test(text)) return "Health JSON visible.";
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

function sourceRow(source) {
  const present = existsSync(source.path);
  return `| ${source.label} | ${present ? "ok" : "check"} | ${source.path} |`;
}

function chooseNextAction({ mcpLive, healthLive, discoveryLive, packReady }) {
  if (!mcpLive || !healthLive || !discoveryLive) return "Clear Vercel build-rate-limit, then confirm latest GitHub main is live.";
  if (!packReady) return "Restore missing personal-pack source files.";
  return "Capture a fresh /agent production preview and turn it into the next design or video asset.";
}

const results = await Promise.all(endpoints.map(checkEndpoint));
const byLabel = new Map(results.map((result) => [result.label, result]));
const liveCore = byLabel.get("agent")?.ok === true;
const mcpLive = byLabel.get("mcp")?.ok === true;
const healthLive = byLabel.get("health")?.ok === true;
const discoveryLive = ["sitemap", "robots", "manifest", "social-preview"].every((label) => byLabel.get(label)?.ok === true);
const packReady = packSources.every((source) => existsSync(source.path));
const blocker = mcpLive && healthLive && discoveryLive ? "none detected" : "latest GitHub main is not fully deployed to production yet";
const nextAction = chooseNextAction({ mcpLive, healthLive, discoveryLive, packReady });

console.log(`# MRagent 15-minute report`);
console.log("");
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Site: ${siteUrl}`);
console.log(`Core agent: ${liveCore ? "live" : "check"}`);
console.log(`MCP app: ${mcpLive ? "live" : "not live"}`);
console.log(`Discovery assets: ${discoveryLive ? "live" : "not live"}`);
console.log(`Personal pack: ${packReady ? "ready" : "check"}`);
console.log(`Current blocker: ${blocker}`);
console.log("");
console.log("| Surface | Result | Status | Latency | Signal |");
console.log("| --- | --- | ---: | ---: | --- |");
for (const result of results) console.log(row(result));
console.log("");
console.log("| Pack source | Result | File |");
console.log("| --- | --- | --- |");
for (const source of packSources) console.log(sourceRow(source));
console.log("");
console.log(`Opinion: ${packReady ? "The repo has a workable personal pack; deploy quota is the loudest constraint." : "The personal pack is incomplete."}`);
console.log(`Next action: ${nextAction}`);
