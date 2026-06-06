"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, MessageSquare, Send, Shield, Sparkles } from "lucide-react";

type StoredRescue = {
  confirmed: boolean;
  activatedAt: string;
  lastSessionId?: string | null;
  messages: number;
  deliveryMinutes: number;
};

type RescueSlot = {
  id: number;
  label: string;
  draft: string;
  tone: string;
  result: string;
  loading: boolean;
};

const defaultSlots: RescueSlot[] = [
  { id: 1, label: "Message 1", draft: "", tone: "diplomatic", result: "", loading: false },
  { id: 2, label: "Message 2", draft: "", tone: "empathetic", result: "", loading: false },
  { id: 3, label: "Message 3", draft: "", tone: "assertive", result: "", loading: false },
];

const toneOptions = ["diplomatic", "empathetic", "assertive", "concise", "warm", "professional"];

function readStoredRescue() {
  try {
    const saved = window.localStorage.getItem("mindreply.rescue");
    return saved ? (JSON.parse(saved) as StoredRescue) : null;
  } catch {
    window.localStorage.removeItem("mindreply.rescue");
    return null;
  }
}

function readSavedSlots() {
  try {
    const saved = window.localStorage.getItem("mindreply.rescue.workspace");
    return saved ? (JSON.parse(saved) as RescueSlot[]) : defaultSlots;
  } catch {
    window.localStorage.removeItem("mindreply.rescue.workspace");
    return defaultSlots;
  }
}

export default function RescueWorkspacePage() {
  const [rescue, setRescue] = useState<StoredRescue | null>(null);
  const [slots, setSlots] = useState<RescueSlot[]>(defaultSlots);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    setRescue(readStoredRescue());
    setSlots(readSavedSlots());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("mindreply.rescue.workspace", JSON.stringify(slots));
  }, [slots]);

  const completedCount = useMemo(() => slots.filter((slot) => slot.result.trim()).length, [slots]);
  const hasAccess = Boolean(rescue?.confirmed);
  const messageLimit = rescue?.messages ?? 3;
  const deliveryMinutes = rescue?.deliveryMinutes ?? 15;

  function updateSlot(id: number, patch: Partial<RescueSlot>) {
    setSlots((current) => current.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  }

  async function rescueMessage(slot: RescueSlot) {
    if (!slot.draft.trim()) return;
    updateSlot(slot.id, { loading: true });

    try {
      const response = await fetch("/api/tools/email-polisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: slot.tone,
          text: `Rescue this high-pressure message. Make it calm, clear, send-ready, and commercially useful without sounding scripted:\n\n${slot.draft}`,
        }),
      });
      const data = await response.json();
      updateSlot(slot.id, { result: data.result ?? "A clear result could not be generated. Please try a shorter draft.", loading: false });
    } catch {
      updateSlot(slot.id, { result: "A clear result could not be generated. Please try again.", loading: false });
    }
  }

  async function copyResult(slot: RescueSlot) {
    if (!slot.result) return;
    await navigator.clipboard.writeText(slot.result);
    setCopied(slot.id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <main className="min-h-screen bg-[hsl(40_20%_96%)] px-4 pb-20 pt-28">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(220_55%_20%)] hover:opacity-75">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-3xl border border-[rgba(248,245,240,0.12)] bg-[hsl(220_55%_20%)] text-[hsl(43_70%_88%)] shadow-[0_24px_80px_rgba(8,18,35,0.18)]">
          <div className="grid gap-0 lg:grid-cols-[1fr_0.82fr]">
            <div className="p-6 sm:p-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(201,169,97,0.34)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[hsl(43_80%_60%)]">
                <CheckCircle2 size={15} />
                {hasAccess ? "Message Rescue active" : "Message Rescue workspace"}
              </div>
              <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
                Paste the messages. Leave with send-ready wording.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[rgba(248,245,240,0.72)]">
                Use this workspace for the {messageLimit} difficult messages included in Message Rescue. Each slot turns pressure, hesitation, or conflict into composed wording you can send today.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-2">
                  <MessageSquare size={14} />
                  {completedCount}/{messageLimit} messages prepared
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-2">
                  <Sparkles size={14} />
                  {deliveryMinutes}-minute outcome path
                </span>
              </div>
            </div>

            <aside className="border-t border-[rgba(248,245,240,0.12)] bg-[rgba(8,18,35,0.28)] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <Shield size={22} className="text-[hsl(43_80%_60%)]" />
              <h2 className="mt-4 font-serif text-2xl font-bold">Use the slot when delay costs more than the rewrite.</h2>
              <p className="mt-3 text-sm leading-6 text-[rgba(248,245,240,0.7)]">
                Best fit: client follow-ups, apology wording, price or fee messages, staff updates, refund replies, and firm boundaries.
              </p>
              {!hasAccess && (
                <Link href="/rescue" className="mt-5 inline-flex w-full justify-center rounded-lg bg-[hsl(43_80%_60%)] px-5 py-3 text-sm font-bold text-[hsl(220_45%_13%)]">
                  Start Message Rescue
                </Link>
              )}
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {slots.map((slot) => (
            <article key={slot.id} className="rounded-2xl border border-[hsl(40_25%_88%)] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[hsl(43_80%_42%)]">{slot.label}</p>
                  <h3 className="mt-1 font-serif text-xl font-bold text-[hsl(220_45%_13%)]">Rescue draft</h3>
                </div>
                {slot.result && <CheckCircle2 size={20} className="text-emerald-600" />}
              </div>

              <textarea
                value={slot.draft}
                onChange={(event) => updateSlot(slot.id, { draft: event.target.value })}
                className="h-44 w-full resize-none rounded-lg border border-[hsl(40_25%_88%)] bg-[hsl(40_20%_98%)] p-4 text-sm text-[hsl(220_45%_13%)] outline-none focus:border-[hsl(43_80%_60%)]"
                placeholder="Paste the message you are avoiding."
              />

              <div className="mt-3 flex gap-2">
                <select
                  value={slot.tone}
                  onChange={(event) => updateSlot(slot.id, { tone: event.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-[hsl(40_25%_88%)] px-3 py-3 text-sm text-[hsl(220_45%_13%)] outline-none"
                >
                  {toneOptions.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => rescueMessage(slot)}
                  disabled={!slot.draft.trim() || slot.loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(220_55%_20%)] px-4 py-3 text-sm font-bold text-[hsl(43_70%_88%)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Send size={15} />
                  {slot.loading ? "Working" : "Rescue"}
                </button>
              </div>

              <div className="mt-4 min-h-56 rounded-lg border border-[hsl(40_25%_88%)] bg-[hsl(40_20%_97%)] p-4 text-sm leading-6 text-[hsl(220_45%_13%)]">
                {slot.result ? <pre className="whitespace-pre-wrap font-sans">{slot.result}</pre> : <span className="text-[hsl(220_25%_45%)]">Your send-ready wording appears here.</span>}
              </div>

              {slot.result && (
                <button
                  type="button"
                  onClick={() => copyResult(slot)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(40_25%_88%)] px-4 py-3 text-sm font-bold text-[hsl(220_45%_13%)] transition hover:bg-[hsl(40_20%_97%)]"
                >
                  <Copy size={15} />
                  {copied === slot.id ? "Copied" : "Copy send-ready message"}
                </button>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
