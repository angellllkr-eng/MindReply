"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Video, Phone, MessageSquare, Clock } from "lucide-react";

type Booking = { id: number; professionalName: string; mode: string; scheduledAt: string; durationMinutes: number; totalPrice: number; status: string; notes: string | null };

const STATUS_STYLES: Record<string, string> = {
  pending: "background:#fef3c7;color:#92400e",
  confirmed: "background:#d1fae5;color:#065f46",
  completed: "background:#dbeafe;color:#1e40af",
  cancelled: "background:#fee2e2;color:#991b1b",
};

const MODE_ICONS: Record<string, React.ReactNode> = {
  text: <MessageSquare size={14} />,
  voice: <Phone size={14} />,
  video: <Video size={14} />,
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings").then((r) => r.json()).then((d) => { setBookings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="py-14 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>Your Sessions</p>
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: "hsl(43 70% 88%)" }}>My Bookings</h1>
          <p className="text-sm" style={{ color: "rgba(248,245,240,0.7)" }}>All your scheduled and completed sessions.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white border border-[hsl(40_25%_88%)] rounded-xl p-5 animate-pulse h-24" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "hsl(40 20% 92%)" }}>
              <Calendar size={28} style={{ color: "hsl(220 25% 45%)" }} />
            </div>
            <h3 className="font-serif text-xl mb-2" style={{ color: "hsl(220 45% 13%)" }}>No bookings yet</h3>
            <p className="text-sm mb-6" style={{ color: "hsl(220 25% 45%)" }}>Book your first session with one of our professionals.</p>
            <Link href="/professionals" className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
              Find a Professional
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white border border-[hsl(40_25%_88%)] rounded-xl p-5 hover:border-[hsl(43_80%_60%_/_0.3)] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-sm" style={{ color: "hsl(220 45% 13%)" }}>{b.professionalName}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={Object.fromEntries(STATUS_STYLES[b.status]?.split(";").map((s) => s.split(":")) ?? []) as React.CSSProperties}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: "hsl(220 25% 45%)" }}>
                      <span className="flex items-center gap-1.5">{MODE_ICONS[b.mode]}<span className="capitalize">{b.mode} session</span></span>
                      <span className="flex items-center gap-1.5"><Calendar size={11} />{new Date(b.scheduledAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} at {new Date(b.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="flex items-center gap-1.5"><Clock size={11} />{b.durationMinutes} min</span>
                    </div>
                    {b.notes && <p className="mt-2 text-xs px-2.5 py-1.5 rounded border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 25% 45%)" }}>{b.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold" style={{ color: "hsl(220 45% 13%)" }}>£{b.totalPrice.toFixed(2)}</p>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(220 25% 45%)" }}>#{b.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
