import Link from "next/link";
import { Activity, Bot, BookOpen, CalendarDays, HeartHandshake, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

const footerGroups = [
  {
    title: "Workflows",
    links: [
      { href: "/tools/ops-overload-analyzer", label: "Ops Overload Analyzer" },
      { href: "/tools/prospect-reply-analyzer", label: "Prospect Reply Analyzer" },
      { href: "/tools/email-polisher", label: "Email Polisher" },
      { href: "/tools/text-refiner", label: "Text Refiner" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services", label: "All Services" },
      { href: "/professionals", label: "Professionals" },
      { href: "/bookings", label: "My Bookings" },
      { href: "/lexicons", label: "Lexicons" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/agent", label: "MRagent" },
      { href: "/memberships", label: "Memberships" },
      { href: "/api/language", label: "Language Status" },
      { href: "/health", label: "System Health" },
    ],
  },
];

const statusItems = [
  { icon: Bot, label: "AI chat available" },
  { icon: Wand2, label: "Tools available" },
  { icon: CalendarDays, label: "Booking paths ready" },
  { icon: BookOpen, label: "Lexicons live" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-[hsl(220_45%_13%)] text-[hsl(43_70%_88%)]" style={{ borderColor: "rgba(248,245,240,0.14)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="MindReply home">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(43_80%_60%)] font-serif text-xl font-bold text-[hsl(220_45%_13%)]">M</span>
              <span>
                <span className="block font-serif text-xl font-bold">MindReply</span>
                <span className="text-xs text-[rgba(248,245,240,0.58)]">Subconscious Communication Intelligence</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-[rgba(248,245,240,0.68)]">
              Practical AI chat, tools, professional booking paths, lexicons, and communication workflows for people who need calm, useful support now.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {statusItems.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[rgba(248,245,240,0.74)]">
                    <Icon size={14} className="text-[hsl(43_80%_60%)]" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[hsl(43_80%_60%)]">
                  {group.title === "Workflows" ? <Sparkles size={14} /> : group.title === "Services" ? <HeartHandshake size={14} /> : <ShieldCheck size={14} />}
                  {group.title}
                </h2>
                <div className="grid gap-2">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm text-[rgba(248,245,240,0.68)] transition hover:text-[hsl(43_80%_60%)]">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-[rgba(248,245,240,0.52)] sm:flex-row sm:items-center sm:justify-between">
          <span>MindReply keeps chat, tools, bookings, lexicons, and system health within reach from every page.</span>
          <Link href="/api/health" className="inline-flex items-center gap-2 transition hover:text-[hsl(43_80%_60%)]">
            <Activity size={13} /> API health
          </Link>
        </div>
      </div>
    </footer>
  );
}
