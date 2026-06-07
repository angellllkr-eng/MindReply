import Link from "next/link";
import { ArrowRight, Bot, BookOpen, CalendarDays, CheckCircle2, MessageSquare, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

const services = [
  {
    icon: Bot,
    title: "MRagent AI Chat",
    body: "Ask normal questions, prepare sensitive replies, choose a plan, or get an expert-field preview before booking.",
    href: "/agent",
    cta: "Open MRagent",
  },
  {
    icon: Wand2,
    title: "Communication Tools",
    body: "Run overload analysis, prospect reply recovery, email polishing, text refinement, tone calibration, and planning workflows.",
    href: "/tools",
    cta: "Use tools",
  },
  {
    icon: CalendarDays,
    title: "Professional Booking",
    body: "Choose a professional and book text, voice, or video. If provider systems are offline, the local fallback still creates a session room.",
    href: "/professionals",
    cta: "Find a professional",
  },
  {
    icon: BookOpen,
    title: "Specialist Lexicons",
    body: "Use clinical, legal, executive, and financial language dictionaries to keep wording precise and field-aware.",
    href: "/lexicons",
    cta: "Open lexicons",
  },
];

const recoveryChecks = [
  "Footer routes point to working pages only",
  "Integrations are removed from public navigation",
  "Bookings can create local fallback session records",
  "MRagent works with provider AI or local intelligence",
  "Language status is available at /api/language",
  "Lexicons render with database or fallback data",
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen pt-20" style={{ background: "hsl(40 33% 97%)" }}>
      <section className="px-4 py-16" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}>Recovered Service Layer</p>
          <h1 className="max-w-3xl font-serif text-4xl font-bold md:text-5xl" style={{ color: "hsl(43 70% 88%)" }}>Working services for chat, tools, bookings, and lexicons.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: "rgba(248,245,240,0.72)" }}>
            This page routes visitors to the highest-confidence parts of MindReply right now: AI chat, practical tools, professional booking flows, and specialist language systems.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                    <Icon size={22} />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "hsl(150 45% 92%)", color: "hsl(150 40% 28%)" }}>
                    <CheckCircle2 size={13} /> Ready
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{service.title}</h2>
                <p className="mt-2 text-sm leading-6" style={{ color: "hsl(220 25% 45%)" }}>{service.body}</p>
                <Link href={service.href} className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
                  {service.cta} <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border bg-white p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}><ShieldCheck size={14} /> Recovery status</p>
            <h2 className="font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Everything here is routed to a working surface.</h2>
            <p className="mt-3 text-sm leading-6" style={{ color: "hsl(220 25% 45%)" }}>
              Provider-backed systems still become stronger when Vercel environment variables are fully connected, but the public path no longer depends on unfinished integration pages.
            </p>
          </section>
          <section className="rounded-2xl border bg-white p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}><Sparkles size={14} /> Working checks</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {recoveryChecks.map((item) => (
                <div key={item} className="flex gap-2 rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 35% 30%)" }}>
                  <CheckCircle2 size={15} style={{ color: "hsl(43 80% 45%)" }} />
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border bg-[hsl(220_45%_13%)] p-6 text-[hsl(43_70%_88%)]" style={{ borderColor: "rgba(248,245,240,0.14)" }}>
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[hsl(43_80%_60%)]">Start now</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Use AI chat first, then move to tools or booking when useful.</h2>
              <p className="mt-2 text-sm text-[rgba(248,245,240,0.68)]">That keeps the path useful even before every provider dashboard is fully connected.</p>
            </div>
            <Link href="/agent" className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              Start with MRagent <MessageSquare size={15} />
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
