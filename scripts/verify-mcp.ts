import {
  callMRAgentTool,
  getMRAgentMcpManifest,
  getMRAgentWidgetHtml,
  MRAGENT_RESOURCE_MIME_TYPE,
  MRAGENT_WIDGET_URI,
} from "../lib/mragent-mcp";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.OPENAI_API_KEY;

  try {
    const manifest = getMRAgentMcpManifest();
    const toolNames = manifest.tools.map((tool) => tool.name).sort();

    assert(toolNames.join(",") === "fetch_receipt,prepare_mindread,render_mindread", "MCP tool names changed.");
    assert(manifest.resources[0]?.uri === MRAGENT_WIDGET_URI, "Widget resource URI changed.");
    assert(manifest.resources[0]?.mimeType === MRAGENT_RESOURCE_MIME_TYPE, "Widget MIME type changed.");

    const renderTool = manifest.tools.find((tool) => tool.name === "render_mindread") as {
      _meta?: { ui?: { resourceUri?: string }; [key: string]: unknown };
    };
    assert(renderTool?._meta?.ui?.resourceUri === MRAGENT_WIDGET_URI, "Render tool must attach the widget resource.");
    assert(renderTool?._meta?.["openai/outputTemplate"] === MRAGENT_WIDGET_URI, "Render tool must expose ChatGPT output template metadata.");

    const html = getMRAgentWidgetHtml();
    assert(html.includes("window.openai"), "Widget must read the ChatGPT bridge state.");
    assert(html.includes("ui/notifications/tool-result"), "Widget must listen for tool-result notifications.");
    assert(html.includes("One action"), "Widget must preserve the one-action surface.");

    const rawInput = "A client says the fee is too high and wants an answer now.";
    const prepared = await callMRAgentTool("prepare_mindread", { message: rawInput, source: "manual" });
    const structured = prepared.structuredContent as Record<string, unknown>;

    assert(typeof structured.generationId === "string" && structured.generationId.length > 10, "prepare_mindread must return a generation id.");
    assert(typeof structured.reply === "string" && structured.reply.length > 0, "prepare_mindread must return a reply.");
    assert(Boolean(structured.decision), "prepare_mindread must return decision output.");
    assert(Boolean(structured.receipt), "prepare_mindread must return a receipt.");

    const persistence = structured.persistence as { stored?: boolean; status?: string };
    assert(persistence.stored === false, "Missing Blob env must leave response usable with stored=false.");
    assert(persistence.status === "skipped", "Missing Blob env must report skipped persistence.");
    assert(!JSON.stringify(structured).includes(rawInput), "Structured output must not contain raw input.");

    const rendered = await callMRAgentTool("render_mindread", { message: rawInput, source: "manual" });
    const renderedMeta = rendered._meta as { ui?: { resourceUri?: string } };
    assert(renderedMeta.ui?.resourceUri === MRAGENT_WIDGET_URI, "render_mindread must return widget metadata.");

    const receipt = structured.receipt as { id?: string };
    assert(typeof receipt.id === "string" && receipt.id.startsWith("mr-"), "Receipt id must be returned.");

    const fetched = await callMRAgentTool("fetch_receipt", { receiptId: receipt.id });
    const fetchedContent = fetched.structuredContent as { found?: boolean; persistence?: { stored?: boolean } };
    assert(fetchedContent.found === false, "fetch_receipt should not find a Blob receipt without Blob env.");
    assert(fetchedContent.persistence?.stored === false, "fetch_receipt must expose skipped persistence without Blob env.");
  } finally {
    if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;

    if (originalOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAIKey;
  }

  console.log("MRagent MCP verification passed.");
}

void main();
