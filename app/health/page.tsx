import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Database, Languages, Server, ShieldCheck } from "lucide-react";

const checks = [
  { icon: Server, label: "Next.js app", status: "Online", href: "/" },
  { icon: Activity, label: "Health API", status: "Check", href: "/api/health" },
  { icon: Languages, label: "Language detection", status: "Check", href: "/api/language" },
  { icon: Database, label: "Professional data", status: "Ready", href: "/api/professionals" },
];

export default function HealthPage() {
  return (
    <main className="min-h-screen pt-20" style={{ background: "hsl(40 33% 97%)" }}>
      <section className="px-4 py-16" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}><ShieldCheck size={14} /> System status</p>
          <h1 className="font-serif text-4xl font-bold md:text-5xl" style={{ color: "hsl(43 70% 88%)" }}>MindReply health layer</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: "rgba(248,245,240,0.72)" }}>
            Public status shortcuts for the app, language detection, service data, and API health.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {checks.map((check) => {
            const Icon = check.icon;
            return (
              <Link key={check.label} href={check.href} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[hsl(43_80%_60%)]" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}><Icon size={21} /></span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "hsl(150 45% 92%)", color: "hsl(150 40% 28%)" }}><CheckCircle2 size={13} /> {check.status}</span>
                </div>
                <h2 className="mt-4 font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{check.label}</h2>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(43 80% 38%)" }}>Open status <ArrowRight size={14} /></p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <p className="text-sm leading-6" style={{ color: "hsl(220 25% 45%)" }}>
            Use these links to verify the live app, API health, language detection, and professional data endpoints.
          </p>
        </div>
      </section>
    </main>
  );
}
