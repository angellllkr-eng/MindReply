"use client";
import { useEffect, useState } from "react";
import { BookOpen, Search, ChevronRight, X } from "lucide-react";

type Lexicon = { id: number; name: string; category: string; description: string; terms: string[] };

export default function Lexicons() {
  const [data, setData] = useState<Lexicon[]>([]);
  const [selected, setSelected] = useState<Lexicon | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lexicons").then((r) => r.json()).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = data.filter((l) => search === "" || l.name.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase()));
  const categories = Array.from(new Set(data.map((l) => l.category)));

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="py-14 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Knowledge Architecture</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3" style={{ color: "hsl(43 70% 88%)" }}>Professional Lexicons</h1>
          <p className="text-sm max-w-xl" style={{ color: "rgba(248,245,240,0.7)" }}>Curated vocabularies from the world's most demanding professional disciplines.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 bg-white border border-[hsl(40_25%_88%)] rounded-xl px-4 py-3 mb-8 max-w-sm">
          <Search size={15} style={{ color: "hsl(220 25% 45%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lexicons..." className="bg-transparent text-sm outline-none w-full" style={{ color: "hsl(220 45% 13%)" }} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white border border-[hsl(40_25%_88%)] rounded-xl p-5 animate-pulse h-36" />)}
          </div>
        ) : (
          categories.map((cat) => {
            const items = filtered.filter((l) => l.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat} className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "hsl(220 25% 45%)" }}>
                  <BookOpen size={12} /> {cat}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((l) => (
                    <button key={l.id} onClick={() => setSelected(l)} className="text-left bg-white border border-[hsl(40_25%_88%)] rounded-xl p-5 hover:border-[hsl(43_80%_60%_/_0.4)] hover:shadow-sm hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm" style={{ color: "hsl(220 45% 13%)" }}>{l.name}</h3>
                        <ChevronRight size={14} className="group-hover:text-[hsl(43_80%_60%)] transition-colors flex-shrink-0 mt-0.5" style={{ color: "hsl(220 25% 45%)" }} />
                      </div>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: "hsl(220 25% 45%)" }}>{l.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {l.terms.slice(0, 3).map((t, i) => <span key={i} className="text-[10px] border border-[hsl(40_25%_88%)] px-2 py-0.5 rounded-full" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }}>{t}</span>)}
                        {l.terms.length > 3 && <span className="text-[10px] px-1" style={{ color: "hsl(220 25% 45%)" }}>+{l.terms.length - 3} more</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-7 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{selected.name}</h2>
                <span className="text-xs font-medium" style={{ color: "hsl(43 80% 60%)" }}>{selected.category}</span>
              </div>
              <button onClick={() => setSelected(null)} className="hover:text-[hsl(220_45%_13%)] transition-colors" style={{ color: "hsl(220 25% 45%)" }}><X size={18} /></button>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(220 25% 45%)" }}>{selected.description}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {selected.terms.map((term, i) => (
                <div key={i} className="flex items-center gap-2 p-3 border border-[hsl(40_25%_88%)] rounded-xl text-sm" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "hsl(43 80% 60%)" }} />{term}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
