import Link from "next/link";
import DecisionIntake from "@/components/DecisionIntake";

const principles = [
  "Intake reads the pressure.",
  "Action returns one next move.",
  "Memory adapts without demanding attention.",
  "Risk is checked before movement.",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#081121]">
      <section className="relative px-5 pb-20 pt-8 md:px-8 md:pb-28">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #f8f5f0 1px, transparent 0)", backgroundSize: "44px 44px" }} />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wide text-[#f8f5f0]">
            MindReply
          </Link>
          <Link href="/privacy" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[#cdd6e4] transition hover:border-[#c9a961] hover:text-[#c9a961]">
            Privacy
          </Link>
        </div>

        <div className="relative mx-auto mt-24 max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a961]">Executive Nervous System</p>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-[0.95] text-[#f8f5f0] md:text-7xl">
            Decision Infrastructure for the space between input and action.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#cdd6e4]">
            MindReply turns scattered pressure into one synthesis, one recommended action, and one quiet memory update. The next move becomes obvious.
          </p>
        </div>

        <div className="relative mt-12">
          <DecisionIntake />
        </div>

        <div className="relative mx-auto mt-12 grid max-w-5xl gap-3 md:grid-cols-4">
          {principles.map((principle) => (
            <div key={principle} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left text-sm leading-6 text-[#cdd6e4]">
              {principle}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
