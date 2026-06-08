import Link from "next/link";
import MRAgentChat from "@/components/MRAgentChat";

const rails = [
  "Feels the pressure before it answers.",
  "Reads behavior without making it clinical.",
  "Keeps one clear move in view.",
  "Leaves a quiet receipt, not the raw text.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#162033]">
      <section className="border-b border-[#162033]/10 bg-[#f4efe4] px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#162033] font-serif text-lg font-bold text-[#e2b757]">M</span>
            <span className="font-serif text-xl font-bold tracking-wide">MindReply</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/agent" className="rounded-full bg-[#162033] px-4 py-2 text-sm font-semibold text-[#f8f5f0] transition hover:bg-[#22314d]">
              Open MRagent
            </Link>
            <Link href="/privacy" className="hidden rounded-full border border-[#162033]/15 px-4 py-2 text-sm font-semibold text-[#162033] transition hover:border-[#e2b757] sm:inline-flex">
              Privacy
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[0.92fr_1.08fr] md:px-8 md:py-12">
        <div className="flex min-h-[42rem] flex-col justify-between rounded-2xl bg-[#162033] p-6 text-[#f8f5f0] shadow-2xl shadow-[#162033]/20 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#e2b757]">MRagent</p>
            <h1 className="mt-6 max-w-xl font-serif text-5xl font-bold leading-[0.94] md:text-7xl">
              Warm mind read. Clear next move.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#d8deea]">
              Bring the message, hesitation, or emotional knot. MRagent answers like a steady bestie with ballast: gentle, clever, and quietly firm.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {rails.map((rail) => (
              <div key={rail} className="rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-[#d8deea]">
                {rail}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[42rem] overflow-hidden rounded-2xl border border-[#162033]/10 bg-[#0d1729] shadow-2xl shadow-[#162033]/15">
          <MRAgentChat compact />
        </div>
      </section>
    </main>
  );
}
