"use client";
import { useEffect, useState } from "react";
import { Users, Star, Calendar, TrendingUp, Globe } from "lucide-react";
import ProfessionalCard from "@/components/ProfessionalCard";

type Summary = { totalProfessionals: number; availableProfessionals: number; totalBookings: number; activeMembers: number; avgRating: number; popularRoles: { role: string; count: number }[] };
type Professional = { id: number; name: string; role: string; niche: string; rating: number; reviewCount: number; priceVideo: number; availabilityStatus: string; languages: string[]; photoUrl: string };

export default function Analytics() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [featured, setFeatured] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/summary").then((r) => r.json()),
      fetch("/api/professionals/featured").then((r) => r.json()),
    ]).then(([s, f]) => { setSummary(s); setFeatured(f); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const stats = summary ? [
    { icon: <Users size={18} />, label: "Total Professionals", value: summary.totalProfessionals, sub: `${summary.availableProfessionals} available now` },
    { icon: <Globe size={18} />, label: "Active Members", value: summary.activeMembers?.toLocaleString() ?? "—" },
    { icon: <Calendar size={18} />, label: "Sessions Booked", value: summary.totalBookings },
    { icon: <Star size={18} />, label: "Average Rating", value: summary.avgRating.toFixed(1), sub: "Across all professionals" },
  ] : [];

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="py-14 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Platform Intelligence</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3" style={{ color: "hsl(43 70% 88%)" }}>Ecosystem Overview</h1>
          <p className="text-sm max-w-xl" style={{ color: "rgba(248,245,240,0.7)" }}>Live metrics from the MindReply ecosystem.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">{[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-[hsl(40_25%_88%)] rounded-xl p-5 animate-pulse h-32" />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-[hsl(40_25%_88%)] rounded-xl p-5 hover:border-[hsl(43_80%_60%_/_0.3)] transition-colors">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(10,22,40,0.06)", color: "hsl(220 55% 20%)" }}>{s.icon}</span>
                <p className="font-serif text-3xl font-bold mb-0.5" style={{ color: "hsl(220 45% 13%)" }}>{s.value}</p>
                <p className="text-xs font-medium" style={{ color: "hsl(220 25% 45%)" }}>{s.label}</p>
                {s.sub && <p className="text-xs mt-1" style={{ color: "hsl(43 80% 60%)" }}>{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {summary && (summary.popularRoles ?? []).length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-xl font-bold mb-5 flex items-center gap-2" style={{ color: "hsl(220 45% 13%)" }}>
              <TrendingUp size={18} style={{ color: "hsl(43 80% 60%)" }} /> Most In-Demand Expertise
            </h2>
            <div className="space-y-3">
              {(summary.popularRoles ?? []).map((r, i) => {
                const max = (summary.popularRoles ?? [])[0]?.count ?? 1;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>{r.role}</span>
                      <span style={{ color: "hsl(220 25% 45%)" }}>{r.count} professional{r.count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(40 20% 92%)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(r.count / max) * 100}%`, background: "hsl(43 80% 60%)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-serif text-xl font-bold mb-5" style={{ color: "hsl(220 45% 13%)" }}>Available Professionals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p) => <ProfessionalCard key={p.id} p={p} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
