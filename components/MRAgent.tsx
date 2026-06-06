"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageCircle, Send, Sparkles, X } from "lucide-react";

type Msg = { role: "agent" | "user"; text: string; source?: string };

const GREET: Msg = {
  role: "agent",
  text: "Hi, I am MRagent. Ask me anything - a message, a decision, a booking, credits, or which plan fits your work. I will keep it practical and point you to the fastest useful next step.",
};

const SUGGESTIONS = ["Help me buy credits", "Book a video session", "Which plan should I choose?", "Can we talk about another topic?"];

export default function MRAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREET]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  async function send(text: string) {
    const message = text.trim();
    if (!message || typing) return;

    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error(`MR Agent failed with ${response.status}`);
      }
      const data = await response.json();
      setMessages((current) => [...current, { role: "agent", text: data.reply ?? "I have the context. Clarify the desired outcome and I will shape the next move.", source: data.source ?? "local" }]);
    } catch (error) {
      const fallback = message.toLowerCase().includes("login")
        ? "For login, use Member Login or Sign Up. If access is still preparing, continue through the workspace preview and come back to sign in when your member account is ready."
        : message.toLowerCase().includes("book") || message.toLowerCase().includes("payment")
          ? "For booking or payment, choose a professional, buy credits, or upgrade to Growth/Pro. The clean path is to start with the action you need now, then confirm the dashboard or session room after checkout."
          : "I am still active locally. Ask me about the situation in plain language. If there is a paid path that will genuinely save time, I will make it clear without pushing.";
      setMessages((current) => [...current, { role: "agent", text: fallback, source: "ready" }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all hover:opacity-90 ${open ? "hidden" : ""}`} style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }} aria-label="Open MR Agent">
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
                <p className="font-semibold text-sm" style={{ color: "hsl(43 70% 88%)" }}>MRagent</p>
                <p className="text-xs flex items-center gap-1" style={{ color: "hsl(43 80% 60%)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "#34d399" }} /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100" style={{ color: "hsl(43 70% 88%)" }}><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "hsl(40 20% 92% / 0.3)" }}>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "agent" ? "rounded-tl-sm" : "rounded-tr-sm border border-[hsl(40_25%_88%)]"}`} style={message.role === "agent" ? { background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" } : { background: "white", color: "hsl(220 45% 13%)" }}>
                  {message.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5" style={{ background: "hsl(220 55% 20%)" }}>
                  <span className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((delay) => <span key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "hsl(43 70% 88%)", animationDelay: `${delay}ms` }} />)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} onClick={() => send(suggestion)} className="text-xs px-2.5 py-1 rounded-full border hover:border-[hsl(43_80%_60%)] hover:text-[hsl(43_80%_60%)] transition-colors" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }}>{suggestion}</button>
              ))}
            </div>
          )}

          <div className="px-3 py-2 border-t border-[hsl(40_25%_88%)] flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-[hsl(43_80%_60%_/_0.16)] px-2 py-1 font-semibold text-[hsl(220_55%_20%)]"><Sparkles size={11} /> Ready</span>
            {[["Professionals", "/professionals"], ["Tools", "/tools"], ["Membership", "/memberships"]].map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center gap-0.5 text-[hsl(220_25%_45%)] hover:text-[hsl(220_55%_20%)] transition-colors">{label} <ChevronRight size={10} /></Link>
            ))}
          </div>

          <div className="p-3 border-t border-[hsl(40_25%_88%)]">
            <div className="flex gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send(input)} placeholder="Ask MRagent anything..." className="flex-1 text-sm rounded-lg px-3 py-2 outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors" style={{ background: "hsl(40 20% 92%)" }} />
              <button onClick={() => send(input)} disabled={!input.trim() || typing} className="px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
