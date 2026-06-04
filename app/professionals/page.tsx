"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ProfessionalCard from "@/components/ProfessionalCard";
import { professionalCategoryLabel } from "@/lib/professional-categories";

type Professional = { id: number; name: string; role: string; niche: string; rating: number; reviewCount: number; priceVideo: number; availabilityStatus: string; languages: string[]; photoUrl: string };

const ROLES = ["All", "Child Psychologist", "Adult Mental Health Support", "Relationship & Communication Coach", "Legal Advisor", "Financial Advisor", "Business Consultant", "HR Leader & Executive PA", "Accountant & Tax Advisor", "Executive Assistant & Operations", "Event Manager"];
const LANGS = ["All", "English", "French", "Spanish", "German", "Bulgarian", "Italian", "Portuguese", "Hindi"];

export default function Professionals() {
  const [data, setData] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("All");
  const [lang, setLang] = useState("All");
  const [category, setCategory] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") ?? "");
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (role !== "All") p.set("role", role);
    else if (category) p.set("category", category);
    if (lang !== "All") p.set("language", lang);
    if (availableOnly) p.set("available", "true");
    setLoading(true);
    fetch(`/api/professionals?${p}`).then((r) => r.json()).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [role, lang, category, availableOnly]);

  const filtered = data.filter((p) => search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()));
  const categoryLabel = role === "All" ? professionalCategoryLabel(category) : null;

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="py-14 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Elite Network</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3" style={{ color: "hsl(43 70% 88%)" }}>Our Professionals</h1>
          <p className="text-sm max-w-xl" style={{ color: "rgba(248,245,240,0.7)" }}>Vetted experts across psychology, law, finance, strategy, and communication.</p>
        </div>
      </div>

      <div className="bg-white border-b border-[hsl(40_25%_88%)] sticky top-16 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-48 max-w-xs border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92%)" }}>
            <Search size={14} style={{ color: "hsl(220 25% 45%)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search professionals..." className="bg-transparent text-sm outline-none w-full" style={{ color: "hsl(220 45% 13%)" }} />
          </div>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={14} style={{ color: "hsl(220 25% 45%)" }} />
            <select value={role} onChange={(e) => { setRole(e.target.value); if (e.target.value !== "All") setCategory(""); }} className="text-sm rounded-lg px-3 py-2 outline-none border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="text-sm rounded-lg px-3 py-2 outline-none border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }}>
              {LANGS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none" style={{ color: "hsl(220 45% 13%)" }}>
              <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="w-3.5 h-3.5" style={{ accentColor: "hsl(220 55% 20%)" }} /> Available now
            </label>
          </div>
          {categoryLabel && (
            <button type="button" onClick={() => setCategory("")} className="text-xs font-semibold rounded-full px-3 py-2 border border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.15)] text-[hsl(43_80%_35%)]">
              {categoryLabel} category - clear
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="rounded-xl border border-[hsl(40_25%_88%)] p-5 animate-pulse h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl" style={{ color: "hsl(220 25% 45%)" }}>No professionals found</p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: "hsl(220 25% 45%)" }}>{filtered.length} professional{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((p) => <ProfessionalCard key={p.id} p={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
