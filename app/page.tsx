"use client";
import Link from "next/link";
import { ArrowRight, Shield, Globe, Users, Zap, BookOpen, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import ProfessionalCard from "@/components/ProfessionalCard";

type Analytics = { totalProfessionals: number; activeMembers: number; avgRating: number; totalBookings: number };
type Professional = { id: number; name: string; role: string; niche: string; rating: number; reviewCount: number; priceVideo: number; availabilityStatus: string; languages: string[]; photoUrl: string };
type Membership = { id: number; tier: string; name: string; price: number; features: string[]; highlighted: boolean };

export default function Home() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [featured, setFeatured] = useState<Professional[]>([]);
  const [strategist, setStrategist] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/summary").then((r) => r.json()),
      fetch("/api/professionals/featured").then((r) => r.json()),
      fetch("/api/memberships").then((r) => r.json()),
    ]).then(([a, f, m]) => {
      setAnalytics(a);
      setFeatured(f);
      setStrategist(m.find((t: Membership) => t.tier === "strategist") ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-28 px-4 relative overflow-hidden" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-xs font-medium mb-8" style={{ borderColor: "rgba(201,169,97,0.3)", color: "hsl(43 80% 60%)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />
            N1 Worldwide Behavioral Communication Ecosystem
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ color: "hsl(43 70% 88%)" }}>
            Communicate with <span className="text-gold-gradient italic">Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(248,245,240,0.75)" }}>
            MindReply connects elite professionals and behavioral AI tools to help you master every conversation — from boardrooms to negotiations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/professionals" className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg hover:opacity-90 transition-all shadow-lg" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              Meet Our Professionals <ArrowRight size={16} />
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-2 font-medium px-7 py-3.5 rounded-lg border hover:text-[hsl(43_80%_60%)] transition-all" style={{ borderColor: "rgba(248,245,240,0.3)", color: "hsl(43 70% 88%)" }}>
              Explore AI Tools
            </Link>
          </div>
          {analytics && (
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-12" style={{ borderColor: "rgba(248,245,240,0.1)" }}>
              {[
                { value: `${analytics.totalProfessionals}+`, label: "Elite Professionals" },
                { value: `${analytics.activeMembers?.toLocaleString()}+`, label: "Active Members" },
                { value: analytics.avgRating.toFixed(1), label: "Average Rating" },
                { value: `${analytics.totalBookings}+`, label: "Sessions Booked" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-serif text-3xl font-bold" style={{ color: "hsl(43 80% 60%)" }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(248,245,240,0.7)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Elite Network</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Featured Professionals</h2>
            </div>
            <Link href="/professionals" className="hidden sm:flex items-center gap-1 text-sm font-medium" style={{ color: "hsl(220 55% 20%)" }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <div key={i} className="rounded-xl border border-[hsl(40_25%_88%)] p-5 animate-pulse h-40" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((p) => <ProfessionalCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Tools */}
      <section className="py-20 px-4" style={{ background: "hsl(40 20% 92% / 0.4)" }}>
        <div className="max-w-7xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Behavioral Intelligence</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3" style={{ color: "hsl(220 45% 13%)" }}>AI-Powered Communication Tools</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Zap size={18} />, title: "Email Refiner", desc: "Transform rough drafts into polished professional correspondence instantly." },
            { icon: <Users size={18} />, title: "Tone Adjuster", desc: "Shift your tone across six modes: professional, warm, assertive, empathetic, concise, diplomatic." },
            { icon: <BookOpen size={18} />, title: "Note Clarifier", desc: "Convert scattered thoughts into structured bullets, executive summaries, or clear paragraphs." },
            { icon: <BarChart3 size={18} />, title: "Mini-Planner", desc: "Turn a goal into a structured, milestone-driven action plan with clear timelines." },
          ].map((t) => (
            <div key={t.title} className="bg-white border border-[hsl(40_25%_88%)] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(220 55% 20%)" }}>
                <span style={{ color: "hsl(43 70% 88%)" }}>{t.icon}</span>
              </div>
              <h4 className="font-semibold text-sm mb-1" style={{ color: "hsl(220 45% 13%)" }}>{t.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/tools" className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
            Try the Tools <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Membership teaser */}
      {strategist && (
        <section className="py-20 px-4 text-center" style={{ background: "hsl(220 55% 20%)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(43 80% 60%)" }}>Exclusive Access</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "hsl(43 70% 88%)" }}>The Strategist Membership</h2>
          <p className="text-sm leading-relaxed mb-2 max-w-xl mx-auto" style={{ color: "rgba(248,245,240,0.75)" }}>
            Unlimited AI tools, priority bookings, behavioral analytics, and a complimentary 30-minute session each month.
          </p>
          <p className="font-serif text-4xl font-bold mt-6 mb-2" style={{ color: "hsl(43 80% 60%)" }}>
            £{strategist.price}<span className="text-lg font-sans font-normal" style={{ color: "rgba(248,245,240,0.6)" }}>/month</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4 mb-8">
            {strategist.features.slice(0, 4).map((f, i) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: "rgba(201,169,97,0.3)", color: "hsl(43 80% 60%)" }}>{f}</span>
            ))}
          </div>
          <Link href="/memberships" className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
            Explore All Tiers <ArrowRight size={15} />
          </Link>
        </section>
      )}

      {/* Trust */}
      <section className="py-16 px-4 border-t border-[hsl(40_25%_88%)]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Shield size={28} />, title: "Enterprise Security", desc: "End-to-end encrypted sessions and zero data retention options." },
            { icon: <Globe size={28} />, title: "7 Languages", desc: "English, French, Spanish, German, Bulgarian, Italian, Portuguese." },
            { icon: <Users size={28} />, title: "Verified Experts", desc: "Every professional is vetted for credentials and client outcomes." },
          ].map((item) => (
            <div key={item.title}>
              <span className="flex justify-center mb-3" style={{ color: "hsl(43 80% 60%)" }}>{item.icon}</span>
              <h4 className="font-semibold mb-1" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4" style={{ background: "hsl(220 55% 20%)", color: "rgba(248,245,240,0.6)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif font-semibold" style={{ color: "hsl(43 70% 88%)" }}>MindReply</span>
          <p className="text-xs text-center">The N1 worldwide behavioral communication intelligence ecosystem. UK-based, globally available.</p>
          <div className="flex gap-4 text-xs">
            {[["Professionals", "/professionals"], ["Tools", "/tools"], ["Membership", "/memberships"]].map(([l, h]) => (
              <Link key={h} href={h} className="hover:text-[hsl(43_80%_60%)] transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
