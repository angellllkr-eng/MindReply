"use client";
import Link from "next/link";
import { ArrowRight, Shield, Globe, Users, Zap, BookOpen, BarChart3, Brain, MessageSquare, Target, CheckCircle2, Bot, Clock, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import ProfessionalCard from "@/components/ProfessionalCard";
import OperationsHeroVisual from "@/components/OperationsHeroVisual";

type Professional = { id: number; name: string; role: string; niche: string; rating: number; reviewCount: number; priceVideo: number; availabilityStatus: string; languages: string[]; photoUrl: string };

const lexicons = ["Clinical Psychologist", "Legal Counsel", "Financial Advisor", "HR Director", "Event Strategist", "Compliance Officer", "PR Specialist", "Executive Coach", "Mediator", "Recruitment Lead", "Training Facilitator", "Risk Analyst", "Brand Strategist", "Negotiation Expert", "Organisational Developer", "Crisis Communicator", "Stakeholder Manager", "Ethics Advisor", "Innovation Lead", "Executive Assistant"];

const microTools = [
  { name: "Text Refiner", credits: 1, desc: "Instantly refine casual messages for professional contexts with subconscious tone calibration." },
  { name: "Email Polisher", credits: 2, desc: "Transform draft emails into executive-grade correspondence with behavioral intent optimization." },
  { name: "Call Scripter", credits: 2, desc: "Generate persuasive call scripts with subconscious persuasion frameworks." },
  { name: "Planning Assistant", credits: 1, desc: "Structure project communications with subconscious clarity frameworks." },
  { name: "Correction Engine", credits: 1, desc: "Identify and correct subconscious linguistic patterns that undermine authority." },
  { name: "Teaching Optimizer", credits: 2, desc: "Refine instructional content with subconscious learning frameworks." },
  { name: "Lexicon Refiner", credits: 3, desc: "Discipline-specific vocabulary optimization with contextual appropriateness scoring." },
  { name: "Tone Calibrator", credits: 2, desc: "Adjust emotional valence, formality register, and persuasive intensity." },
  { name: "Structure Architect", credits: 3, desc: "Optimise message flow for specific outcomes: decision acceleration or conflict resolution." },
  { name: "Cultural Adapter", credits: 2, desc: "Automatically adjust phrasing and indirectness for cross-cultural communication." }
];

const launchStatus = [
  { icon: Bot, title: "MRagent active", detail: "Floating assistant and /agent are live with browser fallback plus Azure OpenAI when configured." },
  { icon: Shield, title: "Social login ready", detail: "Clerk renders email, Google, Apple, and Facebook access as soon as providers are enabled." },
  { icon: Globe, title: "Auto language", detail: "Browser locale, timezone, and ?lang= links select the best language without blocking manual choice." },
  { icon: CheckCircle2, title: "Paid delivery", detail: "Stripe checkout and booking return routes confirm access immediately after successful payment." },
  { icon: Users, title: "60 active desks", detail: "Revenue, platform, trust, intelligence, SEO, payments, auth, and support roles are exposed through live agent APIs." },
  { icon: Zap, title: "Ops alerts", detail: "Sentry and Slack readiness endpoints are deployed for owner-authorized production checks." },
];

export default function Home() {
  const [featured, setFeatured] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditCheckout, setCreditCheckout] = useState<number | null>(null);
  const [creditError, setCreditError] = useState("");

  useEffect(() => {
    fetch("/api/professionals/featured").then((r) => r.json()).then((f) => {
      setFeatured(f);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function startCreditCheckout(credits: 5 | 20) {
    setCreditCheckout(credits);
    setCreditError("");

    try {
      const response = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setCreditError(data.error ?? "Credit checkout is not available yet.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setCreditError("Credit checkout is not available right now.");
    } finally {
      setCreditCheckout(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(40 20% 96%)" }}>
      
      {/* 1. Hero Section */}
      <section className="pt-32 pb-28 px-4 relative overflow-hidden" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-7xl mx-auto relative z-10 grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-xs font-medium mb-8" style={{ borderColor: "rgba(201,169,97,0.3)", color: "hsl(43 80% 60%)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400" />
            MRagent is online and ready to assist
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ color: "hsl(43 70% 88%)" }}>
            Subconscious Communication <span className="italic" style={{ color: "hsl(43 80% 60%)" }}>Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto lg:mx-0 mb-10 leading-relaxed" style={{ color: "rgba(248,245,240,0.75)" }}>
            MindReply empowers professionals with behavioral intelligence for email composition, expression refinement, and strategic dialogue—curated for psychologists, legal counsel, financial advisors, and C-suite executives worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/agent" className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-all shadow-lg" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              Begin Conversation <ArrowRight size={16} />
            </Link>
            <Link href="/tools" className="inline-flex items-center justify-center gap-2 font-medium px-8 py-4 rounded-lg border hover:text-[hsl(43_80%_60%)] transition-all" style={{ borderColor: "rgba(248,245,240,0.3)", color: "hsl(43 70% 88%)" }}>
              Explore Micro-Tools
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium" style={{ color: "rgba(248,245,240,0.6)" }}>
            <span className="flex items-center gap-1.5"><Shield size={14} /> Enterprise-grade security</span>
            <span className="flex items-center gap-1.5"><Globe size={14} /> Global professional network</span>
          </div>
          </div>
          <OperationsHeroVisual />
        </div>
      </section>

      {/* 2. Production Status */}
      <section className="px-4 py-10 border-y" style={{ background: "hsl(218 38% 12%)", borderColor: "rgba(201,169,97,0.22)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}>Production Command Layer</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold mt-2" style={{ color: "hsl(43 70% 88%)" }}>Visible systems now wired for launch</h2>
            </div>
            <Link href="/health" className="inline-flex items-center gap-2 self-start rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:text-[hsl(43_80%_60%)]" style={{ borderColor: "rgba(248,245,240,0.2)", color: "hsl(43 70% 88%)" }}>
              View live health <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {launchStatus.map((item) => (
              <div key={item.title} className="rounded-xl border p-4" style={{ borderColor: "rgba(248,245,240,0.12)", background: "rgba(248,245,240,0.055)" }}>
                <item.icon size={20} style={{ color: "hsl(43 80% 60%)" }} />
                <h3 className="mt-3 text-sm font-bold" style={{ color: "hsl(43 70% 88%)" }}>{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(248,245,240,0.68)" }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MRagent Chat Preview */}
      <section className="py-20 px-4" style={{ background: "hsl(220 45% 13%)" }}>
        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "hsl(43 80% 60%)" }}>
              <Bot size={20} style={{ color: "hsl(220 45% 13%)" }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "hsl(43 70% 88%)" }}>MRagent</p>
              <p className="text-xs" style={{ color: "rgba(248,245,240,0.6)" }}>Online • Subconscious Intelligence Active • Credits: 5</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed" style={{ background: "rgba(248,245,240,0.1)", color: "hsl(43 70% 88%)" }}>
              Good afternoon. I am MRagent, your executive communication intelligence partner. I observe you seek to refine professional correspondence with subconscious behavioral precision. How may I assist your communication objectives today?
            </div>
            <div className="max-w-[85%] ml-auto p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              I need to send a sensitive email to my team about restructuring. How should I phrase it?
            </div>
            <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed" style={{ background: "rgba(248,245,240,0.1)", color: "hsl(43 70% 88%)" }}>
              An exquisite question. For restructuring communications, I recommend a framework of transparent intention, empathetic validation, and future-oriented reassurance. Would you like me to refine a draft with these principles?
            </div>
          </div>
          <p className="text-[10px] text-center mt-6" style={{ color: "rgba(248,245,240,0.4)" }}>MRagent learns from your preferences • Subconscious behavior analysis active</p>
        </div>
      </section>

      {/* 3. Subconscious Communication Intelligence Pillars */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Proprietary Framework</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "hsl(220 45% 13%)" }}>Subconscious Communication Intelligence</h2>
          <p className="text-sm max-w-2xl mx-auto" style={{ color: "hsl(220 25% 45%)" }}>Our proprietary framework decodes the subconscious behavioral patterns in professional correspondence, enabling intentional expression that aligns with your strategic objectives.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Brain size={24} />, title: "Behavioral Intent Mapping", desc: "Decodes underlying subconscious drivers in written communication—identifying opportunities for enhanced clarity, trust-building, and persuasive impact.", points: ["Emotional valence trajectory analysis", "Power-distance subconscious calibration", "Cultural register intuitive adaptation"] },
            { icon: <BookOpen size={24} />, title: "Lexical Precision Engine", desc: "Curates discipline-specific vocabulary repositories that align with professional standards while enhancing rhetorical effectiveness.", points: ["Context-aware synonym refinement", "Jargon appropriateness subconscious scoring", "Conciseness optimization for cognitive ease"] },
            { icon: <Target size={24} />, title: "Strategic Dialogue Architecture", desc: "Structures communication flows to achieve specific behavioral outcomes by aligning with the recipient's subconscious expectations.", points: ["Persuasion pathway subconscious modeling", "Objection anticipation intuitive frameworks", "Closure optimization for decision acceleration"] }
          ].map((pillar, i) => (
            <div key={i} className="bg-white border rounded-xl p-8 hover:shadow-lg transition-all" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>{pillar.icon}</div>
              <h3 className="font-serif text-xl font-bold mb-3" style={{ color: "hsl(220 45% 13%)" }}>{pillar.title}</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "hsl(220 25% 45%)" }}>{pillar.desc}</p>
              <ul className="space-y-2">
                {pillar.points.map((p, j) => (
                  <li key={j} className="text-xs flex items-start gap-2" style={{ color: "hsl(220 45% 13%)" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "hsl(43 80% 60%)" }} /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Metrics */}
      <section className="py-16 px-4 border-y" style={{ borderColor: "hsl(40 25% 88%)", background: "hsl(40 20% 96%)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "96/100", label: "Subconscious Clarity" },
            { value: "92/100", label: "Trust Resonance" },
            { value: "89/100", label: "Persuasive Subtext" },
            { value: "98/100", label: "Professional Intuition" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-4xl font-bold" style={{ color: "hsl(220 55% 20%)" }}>{s.value}</p>
              <p className="text-xs mt-1 font-medium uppercase tracking-wide" style={{ color: "hsl(220 25% 45%)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Professionals (Replit Structure) */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Elite Network</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Featured Professionals</h2>
            </div>
            <Link href="/professionals" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "hsl(220 55% 20%)" }}>
              View all professionals <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="rounded-xl border border-[hsl(40_25%_88%)] p-5 animate-pulse h-96 bg-white" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => <ProfessionalCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* 6. Professional Lexicons Toolkit */}
      <section className="py-24 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Toolkit</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "hsl(43 70% 88%)" }}>Specialised Professional Lexicons</h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: "rgba(248,245,240,0.7)" }}>Subconscious communication frameworks for twenty+ professional categories—each with curated vocabulary, behavioral protocols, and expression standards.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-12">
            {lexicons.map((name) => (
              <div key={name} className="p-4 border rounded-lg text-center text-sm font-medium hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer bg-white/5" style={{ borderColor: "rgba(248,245,240,0.1)", color: "hsl(43 70% 88%)" }}>
                {name}
              </div>
            ))}
          </div>
          
          {/* Clinical Psychologist Detail View */}
          <div className="bg-white/5 border rounded-2xl p-8" style={{ borderColor: "rgba(201,169,97,0.3)" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: "hsl(43 70% 88%)" }}>Clinical Psychologist Lexicon</h3>
                <p className="text-sm" style={{ color: "rgba(248,245,240,0.7)" }}>Specialised vocabulary for therapeutic correspondence, boundary-setting, and interdisciplinary collaboration.</p>
              </div>
              <Link href="/lexicons/clinical-psychologist" className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "hsl(43 80% 60%)" }}>
                Explore Full Lexicon <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Therapeutic Register", items: ["\"I notice you're describing...\"", "\"Would you be willing to explore...\"", "\"That sounds like a significant...\""] },
                { title: "Boundary Language", items: ["\"My professional scope includes...\"", "\"I'm available for consultation during...\"", "\"For matters outside our agreement...\""] },
                { title: "Collaborative Framing", items: ["\"In partnership with your care team...\"", "\"Building on our previous discussion...\"", "\"Integrating your insights with...\""] },
                { title: "Crisis Communication", items: ["\"I'm here to support you through...\"", "\"Let's prioritise immediate safety by...\"", "\"Would it help to connect you with...\""] }
              ].map((cat, i) => (
                <div key={i}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "hsl(43 80% 60%)" }}>{cat.title}</h4>
                  <ul className="space-y-2">
                    {cat.items.map((item, j) => (
                      <li key={j} className="text-xs italic leading-relaxed" style={{ color: "rgba(248,245,240,0.8)" }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. One-Click Micro-Tools */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Instruments</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>One-Click Micro-Tools</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {microTools.map((t) => (
            <div key={t.name} className="bg-white border border-[hsl(40_25%_88%)] rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-base" style={{ color: "hsl(220 45% 13%)" }}>{t.name}</h4>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "hsl(43 80% 60% / 0.15)", color: "hsl(43 80% 40%)" }}>{t.credits} Credit{t.credits > 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "hsl(220 25% 45%)" }}>{t.desc}</p>
              <Link href={`/tools/${t.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: "hsl(220 55% 20%)" }}>
                Use Now <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-12 p-8 rounded-2xl text-center border" style={{ background: "hsl(40 20% 96%)", borderColor: "hsl(40 25% 88%)" }}>
          <h3 className="font-serif text-xl font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>Expand Your Communication Intelligence</h3>
          <p className="text-sm mb-6" style={{ color: "hsl(220 25% 45%)" }}>Purchase credit packs for unlimited access to micro-tools and premium features.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => startCreditCheckout(5)} disabled={creditCheckout !== null} className="px-6 py-3 rounded-lg border font-semibold text-sm disabled:opacity-50" style={{ borderColor: "hsl(220 55% 20%)", color: "hsl(220 55% 20%)" }}>
              {creditCheckout === 5 ? "Opening checkout..." : "5 Credits - £9"}
            </button>
            <button onClick={() => startCreditCheckout(20)} disabled={creditCheckout !== null} className="px-6 py-3 rounded-lg font-semibold text-sm disabled:opacity-50" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              {creditCheckout === 20 ? "Opening checkout..." : "20 Credits - £29 (Best Value)"}
            </button>
          </div>
          {creditError && <p className="mt-4 text-xs font-semibold" style={{ color: "#991b1b" }}>{creditError}</p>}
        </div>
      </section>

      {/* 8. Exclusive Membership Tiers */}
      <section className="py-24 px-4" style={{ background: "hsl(220 45% 13%)" }}>
        <div className="max-w-7xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Exclusive Access</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "hsl(43 70% 88%)" }}>Membership Tiers</h2>
          <p className="text-sm max-w-2xl mx-auto" style={{ color: "rgba(248,245,240,0.7)" }}>Invitation-only access to premium communication intelligence, curated professional networks, and behavioral analytics unavailable elsewhere.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Curator", price: "$49", desc: "For emerging professionals refining their communicative presence", features: ["Access to 5 professional lexicons", "3 micro-tools", "Monthly subconscious behavioral insights report", "Community forum access", "50 micro-tool credits monthly"] },
            { name: "Strategist", price: "$149", desc: "For established professionals leading teams and client relationships", features: ["All 20+ professional lexicons", "Full micro-tool suite access (10 instruments)", "Advanced subconscious behavioral analytics dashboard", "Priority concierge support", "Unlimited micro-tool credits", "Quarterly strategy consultation"], highlighted: true },
            { name: "Sovereign", price: "Custom", desc: "For executive leadership and organisational transformation", features: ["Everything in Strategist, plus:", "Dedicated communication architect", "Organisation-wide lexicon customisation", "Predictive subconscious behavioral modelling", "Crisis communication protocol development", "Board-level reporting suite"] }
          ].map((tier) => (
            <div key={tier.name} className={`rounded-2xl p-8 border flex flex-col ${tier.highlighted ? 'border-[hsl(43_80%_60%)] shadow-2xl scale-105 bg-white' : 'border-white/10 bg-white/5'}`}>
              {tier.highlighted && <span className="text-xs font-bold px-3 py-1 rounded-full mb-4 self-start" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>MOST SELECTED</span>}
              <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: tier.highlighted ? "hsl(220 45% 13%)" : "hsl(43 70% 88%)" }}>{tier.name}</h3>
              <p className="text-sm mb-6" style={{ color: tier.highlighted ? "hsl(220 25% 45%)" : "rgba(248,245,240,0.7)" }}>{tier.desc}</p>
              <p className="font-serif text-4xl font-bold mb-8" style={{ color: "hsl(43 80% 60%)" }}>{tier.price}<span className="text-base font-sans font-normal" style={{ color: tier.highlighted ? "hsl(220 25% 45%)" : "rgba(248,245,240,0.6)" }}>{tier.price !== 'Custom' ? '/month' : ''}</span></p>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: tier.highlighted ? "hsl(220 45% 13%)" : "rgba(248,245,240,0.8)" }}>
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: "hsl(43 80% 60%)" }} /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-opacity ${tier.highlighted ? '' : 'border border-white/20'}`} style={{ background: tier.highlighted ? "hsl(220 55% 20%)" : "transparent", color: tier.highlighted ? "hsl(43 70% 88%)" : "hsl(43 70% 88%)" }}>
                {tier.name === 'Sovereign' ? 'Schedule Consultation' : tier.name === 'Strategist' ? 'Request Invitation' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Accelerate Professional Growth */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Business Outcomes</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "hsl(220 45% 13%)" }}>Accelerate Professional Growth</h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: "hsl(220 25% 45%)" }}>Transform subconscious communication excellence into tangible business outcomes: client retention, deal velocity, team cohesion, and reputational capital.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: <Users size={24} />, metric: "+34%", label: "Client Retention", desc: "Average increase through enhanced relationship communication" },
              { icon: <Zap size={24} />, metric: "22%", label: "Deal Velocity", desc: "Faster negotiation cycles with precision persuasion frameworks" },
              { icon: <Target size={24} />, metric: "41%", label: "Team Alignment", desc: "Reduction in miscommunication-related project delays" },
              { icon: <Shield size={24} />, metric: "67%", label: "Risk Mitigation", desc: "Fewer compliance incidents through proactive language screening" }
            ].map((stat, i) => (
              <div key={i} className="bg-white border rounded-xl p-6 text-center" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "hsl(43 80% 60% / 0.15)", color: "hsl(43 80% 60%)" }}>{stat.icon}</div>
                <p className="font-serif text-3xl font-bold mb-1" style={{ color: "hsl(220 55% 20%)" }}>{stat.metric}</p>
                <p className="text-sm font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>{stat.label}</p>
                <p className="text-xs" style={{ color: "hsl(220 25% 45%)" }}>{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-2xl p-8 md:p-12" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Success Snapshot</span>
                <h3 className="font-serif text-2xl font-bold mb-4" style={{ color: "hsl(220 45% 13%)" }}>Legal Firm Transformation</h3>
                <div className="space-y-4">
                  <div><span className="text-xs font-bold uppercase" style={{ color: "hsl(220 25% 45%)" }}>Challenge:</span> <span className="text-sm" style={{ color: "hsl(220 45% 13%)" }}>Client complaints about "cold" or "confusing" correspondence.</span></div>
                  <div><span className="text-xs font-bold uppercase" style={{ color: "hsl(220 25% 45%)" }}>Solution:</span> <span className="text-sm" style={{ color: "hsl(220 45% 13%)" }}>Implemented Lexicon Refiner + Empathy Amplifier for client communications.</span></div>
                  <div><span className="text-xs font-bold uppercase" style={{ color: "hsl(220 25% 45%)" }}>Result:</span> <span className="text-sm font-semibold" style={{ color: "hsl(43 80% 40%)" }}>92% client satisfaction score (+41 pts), 28% increase in referral business within 6 months.</span></div>
                </div>
                <Link href="/case-studies" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "hsl(220 55% 20%)" }}>
                  View Case Study Library <ArrowRight size={14} />
                </Link>
              </div>
              <div className="flex-1 w-full bg-gray-50 rounded-xl p-6 border" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "hsl(220 45% 13%)" }}><TrendingUp size={16} /> Subconscious Communication Impact Trajectory</h4>
                <div className="space-y-4">
                  {["Month 1: Foundation & Baseline Assessment", "Month 3: +45% Clarity in Internal Memos", "Month 6: +28% Client Retention Rate", "Month 12: +187% average growth in communication-derived business value"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "hsl(43 80% 60%)" }} />
                      <span className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="py-16 px-4 border-t" style={{ borderColor: "hsl(40 25% 88%)", background: "hsl(220 55% 20%)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <span className="font-serif font-bold text-2xl block mb-4" style={{ color: "hsl(43 70% 88%)" }}>MindReply</span>
            <p className="text-xs leading-relaxed mb-6" style={{ color: "rgba(248,245,240,0.6)" }}>Executive communication intelligence for professionals who understand that subconscious expression shapes outcomes.</p>
            <div className="flex gap-4">
              <a href="mailto:info@mind-reply.com" className="text-xs hover:text-[hsl(43_80%_60%)] transition-colors" style={{ color: "rgba(248,245,240,0.8)" }}>info@mind-reply.com</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "hsl(43 80% 60%)" }}>Platform</h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(248,245,240,0.7)" }}>
              <li><Link href="/agent" className="hover:text-[hsl(43_80%_60%)]">MRagent</Link></li>
              <li><Link href="/subconscious" className="hover:text-[hsl(43_80%_60%)]">Subconscious Intelligence</Link></li>
              <li><Link href="/professionals" className="hover:text-[hsl(43_80%_60%)]">Professional Lexicons</Link></li>
              <li><Link href="/tools" className="hover:text-[hsl(43_80%_60%)]">Micro-Tools</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "hsl(43 80% 60%)" }}>Professionals</h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(248,245,240,0.7)" }}>
              <li><Link href="/professionals?category=psychology" className="hover:text-[hsl(43_80%_60%)]">Psychologists & Therapists</Link></li>
              <li><Link href="/professionals?category=legal" className="hover:text-[hsl(43_80%_60%)]">Legal & Compliance</Link></li>
              <li><Link href="/professionals?category=finance" className="hover:text-[hsl(43_80%_60%)]">Financial Advisors</Link></li>
              <li><Link href="/professionals?category=hr" className="hover:text-[hsl(43_80%_60%)]">HR & Talent Leaders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "hsl(43 80% 60%)" }}>Access</h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(248,245,240,0.7)" }}>
              <li><Link href="/login" className="hover:text-[hsl(43_80%_60%)]">Member Login</Link></li>
              <li><Link href="/signup" className="hover:text-[hsl(43_80%_60%)]">Create Account</Link></li>
              <li><Link href="/premium" className="hover:text-[hsl(43_80%_60%)]">Request Premium Access</Link></li>
              <li><Link href="/enterprise" className="hover:text-[hsl(43_80%_60%)]">Enterprise Solutions</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: "rgba(248,245,240,0.1)" }}>
          <p className="text-xs" style={{ color: "rgba(248,245,240,0.5)" }}>© 2026 MindReply. All rights reserved. Confidentiality assured.</p>
          <div className="flex gap-6 text-xs" style={{ color: "rgba(248,245,240,0.5)" }}>
            <Link href="/privacy" className="hover:text-[hsl(43_80%_60%)]">Privacy Protocol</Link>
            <Link href="/terms" className="hover:text-[hsl(43_80%_60%)]">Terms of Engagement</Link>
            <Link href="/ethics" className="hover:text-[hsl(43_80%_60%)]">Ethical Framework</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
