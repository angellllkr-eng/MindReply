import { createHash, randomUUID } from "node:crypto";

import { buildDecisionResponse, type DecisionResponse, type IntakeSource } from "./decision-layer";

type ChatMessage = {
  role?: unknown;
  content?: unknown;
};

type AgentRequestBody = {
  input?: unknown;
  message?: unknown;
  messages?: unknown;
  source?: unknown;
};

type TokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

type ProviderResult = {
  reply: string;
  model: string;
  status: "completed" | "fallback";
  tokenUsage: TokenUsage | null;
};

export type MRAgentPersistence = {
  stored: boolean;
  provider: "vercel_blob";
  status: "stored" | "skipped" | "failed";
  receiptId: string;
  reason?: string;
  generationPath?: string;
  receiptPath?: string;
  access?: "private";
};

export type MRAgentPreparation = {
  id: string;
  generationId: string;
  decision: DecisionResponse;
  reply: string;
  receipt: DecisionResponse["receipt"];
  persistence: MRAgentPersistence;
  model: string;
  status: ProviderResult["status"];
  tokenUsage: TokenUsage | null;
};

const sources: IntakeSource[] = ["manual", "gmail", "calendar", "extension"];
const defaultModel = "gpt-5";

function normalizeSource(source: unknown): IntakeSource {
  return typeof source === "string" && sources.includes(source as IntakeSource) ? (source as IntakeSource) : "manual";
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function textFromContent(content: unknown): string {
  const direct = normalizeText(content);
  if (direct) return direct;

  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const value = part as { text?: unknown; content?: unknown };
      return normalizeText(value.text) || normalizeText(value.content);
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function extractMRAgentInput(body: unknown): { input: string; source: IntakeSource } {
  const value = (body && typeof body === "object" ? body : {}) as AgentRequestBody;
  const source = normalizeSource(value.source);
  const directInput = normalizeText(value.input) || normalizeText(value.message);

  if (directInput) return { input: directInput, source };

  const messages = Array.isArray(value.messages) ? (value.messages as ChatMessage[]) : [];
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message && message.role === "user" && textFromContent(message.content));

  return { input: latestUserMessage ? textFromContent(latestUserMessage.content) : "", source };
}

export function detailLine(decision: DecisionResponse) {
  return [
    decision.synthesis,
    decision.mindRead.reallyAbout,
    decision.mindRead.mindsetProtection,
    decision.mindRead.calmerMove,
  ].join("\n\n");
}

function actionLine(decision: DecisionResponse) {
  const payload = decision.recommendedAction.payload;
  if (typeof payload.draft === "string") return payload.draft;
  if (typeof payload.record === "string") return payload.record;
  if (typeof payload.reason === "string") return payload.reason;
  if (typeof payload.title === "string") return `Set: ${payload.title}.`;
  return decision.recommendedAction.label;
}

export function fallbackReply(decision: DecisionResponse) {
  return [
    "I am with you. Let us slow the room down a little.",
    `What this is really about: ${decision.mindRead.reallyAbout}`,
    `What your mind is protecting: ${decision.mindRead.mindsetProtection}`,
    `The calmer move: ${decision.mindRead.calmerMove}`,
    `One move: ${decision.recommendedAction.label}.`,
    actionLine(decision),
    "Keep it warm, lucid, and unhurried. You do not need to over-explain to be understood.",
  ].join("\n\n");
}

function inputHash(input: string) {
  return `sha256:${createHash("sha256").update(input).digest("hex")}`;
}

function outputTextFromResponse(data: unknown): string {
  const value = data as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown; type?: unknown }> }>;
  };

  if (typeof value.output_text === "string" && value.output_text.trim()) {
    return value.output_text.trim();
  }

  const output = Array.isArray(value.output) ? value.output : [];
  return output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function tokenUsageFromResponse(data: unknown): TokenUsage | null {
  const usage = (data as { usage?: Record<string, unknown> }).usage;
  if (!usage) return null;

  const inputTokens = typeof usage.input_tokens === "number" ? usage.input_tokens : undefined;
  const outputTokens = typeof usage.output_tokens === "number" ? usage.output_tokens : undefined;
  const totalTokens = typeof usage.total_tokens === "number" ? usage.total_tokens : undefined;

  if (inputTokens === undefined && outputTokens === undefined && totalTokens === undefined) return null;
  return { inputTokens, outputTokens, totalTokens };
}

