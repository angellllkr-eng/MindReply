import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  LockKeyhole,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import MRAgentChat from "@/components/MRAgentChat";

export const metadata = {
  title: "MRagent | MindReply",
  description: "A warm behavioral companion that reads pressure, explains the slow reply, and returns one clear next move.",
};

const readSignals = [
  { title: "Pressure", copy: "What makes the moment feel charged.", icon: ShieldAlert },
  { title: "Protection", copy: "What the mind may be trying to defend.", icon: LockKeyhole },
  { title: "Tone", copy: "Where language could become the wrong story.", icon: MessageSquareText },
  { title: "Move", copy: "The smallest composed action worth taking.", icon: CheckCircle2 },
];

const replyStages = [
  "Reads the words and the pressure around them.",
  "Separates fact, feeling, risk, and timing.",
  "Returns one synthesis and one recommended move.",
  "Keeps a narrow receipt instead of storing the raw knot by default.",
];

const receiptFields = ["Synthesis", "Mind read", "Recommended action", "Risk", "Memory summary", "Receipt"];

export default function AgentPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#122033]">
      <header className="border-b border-[#122033]/10 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#122033] font-serif text-lg font-bold text-[#e2b757]">M</span>
            <span className="font-serif text-xl font-bold tracking-wide">MindReply</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#122033]/15 px-4 py-2 text-sm font-semibold text-[#122033] transition hover:border-[#2f6f72]">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Home
            </Link>
            <Link href="/pack" className="hidden rounded-full bg-[#122033] px-4 py-2 text-sm font-semibold text-[#f8f5f0] transition hover:bg-[#1c3150] sm:inline-flex">
              Pack
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[0.78fr_1.22fr] md:px-8 md:py-10">
        <aside className="flex flex-col justify-between rounded-lg bg-[#122033] p-6 text-[#f8f5f0] md:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e2b757]/35 bg-[#e2b757]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#e2b757]">
              <Brain aria-hidden className="h-4 w-4" />
              MRagent session
            </div>
            <h1 className="mt-7 font-serif text-5xl font-bold leading-[0.94] md:text-6xl">
              A slow, warm read before the next move.
            </h1>
            <p className="mt-6 text-sm leading-7 text-[#d9e3e7]">
              Mind Read is a behavioral interface, not a literal claim. It reads context, pressure, tone, and protection, then turns the moment into one clearer action.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {readSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div key={signal.title} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e2b757] text-[#122033]"><Icon aria-hidden className="h-4 w-4" /></span>
                  <div>
                    <p className="font-serif text-xl font-bold">{signal.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#d9e3e7]">{signal.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="min-h-[46rem] overflow-hidden rounded-lg border border-[#122033]/10 bg-[#0d1729] shadow-2xl shadow-[#122033]/15">
          <MRAgentChat />
        </div>
      </section>

      <section className="border-y border-[#122033]/10 bg-white px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2f6f72]">How the reply works</p>
            <h2 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
              The delay is part of the product.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#59687b]">
              The UI should feel like a careful companion: confident enough to name the pattern, gentle enough not to flood the user with analysis.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {replyStages.map((stage, index) => (
              <article key={stage} className="rounded-lg border border-[#122033]/10 bg-[#f7f4ed] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#122033] text-sm font-bold text-[#e2b757]">{index + 1}</span>
                  <Clock aria-hidden className="h-4 w-4 text-[#2f6f72]" />
                </div>
                <p className="mt-5 text-sm leading-6 text-[#59687b]">{stage}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg bg-[#103b39] p-6 text-[#f8f5f0] md:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#91d2c8]/35 bg-[#91d2c8]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#91d2c8]">
              <Sparkles aria-hidden className="h-4 w-4" />
              Friendly and exact
            </div>
            <h2 className="mt-6 font-serif text-4xl font-bold leading-tight">Warm language, uncommon clarity.</h2>
            <p className="mt-5 text-sm leading-7 text-[#d3e5e2]">
              MRagent can sound close and human without becoming vague. It uses plain words first, then a slightly richer phrase when it helps the user feel the pattern clearly.
            </p>
          </div>

          <div className="rounded-lg border border-[#122033]/10 bg-white p-6 md:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#122033] text-[#e2b757]"><FileText aria-hidden className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7430]">Receipt contract</p>
                <h2 className="font-serif text-3xl font-bold">What the answer returns</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {receiptFields.map((field) => (
                <div key={field} className="rounded-lg border border-[#122033]/10 bg-[#f7f4ed] px-4 py-3 text-sm font-semibold text-[#4d5c6f]">
                  {field}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
