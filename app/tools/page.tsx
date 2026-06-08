"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Copy, FileText, Globe2, GraduationCap, Mail, Maximize2, MessageSquare, Minimize2, PhoneCall, RotateCcw, SlidersHorizontal, Sparkles, Target, Wand2, Zap } from "lucide-react";
import CreditPurchasePanel from "@/components/CreditPurchasePanel";
import DiagnosticTools from "@/components/DiagnosticTools";

type ToolSlug =
  | "prospect-reply-analyzer"
  | "ops-overload-analyzer"
  | "text-refiner"
  | "email-polisher"
  | "call-scripter"
  | "planning-assistant"
  | "correction-engine"
  | "teaching-optimizer"
  | "lexicon-refiner"
  | "tone-adjuster"
  | "tone-calibrator"
  | "shortener"
  | "expander"
  | "professional-rewrite"
  | "clarity-booster"
  | "structure-architect"
  | "cultural-adapter";

type ToolResponse = {
  result?: string;
  suggestions?: string[];
  analysis?: Record<string, number>;
  creditCost?: number;
  source?: "azure-openai" | "openai" | "local";
  metricLogged?: boolean;
};

type ToolConfig = {
  id: ToolSlug;
  icon: ReactNode;
  title: string;
  desc: string;
  placeholder: string;
  cost: number;
  badge?: string;
};

const FREE_PREVIEW_LIMIT = 10;
const TONES = ["professional", "warm", "assertive", "empathetic", "concise", "diplomatic"];

const TOOLS: ToolConfig[] = [
  {
    id: "prospect-reply-analyzer",
    icon: <Target size={18} />,
    title: "Prospect Reply Analyzer",
    desc: "Find why replies did not convert, repair trust breaks, and rewrite the close.",
    placeholder: "Paste 3-10 stalled prospect replies, objections, or no-response messages.",
    cost: 3,
    badge: "Revenue first",
  },
  {
    id: "ops-overload-analyzer",
    icon: <Zap size={18} />,
    title: "Ops Overload Analyzer",
    desc: "Turn overloaded messages and tasks into urgency, owner, next action, and a 24-hour recovery move.",
    placeholder: "Paste 5-10 urgent emails, Slack messages, tasks, or follow-up notes.",
    cost: 3,
    badge: "2+ hours saved",
  },
  { id: "email-polisher", icon: <Mail size={18} />, title: "Email Polisher", desc: "Transform draft emails into executive correspondence.", placeholder: "Paste your email draft.", cost: 2 },
  { id: "text-refiner", icon: <Wand2 size={18} />, title: "Text Refiner", desc: "Refine casual text into polished professional language.", placeholder: "Paste a rough message or informal note.", cost: 1 },
  { id: "call-scripter", icon: <PhoneCall size={18} />, title: "Call Scripter", desc: "Generate focused call openings, discovery prompts, objections, and closes.", placeholder: "Describe the call goal, recipient, and desired outcome.", cost: 2 },
  { id: "planning-assistant", icon: <Target size={18} />, title: "Planning Assistant", desc: "Turn a goal into milestones and communication checkpoints.", placeholder: "Describe the goal, timeframe, and constraints.", cost: 1 },
  { id: "correction-engine", icon: <CheckCircle2 size={18} />, title: "Correction Engine", desc: "Find weak phrasing, ambiguity, and authority leaks.", placeholder: "Paste text that needs correction.", cost: 1 },
  { id: "teaching-optimizer", icon: <GraduationCap size={18} />, title: "Teaching Optimizer", desc: "Restructure instructional content for understanding and retention.", placeholder: "Paste training, teaching, or explanatory content.", cost: 2 },
  { id: "lexicon-refiner", icon: <BookOpen size={18} />, title: "Lexicon Refiner", desc: "Adapt language to discipline-specific professional vocabulary.", placeholder: "Paste text that needs professional lexicon alignment.", cost: 3 },
  { id: "tone-adjuster", icon: <SlidersHorizontal size={18} />, title: "Tone Adjuster", desc: "Shift a message into a precise communication register.", placeholder: "Paste text that needs a different tone.", cost: 1 },
  { id: "tone-calibrator", icon: <MessageSquare size={18} />, title: "Tone Calibrator", desc: "Tune emotional valence, directness, and professional register.", placeholder: "Paste text that needs tone calibration.", cost: 2 },
  { id: "shortener", icon: <Minimize2 size={18} />, title: "Shortener", desc: "Compress communication without losing intent.", placeholder: "Paste text that should be shorter.", cost: 1 },
  { id: "expander", icon: <Maximize2 size={18} />, title: "Expander", desc: "Expand terse notes into complete professional wording.", placeholder: "Paste terse notes or a short instruction.", cost: 1 },
  { id: "professional-rewrite", icon: <FileText size={18} />, title: "Professional Rewrite", desc: "Rewrite informal phrasing for high-trust settings.", placeholder: "Paste text that needs a professional rewrite.", cost: 2 },
  { id: "clarity-booster", icon: <CheckCircle2 size={18} />, title: "Clarity Booster", desc: "Remove ambiguity and strengthen the next action.", placeholder: "Paste text with unclear ownership or next steps.", cost: 1 },
  { id: "structure-architect", icon: <FileText size={18} />, title: "Structure Architect", desc: "Rebuild message flow for clarity, decision speed, and recipient confidence.", placeholder: "Paste text that needs stronger structure.", cost: 3 },
  { id: "cultural-adapter", icon: <Globe2 size={18} />, title: "Cultural Adapter", desc: "Adapt phrasing for cross-cultural clarity and relationship context.", placeholder: "Paste text and describe the cultural or relationship context.", cost: 2 },
];

