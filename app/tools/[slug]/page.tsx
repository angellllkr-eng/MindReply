"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Wand2 } from "lucide-react";
import CreditPurchasePanel from "@/components/CreditPurchasePanel";

type ToolResponse = {
  result?: string;
  creditCost?: number;
  suggestions?: string[];
  analysis?: { clarity: number; authority: number; warmth: number; brevity: number };
};

const TOOL_CONFIGS: Record<string, { name: string; cost: number; description: string; action: string; apiSlug?: string }> = {
  "ops-overload-analyzer": { name: "Ops Overload Analyzer", cost: 3, description: "Process overloaded messages and task notes into urgency, owner, next action, and a 24-hour recovery move.", action: "Process Overload", apiSlug: "ops-overload-analyzer" },
  "text-refiner": { name: "Text Refiner", cost: 1, description: "Refine casual or imprecise text into polished professional language.", action: "Refine Text", apiSlug: "text-refiner" },
  "email-polisher": { name: "Email Polisher", cost: 2, description: "Transform draft emails into executive-grade correspondence.", action: "Polish Email", apiSlug: "email-polisher" },
  "tone-adjuster": { name: "Tone Adjuster", cost: 1, description: "Shift a message into a precise communication register.", action: "Adjust Tone", apiSlug: "tone-adjuster" },
  shortener: { name: "Shortener", cost: 1, description: "Compress a message without losing the core intent or professional tone.", action: "Shorten Text", apiSlug: "shortener" },
  expander: { name: "Expander", cost: 1, description: "Expand terse notes into complete professional communication.", action: "Expand Text", apiSlug: "expander" },
  "professional-rewrite": { name: "Professional Rewrite", cost: 2, description: "Rewrite informal text into polished professional language.", action: "Rewrite Text", apiSlug: "professional-rewrite" },
  "clarity-booster": { name: "Clarity Booster", cost: 1, description: "Remove ambiguity and strengthen the action requested from the recipient.", action: "Boost Clarity", apiSlug: "clarity-booster" },
  "call-scripter": { name: "Call Scripter", cost: 2, description: "Generate a focused call script with opening, discovery, objection handling, and close.", action: "Generate Script", apiSlug: "call-scripter" },
  "planning-assistant": { name: "Planning Assistant", cost: 1, description: "Turn a goal into a practical plan with milestones and communication checkpoints.", action: "Create Plan", apiSlug: "planning-assistant" },
  "correction-engine": { name: "Correction Engine", cost: 1, description: "Identify weak phrasing, ambiguity, and authority leaks in professional text.", action: "Correct Text", apiSlug: "correction-engine" },
  "teaching-optimizer": { name: "Teaching Optimizer", cost: 2, description: "Restructure instructional content so it is easier to understand and retain.", action: "Optimize Teaching", apiSlug: "teaching-optimizer" },
  "lexicon-refiner": { name: "Lexicon Refiner", cost: 3, description: "Adapt language to professional vocabulary and discipline-specific standards.", action: "Refine Lexicon", apiSlug: "lexicon-refiner" },
  "tone-calibrator": { name: "Tone Calibrator", cost: 2, description: "Adjust emotional valence, directness, and professional register.", action: "Calibrate Tone", apiSlug: "tone-calibrator" },
  "structure-architect": { name: "Structure Architect", cost: 3, description: "Rebuild message flow for clarity, decision speed, and recipient confidence.", action: "Structure Message", apiSlug: "structure-architect" },
  "cultural-adapter": { name: "Cultural Adapter", cost: 2, description: "Adapt phrasing for cross-cultural clarity, indirectness, and relationship context.", action: "Adapt Message", apiSlug: "cultural-adapter" },
  "prospect-reply-analyzer": { name: "Prospect Reply Analyzer", cost: 3, description: "Analyze failed prospect replies, repair trust breaks, and rewrite the close.", action: "Analyze Replies", apiSlug: "prospect-reply-analyzer" },
};

