const siteUrl = process.env.MRAGENT_SITE_URL || "https://www.mind-reply.com";
const endpoints = [
  { label: "home", url: `${siteUrl}/` },
  { label: "agent", url: `${siteUrl}/agent` },
  { label: "mcp", url: `${siteUrl}/mcp` },
  { label: "health", url: `${siteUrl}/api/health` },
];

async function checkEndpoint(endpoint) {
  const started = Date.now();
  try {
    const response = await fetch(endpoint.url, { redirect: "follow" });
    const text = await response.text().catch(() => "");
    return {
      ...endpoint,
      status: response.status,
      ok: response.ok,
      ms: Date.now() - started,
      signal: summarize(endpoint.label, response.status, text),
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

function summarize(label, status, text) {
  if (label === "mcp" && status === 404) return "MCP route not live on production yet.";
  if (label === "health" && status === 404) return "Health route not live on production yet.";
  if (status >= 500) return "Server error.";
  if (status >= 400) return "Blocked or missing.";
  if (label === "agent" && /MRagent|Mind Read|MindReply/i.test(text)) return "MRagent page visible.";
  if (label === "mcp" && /prepare_mindread|render_mindread|fetch_receipt/i.test(text)) return "MCP tools visible.";
  if (label === "health" && /mcpApp|privacyDefaults|status/i.test(text)) return "Health JSON visible.";
  return "Reachable.";
}

function row(result) {
  const mark = result.ok ? "ok" : "check";
  return `| ${result.label} | ${mark} | ${result.status} | ${result.ms}ms | ${result.signal.replace(/\|/g, "/")} |`;
}

const results = await Promise.all(endpoints.map(checkEndpoint));
const liveCore = results.find((result) => result.label === "agent")?.ok === true;
const mcpLive = results.find((result) => result.label === "mcp")?.ok === true;
const healthLive = results.find((result) => result.label === "health")?.ok === true;
const blocker = mcpLive && healthLive ? "none detected" : "latest GitHub main is not fully deployed to production yet";

console.log(`# MRagent 15-minute report`);
console.log("");
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Site: ${siteUrl}`);
console.log(`Core agent: ${liveCore ? "live" : "check"}`);
console.log(`MCP app: ${mcpLive ? "live" : "not live"}`);
console.log(`Current blocker: ${blocker}`);
console.log("");
console.log("| Surface | Result | Status | Latency | Signal |");
console.log("| --- | --- | ---: | ---: | --- |");
for (const result of results) console.log(row(result));
console.log("");
console.log("Next action: if MCP or health stay missing after Vercel quota resets, inspect the Vercel build logs for the first code-level failure.");
