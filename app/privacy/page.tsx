import Link from "next/link";

const safeguards = [
  "Raw input is not stored in memory by default.",
  "Receipts use hashes and metadata instead of private text.",
  "High-risk signals are held for review before movement.",
  "Memory keeps derived preferences, not sensitive wording.",
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#081121] px-5 py-8 text-[#f8f5f0] md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold">
            MindReply
          </Link>
          <Link href="/" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[#cdd6e4] transition hover:border-[#c9a961] hover:text-[#c9a961]">
            Back
          </Link>
        </div>

        <section className="mt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a961]">Privacy Whitepaper Intro</p>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight md:text-6xl">Legal-grade privacy defaults for decision work.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#cdd6e4]">
            MindReply is designed to sit between pressure and action without turning private context into a permanent record. It keeps the decision clear while keeping the underlying material protected.
          </p>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {safeguards.map((item) => (
            <article key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-[#cdd6e4]">
              {item}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
