import { Activity, Briefcase, CheckCircle2, Database, GraduationCap, Mail, Network, PencilRuler, Shield, Target, Users } from "lucide-react";
import Link from "next/link";
import { isAdminUser, isClerkConfigured } from "@/lib/admin";
import { agentRosterSummary } from "@/lib/agent-roster";
import { isAIProviderConfigured } from "@/lib/azure-openai";
import { getPermanentOpsCommand } from "@/lib/permanent-ops-command";

function AccessDenied() {
  return (
    <main className="pt-24 min-h-screen px-4 pb-16" style={{ background: "hsl(40 33% 97%)" }}>
      <section className="max-w-xl mx-auto bg-white border rounded-xl p-8 text-center" style={{ borderColor: "hsl(40 25% 88%)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 45%)" }}>Admin Access</p>
        <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: "hsl(220 45% 13%)" }}>Access restricted</h1>
        <p className="text-sm mb-6" style={{ color: "hsl(220 25% 45%)" }}>This dashboard is limited to configured MindReply administrators.</p>
        <Link href="/dashboard" className="inline-flex px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Return to dashboard</Link>
      </section>
    </main>
  );
}

export default async function AdminPage() {
  if (isClerkConfigured()) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!isAdminUser(userId)) return <AccessDenied />;
  }

  const agentSummary = agentRosterSummary();
  const permanentOps = await getPermanentOpsCommand();
  const salesToday = permanentOps.revenueTarget.todaySales ?? "Unmeasured";
  const firstWeekGap = permanentOps.revenueTarget.firstWeekGap ?? "Unmeasured";

  const stats = [
    { label: "Members", value: "1,240", icon: <Users size={18} /> },
    { label: "Professionals", value: "7+", icon: <Briefcase size={18} /> },
    { label: "Open Bookings", value: "18", icon: <Activity size={18} /> },
    { label: "Orchestrator", value: "Ready", icon: <Network size={18} /> },
    { label: "Agent Roles", value: String(agentSummary.totalRoles), icon: <Shield size={18} /> },
    { label: "Sales Today", value: String(salesToday), icon: <Target size={18} /> },
  ];

  const members = [
    ["Director Strategist", "director@mind-reply.com", "Strategist"],
    ["Clinical Lead", "clinical@mind-reply.com", "Curator"],
    ["Founder Operator", "founder@mind-reply.com", "Sovereign"],
  ];

  const serviceControls = [
    { name: "Stripe", status: process.env.STRIPE_SECRET_KEY ? "Configured" : "Needs env", detail: "Membership checkout and session confirmation", env: "STRIPE_SECRET_KEY + STRIPE_PRICE_*" },
    { name: "Clerk", status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Configured" : "Needs env", detail: "Login, signup, protected dashboard", env: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY" },
    { name: "Database", status: process.env.DATABASE_URL ? "Configured" : "Fallback active", detail: "Professionals, bookings, lexicons, metrics", env: "DATABASE_URL" },
    { name: "AI Provider", status: isAIProviderConfigured() ? "Configured" : "Fallback active", detail: "MRagent and advanced tool intelligence", env: "Azure OpenAI env group or OPENAI_API_KEY" },
  ];

  const contentMap = [
    { title: "Landing page", href: "/", file: "app/page.tsx", body: "Hero, proof points, memberships, footer links." },
    { title: "Memberships", href: "/memberships", file: "app/memberships/page.tsx + app/api/memberships/route.ts", body: "Pricing cards, Stripe checkout entry, fallback tier data." },
    { title: "Professionals", href: "/professionals", file: "app/professionals/page.tsx + lib/fallback-data.ts", body: "Specialist cards, languages, availability, booking routes." },
    { title: "Tools", href: "/tools", file: "lib/tool-engine.ts + app/tools/[slug]/page.tsx", body: "Credit costs, tool prompts, refined output behavior." },
    { title: "SEO", href: "/sitemap.xml", file: "lib/seo.ts + app/sitemap.ts + app/robots.ts", body: "Solution pages, sitemap, robots, metadata." },
  ];

  const readiness = [
    "Production env vars live in the active Vercel scope",
    "Checkout success URL returns session_id for confirmation",
    "Dashboard serves tools immediately after confirmed purchase",
    "Sitemap and robots routes are public",
    "Health API reports service status at /api/health",
  ];

  return (
    <main className="pt-24 min-h-screen px-4 pb-16" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 45%)" }}>Admin Command</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>MindReply Operations</h1>
            <p className="text-sm mt-2" style={{ color: "hsl(220 25% 45%)" }}>Production overview for content, members, bookings, orchestration, and platform health.</p>
          </div>
          <Link href="/api/health" className="inline-flex px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 55% 20%)" }}>View Health JSON</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <article key={stat.label} className="bg-white border rounded-xl p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>{stat.label}</span>
                <span style={{ color: "hsl(43 80% 45%)" }}>{stat.icon}</span>
              </div>
              <p className="font-serif text-3xl font-bold" style={{ color: "hsl(220 55% 20%)" }}>{stat.value}</p>
            </article>
          ))}
        </div>

        <section className="mb-8 overflow-hidden rounded-xl border bg-white" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
            <div className="border-b p-5 lg:border-b-0 lg:border-r" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Permanent Ops</p>
                  <h2 className="font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Agent Command Center</h2>
                </div>
                <GraduationCap size={21} style={{ color: "hsl(43 80% 45%)" }} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Permanent roles", value: permanentOps.staffing.totalPermanentRoles },
                  { label: "Active desks", value: permanentOps.staffing.activeAutomationDesks },
                  { label: "Hiring gap", value: permanentOps.staffing.departmentPlan.reduce((sum, item) => sum + item.hiringGap, 0) },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>{item.label}</p>
                    <p className="mt-2 font-serif text-3xl font-bold" style={{ color: "hsl(220 55% 20%)" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                {permanentOps.staffing.departmentPlan.slice(0, 6).map((department) => (
                  <div key={department.name} className="grid gap-2 rounded-xl border px-4 py-3 text-sm sm:grid-cols-[0.9fr_0.45fr_1.2fr]" style={{ borderColor: "hsl(40 25% 88%)" }}>
                    <strong style={{ color: "hsl(220 45% 13%)" }}>{department.name}</strong>
                    <span style={{ color: "hsl(43 80% 38%)" }}>{department.activeNow}/{department.targetRoles}</span>
                    <span style={{ color: "hsl(220 25% 45%)" }}>{department.recruiterAction}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Revenue Watch</p>
                  <h2 className="font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>10 Sales / Day Observer</h2>
                </div>
                <Mail size={21} style={{ color: "hsl(43 80% 45%)" }} />
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)", background: "hsl(40 33% 97%)" }}>
                <p className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>Reports go to</p>
                <p className="mt-1 break-all font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{permanentOps.reportRecipient}</p>
                <p className="mt-3 text-sm" style={{ color: "hsl(220 25% 45%)" }}>Cadence</p>
                <p className="mt-1 font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{permanentOps.reportCadence}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>Today</p>
                  <p className="mt-2 font-serif text-3xl font-bold" style={{ color: "hsl(220 55% 20%)" }}>{salesToday}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>Week gap</p>
                  <p className="mt-2 font-serif text-3xl font-bold" style={{ color: "hsl(220 55% 20%)" }}>{firstWeekGap}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  { href: "/api/ops/report", label: "Ops report" },
                  { href: "/api/revenue/observer", label: "Revenue observer" },
                  { href: "/api/agents/permanent", label: "Permanent agents" },
                  { href: "/api/agents/learning", label: "Learning loop" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-lg border px-3 py-2 text-center text-xs font-semibold" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 55% 20%)" }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Recent Member Registrations</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(40 25% 88%)" }}>
            {members.map(([name, email, tier]) => (
              <div key={email} className="grid grid-cols-1 sm:grid-cols-4 gap-2 px-5 py-4 text-sm">
                <span className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>{name}</span>
                <span style={{ color: "hsl(220 25% 45%)" }}>{email}</span>
                <span style={{ color: "hsl(220 25% 45%)" }}>{tier}</span>
                <span className="sm:text-right" style={{ color: "hsl(43 80% 45%)" }}>Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-5 mt-8">
          <section className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Service Console</p>
                <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Environment Readiness</h2>
              </div>
              <Database size={19} style={{ color: "hsl(43 80% 45%)" }} />
            </div>
            <div className="divide-y" style={{ borderColor: "hsl(40 25% 88%)" }}>
              {serviceControls.map((service) => (
                <div key={service.name} className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[0.7fr_0.7fr_1.2fr]">
                  <div>
                    <p className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{service.name}</p>
                    <p className="text-xs mt-1" style={{ color: "hsl(220 25% 45%)" }}>{service.detail}</p>
                  </div>
                  <span className="w-fit rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: service.status === "Configured" ? "hsl(150 45% 92%)" : "hsl(43 80% 92%)", color: service.status === "Configured" ? "hsl(150 40% 28%)" : "hsl(38 75% 32%)" }}>{service.status}</span>
                  <code className="text-xs break-words rounded-lg px-3 py-2" style={{ background: "hsl(40 33% 97%)", color: "hsl(220 25% 38%)" }}>{service.env}</code>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Readiness Loop</p>
                <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Launch Checklist</h2>
              </div>
              <CheckCircle2 size={19} style={{ color: "hsl(43 80% 45%)" }} />
            </div>
            <div className="grid gap-3">
              {readiness.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 35% 30%)" }}>
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(43_80%_60%)]" />
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Modification Map</p>
              <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Where to edit production content</h2>
            </div>
            <PencilRuler size={19} style={{ color: "hsl(43 80% 45%)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {contentMap.map((item) => (
              <Link key={item.href} href={item.href} className="bg-white border rounded-xl p-5 hover:shadow-md transition-all" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <h3 className="font-semibold mb-2" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "hsl(220 25% 45%)" }}>{item.body}</p>
                <code className="text-[10px] leading-4" style={{ color: "hsl(43 80% 38%)" }}>{item.file}</code>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[
            { title: "Run Orchestrator", href: "/orchestrator", body: "Coordinate architecture, integration, research, marketing, and deployment agents." },
            { title: "Execute Tasks", href: "/tasks", body: "Run bounded route, health, reasoning, and deployment readiness tasks." },
            { title: "Orchestration API", href: "/api/orchestrate", body: "Inspect the multi-agent orchestration service readiness contract." },
            { title: "Background API", href: "/api/background", body: "Inspect the bounded reasoning-loop execution service readiness contract." },
            { title: "Ops Status", href: "/api/ops/status", body: "Inspect provider readiness, fallback services, and active-agent ownership." },
            { title: "x66 Acceleration", href: "/api/agents/accelerate", body: "Inspect direct action routes, lane targets, owners, and x66 operating mode." },
            { title: "Execution Queue", href: "/api/agents/execution-queue", body: "Inspect the live owner, priority, route, evidence, and ETA queue for active desks." },
            { title: "60 Active Agents", href: "/api/agents/active", body: "Inspect active acceleration desks for production, growth, trust, and intelligence." },
            { title: "60-Role Roster", href: "/api/agents/roster", body: "Inspect the permanent operator and professional-desk staffing map." },
            { title: "Permanent Ops", href: "/api/agents/permanent", body: "Inspect hiring backlog, learning cadence, satisfaction guardrails, and sales target ownership." },
            { title: "Learning Loop", href: "/api/agents/learning", body: "Inspect the permanent-agent learning modules and secure handoff recording contract." },
            { title: "Revenue Observer", href: "/api/revenue/observer", body: "Inspect the 10-sales/day and first-week sales target observer." },
            { title: "Ops Report", href: "/api/ops/report", body: "Preview the twice-daily executive email report sent after provider env setup." },
            { title: "Growth Engine", href: "/api/growth/plan", body: "Inspect market expansion, visitor growth, ads, and conversion actions." },
            { title: "Env Requirements", href: "/api/config/requirements", body: "Inspect required production provider variables and what each service unlocks." },
            { title: "Entitlements", href: "/api/entitlements", body: "Inspect membership tier delivery, credits, access level, and fulfillment products." },
            { title: "Booking Checkout", href: "/api/checkout/booking-session", body: "Inspect professional booking checkout readiness and paid-session verification." },
            { title: "Intelligence API", href: "/api/intelligence/analyze", body: "Inspect MR intent, valence, power-distance, and persuasion-frame readiness." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="bg-white border rounded-xl p-5 hover:shadow-md transition-all" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{item.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
