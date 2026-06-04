"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, Globe, Video, Phone, MessageSquare, ArrowLeft, Clock, Award } from "lucide-react";

type Professional = { id: number; name: string; role: string; niche: string; bio: string; rating: number; reviewCount: number; priceText: number; priceVoice: number; priceVideo: number; availabilityStatus: string; languages: string[]; photoUrl: string; specializations: string[] | null; yearsExperience: number | null };
type Slot = { date: string; time: string; available: boolean };

const STATUS: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "availability-available" },
  busy: { label: "Busy", cls: "availability-busy" },
  fully_booked: { label: "Fully Booked", cls: "availability-fully_booked" },
};

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Professional | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/professionals/${id}`).then((r) => r.json()),
      fetch(`/api/professionals/slots?professionalId=${id}`).then((r) => r.json()),
    ]).then(([prof, sl]) => { setP(prof); setSlots(sl); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-20 min-h-screen flex items-center justify-center"><div className="animate-pulse text-[hsl(220_25%_45%)]">Loading...</div></div>;
  if (!p || (p as any).error) return <div className="pt-20 min-h-screen flex items-center justify-center"><p className="font-serif text-xl" style={{ color: "hsl(220 25% 45%)" }}>Professional not found</p></div>;

  const s = STATUS[p.availabilityStatus] ?? STATUS.available;
  const nextSlots = slots.filter((sl) => sl.available).slice(0, 6);
  const modes = [
    { key: "text", label: "Text / Chat", icon: <MessageSquare size={16} />, price: p.priceText },
    { key: "voice", label: "Voice Call", icon: <Phone size={16} />, price: p.priceVoice },
    { key: "video", label: "Video Call", icon: <Video size={16} />, price: p.priceVideo },
  ];

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/professionals" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:text-[hsl(220_55%_20%)] transition-colors" style={{ color: "hsl(220 25% 45%)" }}>
          <ArrowLeft size={14} /> Back to Professionals
        </Link>

        <div className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img src={p.photoUrl} alt={p.name} className="w-28 h-28 rounded-full object-cover border-2 flex-shrink-0" style={{ borderColor: "rgba(201,169,97,0.3)" }} />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <h1 className="font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{p.name}</h1>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "hsl(43 80% 60%)" }}>{p.role}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.cls}`}>{s.label}</span>
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{p.niche}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-[hsl(43_80%_60%)]" style={{ color: "hsl(43 80% 60%)" }} />
                  <span className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{p.rating.toFixed(1)}</span>
                  <span style={{ color: "hsl(220 25% 45%)" }}>({p.reviewCount} reviews)</span>
                </div>
                {p.yearsExperience && <div className="flex items-center gap-1.5" style={{ color: "hsl(220 25% 45%)" }}><Award size={14} />{p.yearsExperience} years</div>}
                <div className="flex items-center gap-1.5" style={{ color: "hsl(220 25% 45%)" }}><Globe size={14} />{p.languages.join(", ")}</div>
              </div>
              {(p.specializations ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {(p.specializations ?? []).map((s, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-[hsl(40_25%_88%)]" style={{ color: "hsl(220 45% 13%)" }}>{s}</span>)}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[hsl(40_25%_88%)]">
            <h3 className="font-semibold text-sm mb-2" style={{ color: "hsl(220 45% 13%)" }}>About</h3>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{p.bio}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-6">
            <h3 className="font-serif font-semibold mb-4" style={{ color: "hsl(220 45% 13%)" }}>Session Options</h3>
            <div className="space-y-3">
              {modes.map((m) => (
                <div key={m.key} className="flex items-center justify-between py-3 border-b border-[hsl(40_25%_88%)] last:border-0">
                  <div className="flex items-center gap-2.5 text-sm" style={{ color: "hsl(220 45% 13%)" }}>
                    <span style={{ color: "hsl(220 25% 45%)" }}>{m.icon}</span>{m.label}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: "hsl(220 45% 13%)" }}>£{m.price}<span className="text-xs font-normal" style={{ color: "hsl(220 25% 45%)" }}>/hr</span></span>
                    {p.availabilityStatus !== "fully_booked" && (
                      <Link href={`/book/${p.id}?mode=${m.key}`} className="text-xs px-3 py-1.5 rounded font-medium hover:opacity-90 transition-opacity" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Book</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: "hsl(220 25% 45%)" }}><Clock size={12} /> Minimum 1 hour session</div>
          </div>

          <div className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-6">
            <h3 className="font-serif font-semibold mb-4" style={{ color: "hsl(220 45% 13%)" }}>Next Available Slots</h3>
            {nextSlots.length === 0 ? (
              <p className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>No slots currently available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {nextSlots.map((sl, i) => (
                  <Link key={i} href={`/book/${p.id}`} className="text-center text-xs border border-[hsl(40_25%_88%)] rounded-lg px-2 py-2.5 hover:border-[hsl(43_80%_60%)] transition-colors">
                    <p className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>{new Date(sl.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
                    <p style={{ color: "hsl(220 25% 45%)" }}>{sl.time}</p>
                  </Link>
                ))}
              </div>
            )}
            {p.availabilityStatus !== "fully_booked" && (
              <Link href={`/book/${p.id}`} className="block w-full text-center mt-5 font-medium py-3 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                Book a Session
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
