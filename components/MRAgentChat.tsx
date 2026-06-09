"use client";

import { useMemo, useState } from "react";
import { ArrowUp, Feather, HeartHandshake, Loader2, LockKeyhole, RotateCcw, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";
import type { DecisionResponse } from "@/lib/decision-layer";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  decision?: DecisionResponse;
};

type AgentResponse = {
  id: string;
  generationId: string;
  reply: string;
  decision: DecisionResponse;
  status: "completed" | "fallback";
  persistence?: { stored?: boolean; status?: string; receiptId?: string };
};

type MRAgentChatProps = {
  compact?: boolean;
};

const starter: ChatMessage = {
  id: "mra-welcome",
  role: "assistant",
  content:
    "Come here. Put the charged thing down for a second. I will read the pressure beneath it, name what your mind is protecting, and hand you one composed move.",
};

const readingPhases = ["listening under the words", "finding the pressure pattern", "checking the risk gate", "choosing one clean move"];

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function confidenceText(value?: number) {
  if (!value) return "soft read";
  if (value >= 0.82) return "clear read";
  if (value >= 0.72) return "careful read";
  return "gentle read";
}

async function readJson(response: Response) {
  return response.json().catch(() => ({}));
}

function adaptIntakeResponse(decision: DecisionResponse): AgentResponse {
  return {
    id: decision.receipt.id,
    generationId: decision.receipt.id,
    reply: decision.synthesis,
    decision,
    status: "fallback",
    persistence: {
      stored: false,
      status: "legacy-intake",
      receiptId: decision.receipt.id,
    },
  };
}

async function requestMindRead(text: string): Promise<Partial<AgentResponse> & { error?: string }> {
  const agentResponse = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, source: "manual" }),
  });
  const agentData = (await readJson(agentResponse)) as Partial<AgentResponse> & { error?: string };

  if (agentResponse.ok && typeof agentData.reply === "string" && agentData.decision) {
    return agentData;
  }

  const intakeResponse = await fetch("/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: text, source: "manual" }),
  });
  const intakeData = (await readJson(intakeResponse)) as Partial<DecisionResponse> & { error?: string };

  if (!intakeResponse.ok || !intakeData.receipt || !intakeData.recommendedAction) {
    return { error: agentData.error ?? intakeData.error ?? "MRagent could not read that cleanly. Bring the pressure a little closer." };
  }

  return adaptIntakeResponse(intakeData as DecisionResponse);
}

