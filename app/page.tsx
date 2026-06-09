import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  LineChart,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import MRAgentChat from "@/components/MRAgentChat";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Promotion", href: "#promotion" },
  { label: "Proof", href: "#proof" },
];

const heroStats = [
  { label: "Mind Read", value: "1 clear read", icon: Brain },
  { label: "Reports", value: "30 min cadence", icon: Clock },
  { label: "Receipts", value: "raw text stays narrow", icon: FileText },
];

const platformLayers = [
  {
    title: "Pressure intake",
    copy: "The user drops the charged text, half-formed ask, or private hesitation into MRagent without cleaning it first.",
    detail: "Input",
    icon: MessageCircle,
  },
  {
    title: "Behavioral read",
    copy: "The agent names posture, risk, protection, timing, and the calmer move. It reads patterns, not magic.",
    detail: "Mind Read",
    icon: Radar,
  },
  {
    title: "Action composer",
    copy: "The answer comes back as one synthesis, one recommended action, and one usable line when the moment needs language.",
    detail: "Next move",
    icon: Zap,
  },
  {
    title: "Quiet receipt",
    copy: "The system keeps a narrow summary and delivery proof without exposing the original pressure by default.",
    detail: "Proof",
    icon: LockKeyhole,
  },
];

const workflow = [
  {
    step: "01",
    title: "Place the pressure",
    copy: "Paste the message, decision, or feeling. The UI keeps the surface focused so the user does not have to turn the moment into a perfect prompt.",
  },
  {
    step: "02",
    title: "Let the read slow down",
    copy: "MRagent responds in stages: reading, pressure map, quieter read, then one move. That rhythm makes the answer feel considered instead of dumped.",
  },
  {
    step: "03",
    title: "Act once",
    copy: "The output is structured for a real next step: synthesis, mind read, recommended action, risk gate, memory summary, and receipt.",
  },
  {
    step: "04",
    title: "Report what moved",
    copy: "The pack and report jobs show delivery readiness, Vercel status, promotion preparation, and revenue truth without inventing activity.",
  },
];

const promotionLanes = [
  {
    title: "MRadvertisingTeam",
    copy: "Prepares campaign angles, short posts, launch copy, and platform-specific variants for review before anything is published.",
    icon: Megaphone,
  },
  {
    title: "Promotion queue",
    copy: "Separates drafted, approved, blocked, and sent material so automation never pretends an external account is connected.",
    icon: Workflow,
  },
  {
    title: "Revenue readiness",
    copy: "Keeps subscription, annual pack, and credit-load ideas visible while transaction counts stay tied to a real source.",
    icon: LineChart,
  },
];

const proofItems = [
  "Vercel deploy guard keeps non-main branches from burning quota.",
  "Speed Insights is already mounted in the app layout for production visibility.",
  "Reports can send through configured email or Slack channels when the keys are present.",
  "Figma/FigJam/Remotion are treated as design and launch assets, not blockers for the web app.",
];

