"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, HeartHandshake, Shield } from "lucide-react";
import type { DecisionResponse } from "@/lib/decision-layer";

const example =
  "A client says the fee is too high and asks whether we can wait until next month.";

export default function DecisionIntake() {
  const [input, setInput] = useState(example);
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const actionLabel = useMemo(() => {
    if (!decision) return "Start the Mind Read";
    return decision.recommendedAction.label;
  }, [decision]);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, source: "manual" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "The intake could not be read.");
        return;
      }
      setDecision(data);
    } catch {
      setError("The intake could not be read.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label htmlFor="decision-input" className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9a961]">
            MRagent Mind Read
          </label>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#cdd6e4]">
            One private decision is free. Paste the pressure and receive one gentle next move.
          </p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-[#cdd6e4]">
          <HeartHandshake size={16} className="text-[#c9a961]" /> Gentle by default
        </p>
      </div>

      <textarea
        id="decision-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        className="mt-4 min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-[#f8f5f0] p-4 text-base leading-relaxed text-[#14233f] outline-none ring-0 transition focus:border-[#c9a961]"
        placeholder="Paste the message, note, or pressure point."
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={submit}
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c9a961] px-6 py-3 text-sm font-semibold text-[#101b30] transition hover:bg-[#f2c94c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Reading" : actionLabel} <ArrowRight size={16} />
        </button>
        <p className="inline-flex items-center gap-2 text-sm text-[#cdd6e4]">
          <Shield size={16} /> Private by default
        </p>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-100">{error}</p> : null}

      {decision ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#0d1729] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a961]">What this is really about</p>
            <p className="mt-2 text-lg leading-relaxed text-[#f8f5f0]">{decision.mindRead.reallyAbout}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a961]">What your mindset is protecting</p>
              <p className="mt-2 text-sm leading-6 text-[#cdd6e4]">{decision.mindRead.mindsetProtection}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a961]">The calmer move</p>
              <p className="mt-2 text-sm leading-6 text-[#cdd6e4]">{decision.mindRead.calmerMove}</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#c9a961]/40 px-5 py-3 text-sm font-semibold text-[#f8f5f0] transition hover:border-[#c9a961] hover:text-[#c9a961] sm:w-auto"
          >
            {decision.recommendedAction.label} <Check size={16} />
          </button>
          <div className="grid gap-3 text-sm text-[#cdd6e4] md:grid-cols-3">
            <p>Risk: {decision.risk.level}</p>
            <p>{decision.memoryUpdate.summary}</p>
            <p>Receipt: {decision.receipt.id}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
