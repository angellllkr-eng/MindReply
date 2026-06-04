"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquare, Phone, Video, Clock, CheckCircle } from "lucide-react";

type Professional = { id: number; name: string; role: string; photoUrl: string; priceText: number; priceVoice: number; priceVideo: number; availabilityStatus: string };
type Slot = { date: string; time: string; available: boolean };
type Mode = "text" | "voice" | "video";
type Step = "mode" | "slot" | "details" | "confirm";

export default function Book() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Professional | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode>("video");
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [duration, setDuration] = useState(60);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/professionals/${id}`).then((r) => r.json()),
      fetch(`/api/professionals/slots?professionalId=${id}`).then((r) => r.json()),
    ]).then(([prof, sl]) => { setP(prof); setSlots(sl); }).catch(() => {});
  }, [id]);

  if (!p) return <div className="pt-20 min-h-screen flex items-center justify-center"><div className="animate-pulse" style={{ color: "hsl(220 25% 45%)" }}>Loading...</div></div>;

  const pricePerHour = mode === "text" ? p.priceText : mode === "voice" ? p.priceVoice : p.priceVideo;
  const totalPrice = pricePerHour * (duration / 60);
  const availableSlots = slots.filter((s) => s.available);
  const slotsByDate: Record<string, Slot[]> = {};
  for (const s of availableSlots) { if (!slotsByDate[s.date]) slotsByDate[s.date] = []; slotsByDate[s.date].push(s); }

  const modes = [
    { key: "text" as Mode, label: "Text / Chat", icon: <MessageSquare size={20} />, desc: `£${p.priceText}/hr — Async messaging, ideal for non-urgent guidance` },
    { key: "voice" as Mode, label: "Voice Call", icon: <Phone size={20} />, desc: `£${p.priceVoice}/hr — Real-time voice, private and focused` },
    { key: "video" as Mode, label: "Video Call", icon: <Video size={20} />, desc: `£${p.priceVideo}/hr — Full video session, most comprehensive` },
  ];

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId: parseInt(id), mode, scheduledAt: `${selectedSlot.date}T${selectedSlot.time}:00Z`, durationMinutes: duration, clientName, clientEmail, notes: notes || null }),
      });
      if (r.ok) setStep("confirm");
    } finally { setSubmitting(false); }
  }

  if (step === "confirm") return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#d1fae5" }}>
          <CheckCircle size={32} style={{ color: "#065f46" }} />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>Booking Confirmed</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>
          Your session with <strong style={{ color: "hsl(220 45% 13%)" }}>{p.name}</strong> has been confirmed. Confirmation sent to {clientEmail}.
        </p>
        <div className="rounded-xl p-4 text-left space-y-2 text-sm mb-6" style={{ background: "hsl(40 20% 92%)" }}>
          <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Mode</span><span className="font-medium capitalize" style={{ color: "hsl(220 45% 13%)" }}>{mode}</span></div>
          <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Date</span><span className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>{selectedSlot?.date} at {selectedSlot?.time}</span></div>
          <div className="flex justify-between border-t border-[hsl(40_25%_88%)] pt-2 mt-2">
            <span className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>Total</span>
            <span className="font-bold text-lg" style={{ color: "hsl(43 80% 60%)" }}>£{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <Link href="/bookings" className="block font-medium py-3 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>View My Bookings</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href={`/professionals/${id}`} className="inline-flex items-center gap-1.5 text-sm mb-8 hover:text-[hsl(220_55%_20%)] transition-colors" style={{ color: "hsl(220 25% 45%)" }}><ArrowLeft size={14} /> Back to Profile</Link>
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[hsl(40_25%_88%)]">
          <img src={p.photoUrl} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: "rgba(201,169,97,0.3)" }} />
          <div>
            <h2 className="font-serif font-bold text-xl" style={{ color: "hsl(220 45% 13%)" }}>{p.name}</h2>
            <p className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>{p.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 text-xs">
          {[["mode", "1. Session Mode"], ["slot", "2. Date & Time"], ["details", "3. Your Details"]].map(([s, l]) => (
            <div key={s} className={`flex items-center gap-1 ${step === s ? "font-semibold" : ""}`} style={{ color: step === s ? "hsl(220 55% 20%)" : "hsl(220 25% 45%)" }}>
              <span>{l}</span>{s !== "details" && <span style={{ color: "rgba(10,22,40,0.3)" }}>›</span>}
            </div>
          ))}
        </div>

        {step === "mode" && (
          <div>
            <h3 className="font-serif text-xl font-bold mb-5" style={{ color: "hsl(220 45% 13%)" }}>Choose Your Session Mode</h3>
            <div className="space-y-3">
              {modes.map((m) => (
                <button key={m.key} onClick={() => setMode(m.key)} className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${mode === m.key ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.05)]" : "border-[hsl(40_25%_88%)] bg-white hover:border-[hsl(43_80%_60%_/_0.4)]"}`}>
                  <span className="mt-0.5" style={{ color: mode === m.key ? "hsl(43 80% 60%)" : "hsl(220 25% 45%)" }}>{m.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "hsl(220 45% 13%)" }}>{m.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(220 25% 45%)" }}>{m.desc}</p>
                  </div>
                  {mode === m.key && <div className="ml-auto w-4 h-4 rounded-full flex-shrink-0 mt-0.5" style={{ background: "hsl(43 80% 60%)" }} />}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(220 45% 13%)" }}>Duration</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }}>
                <option value={60}>60 minutes — £{pricePerHour.toFixed(0)}</option>
                <option value={90}>90 minutes — £{(pricePerHour * 1.5).toFixed(0)}</option>
                <option value={120}>120 minutes — £{(pricePerHour * 2).toFixed(0)}</option>
              </select>
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "hsl(220 25% 45%)" }}><Clock size={11} /> Minimum session is 60 minutes</p>
            </div>
            <button onClick={() => setStep("slot")} className="w-full mt-6 font-medium py-3.5 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Continue to Date & Time</button>
          </div>
        )}

        {step === "slot" && (
          <div>
            <h3 className="font-serif text-xl font-bold mb-5" style={{ color: "hsl(220 45% 13%)" }}>Select a Date & Time</h3>
            {Object.keys(slotsByDate).length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "hsl(220 25% 45%)" }}>No available slots at this time.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(slotsByDate).slice(0, 5).map(([date, daySlots]) => (
                  <div key={date}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "hsl(220 25% 45%)" }}>
                      {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {daySlots.map((s, i) => (
                        <button key={i} onClick={() => setSelectedSlot({ date, time: s.time })}
                          className={`py-2 text-xs rounded-lg border font-medium transition-all ${selectedSlot?.date === date && selectedSlot?.time === s.time ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.1)] text-[hsl(43_80%_60%)]" : "border-[hsl(40_25%_88%)]"}`}
                          style={{ color: selectedSlot?.date === date && selectedSlot?.time === s.time ? "hsl(43 80% 60%)" : "hsl(220 45% 13%)" }}>
                          {s.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("mode")} className="flex-1 border border-[hsl(40_25%_88%)] font-medium py-3 rounded-lg hover:bg-[hsl(40_20%_92%)] transition-colors text-sm" style={{ color: "hsl(220 45% 13%)" }}>Back</button>
              <button onClick={() => setStep("details")} disabled={!selectedSlot} className="flex-1 font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Continue</button>
            </div>
          </div>
        )}

        {step === "details" && (
          <div>
            <h3 className="font-serif text-xl font-bold mb-5" style={{ color: "hsl(220 45% 13%)" }}>Your Details</h3>
            <div className="space-y-4">
              {[
                { label: "Full Name", val: clientName, set: setClientName, type: "text", ph: "Your full name" },
                { label: "Email Address", val: clientEmail, set: setClientEmail, type: "email", ph: "your@email.com" },
              ].map(({ label, val, set, type, ph }) => (
                <div key={label}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(220 45% 13%)" }}>{label}</label>
                  <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(220 45% 13%)" }}>Notes <span style={{ color: "hsl(220 25% 45%)" }} className="font-normal">(optional)</span></label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any specific topics..." className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors resize-none" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }} />
              </div>
            </div>
            <div className="mt-6 rounded-xl p-4 text-sm space-y-2" style={{ background: "hsl(40 20% 92%)" }}>
              <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Mode</span><span className="capitalize font-medium" style={{ color: "hsl(220 45% 13%)" }}>{mode}</span></div>
              <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Date</span><span className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>{selectedSlot?.date} at {selectedSlot?.time}</span></div>
              <div className="flex justify-between border-t border-[hsl(40_25%_88%)] pt-2 mt-1">
                <span className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>Total</span>
                <span className="font-bold text-lg" style={{ color: "hsl(43 80% 60%)" }}>£{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("slot")} className="flex-1 border border-[hsl(40_25%_88%)] font-medium py-3 rounded-lg hover:bg-[hsl(40_20%_92%)] transition-colors text-sm" style={{ color: "hsl(220 45% 13%)" }}>Back</button>
              <button onClick={handleConfirm} disabled={!clientName || !clientEmail || submitting} className="flex-1 font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                {submitting ? "Confirming..." : `Confirm — £${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