function titleFromSlug(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function fallbackProcess(slug: string, text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (slug === "ops-overload-analyzer") return [
    "Ops Overload Analyzer",
    "",
    "Immediate overload diagnosis:",
    "These items need triage before the workday ends because one missed owner, deadline, or client response can create tomorrow's escalation.",
    "",
    "Action queue:",
    `1. High priority - identify owner and deadline: ${cleaned}`,
    "",
    "Next 24-hour operating move:",
    "Convert each message into owner + deadline + next action, process the first 10, then unlock unlimited processing when the next items queue.",
    "",
    "Upgrade trigger:",
    "Messages Processed: 10/10. New incoming items are queued until unlimited processing is active.",
  ].join("\n");
  if (slug === "prospect-reply-analyzer") return [
    "Prospect Reply Analyzer",
    "",
    "Why they did not convert:",
    "The reply shows interest without enough urgency to act.",
    "",
    "Where friction exists:",
    "The next step feels too large or unclear.",
    "",
    "Where trust breaks:",
    "The buyer has not seen a small proof step tied to recovered revenue.",
    "",
    "Rewritten message:",
    "Fair. The reason I am reaching out is that most teams do not lose prospects only because of bad outbound. They lose them after the prospect replies and the next message is weak.",
    "",
    "Rewritten offer:",
    "Send 10 recent replies. MindReply will identify which ones are recoverable and give you the next message to send.",
    "",
    "Rewritten close:",
    "Can you send 10 replies today so we recover the warm conversations before they go cold?",
    "",
    `Input reviewed: ${cleaned}`,
  ].join("\n");
  if (slug === "call-scripter") return `Opening: Thank you for making time today.\n\nObjective: ${cleaned}\n\nDiscovery: What outcome would make this conversation useful for you?\n\nClose: Shall we confirm the next action and date now?`;
  if (slug === "planning-assistant") return `Objective: ${cleaned}\n\n1. Define the result.\n2. Identify owner and stakeholders.\n3. Set three milestones.\n4. Confirm communication cadence.\n5. Review weekly.`;
  return `Professional version:\n\n${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}\n\nPlease confirm the next step and timing.`;
}

export default function DynamicToolPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const config = useMemo(() => TOOL_CONFIGS[slug] ?? {
    name: titleFromSlug(slug),
    cost: 1,
    description: "Apply MindReply communication intelligence to this professional workflow.",
    action: "Run Tool",
  }, [slug]);

  const [input, setInput] = useState("");
  const [output, setOutput] = useState<ToolResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (config.apiSlug) {
        const response = await fetch(`/api/tools/${config.apiSlug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input, tone: "professional" }),
        });
        const payload = await response.json();
        setOutput(response.ok ? payload : { result: payload.error ?? "The tool could not process this request.", creditCost: config.cost });
      } else {
        setOutput({
          result: fallbackProcess(slug, input),
          creditCost: config.cost,
          suggestions: ["Confirm the next action is explicit.", "Keep the close concise and action-oriented."],
          analysis: { clarity: 88, authority: 86, warmth: 84, brevity: 82 },
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-4" style={{ background: "hsl(40 20% 96%)" }}>
      <div className="max-w-5xl mx-auto">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70" style={{ color: "hsl(220 55% 20%)" }}>
          <ArrowLeft size={16} /> Back to Tools
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{config.name}</h1>
            <p className="text-sm mt-1 max-w-xl" style={{ color: "hsl(220 25% 45%)" }}>{config.description}</p>
          </div>
          <span className="px-4 py-2 rounded-lg text-sm font-bold self-start sm:self-auto" style={{ background: "hsl(43 80% 60% / 0.2)", color: "hsl(43 80% 40%)" }}>
            {output?.creditCost ?? config.cost} Credit{(output?.creditCost ?? config.cost) === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mb-6">
          <CreditPurchasePanel currentCost={output?.creditCost ?? config.cost} compact context={config.name} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "hsl(220 25% 45%)" }}>Input</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-64 p-4 rounded-lg border text-sm outline-none focus:border-[hsl(43_80%_60%)] resize-none" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }} placeholder={slug === "ops-overload-analyzer" ? "Paste 5-10 urgent emails, Slack messages, tasks, or follow-up notes." : slug === "prospect-reply-analyzer" ? "Paste 3-10 stalled prospect replies, objections, or no-response messages." : "Paste the text, goal, or context you want to process."} />
            <button onClick={run} disabled={!input.trim() || loading} className="w-full mt-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
              <Wand2 size={16} /> {loading ? "Processing..." : config.action}
            </button>
          </section>

          <section className="bg-white border rounded-xl p-6 shadow-sm relative" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "hsl(220 25% 45%)" }}>Output</label>
            <div className="w-full h-64 p-4 rounded-lg border text-sm overflow-y-auto whitespace-pre-line" style={{ borderColor: "hsl(40 25% 88%)", background: "hsl(40 20% 98%)", color: "hsl(220 45% 13%)" }}>
              {output?.result || <span className="opacity-50 italic">The processed result will appear here.</span>}
            </div>
            {output?.result && (
              <button onClick={() => navigator.clipboard.writeText(output.result ?? "")} className="absolute bottom-10 right-10 p-2 rounded-lg border shadow-sm hover:bg-gray-50" style={{ borderColor: "hsl(40 25% 88%)", background: "white" }}>
                <Copy size={16} style={{ color: "hsl(220 55% 20%)" }} />
              </button>
            )}
          </section>
        </div>

        {output?.result && (
          <div className="mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <p className="text-sm font-bold" style={{ color: "hsl(220 45% 13%)" }}>Keep your context.</p>
            <p className="mt-1 text-sm" style={{ color: "hsl(220 25% 45%)" }}>If this analysis found queued work, use credits for the next batch or move to Growth when daily message overload is costing time.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/tools" className="rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Process next 10 items</Link>
              <Link href="/memberships" className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }}>Unlock Growth or Pro</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
