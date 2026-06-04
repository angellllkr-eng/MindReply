import Link from "next/link";
import { Star, Globe, Video } from "lucide-react";

interface Professional {
  id: number; name: string; role: string; niche: string;
  rating: number; reviewCount: number; priceVideo: number;
  availabilityStatus: string; languages: string[]; photoUrl: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "availability-available" },
  busy: { label: "Busy", cls: "availability-busy" },
  fully_booked: { label: "Fully Booked", cls: "availability-fully_booked" },
};

export default function ProfessionalCard({ p }: { p: Professional }) {
  const s = STATUS[p.availabilityStatus] ?? STATUS.available;
  return (
    <div className="rounded-xl overflow-hidden border border-[hsl(40_25%_88%)] bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[hsl(43_80%_60%_/_0.4)] transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <img src={p.photoUrl} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-[hsl(40_20%_92%)] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm truncate" style={{ color: "hsl(220 45% 13%)" }}>{p.name}</h3>
                <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(43 80% 60%)" }}>{p.role}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
            <p className="text-xs mt-1 line-clamp-2" style={{ color: "hsl(220 25% 45%)" }}>{p.niche}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(40_25%_88%)]">
          <div className="flex items-center gap-1.5">
            <Star size={12} className="fill-[hsl(43_80%_60%)]" style={{ color: "hsl(43 80% 60%)" }} />
            <span className="text-xs font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{p.rating.toFixed(1)}</span>
            <span className="text-xs" style={{ color: "hsl(220 25% 45%)" }}>({p.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: "hsl(220 25% 45%)" }}>
            <Globe size={11} /><span>{p.languages.slice(0, 2).join(", ")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs" style={{ color: "hsl(220 25% 45%)" }}>
            <Video size={11} />
            <span className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>£{p.priceVideo}</span>
            <span>/hr</span>
          </div>
          <div className="flex gap-2">
            <Link href={`/professionals/${p.id}`} className="text-xs font-medium hover:text-[hsl(43_80%_60%)] transition-colors" style={{ color: "hsl(220 55% 20%)" }}>View Profile</Link>
            {p.availabilityStatus !== "fully_booked" && (
              <Link href={`/book/${p.id}`} className="text-xs font-medium px-3 py-1 rounded hover:opacity-90 transition-opacity" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Book</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
