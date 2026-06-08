"use client";

import { useMemo, useState } from "react";
import { ArrowUp, Clock, HeartHandshake, Loader2, ShieldCheck, Sparkles } from "lucide-react";
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
  reply: string;
  decision: DecisionResponse;
};

const starter: ChatMessage = {
  id: "mra-welcome",
  role: "assistant",
  content:
    "I am here. Paste the message, pressure point, or situation. I will read what is underneath it, steady the feeling, and return one gentle next move.",
};

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

export default function MRAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);
  const [input, setInput] = useState("A client is hesitating after seeing the fee and says they need to think about it.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lastDecision = useMemo(() => [...messages].reverse().find((message) => message.decision)?.decision, [messages]);

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { id: makeId("user"), role: "user", content: text };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      const data = (await response.json()) as Partial<AgentResponse> & { error?: string };

      if (!response.ok || typeof data.reply !== "string" || typeof data.id !== "string" || !data.decision) {
        setError(data.error ?? "MRagent could not read that clearly.");
        return;
      }

      const assistantMessage: ChatMessage = {
        id: data.id,
        role: "assistant",
        content: data.reply,
        decision: data.decision,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setError("MRagent could not read that clearly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-6xl gap-6 px-5 py-8 md:grid-cols-[0.78fr_1.22fr] md:px-8">
      <aside className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a961]">MRagent Mind Read</p>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-[#f8f5f0] md:text-5xl">
            A gentle decision companion that feels what the pressure is asking for.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#cdd6e4]">
            One private decision is free. Bring the pressure, wording, hesitation, or conflict. MRagent reflects the mindset underneath it and gives one clear next move.
          </p>
        </div>

        <div className="mt-8 grid gap-3 text-sm text-[#cdd6e4]">
          <p className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#081121]/70 p-3">
            <Sparkles size={16} className="text-[#c9a961]" /> One free private Mind Read.
          </p>
          <p className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#081121]/70 p-3">
            <HeartHandshake size={16} className="text-[#c9a961]" /> Warm reflection without losing discipline.
          </p>
          <p className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#081121]/70 p-3">
            <Clock size={16} className="text-[#c9a961]" /> Reads before moving.
          </p>
          <p className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#081121]/70 p-3">
            <ShieldCheck size={16} className="text-[#c9a961]" /> Risk checked before action.
          </p>
        </div>
      </aside>

      <div className="flex min-h-[36rem] flex-col rounded-[2rem] border border-white/10 bg-[#0d1729] shadow-2xl shadow-black/25">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#f8f5f0]">Mind Read session</p>
            <p className="text-xs text-[#8fa0b8]">One mirror. One calmer move. One action.</p>
          </div>
          {lastDecision ? (
            <span className="rounded-full border border-[#c9a961]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a961]">
              {lastDecision.risk.level} risk
            </span>
          ) : null}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
          {messages.map((message) => (
            <article key={message.id} className={message.role === "user" ? "ml-auto max-w-[86%]" : "mr-auto max-w-[92%]"}>
              <div
                className={
                  message.role === "user"
                    ? "rounded-3xl bg-[#f8f5f0] px-5 py-4 text-[#101b30]"
                    : "rounded-3xl border border-white/10 bg-white/[0.045] px-5 py-4 text-[#f8f5f0]"
                }
              >
                {message.role === "assistant" ? <MessageResponse>{message.content}</MessageResponse> : <p className="whitespace-pre-wrap leading-7">{message.content}</p>}
              </div>
              {message.decision ? (
                <div className="mt-2 grid gap-2 rounded-2xl border border-white/10 bg-[#081121]/70 p-3 text-xs text-[#cdd6e4] sm:grid-cols-3">
                  <span>Action: {message.decision.recommendedAction.kind}</span>
                  <span>Receipt: {message.decision.receipt.id}</span>
                  <span>{message.decision.memoryUpdate.summary}</span>
                </div>
              ) : null}
            </article>
          ))}
          {loading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#cdd6e4]">
              <Loader2 size={15} className="animate-spin text-[#c9a961]" /> Reading carefully
            </div>
          ) : null}
        </div>

        {error ? <p className="mx-4 mb-3 rounded-2xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-100 md:mx-6">{error}</p> : null}

        <div className="border-t border-white/10 p-4 md:p-5">
          <div className="flex gap-3 rounded-3xl border border-white/10 bg-[#081121] p-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  void submit();
                }
              }}
              rows={2}
              className="min-h-14 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-[#f8f5f0] outline-none placeholder:text-[#70819b]"
              placeholder="Bring MRagent the message or situation."
            />
            <button
              type="button"
              onClick={submit}
              disabled={loading || !input.trim()}
              className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#c9a961] text-[#101b30] transition hover:bg-[#f2c94c] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send to MRagent"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
