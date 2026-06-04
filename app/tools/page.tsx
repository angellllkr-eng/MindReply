"use client";
import { useState } from "react";
import { Zap, Users, BookOpen, BarChart3, Copy, RotateCcw } from "lucide-react";

type Tool = "email" | "tone" | "note" | "plan";
const TONES = ["professional", "warm", "assertive", "empathetic", "concise", "diplomatic"];
const FORMATS = [{ v: "bullet", l: "Bullet Points" }, { v: "paragraph", l: "Paragraph" }, { v: "executive", l: "Executive Summary" }];

export default function Tools() {
  const [active, setActive] = useState<Tool>("email");
  const [input, setInput] = useState("");
  const [emailTone, setEmailTone] = useState("professional");
  const [targetTone, setTargetTone] = useState("professional");
  const [outputFormat, setOutputFormat] = useState("bullet");
  const [timeframe, setTimeframe] = useState("30 days");
  const [result, setResult] = useState<{ result?: string; steps?: string[]; suggestions?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function reset() { setInput(""); setResult(null); }

  function copy() {
    const t = result?.result ?? (result?.steps ?? []).join("\n");
    navigator.clipboard.writeText(t ?? "");
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  async function run() {
    if (!input.trim()) return;
    setLoading(true); setResult(null);
    try {
      let url = ""; let body: Record<string, string> = {};
      if (active === "email") { url = "/api/tools/refine-email"; body = { text: input, tone: emailTone }; }
      else if (active === "tone") { url = "/api/tools/adjust-tone"; body = { text: input, targetTone }; }
      else if (active === "note") { url = "/api/tools/clarify-note"; body = { text: input, outputFormat }; }
      else { url = "/api/tools/plan"; body = { goal: input, timeframe }; }
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setResult(await r.json());
    } finally { setLoading(false); }
  }

  const tools: { id: Tool; icon: React.ReactNode; title: string; desc: string }[] = [
    { id: "email", icon: <Zap size={18} />, title: "Email Refiner", desc: "Polish any draft into professional correspondence." },
    { id: "tone", icon: <Users size={18} />, title: "Tone Adjuster", desc: "Shift your message across 6 communication modes." },
    { id: "note", icon: <BookOpen size={18} />, title: "Note Clarifier", desc: "Transform rough notes into structured, clear text." },
    { id: "plan", icon: <BarChart3 size={18} />, title: "Mini-Planner", desc: "Turn a goal into a milestone-driven plan." },
  ];

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="py-14 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Intelligence Suite</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3" style={{ color: "hsl(43 70% 88%)" }}>Behavioral AI Tools</h1>
          <p className="text-sm max-w-xl" style={{ color: "rgba(248,245,240,0.7)" }}>Instant intelligence for your most critical communications.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tools.map((t) => (
            <button key={t.id} onClick={() => { setActive(t.id); reset(); }}
              className={`text-left p-5 rounded-xl border transition-all ${active === t.id ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.05)] shadow-sm" : "border-[hsl(40_25%_88%)] bg-white hover:-translate-y-0.5"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${active === t.id ? "bg-[hsl(220_55%_20%)]" : "bg-[hsl(40_20%_92%)]"}`}>
                <span style={{ color: active === t.id ? "hsl(43 70% 88%)" : "hsl(220 25% 45%)" }}>{t.icon}</span>
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "hsl(220 45% 13%)" }}>{t.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-6">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "hsl(220 45% 13%)" }}>
              {active === "email" ? "Your Draft" : active === "tone" ? "Your Text" : active === "note" ? "Your Notes" : "Your Goal"}
            </h3>
            {active === "email" && (
              <div className="mb-3">
                <label className="text-xs block mb-1.5" style={{ color: "hsl(220 25% 45%)" }}>Desired tone</label>
                <select value={emailTone} onChange={(e) => setEmailTone(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }}>
                  {TONES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            )}
            {active === "tone" && (
              <div className="mb-3">
                <label className="text-xs block mb-1.5" style={{ color: "hsl(220 25% 45%)" }}>Target tone</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TONES.map((t) => (
                    <button key={t} onClick={() => setTargetTone(t)} className={`text-xs px-2 py-1.5 rounded-lg border font-medium transition-all capitalize ${targetTone === t ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.1)] text-[hsl(43_80%_60%)]" : "border-[hsl(40_25%_88%)] text-[hsl(220_25%_45%)]"}`}>{t}</button>
                  ))}
                </div>
              </div>
            )}
            {active === "note" && (
              <div className="mb-3 flex gap-1.5">
                {FORMATS.map((f) => (
                  <button key={f.v} onClick={() => setOutputFormat(f.v)} className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${outputFormat === f.v ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.1)] text-[hsl(43_80%_60%)]" : "border-[hsl(40_25%_88%)] text-[hsl(220_25%_45%)]"}`}>{f.l}</button>
                ))}
              </div>
            )}
            {active === "plan" && (
              <div className="mb-3">
                <label className="text-xs block mb-1.5" style={{ color: "hsl(220 25% 45%)" }}>Timeframe</label>
                <input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g. 30 days, 3 months" className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }} />
              </div>
            )}
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={7}
              placeholder={active === "email" ? "Paste your email draft..." : active === "tone" ? "Enter text to adjust..." : active === "note" ? "Paste your rough notes..." : "Describe your goal..."}
              className="w-full rounded-lg px-3 py-3 text-sm outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors resize-none leading-relaxed" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }} />
            <button onClick={run} disabled={!input.trim() || loading}
              className="w-full mt-4 font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm flex items-center justify-center gap-2" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
              {loading ? <><span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(248,245,240,0.3)", borderTopColor: "hsl(43 70% 88%)" }} />Processing...</> : <><Zap size={15} />Run Intelligence</>}
            </button>
          </div>

          <div className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: "hsl(220 45% 13%)" }}>Result</h3>
              {result && (
                <div className="flex gap-2">
                  <button onClick={copy} className="text-xs flex items-center gap-1 hover:text-[hsl(220_55%_20%)] transition-colors" style={{ color: "hsl(220 25% 45%)" }}><Copy size={12} /> {copied ? "Copied!" : "Copy"}</button>
                  <button onClick={reset} className="text-xs flex items-center gap-1 hover:text-[hsl(220_55%_20%)] transition-colors" style={{ color: "hsl(220 25% 45%)" }}><RotateCcw size={12} /> Reset</button>
                </div>
              )}
            </div>
            {!result && !loading && (
              <div className="h-52 flex flex-col items-center justify-center text-sm text-center gap-2" style={{ color: "hsl(220 25% 45%)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: "hsl(40 20% 92%)" }}><Zap size={20} style={{ color: "rgba(10,22,40,0.25)" }} /></div>
                <p>Your result will appear here</p>
              </div>
            )}
            {loading && <div className="h-52 flex items-center justify-center"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(201,169,97,0.3)", borderTopColor: "hsl(43 80% 60%)" }} /></div>}
            {result && (
              <div className="space-y-4">
                {result.result && <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92% / 0.5)", color: "hsl(220 45% 13%)" }}>{result.result}</div>}
                {result.steps && (
                  <div className="space-y-2">
                    {result.steps.map((step, i) => (
                      <div key={i} className="flex gap-2.5 text-sm" style={{ color: "hsl(220 45% 13%)" }}>
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(201,169,97,0.2)", color: "hsl(43 80% 60%)" }}>{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                )}
                {(result.suggestions ?? []).length > 0 && (
                  <div className="border-t border-[hsl(40_25%_88%)] pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "hsl(220 25% 45%)" }}>Intelligence Notes</p>
                    <ul className="space-y-1.5">
                      {(result.suggestions ?? []).map((s, i) => (
                        <li key={i} className="text-xs flex gap-2" style={{ color: "hsl(220 25% 45%)" }}><span style={{ color: "hsl(43 80% 60%)" }}>›</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
