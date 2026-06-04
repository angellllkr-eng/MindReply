"use client";

import { Activity, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const operations = [
  "Signal distilled from 47 unread threads",
  "Executive draft calibrated for trust and clarity",
  "Risk language softened without losing authority",
  "Next-step ownership detected and sharpened",
  "Cross-cultural phrasing adjusted for context",
  "Decision path compressed into three actions",
];

export default function OperationsHeroVisual() {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(284);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % operations.length);
      setCount((current) => current + 3);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const score = useMemo(() => 91 + (index % 6), [index]);

  return (
    <div className="relative hidden min-h-[520px] lg:block" aria-hidden="true">
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        <img
          src="/assets/images/hero-atmosphere.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,22,40,0.14),rgba(10,22,40,0.82))]" />
      </div>

      <div className="absolute left-8 right-8 top-8 rounded-2xl border border-white/15 bg-[rgba(10,22,40,0.72)] p-5 shadow-2xl backdrop-blur-md">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(43_80%_60%)] text-[hsl(220_45%_13%)]">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(43_80%_60%)]">MR Vision Layer</p>
              <p className="text-sm text-[rgba(248,245,240,0.78)]">Operational composure engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Clarity", value: `${score}/100` },
            { label: "Ops today", value: count.toLocaleString() },
            { label: "Risk", value: "Low" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(248,245,240,0.48)]">{item.label}</p>
              <p className="mt-2 font-serif text-2xl font-bold text-[hsl(43_70%_88%)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-8 max-w-[360px] rounded-2xl border border-white/15 bg-[rgba(10,22,40,0.78)] p-5 shadow-2xl backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(43_80%_60%)]">
          <Activity size={14} />
          Active intelligence
        </div>
        <p className="text-sm leading-relaxed text-[rgba(248,245,240,0.78)]">{operations[index]}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[hsl(43_80%_60%)] transition-all duration-700" style={{ width: `${58 + index * 7}%` }} />
        </div>
      </div>

      <div className="absolute bottom-8 right-8 flex items-center gap-2 rounded-full border border-white/15 bg-[rgba(10,22,40,0.72)] px-4 py-2 text-xs font-semibold text-[rgba(248,245,240,0.78)] backdrop-blur-md">
        <LockKeyhole size={14} className="text-[hsl(43_80%_60%)]" />
        Private by design
      </div>
    </div>
  );
}
