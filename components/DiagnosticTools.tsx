"use client";

import { BarChart3, Gauge, RotateCcw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

const bandwidthItems = [
  { key: "inbox", label: "Inbox and replies", max: 20, defaultValue: 8 },
  { key: "admin", label: "Admin and scheduling", max: 15, defaultValue: 5 },
  { key: "drafting", label: "Content drafting", max: 15, defaultValue: 6 },
  { key: "research", label: "Research and reporting", max: 12, defaultValue: 4 },
  { key: "coordination", label: "Task coordination", max: 10, defaultValue: 3 },
] as const;

const clarityQuestions = [
  {
    question: "How often does reactive communication dictate your day?",
    options: ["Rarely", "Sometimes", "Most days", "Constantly"],
  },
  {
    question: "How much weekly work is repeatable enough to delegate?",
    options: ["Under 10%", "10-25%", "25-50%", "Over 50%"],
  },
  {
    question: "How clear is your next strategic communication priority?",
    options: ["Exact", "Mostly clear", "Somewhat unclear", "Unclear"],
  },
  {
    question: "How often do urgent messages displace important work?",
    options: ["Almost never", "Occasionally", "Weekly", "Daily"],
  },
] as const;

type BandwidthKey = (typeof bandwidthItems)[number]["key"];
type BandwidthState = Record<BandwidthKey, number>;

const defaultBandwidth = bandwidthItems.reduce((acc, item) => {
  acc[item.key] = item.defaultValue;
  return acc;
}, {} as BandwidthState);

function resultLabel(score: number) {
  if (score <= 3) return { label: "High clarity", detail: "Your current signal is strong. MindReply would amplify and preserve that focus." };
  if (score <= 7) return { label: "Moderate clarity debt", detail: "Some attention is leaking into repeatable work. A tighter operating layer would reclaim it." };
  if (score <= 10) return { label: "Significant interference", detail: "Reactive work is crowding out strategic communication. This is a high-value recovery zone." };
  return { label: "Critical bandwidth loss", detail: "Your operating surface is overloaded. Prioritise automation, delegation, and message triage." };
}

export default function DiagnosticTools() {
  const [active, setActive] = useState<"bandwidth" | "clarity">("bandwidth");
  const [bandwidth, setBandwidth] = useState<BandwidthState>(defaultBandwidth);
  const [answers, setAnswers] = useState<number[]>(Array(clarityQuestions.length).fill(-1));

  const totalHours = useMemo(() => Object.values(bandwidth).reduce((sum, value) => sum + value, 0), [bandwidth]);
  const reclaimable = Math.round(totalHours * 0.72);
  const clarityScore = answers.reduce((sum, value) => sum + Math.max(0, value), 0);
  const clarityComplete = answers.every((value) => value >= 0);
  const clarity = resultLabel(clarityScore);

  function setBandwidthValue(key: BandwidthKey, value: number) {
    setBandwidth((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setBandwidth(defaultBandwidth);
    setAnswers(Array(clarityQuestions.length).fill(-1));
  }

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[hsl(220_25%_18%)] bg-[hsl(220_45%_13%)] shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 p-6 md:p-8 lg:border-b-0 lg:border-r">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(43_80%_60%_/_0.28)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(43_80%_60%)]">
              <ShieldCheck size={13} />
              Free diagnostics
            </div>
            <h2 className="font-serif text-3xl font-bold leading-tight text-[hsl(43_70%_88%)] md:text-4xl">
              Find the pressure points before they cost attention.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[rgba(248,245,240,0.68)]">
              Two quick instruments from the older Mind-Reply build were rebuilt here as production App Router tools. No account required, no data stored.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { key: "bandwidth" as const, title: "Bandwidth Audit", icon: <BarChart3 size={16} />, text: "Estimate reclaimable weekly hours." },
                { key: "clarity" as const, title: "Signal Clarity Check", icon: <Gauge size={16} />, text: "Score communication interference." },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active === tab.key
                      ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.1)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[hsl(43_70%_88%)]">
                    {tab.icon}
                    {tab.title}
                  </span>
                  <span className="block text-xs leading-relaxed text-[rgba(248,245,240,0.54)]">{tab.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {active === "bandwidth" ? (
              <div className="grid gap-6 md:grid-cols-[1fr_0.85fr]">
                <div className="space-y-5">
                  {bandwidthItems.map((item) => (
                    <label key={item.key} className="block">
                      <span className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-[hsl(43_70%_88%)]">{item.label}</span>
                        <span className="font-serif text-xl font-bold text-[hsl(43_80%_60%)]">{bandwidth[item.key]}h</span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={item.max}
                        value={bandwidth[item.key]}
                        onChange={(event) => setBandwidthValue(item.key, Number(event.target.value))}
                        className="w-full accent-[hsl(43_80%_60%)]"
                      />
                    </label>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(248,245,240,0.52)]">Reclaim potential</p>
                  <p className="mt-4 font-serif text-5xl font-bold text-[hsl(43_80%_60%)]">{reclaimable}h</p>
                  <p className="mt-2 text-sm text-[rgba(248,245,240,0.7)]">per week could move from reactive work into strategic decisions.</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[hsl(43_80%_60%)] transition-all" style={{ width: `${Math.min(100, reclaimable * 2)}%` }} />
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-[rgba(248,245,240,0.5)]">
                    Estimate based on repeatable communication, scheduling, reporting, and coordination load.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[1fr_0.85fr]">
                <div className="space-y-5">
                  {clarityQuestions.map((question, questionIndex) => (
                    <div key={question.question}>
                      <p className="mb-3 text-sm font-medium leading-relaxed text-[hsl(43_70%_88%)]">
                        <span className="mr-2 text-[hsl(43_80%_60%)]">0{questionIndex + 1}</span>
                        {question.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={option}
                            onClick={() => {
                              const next = [...answers];
                              next[questionIndex] = optionIndex;
                              setAnswers(next);
                            }}
                            className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                              answers[questionIndex] === optionIndex
                                ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.12)] text-[hsl(43_70%_88%)]"
                                : "border-white/10 bg-white/[0.04] text-[rgba(248,245,240,0.58)] hover:border-white/20"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(248,245,240,0.52)]">Signal score</p>
                  <p className="mt-4 font-serif text-5xl font-bold text-[hsl(43_80%_60%)]">
                    {clarityComplete ? `${clarityScore}/12` : `${answers.filter((value) => value >= 0).length}/4`}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[hsl(43_70%_88%)]">{clarityComplete ? clarity.label : "Complete all questions"}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[rgba(248,245,240,0.62)]">
                    {clarityComplete ? clarity.detail : "Your result will appear as soon as each answer is selected."}
                  </p>
                  <button onClick={reset} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-[rgba(248,245,240,0.72)] hover:border-[hsl(43_80%_60%_/_0.5)]">
                    <RotateCcw size={13} />
                    Reset diagnostics
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
