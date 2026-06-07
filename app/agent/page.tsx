"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bot, CalendarDays, CreditCard, MessageSquare, Send, Sparkles, TrendingUp } from "lucide-react";
import { Message as AIMessage, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { useLanguage } from "@/components/LanguageProvider";

type Message = { role: "agent" | "user"; text: string };
type AgentAnalysis = {
  intent: string;
  emotionalValence: string;
  powerDistance: string;
  clarityFramework: string[];
};

const baseStarter: Message = {
  role: "agent",
  text: "Hi, I am MRagent. Ask me anything - a message, decision, booking, credits, expert field, or plan choice. I will answer naturally and show the fastest useful next step.",
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function replyDelay(message: string) {
  return Math.min(2600, 1000 + message.length * 10);
}

function getNextAction(analysis: AgentAnalysis | null) {
  if (!analysis) return null;

  if (analysis.intent === "message_rescue") {
    return {
      href: "/rescue",
      label: "Open Message Rescue",
      text: "Clear 3 stuck replies today instead of carrying them into tomorrow.",
    };
  }

  if (analysis.intent === "booking_and_credits" || analysis.intent === "professional_booking") {
    return {
      href: "/professionals",
      label: "Book a professional",
      text: "Use video, voice, or text review when the situation is high-stakes.",
    };
  }

  if (analysis.intent === "credit_purchase") {
    return {
      href: "/tools",
      label: "Open tools",
      text: "Use credits for fast rewrites, tone fixes, and message polishing.",
    };
  }

  if (analysis.intent === "membership_upgrade") {
    return {
      href: "/memberships",
      label: "Compare plans",
      text: "Choose Growth or Pro when repeating context is costing time.",
    };
  }

  return {
    href: "/tools/ops-overload-analyzer",
    label: "Analyze overload",
    text: "If the issue is pressure or too many messages, turn it into next actions first.",
  };
}

export default function AgentPage() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const expert = searchParams.get("expert")?.trim() ?? "";
  const professional = searchParams.get("professional")?.trim() ?? "";
  const expertContext = expert ? `${expert}${professional ? ` with ${professional}` : ""}` : "";
  const starter = useMemo<Message>(() => expertContext
    ? {
        role: "agent",
        text: `I can help as a ${expertContext}-aware AI preview. Tell me the situation, the person involved, and what outcome you want. I will be helpful first, then suggest text, voice, or video booking only if expert support is genuinely needed.`,
      }
    : baseStarter,
  [expertContext]);

  const quickPrompts = useMemo(() => [
    { icon: MessageSquare, label: "Rescue message", prompt: "I have a difficult client reply I keep avoiding. What is the fastest way to handle it?" },
    { icon: CreditCard, label: "Buy credits", prompt: "I want to buy credits for the tools. Which pack should I use?" },
    { icon: CalendarDays, label: expertContext ? "Book this field" : "Book video", prompt: expertContext ? `I may need a ${expert} session. What mode should I choose and how should I prepare?` : "I need to book a video session with the right professional. What is the best route?" },
    { icon: TrendingUp, label: "Pick plan", prompt: "Should I use Signal, Growth, or Pro for daily work?" },
  ], [expert, expertContext]);

  const [messages, setMessages] = useState<Message[]>([starter]);
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const nextAction = getNextAction(analysis);

  async function sendText(rawText: string) {
    const text = rawText.trim();
    if (!text || loading) return;

    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      await sleep(replyDelay(text));
      const messageForAgent = expertContext ? `[Expert preview context: ${expertContext}] ${text}` : text;
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageForAgent, language }),
      });
      const data = await response.json();
      setAnalysis(data.analysis ?? null);
      setMessages((current) => [...current, { role: "agent", text: data.reply ?? "I have the context. Clarify the desired outcome and I will shape the next message." }]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    await sendText(input);
  }

  return (
    <main className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <section className="py-14 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>MRagent</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3" style={{ color: "hsl(43 70% 88%)" }}>{expertContext ? `${expert} AI preview` : "Human-feeling AI chat assistant"}</h1>
          <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "rgba(248,245,240,0.72)" }}>Ask broad questions, refine sensitive messages, prepare for a professional session, buy credits, or choose the right Signal, Growth, or Pro path without losing momentum.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}><Bot size={20} /></span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(220 45% 13%)" }}>MRagent</p>
                  <p className="text-xs" style={{ color: "hsl(220 25% 45%)" }}>{expertContext ? `${expertContext} preview mode` : "Online for chat, Message Rescue, credits, bookings, and plan routing"}</p>
                </div>
              </div>
              <Link href="/professionals" className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 rounded-lg border" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 55% 20%)" }}>Find a professional</Link>
            </div>
            <div className="flex flex-wrap gap-2 border-b px-5 py-3" style={{ borderColor: "hsl(40 25% 88%)" }}>
              {quickPrompts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => sendText(item.prompt)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:border-[hsl(43_80%_60%)] disabled:opacity-50"
                    style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }}
                  >
                    <Icon size={13} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="h-[460px] overflow-y-auto p-5 space-y-4" style={{ background: "hsl(40 20% 96%)" }}>
              {messages.map((message, index) => (
                <AIMessage key={index} from={message.role === "agent" ? "assistant" : "user"} className={message.role === "user" ? "items-end" : "items-start"}>
                  <MessageContent className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed" style={message.role === "agent" ? { background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" } : { background: "white", color: "hsl(220 45% 13%)", border: "1px solid hsl(40 25% 88%)" }}>
                    {message.role === "agent" ? <MessageResponse>{message.text}</MessageResponse> : message.text}
                  </MessageContent>
                </AIMessage>
              ))}
              {loading && <div className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>MRagent is running the behavioral dictionary pass...</div>}
            </div>

            <div className="p-4 border-t" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about anything - messages, credits, bookings, plans..." className="flex-1 rounded-lg border px-3 py-3 text-sm outline-none focus:border-[hsl(43_80%_60%)]" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }} />
                <button onClick={send} disabled={loading || !input.trim()} className="px-4 rounded-lg flex items-center gap-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}><Send size={16} /> Send</button>
              </div>
            </div>
          </div>

          <aside className="bg-white border rounded-2xl p-5 h-fit" style={{ borderColor: "hsl(40 25% 88%)" }}>
            {nextAction && (
              <div className="border-b pb-4 mb-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 45%)" }}>Fastest Next Step</p>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "hsl(220 45% 13%)" }}>{nextAction.text}</p>
                <Link href={nextAction.href} className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
                  {nextAction.label}
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "hsl(43 80% 45%)" }}><Sparkles size={13} /> Live Analysis</p>
            {analysis ? (
              <div className="space-y-4">
                {[
                  ["Intent", analysis.intent],
                  ["Emotional Valence", analysis.emotionalValence],
                  ["Power Distance", analysis.powerDistance],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs mb-1" style={{ color: "hsl(220 25% 45%)" }}>{label}</p>
                    <p className="text-sm font-semibold capitalize" style={{ color: "hsl(220 45% 13%)" }}>{value.replace(/_/g, " ")}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs mb-2" style={{ color: "hsl(220 25% 45%)" }}>Clarity Framework</p>
                  <ul className="space-y-2">
                    {analysis.clarityFramework.map((item) => (
                      <li key={item} className="text-xs flex gap-2" style={{ color: "hsl(220 45% 13%)" }}><span style={{ color: "hsl(43 80% 45%)" }}>-</span>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>Send a message to surface intent, emotional valence, power distance, and the best paid or free route when it helps.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