async function providerReply(decision: DecisionResponse, generationId: string): Promise<ProviderResult> {
  const model = process.env.MRAGENT_MODEL || defaultModel;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      reply: fallbackReply(decision),
      model,
      status: "fallback",
      tokenUsage: null,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_output_tokens: 360,
        input: [
          {
            role: "system",
            content:
              "You are MRagent for MindReply: warm like a trusted best friend, confident like a calm operator, and precise about behavior. Return only the final prepared reply. Use uncommon but understandable words sparingly, such as equipoise, lucid, tender, unhurried, or ballast. Never flatter, never overwhelm, and always keep one action.",
          },
          {
            role: "user",
            content: JSON.stringify({
              generationId,
              synthesis: decision.synthesis,
              mindRead: decision.mindRead,
              risk: decision.risk,
              recommendedAction: decision.recommendedAction,
            }),
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Provider request failed with ${response.status}`);

    const data = await response.json();
    return {
      reply: outputTextFromResponse(data) || fallbackReply(decision),
      model,
      status: "completed",
      tokenUsage: tokenUsageFromResponse(data),
    };
  } catch {
    return {
      reply: fallbackReply(decision),
      model,
      status: "fallback",
      tokenUsage: null,
    };
  }
}

export function mragentPersistenceConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function persistGeneration(args: {
  generationId: string;
  decision: DecisionResponse;
  reply: string;
  model: string;
  status: ProviderResult["status"];
  tokenUsage: TokenUsage | null;
  sourceInputHash: string;
  createdAt: string;
}): Promise<MRAgentPersistence> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const receiptId = args.decision.receipt.id;

  if (!token) {
    return {
      stored: false,
      provider: "vercel_blob",
      status: "skipped",
      receiptId,
      reason: "BLOB_READ_WRITE_TOKEN is not configured.",
    };
  }

  try {
    const { put } = await import("@vercel/blob");
    const completedAt = new Date().toISOString();
    const generationPath = `mragent/generations/${args.generationId}.json`;
    const receiptPath = `mragent/receipts/${receiptId}.json`;
    const generationRecord = {
      generationId: args.generationId,
      status: args.status,
      source: args.decision.receipt.source,
      inputHash: args.sourceInputHash,
      decision: args.decision,
      reply: args.reply,
      model: args.model,
      tokenUsage: args.tokenUsage,
      receiptId,
      rawContentRedacted: true,
      createdAt: args.createdAt,
      completedAt,
    };
    const receiptRecord = {
      receipt: args.decision.receipt,
      generationId: args.generationId,
      status: args.status,
      inputHash: args.sourceInputHash,
      rawContentRedacted: true,
      createdAt: args.createdAt,
      completedAt,
    };

    await Promise.all([
      put(generationPath, JSON.stringify(generationRecord, null, 2), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        token,
      }),
      put(receiptPath, JSON.stringify(receiptRecord, null, 2), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        token,
      }),
    ]);

    return {
      stored: true,
      provider: "vercel_blob",
      status: "stored",
      receiptId,
      generationPath,
      receiptPath,
      access: "private",
    };
  } catch (error) {
    return {
      stored: false,
      provider: "vercel_blob",
      status: "failed",
      receiptId,
      reason: error instanceof Error ? error.message : "Generation persistence failed.",
    };
  }
}

export async function prepareMindRead(args: { input: string; source?: IntakeSource }): Promise<MRAgentPreparation> {
  const input = normalizeText(args.input);
  const source = normalizeSource(args.source);
  const generationId = randomUUID();
  const createdAt = new Date().toISOString();
  const decision = buildDecisionResponse({ input, source });
  const provider = await providerReply(decision, generationId);
  const persistence = await persistGeneration({
    generationId,
    decision,
    reply: provider.reply,
    model: provider.model,
    status: provider.status,
    tokenUsage: provider.tokenUsage,
    sourceInputHash: inputHash(input),
    createdAt,
  });

  return {
    id: generationId,
    generationId,
    decision,
    reply: provider.reply,
    receipt: decision.receipt,
    persistence,
    model: provider.model,
    status: provider.status,
    tokenUsage: provider.tokenUsage,
  };
}

export async function fetchStoredReceipt(receiptId: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return {
      found: false,
      receiptId,
      persistence: {
        stored: false,
        provider: "vercel_blob" as const,
        status: "skipped" as const,
        receiptId,
        reason: "BLOB_READ_WRITE_TOKEN is not configured.",
      },
    };
  }

  try {
    const { get } = await import("@vercel/blob");
    const receiptPath = `mragent/receipts/${receiptId}.json`;
    const receiptBlob = await get(receiptPath, { access: "private", token });

    if (!receiptBlob) {
      return { found: false, receiptId };
    }

    const response = await fetch(receiptBlob.downloadUrl, { cache: "no-store" });
    if (!response.ok) return { found: false, receiptId };

    const stored = await response.json();
    return {
      found: true,
      receiptId,
      receipt: (stored as { receipt?: unknown }).receipt ?? stored,
      rawContentRedacted: true,
    };
  } catch (error) {
    return {
      found: false,
      receiptId,
      error: error instanceof Error ? error.message : "Receipt lookup failed.",
    };
  }
}