const packageRows = [
  { label: "Website completion", value: "Full front end, MRagent, pack, privacy, MCP", icon: CheckCircle2 },
  { label: "Advertising asset", value: "Safe campaign queue and review-first launch language", icon: Sparkles },
  { label: "Automation lane", value: "30-minute reporting with delivery proof and blockers", icon: Activity },
  { label: "Customer value", value: "Warm decision support for tense messages and next moves", icon: Bot },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MindReply",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://www.mind-reply.com/",
  description: "MindReply is an operating layer between pressure and action, with MRagent for behavioral reads, receipts, reporting, and promotion-ready launch support.",
  featureList: ["MRagent", "Behavioral read", "Quiet receipt", "30-minute reporting", "Promotion queue", "Vercel proof"],
  brand: {
    "@type": "Brand",
    name: "MindReply",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#122033]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="border-b border-[#122033]/10 bg-[#f7f4ed]/95 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#122033] font-serif text-lg font-bold text-[#e2b757]">M</span>
            <span className="font-serif text-xl font-bold tracking-wide">MindReply</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-semibold text-[#4d5c6f] transition hover:bg-white hover:text-[#122033]">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/pack" className="hidden rounded-full border border-[#122033]/15 px-4 py-2 text-sm font-semibold text-[#122033] transition hover:border-[#2f6f72] md:inline-flex">
              Pack
            </Link>
            <Link href="/agent" className="rounded-full bg-[#122033] px-4 py-2 text-sm font-semibold text-[#f8f5f0] transition hover:bg-[#1c3150]">
              Open MRagent
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#122033] px-4 py-8 text-[#f8f5f0] md:px-8 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="py-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e2b757]/35 bg-[#e2b757]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#e2b757]">
              <Sparkles aria-hidden className="h-4 w-4" />
              Executive nervous system
            </div>
            <h1 className="mt-7 max-w-3xl font-serif text-5xl font-bold leading-[0.94] md:text-7xl">
              MindReply turns pressure into one composed next move.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#d9e3e7] md:text-lg">
              MRagent is the warm front door. The platform behind it reads posture, protects privacy, prepares launch material, and reports only what actually moved.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/agent" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e2b757] px-5 py-3 text-sm font-bold text-[#122033] transition hover:bg-[#f0cf7a]">
                Try the Mind Read <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href="/pack" className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-[#f8f5f0] transition hover:border-[#e2b757] hover:text-[#e2b757]">
                View completion pack
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#91d2c8]">
                      <Icon aria-hidden className="h-4 w-4" />
                      {item.label}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#f8f5f0]">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-[43rem] overflow-hidden rounded-lg border border-white/10 bg-[#0d1729] shadow-2xl shadow-black/20">
            <MRAgentChat compact />
          </div>
        </div>
      </section>

      <section id="platform" className="border-b border-[#122033]/10 bg-white px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2f6f72]">Platform layers</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight md:text-5xl">
                The site now shows the full operating system, not only a chat window.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#59687b]">
              The product story is simple: input enters quietly, the agent reads the pressure, the user receives one move, and the system records a narrow proof trail.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {platformLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <article key={layer.title} className="rounded-lg border border-[#122033]/10 bg-[#f7f4ed] p-5 shadow-sm shadow-[#122033]/5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#122033] text-[#e2b757]"><Icon aria-hidden className="h-5 w-5" /></span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2f6f72]">{layer.detail}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-bold leading-tight">{layer.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#59687b]">{layer.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7430]">How it works</p>
            <h2 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
              Slow reply, sharp structure, one useful action.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#59687b]">
              The language is friendly and warm, but the system is deliberately strict about claims, privacy, and what counts as proof.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((item) => (
              <article key={item.step} className="rounded-lg border border-[#122033]/10 bg-white p-5 shadow-sm shadow-[#122033]/5">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d96f4a]">{item.step}</span>
                <h3 className="mt-4 font-serif text-2xl font-bold leading-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#59687b]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="promotion" className="bg-[#103b39] px-4 py-14 text-[#f8f5f0] md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#91d2c8]">Promotion readiness</p>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                MRadvertisingTeam becomes a review-first launch lane.
              </h2>
            </div>
            <p className="text-sm leading-7 text-[#d3e5e2]">
              The front end can show ambition without unsafe automation: it can prepare platform copy, annual-pack angles, and proof language, while publishing still waits for connected accounts and explicit approval.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {promotionLanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <article key={lane.title} className="rounded-lg border border-white/10 bg-white/[0.055] p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e2b757] text-[#122033]"><Icon aria-hidden className="h-5 w-5" /></span>
                  <h3 className="mt-5 font-serif text-2xl font-bold leading-tight">{lane.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#d3e5e2]">{lane.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="proof" className="border-b border-[#122033]/10 bg-[#fbfaf6] px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2f6f72]">Proof and observability</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight md:text-5xl">
              Built for visible progress, not invisible promises.
            </h2>
            <div className="mt-8 grid gap-3">
              {proofItems.map((item) => (
                <div key={item} className="flex gap-3 rounded-lg border border-[#122033]/10 bg-white p-4 text-sm leading-6 text-[#59687b]">
                  <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6f72]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {packageRows.map((row) => {
              const Icon = row.icon;
              return (
                <article key={row.label} className="rounded-lg border border-[#122033]/10 bg-white p-5 shadow-sm shadow-[#122033]/5">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#122033] text-[#e2b757]"><Icon aria-hidden className="h-5 w-5" /></span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#9b7430]">{row.label}</p>
                  <h3 className="mt-3 font-serif text-2xl font-bold leading-tight">{row.value}</h3>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-lg bg-[#122033] p-6 text-[#f8f5f0] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#91d2c8]">Next safe move</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">Open MRagent, run one pressure read, and keep the receipt narrow.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/agent" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e2b757] px-5 py-3 text-sm font-bold text-[#122033] transition hover:bg-[#f0cf7a]">
              Start session <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link href="/privacy" className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-[#f8f5f0] transition hover:border-[#e2b757] hover:text-[#e2b757]">
              Privacy posture
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
