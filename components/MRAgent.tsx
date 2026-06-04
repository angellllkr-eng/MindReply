"use client";
import { useState } from "react";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";
import Link from "next/link";

type Msg = { role: "agent" | "user"; text: string };
const GREET: Msg = { role: "agent", text: "Good day. I'm MR Agent — your behavioral intelligence concierge. How can I assist you today?" };
const SUGGESTIONS = ["Find me a communication coach", "What tools do you offer?", "Tell me about membership", "Book a legal consultation"];

function getReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("coach") || m.includes("communication")) return "Isabelle Moreau is exceptional for communication coaching — 16 years bridging personal and corporate dynamics, trusted by diplomats. Shall I take you to her profile?";
  if (m.includes("tool")) return "Our tools section has the Email Refiner, Tone Adjuster, Note Clarifier, and Mini-Planner — all delivering instant, intelligent refinement.";
  if (m.includes("membership") || m.includes("tier")) return "Three tiers: Curator (£49/mo), Strategist (£149/mo) — our most popular — and Sovereign (£499/mo) for complete white-glove service.";
  if (m.includes("legal") || m.includes("lawyer")) return "James Hartley — 20 years UK employment and corporate law. Available for video consultation. Shall I link you to his booking page?";
  return "I'd be glad to help. Could you share a little more? I'll match you with the right professional or tool.";
}

export default function MRAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREET]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => { setMessages((m) => [...m, { role: "agent", text: getReply(text) }]); setTyping(false); }, 900);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-all ${open ? "hidden" : "flex"}`} style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-pulse" style={{ background: "hsl(43 80% 60%)" }} />
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[hsl(40_25%_88%)]" style={{ maxHeight: "520px", background: "hsl(0 0% 100%)" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "hsl(220 55% 20%)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border flex items-center justify-center" style={{ background: "rgba(201,169,97,0.2)", borderColor: "rgba(201,169,97,0.4)" }}>
                <span className="font-serif font-bold text-sm" style={{ color: "hsl(43 80% 60%)" }}>MR</span>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "hsl(43 70% 88%)" }}>MR Agent</p>
                <p className="text-xs flex items-center gap-1" style={{ color: "hsl(43 80% 60%)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "#34d399" }} /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100" style={{ color: "hsl(43 70% 88%)" }}><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "hsl(40 20% 92% / 0.3)" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "agent" ? "rounded-tl-sm" : "rounded-tr-sm border border-[hsl(40_25%_88%)]"}`}
                  style={m.role === "agent" ? { background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" } : { background: "white", color: "hsl(220 45% 13%)" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5" style={{ background: "hsl(220 55% 20%)" }}>
                  <span className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "hsl(43 70% 88%)", animationDelay: `${d}ms` }} />)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pt-1 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs px-2.5 py-1 rounded-full border hover:border-[hsl(43_80%_60%)] hover:text-[hsl(43_80%_60%)] transition-colors" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }}>{s}</button>
              ))}
            </div>
          )}

          <div className="px-3 py-1.5 border-t border-[hsl(40_25%_88%)] flex gap-2 text-xs">
            {[["Professionals", "/professionals"], ["Tools", "/tools"], ["Membership", "/memberships"]].map(([l, h]) => (
              <Link key={h} href={h} className="flex items-center gap-0.5 text-[hsl(220_25%_45%)] hover:text-[hsl(220_55%_20%)] transition-colors">{l} <ChevronRight size={10} /></Link>
            ))}
          </div>

          <div className="p-3 border-t border-[hsl(40_25%_88%)]">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Ask MR Agent..."
                className="flex-1 text-sm rounded-lg px-3 py-2 outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors" style={{ background: "hsl(40 20% 92%)" }} />
              <button onClick={() => send(input)} disabled={!input.trim()} className="px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