export default function MRAgentChat({ compact = false }: MRAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);
  const [input, setInput] = useState("I need to answer someone gently, but I feel pressure to decide too fast.");
  const [loading, setLoading] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [error, setError] = useState("");

  const lastDecision = useMemo(() => [...messages].reverse().find((message) => message.decision)?.decision, [messages]);

  async function submit(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { id: makeId("user"), role: "user", content: text };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");
    setPhaseIndex(0);

    try {
      for (let index = 0; index < readingPhases.length; index += 1) {
        setPhaseIndex(index);
        await sleep(index === 0 ? 420 : 560);
      }

      const data = await requestMindRead(text);

      if (typeof data.reply !== "string" || !data.decision) {
        setError(data.error ?? "MRagent could not read that cleanly. Bring the pressure a little closer.");
        return;
      }

      const assistantMessage: ChatMessage = {
        id: data.id ?? data.generationId ?? makeId("assistant"),
        role: "assistant",
        content: data.reply,
        decision: data.decision,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setError("MRagent lost the thread for a moment. Try again; keep the same words if they matter.");
    } finally {
      setLoading(false);
      setPhaseIndex(0);
    }
  }

  const latestUserText = [...messages].reverse().find((message) => message.role === "user")?.content ?? input;

  return (
    <section className={compact ? "h-full bg-[#0d1729] text-[#f8f5f0]" : "mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[0.72fr_1.28fr] md:px-8"}>
      {!compact ? (
        <aside className="flex flex-col justify-between rounded-2xl bg-[#162033] p-6 text-[#f8f5f0] shadow-2xl shadow-[#162033]/20 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#e2b757]">Mind Read</p>
            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight md:text-6xl">
              Warm authority for charged moments.
            </h1>
            <p className="mt-5 text-base leading-8 text-[#d8deea]">
              MRagent reads beneath the words: the pressure, the protective reflex, the risk, and the clean next move. One synthesis. One action. One quiet receipt.
            </p>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-[#d8deea]">
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
              <p className="flex items-center gap-2 font-semibold text-[#f8f5f0]"><HeartHandshake size={16} className="text-[#e2b757]" /> Tender, not soft</p>
              <p className="mt-2 leading-6">Close enough to understand the feeling; clear enough to protect your edge.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
              <p className="flex items-center gap-2 font-semibold text-[#f8f5f0]"><LockKeyhole size={16} className="text-[#e2b757]" /> Private by shape</p>
              <p className="mt-2 leading-6">Receipts keep hashes and results. Raw pressure stays out of the quiet record.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
              <p className="flex items-center gap-2 font-semibold text-[#f8f5f0]"><ShieldCheck size={16} className="text-[#e2b757]" /> Risk before movement</p>
              <p className="mt-2 leading-6">If the moment has too much heat, MRagent holds the line instead of hurrying you.</p>
            </div>
          </div>
        </aside>
      ) : null}

      <div className={compact ? "flex h-full min-h-[42rem] flex-col bg-[#0d1729]" : "flex min-h-[42rem] flex-col rounded-2xl border border-[#162033]/10 bg-[#0d1729] shadow-2xl shadow-[#162033]/15"}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#f8f5f0]"><Sparkles size={15} className="text-[#e2b757]" /> MRagent session</p>
            <p className="mt-1 text-xs text-[#8fa0b8]">pressure-first read, warm voice, one move</p>
          </div>
          {lastDecision ? (
            <span className="rounded-full border border-[#e2b757]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#e2b757]">
              {confidenceText(lastDecision.receipt.confidence)}
            </span>
          ) : null}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
          {messages.map((message) => (
            <article key={message.id} className={message.role === "user" ? "ml-auto max-w-[86%]" : "mr-auto max-w-[94%]"}>
              <div
                className={
                  message.role === "user"
                    ? "rounded-2xl bg-[#f4efe4] px-5 py-4 text-[#162033]"
                    : "rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-4 text-[#f8f5f0]"
                }
              >
                {message.role === "assistant" ? <MessageResponse>{message.content}</MessageResponse> : <p className="whitespace-pre-wrap leading-7">{message.content}</p>}
              </div>
              {message.decision ? (
                <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-[#081121]/80 p-4 text-xs leading-5 text-[#d8deea] md:grid-cols-2">
                  <div>
                    <p className="font-semibold uppercase tracking-[0.18em] text-[#e2b757]">Pressure</p>
                    <p className="mt-1">{message.decision.mindRead.reallyAbout}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.18em] text-[#e2b757]">Protection</p>
                    <p className="mt-1">{message.decision.mindRead.mindsetProtection}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.18em] text-[#e2b757]">One Move</p>
                    <p className="mt-1">{message.decision.recommendedAction.label}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.18em] text-[#e2b757]">Quiet Receipt</p>
                    <p className="mt-1">{message.decision.receipt.id} - {message.decision.risk.level} risk</p>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
          {loading ? (
            <div className="mr-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm text-[#d8deea]">
              <Loader2 size={15} className="animate-spin text-[#e2b757]" /> {readingPhases[phaseIndex]}
            </div>
          ) : null}
        </div>

        {lastDecision ? (
          <div className="mx-4 mb-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#081121]/80 p-3 text-xs text-[#d8deea] md:mx-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1"><Feather size={13} className="text-[#e2b757]" /> {lastDecision.mindRead.calmerMove}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1"><TimerReset size={13} className="text-[#e2b757]" /> {lastDecision.memoryUpdate.summary}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[#e2b757]/30 bg-[#2b1d16] p-3 text-sm text-[#f8f5f0] md:mx-6">
            <span>{error}</span>
            <button type="button" onClick={() => submit(latestUserText)} className="inline-flex items-center gap-1 rounded-full bg-[#e2b757] px-3 py-1 text-xs font-semibold text-[#162033]">
              <RotateCcw size={13} /> Retry
            </button>
          </div>
        ) : null}

        <div className="border-t border-white/10 p-4 md:p-5">
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#081121] p-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  void submit();
                }
              }}
              rows={compact ? 2 : 3}
              className="min-h-14 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-[#f8f5f0] outline-none placeholder:text-[#70819b]"
              placeholder="Drop the message, hesitation, or charged moment here."
            />
            <button
              type="button"
              onClick={() => submit()}
              disabled={loading || !input.trim()}
              className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#e2b757] text-[#162033] transition hover:bg-[#f0c86a] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send to MRagent"
            >
              <ArrowUp size={18} />
            </button>
          </div>
          <p className="mt-2 text-xs text-[#8fa0b8]">Ctrl+Enter sends. MRagent slows the moment before it moves.</p>
        </div>
      </div>
    </section>
  );
}
