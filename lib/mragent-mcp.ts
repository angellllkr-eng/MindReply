import { fetchStoredReceipt, prepareMindRead, type MRAgentPreparation } from "./mragent";
import type { IntakeSource } from "./decision-layer";

export const MRAGENT_WIDGET_URI = "ui://widget/mragent-mindread-v1.html";
export const MRAGENT_SERVER_INFO = { name: "mindreply-mragent", version: "0.2.1" };
export const MRAGENT_RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";

const sourceValues = ["manual", "gmail", "calendar", "extension"] as const;

function siteOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.mind-reply.com").origin;
  } catch {
    return "https://www.mind-reply.com";
  }
}

export function getMRAgentResourceMeta() {
  const origin = siteOrigin();
  return {
    ui: {
      prefersBorder: true,
      domain: origin,
      csp: {
        connectDomains: [origin],
        resourceDomains: [origin],
      },
    },
    "openai/widgetDescription": "Shows MRagent's warm Mind Read, one action, the risk gate, and a quiet receipt.",
    "openai/widgetPrefersBorder": true,
    "openai/widgetDomain": origin,
    "openai/widgetCSP": {
      connect_domains: [origin],
      resource_domains: [origin],
    },
  };
}

export function getMRAgentWidgetHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: #f4efe4; color: #162033; }
.shell { min-height: 100vh; padding: 18px; display: grid; gap: 14px; align-content: start; }
.header { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(22,32,51,.14); padding-bottom: 12px; }
.brand { display: grid; gap: 2px; }
.brand span { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #755d24; }
.brand strong { font-size: 20px; line-height: 1.1; }
.badge { border: 1px solid rgba(22,32,51,.16); border-radius: 999px; padding: 6px 10px; font-size: 12px; white-space: nowrap; background: rgba(255,255,255,.62); }
.grid { display: grid; gap: 10px; }
.panel { border: 1px solid rgba(22,32,51,.12); background: rgba(255,255,255,.72); border-radius: 8px; padding: 13px; display: grid; gap: 7px; }
.label { color: #755d24; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.value { font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; white-space: pre-line; }
.action { border-color: rgba(226,183,87,.45); background: #fff9eb; }
.footer { display: flex; gap: 8px; flex-wrap: wrap; color: #59636f; font-size: 12px; }
.footer span { border: 1px solid rgba(22,32,51,.12); border-radius: 999px; padding: 5px 8px; background: rgba(255,255,255,.62); }
.empty { color: #59636f; font-size: 14px; padding: 18px; border: 1px dashed rgba(22,32,51,.22); border-radius: 8px; background: rgba(255,255,255,.48); }
@media (min-width: 680px) { .grid { grid-template-columns: 1fr 1fr; } .wide { grid-column: 1 / -1; } }
</style>
</head>
<body>
<div class="shell">
  <header class="header">
    <div class="brand"><span>MindReply</span><strong>MRagent</strong></div>
    <div class="badge">One action</div>
  </header>
  <main id="root"><div class="empty">Waiting for a warm Mind Read.</div></main>
</div>
<script>
const root = document.getElementById("root");
function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}
function getData(toolResult) {
  return toolResult?.structuredContent || toolResult || window.openai?.toolOutput?.structuredContent || window.openai?.toolOutput || null;
}
function panel(label, value, className) {
  return '<section class="panel ' + (className || '') + '"><div class="label">' + esc(label) + '</div><div class="value">' + esc(value || 'Not ready') + '</div></section>';
}
function render(toolResult) {
  const data = getData(toolResult);
  if (!data || !data.decision) return;
  const decision = data.decision;
  const receipt = data.receipt || decision.receipt || {};
  root.innerHTML = '<div class="grid">'
    + panel('Mind Read', decision.mindRead?.reallyAbout, 'wide')
    + panel('Protection', decision.mindRead?.mindsetProtection, '')
    + panel('Calmer move', decision.mindRead?.calmerMove, '')
    + panel('One action', (decision.recommendedAction?.label || '') + '\n\n' + (data.reply || ''), 'action wide')
    + '</div><footer class="footer"><span>Receipt ' + esc(receipt.id) + '</span><span>' + esc(decision.risk?.level || 'low') + ' risk</span><span>' + esc(receipt.rawContentRedacted ? 'Raw input redacted' : 'Redaction pending') + '</span></footer>';
}
render(window.openai?.toolOutput);
window.addEventListener("openai:set_globals", (event) => render(event.detail?.toolOutput || window.openai?.toolOutput), { passive: true });
window.addEventListener("message", (event) => {
  if (event.source !== window.parent) return;
  const message = event.data;
  if (!message || message.jsonrpc !== "2.0") return;
  if (message.method === "ui/notifications/tool-result") render(message.params);
}, { passive: true });
</script>
</body>
</html>`;
}

function structuredContent(result: MRAgentPreparation) {
  return {
    generationId: result.generationId,
    decision: result.decision,
    reply: result.reply,
    receipt: result.receipt,
    persistence: result.persistence,
    model: result.model,
    status: result.status,
    tokenUsage: result.tokenUsage,
  };
}

function normalizeToolArgs(args: unknown) {
  const record = args && typeof args === "object" ? (args as Record<string, unknown>) : {};
  const message = typeof record.message === "string" ? record.message.trim() : "";
  const source = sourceValues.includes(record.source as IntakeSource) ? (record.source as IntakeSource) : "manual";
  return { message, source };
}

function jsonToolSchemas() {
  const sourceEnum = [...sourceValues];
  const prepare = {
    type: "object",
    additionalProperties: false,
    required: ["message"],
    properties: {
      message: { type: "string", minLength: 1 },
      source: { type: "string", enum: sourceEnum },
    },
  };
  const receipt = {
    type: "object",
    additionalProperties: false,
    required: ["receiptId"],
    properties: {
      receiptId: { type: "string", minLength: 1 },
    },
  };
  const preparationOutput = {
    type: "object",
    additionalProperties: true,
    required: ["generationId", "decision", "reply", "receipt", "persistence", "model", "status"],
    properties: {
      generationId: { type: "string" },
      decision: { type: "object" },
      reply: { type: "string" },
      receipt: { type: "object" },
      persistence: { type: "object" },
      model: { type: "string" },
      status: { type: "string", enum: ["completed", "fallback"] },
      tokenUsage: { type: ["object", "null"] },
    },
  };
  const receiptOutput = {
    type: "object",
    additionalProperties: true,
    required: ["found", "receiptId"],
    properties: {
      found: { type: "boolean" },
      receiptId: { type: "string" },
      receipt: { type: "object" },
      persistence: { type: "object" },
      rawContentRedacted: { type: "boolean" },
    },
  };
  return { prepare, receipt, preparationOutput, receiptOutput };
}

const preparationAnnotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const receiptAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };

export function getMRAgentMcpManifest() {
  const schemas = jsonToolSchemas();
  const resourceMeta = getMRAgentResourceMeta();

  return {
    serverInfo: MRAGENT_SERVER_INFO,
    resources: [
      {
        uri: MRAGENT_WIDGET_URI,
        name: "MRagent Mind Read",
        mimeType: MRAGENT_RESOURCE_MIME_TYPE,
        _meta: resourceMeta,
      },
    ],
    tools: [
      {
        name: "prepare_mindread",
        title: "Prepare Mind Read",
        description: "Use this when the user wants MRagent to read pressure, reflect behavior, optionally store a privacy-safe receipt, and return one warm next move without rendering a widget.",
        inputSchema: schemas.prepare,
        outputSchema: schemas.preparationOutput,
        annotations: preparationAnnotations,
      },
      {
        name: "render_mindread",
        title: "Render Mind Read",
        description: "Use this when the user wants a visual MRagent card showing the Mind Read, protection pattern, calmer move, risk gate, receipt, and persistence state.",
        inputSchema: schemas.prepare,
        outputSchema: schemas.preparationOutput,
        annotations: preparationAnnotations,
        _meta: {
          ui: { resourceUri: MRAGENT_WIDGET_URI },
          "openai/outputTemplate": MRAGENT_WIDGET_URI,
          "openai/toolInvocation/invoking": "MRagent is reading slowly",
          "openai/toolInvocation/invoked": "MRagent is ready",
        },
      },
      {
        name: "fetch_receipt",
        title: "Fetch Receipt",
        description: "Use this when the user needs to retrieve a stored privacy-safe MRagent receipt by receipt id.",
        inputSchema: schemas.receipt,
        outputSchema: schemas.receiptOutput,
        annotations: receiptAnnotations,
      },
    ],
  };
}

export async function callMRAgentTool(name: string, args: unknown) {
  if (name === "prepare_mindread" || name === "render_mindread") {
    const parsed = normalizeToolArgs(args);
    if (!parsed.message) throw new Error("message is required.");

    const result = await prepareMindRead({ input: parsed.message, source: parsed.source });
    const content = structuredContent(result);
    return {
      structuredContent: content,
      content: [{ type: "text" as const, text: `${content.decision.synthesis} ${content.decision.recommendedAction.label}.` }],
      _meta: name === "render_mindread" ? { ui: { resourceUri: MRAGENT_WIDGET_URI }, generationId: result.generationId } : { generationId: result.generationId },
    };
  }

  if (name === "fetch_receipt") {
    const record = args && typeof args === "object" ? (args as Record<string, unknown>) : {};
    const receiptId = typeof record.receiptId === "string" ? record.receiptId.trim() : "";
    if (!receiptId) throw new Error("receiptId is required.");

    const receipt = await fetchStoredReceipt(receiptId);
    return {
      structuredContent: receipt,
      content: [{ type: "text" as const, text: receipt.found ? "Receipt found." : "Receipt not found." }],
      _meta: {},
    };
  }

  throw new Error(`Unknown MRagent tool: ${name}`);
}
