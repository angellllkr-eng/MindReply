import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, FileText, Gift, Network, ShieldCheck, TrendingUp, Users, Wand2 } from "lucide-react";
import DashboardSignOut from "@/components/DashboardSignOut";
import PurchaseSuccessPanel from "@/components/PurchaseSuccessPanel";

export default function UserDashboard() {
  const stats = [
    { label: "Available Credits", value: "42", icon: <Wand2 size={20} /> },
    { label: "Tools Used This Month", value: "18", icon: <FileText size={20} /> },
    { label: "Clarity Score", value: "96/100", icon: <TrendingUp size={20} /> },
    { label: "Network Connections", value: "124", icon: <Users size={20} /> },
  ];

  const actions = [
    { href: "/tools/text-refiner", title: "Text Refiner", body: "Refine casual messages instantly." },
    { href: "/tools/email-polisher", title: "Email Polisher", body: "Transform drafts to executive-grade." },
    { href: "/dashboard/analytics", title: "Behavioral Analytics", body: "View communication impact scores." },
    { href: "/lexicons", title: "Specialist Lexicons", body: "Choose words that lower resistance." },
    { href: "/orchestrator", title: "MR-Core Orchestrator", body: "Coordinate autonomous execution agents." },
  ];

  const engagementLoops = [
    { title: "Signal", body: "Name the real intention before you write. Calm intention changes how the message is received." },
    { title: "Frame", body: "Open with respect, define the decision, then make the next step feel obvious." },
    { title: "Return", body: "Invite one trusted peer to use the same communication standard this week." },
  ];

  const productAccess = [
    "Unlimited draft refinement queue",
    "Professional language lexicons",
    "Booking and specialist matching",
    "Analytics for clarity, trust, and tone",
  ];

  const proPreviews = [
    { title: "Unlimited Context Memory", body: "Growth keeps 30 days. Pro keeps the operational brain permanently available." },
    { title: "Character Profiles", body: "Preserve how investors, clients, team members, and partners respond under pressure." },
    { title: "Momentum Clarity", body: "See what is stuck, what moved, and what next action creates visible progress." },
    { title: "Slack, Gmail, Notion", body: "Move MindReply into the tools where the work already happens." },
  ];

  return (
    <main className="min-h-screen pt-24 pb-20 px-4" style={{ background: "hsl(40 20% 96%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold sm:text-3xl" style={{ color: "hsl(220 45% 13%)" }}>Welcome back, Director</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(220 25% 45%)" }}>Strategist Tier - Subconscious Intelligence Active</p>
          </div>
          <DashboardSignOut />
        </div>

        <Suspense fallback={null}>
          <PurchaseSuccessPanel />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <article key={stat.label} className="bg-white border rounded-xl p-5 shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>{stat.label}</span>
                <span style={{ color: "hsl(43 80% 60%)" }}>{stat.icon}</span>
              </div>
              <p className="font-serif text-3xl font-bold" style={{ color: "hsl(220 55% 20%)" }}>{stat.value}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5 mb-8">
          <section className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Member Product</p>
                <h2 className="font-serif text-2xl font-bold mt-1" style={{ color: "hsl(220 45% 13%)" }}>Access served instantly</h2>
              </div>
              <ShieldCheck size={22} style={{ color: "hsl(43 80% 45%)" }} />
            </div>
            <div className="grid gap-3">
              {productAccess.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 35% 28%)" }}>
                  <span className="h-2 w-2 rounded-full bg-[hsl(43_80%_60%)]" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Subconscious Loop</p>
                <h2 className="font-serif text-2xl font-bold mt-1" style={{ color: "hsl(220 45% 13%)" }}>Keep members engaged</h2>
              </div>
              <Gift size={22} style={{ color: "hsl(43 80% 45%)" }} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {engagementLoops.map((item) => (
                <article key={item.title} className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                  <h3 className="font-serif text-lg font-bold" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</h3>
                  <p className="mt-2 text-xs leading-5" style={{ color: "hsl(220 25% 45%)" }}>{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mb-8 overflow-hidden rounded-2xl border bg-[hsl(220_45%_13%)] p-6 text-[hsl(40_33%_97%)]" style={{ borderColor: "rgba(248,245,240,0.14)" }}>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[hsl(43_80%_60%)]">Pro outcome preview</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">You are leaking 70% of execution bandwidth.</h2>
              <p className="mt-3 text-sm leading-6 text-[rgba(248,245,240,0.7)]">
                Signal is temporary assistance. Growth gives 30 days of continuity. Pro turns MindReply into the permanent operational brain across memory, people, and tools.
              </p>
              <Link href="/memberships" className="mt-5 inline-flex rounded-lg px-5 py-3 text-sm font-semibold" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
                Upgrade to Pro
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {proPreviews.map((item) => (
                <article key={item.title} className="rounded-xl border border-[rgba(248,245,240,0.12)] bg-white/[0.045] p-4">
                  <p className="text-sm font-semibold text-[hsl(43_70%_88%)]">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[rgba(248,245,240,0.62)]">{item.body}</p>
                  <span className="mt-3 inline-flex rounded-full border border-[rgba(201,169,97,0.28)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[hsl(43_80%_60%)]">Locked Pro Preview</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Quick Actions</h2>
          <Network size={18} style={{ color: "hsl(43 80% 45%)" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} className="bg-white border rounded-xl p-6 hover:shadow-md transition-all group" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold mb-1 group-hover:text-[hsl(43_80%_60%)] transition-colors" style={{ color: "hsl(220 45% 13%)" }}>{action.title}</h3>
                <ArrowRight size={15} className="opacity-45 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <p className="text-xs" style={{ color: "hsl(220 25% 45%)" }}>{action.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