function todayUsageKey() {
  return `mindreply.tools.processed.${new Date().toISOString().slice(0, 10)}`;
}

export default function Tools() {
  const [active, setActive] = useState<ToolSlug>("prospect-reply-analyzer");
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState<ToolResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [queuedCount, setQueuedCount] = useState(0);

  const current = TOOLS.find((tool) => tool.id === active) ?? TOOLS[0];
  const showTone = active === "email-polisher" || active === "tone-adjuster" || active === "tone-calibrator";
  const remaining = Math.max(FREE_PREVIEW_LIMIT - processedCount, 0);
  const atLimit = remaining === 0;

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(todayUsageKey()) ?? "0");
    if (Number.isFinite(saved)) {
      setProcessedCount(Math.min(Math.max(saved, 0), FREE_PREVIEW_LIMIT));
    }
  }, []);

  function setDailyProcessed(nextValue: number) {
    const next = Math.min(Math.max(nextValue, 0), FREE_PREVIEW_LIMIT);
    setProcessedCount(next);
    window.localStorage.setItem(todayUsageKey(), String(next));
  }

  function reset() {
    setInput("");
    setResult(null);
  }

  function copy() {
    navigator.clipboard.writeText(result?.result ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function run() {
    if (!input.trim()) return;

    if (atLimit) {
      const nextQueuedCount = queuedCount + 1;
      setQueuedCount(nextQueuedCount);
      setResult({
        result: `Queued: ${nextQueuedCount} item${nextQueuedCount === 1 ? "" : "s"} waiting. Upgrade to process immediately and stop missing critical replies, messages, or tasks.`,
        suggestions: [
          "The free preview has reached 10/10 processed items today.",
          "New items stay queued until unlimited processing is unlocked.",
          "Upgrade when the next reply or urgent message can still be recovered today.",
        ],
        creditCost: current.cost,
        source: "local",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/tools/${active}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, tone }),
      });
      const nextResult = await response.json();
      setResult(response.ok ? nextResult : { result: nextResult.error ?? "This tool could not process the request.", creditCost: current.cost, source: "local" });
      setDailyProcessed(processedCount + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[hsl(40_33%_97%)] pt-20">
      <section className="bg-[hsl(220_55%_20%)] px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_80%_60%)]">Revenue recovery suite</p>
          <h1 className="mb-3 font-serif text-4xl font-bold text-[hsl(43_70%_88%)] md:text-5xl">Recover stalled replies before they go cold</h1>
          <p className="max-w-2xl text-sm leading-6 text-[rgba(248,245,240,0.72)]">
            Paste real prospect replies, urgent messages, or overloaded task notes. MindReply identifies the bottleneck, rewrites the next move, and pushes the fastest paid action.
          </p>
        </div>
      </section>

      <DiagnosticTools />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: atLimit ? "hsl(43 80% 60%)" : "hsl(40 25% 88%)" }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(43_80%_42%)]">Free preview</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[hsl(220_45%_13%)]">Items processed: {processedCount}/{FREE_PREVIEW_LIMIT}</h2>
                <p className="mt-1 text-sm text-[hsl(220_25%_45%)]">
                  {atLimit ? "Limit reached. New work queues until unlimited processing is unlocked." : `${remaining} preview item${remaining === 1 ? "" : "s"} left today.`}
                </p>
                {queuedCount > 0 && <p className="mt-2 text-xs font-semibold text-[hsl(43_80%_38%)]">{queuedCount} queued item{queuedCount === 1 ? "" : "s"} waiting.</p>}
              </div>
              <Link href="/memberships" className="inline-flex items-center justify-center rounded-lg bg-[hsl(220_55%_20%)] px-4 py-3 text-sm font-semibold text-[hsl(43_70%_88%)]">
                Unlock unlimited processing
              </Link>
            </div>
          </div>
          <CreditPurchasePanel currentCost={result?.creditCost ?? current.cost} context="revenue tool" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[310px_1fr]">
          <aside className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => { setActive(tool.id); setResult(null); }}
                className={`min-w-[235px] rounded-xl border p-4 text-left transition-all lg:w-full lg:min-w-0 ${active === tool.id ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.09)] shadow-sm" : "border-[hsl(40_25%_88%)] bg-white hover:-translate-y-0.5"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: active === tool.id ? "hsl(220 55% 20%)" : "hsl(40 20% 92%)", color: active === tool.id ? "hsl(43 70% 88%)" : "hsl(220 25% 45%)" }}>{tool.icon}</span>
                  <span>
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[hsl(220_45%_13%)]">
                      {tool.title}
                      {tool.badge && <span className="rounded-full bg-[hsl(43_80%_60%_/_0.18)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[hsl(43_80%_34%)]">{tool.badge}</span>}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[hsl(220_25%_45%)]">{tool.desc}</span>
                  </span>
                </div>
              </button>
            ))}
          </aside>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border bg-white p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[hsl(220_45%_13%)]">{current.title}</h2>
                  <p className="mt-1 text-sm text-[hsl(220_25%_45%)]">{current.desc}</p>
                  <Link href={`/tools/${current.id}`} className="mt-2 inline-flex text-xs font-semibold text-[hsl(43_80%_36%)] hover:opacity-70">Open focused route</Link>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: atLimit ? "hsl(43 80% 60%)" : "hsl(43 80% 60% / 0.18)", color: atLimit ? "hsl(220 45% 13%)" : "hsl(43 80% 36%)" }}>{atLimit ? "Limit reached" : `${current.cost} credit${current.cost === 1 ? "" : "s"}`}</span>
              </div>

              {showTone && (
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(220_25%_45%)]">Target tone</label>
                  <select value={tone} onChange={(event) => setTone(event.target.value)} className="w-full rounded-lg border border-[hsl(40_25%_88%)] bg-[hsl(40_20%_92%)] px-3 py-2 text-sm text-[hsl(220_45%_13%)] outline-none">
                    {TONES.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
                  </select>
                </div>
              )}

              <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} placeholder={current.placeholder} className="w-full resize-none rounded-lg border border-[hsl(40_25%_88%)] bg-[hsl(40_20%_92%)] px-3 py-3 text-sm leading-relaxed text-[hsl(220_45%_13%)] outline-none transition-colors focus:border-[hsl(43_80%_60%)]" />
              <button onClick={run} disabled={!input.trim() || loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40" style={{ background: atLimit ? "hsl(43 80% 60%)" : "hsl(220 55% 20%)", color: atLimit ? "hsl(220 45% 13%)" : "hsl(43 70% 88%)" }}>
                <Sparkles size={15} /> {loading ? "Processing..." : atLimit ? "Queue item until upgrade" : current.id === "prospect-reply-analyzer" ? "Analyze and rewrite close" : "Run Intelligence"}
              </button>
            </section>

            <section className="rounded-2xl border bg-white p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-[hsl(220_45%_13%)]">Result</h2>
                {result?.result && (
                  <div className="flex gap-3">
                    <button onClick={copy} className="flex items-center gap-1 text-xs text-[hsl(220_25%_45%)] hover:text-[hsl(220_55%_20%)]"><Copy size={12} /> {copied ? "Copied" : "Copy"}</button>
                    <button onClick={reset} className="flex items-center gap-1 text-xs text-[hsl(220_25%_45%)] hover:text-[hsl(220_55%_20%)]"><RotateCcw size={12} /> Reset</button>
                  </div>
                )}
              </div>

              {!result && !loading && (
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-[hsl(220_25%_45%)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(40_20%_92%)]"><Sparkles size={20} className="text-[rgba(10,22,40,0.25)]" /></div>
                  <p>{atLimit ? "New work will queue here until unlimited processing is unlocked." : "Paste real replies or messages. The revenue read and next action appear here."}</p>
                </div>
              )}

              {loading && <div className="flex h-64 items-center justify-center text-sm text-[hsl(220_25%_45%)]">Processing communication intelligence...</div>}

              {result?.result && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[hsl(40_25%_88%)] bg-[hsl(40_20%_92%_/_0.5)] p-4 text-sm leading-relaxed whitespace-pre-line text-[hsl(220_45%_13%)]">{result.result}</div>

                  {result.analysis && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.analysis).map(([key, value]) => (
                        <div key={key} className="rounded-lg border p-3" style={{ borderColor: "hsl(40 25% 88%)" }}>
                          <p className="mb-1 text-xs capitalize text-[hsl(220_25%_45%)]">{key}</p>
                          <p className="font-serif text-2xl font-bold text-[hsl(220_55%_20%)]">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(result.suggestions ?? []).length > 0 && (
                    <div className="border-t pt-3" style={{ borderColor: "hsl(40 25% 88%)" }}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(220_25%_45%)]">Next checks</p>
                      <ul className="space-y-1.5">
                        {(result.suggestions ?? []).map((suggestion) => <li key={suggestion} className="flex gap-2 text-xs text-[hsl(220_25%_45%)]"><span className="text-[hsl(43_80%_45%)]">-</span>{suggestion}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)", background: atLimit ? "hsl(43 80% 60% / 0.16)" : "hsl(43 80% 60% / 0.08)" }}>
                    <p className="text-sm font-bold text-[hsl(220_45%_13%)]">{current.id === "prospect-reply-analyzer" ? "Recover the next 10 replies." : "Stop missing critical items."}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[hsl(220_25%_45%)]">
                      {current.id === "prospect-reply-analyzer" ? "Use the first result now. Then process the next 10 replies before warm conversations go cold." : "Unlock immediate processing and reclaim your day when the next urgent batch arrives."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href="/memberships" className="rounded-lg bg-[hsl(220_55%_20%)] px-3 py-2 text-xs font-semibold text-[hsl(43_70%_88%)]">Unlock unlimited processing</Link>
                      <Link href="/professionals" className="rounded-lg border px-3 py-2 text-xs font-semibold text-[hsl(220_45%_13%)]" style={{ borderColor: "hsl(40 25% 88%)" }}>Book expert review</Link>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
