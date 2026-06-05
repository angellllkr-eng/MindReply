"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, MessageSquare, Phone, Video } from "lucide-react";
import { createBookingAction } from "@/app/booking/actions";

type Professional = {
  id: number;
  name: string;
  role: string;
  photoUrl: string;
  priceText: number;
  priceVoice: number;
  priceVideo: number;
  availabilityStatus: string;
};

type Slot = { date: string; time: string; available: boolean };
type Mode = "text" | "voice" | "video";
type Step = "mode" | "slot" | "details" | "confirm";
type ConfirmedBooking = {
  id: number;
  professionalId: number;
  professionalName: string;
  mode: Mode;
  scheduledAt: string;
  durationMinutes: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus?: string;
  stripeSessionId?: string | null;
  clientName: string;
  clientEmail: string;
  notes: string | null;
};

function saveLocalBooking(booking: ConfirmedBooking) {
  const key = "mindreply.bookings";
  const existing = window.localStorage.getItem(key);
  let parsed: ConfirmedBooking[] = [];
  if (existing) {
    try {
      parsed = JSON.parse(existing) as ConfirmedBooking[];
    } catch {
      parsed = [];
    }
  }
  const next = [booking, ...parsed.filter((item) => item.id !== booking.id)].slice(0, 25);
  window.localStorage.setItem(key, JSON.stringify(next));
}

export default function Book() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode>("video");
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [duration, setDuration] = useState(60);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "text" || requestedMode === "voice" || requestedMode === "video") {
      setMode(requestedMode);
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setNotFound(false);

    Promise.all([
      fetch(`/api/professionals/${id}`).then(async (response) => {
        const profile = await response.json();
        if (!response.ok || profile?.error) {
          throw new Error("not-found");
        }
        return profile as Professional;
      }),
      fetch(`/api/professionals/slots?professionalId=${id}`).then(async (response) => {
        if (!response.ok) return [] as Slot[];
        const availability = await response.json();
        return Array.isArray(availability) ? availability as Slot[] : [];
      }),
    ])
      .then(([profile, availability]) => {
        if (!active) return;
        setProfessional(profile);
        setSlots(availability);
        setLoading(false);
      })
      .catch((loadError) => {
        if (!active) return;
        if (loadError instanceof Error && loadError.message === "not-found") {
          setNotFound(true);
        } else {
          setError("Unable to load booking details. Please refresh and try again.");
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-pulse" style={{ color: "hsl(220 25% 45%)" }}>Loading booking flow...</div>
      </main>
    );
  }

  if (notFound || !professional) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(40 33% 97%)" }}>
        <section className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>Professional Not Found</h1>
          <p className="text-sm mb-6" style={{ color: "hsl(220 25% 45%)" }}>This booking page cannot be loaded because the selected professional is not available.</p>
          <Link href="/professionals" className="inline-flex justify-center font-medium px-5 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
            Browse Professionals
          </Link>
        </section>
      </main>
    );
  }

  const pricePerHour = mode === "text" ? professional.priceText : mode === "voice" ? professional.priceVoice : professional.priceVideo;
  const totalPrice = pricePerHour * (duration / 60);
  const availableSlots = slots.filter((slot) => slot.available);
  const slotsByDate = availableSlots.reduce<Record<string, Slot[]>>((acc, slot) => {
    acc[slot.date] = [...(acc[slot.date] ?? []), slot];
    return acc;
  }, {});

  const modes = [
    { key: "text" as Mode, label: "Text / Chat", icon: <MessageSquare size={20} />, desc: `GBP ${professional.priceText}/hr - field professional text workspace for precise written guidance` },
    { key: "voice" as Mode, label: "Voice Call", icon: <Phone size={20} />, desc: `GBP ${professional.priceVoice}/hr - private AI-human voice room with a field professional brief` },
    { key: "video" as Mode, label: "Video Call", icon: <Video size={20} />, desc: `GBP ${professional.priceVideo}/hr - AI-human video consultation room for complex issues` },
  ];

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError("");

    try {
      const result = await createBookingAction({
        professionalId: Number(id),
        mode,
        scheduledAt: `${selectedSlot.date}T${selectedSlot.time}:00Z`,
        durationMinutes: duration,
        clientName,
        clientEmail,
        notes: notes || null,
        origin: window.location.origin,
      });

      if (!result.ok) {
        setError(result.error ?? "Unable to confirm booking.");
        return;
      }

      saveLocalBooking(result.booking);
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }

      setBookingId(result.booking.id);
      setStep("confirm");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "confirm") {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(40 33% 97%)" }}>
        <section className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#d1fae5" }}>
            <CheckCircle size={32} style={{ color: "#065f46" }} />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>Booking Confirmed</h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>
            Your session with <strong style={{ color: "hsl(220 45% 13%)" }}>{professional.name}</strong> has been confirmed. Confirmation sent to {clientEmail}.
          </p>
          <div className="rounded-xl p-4 text-left space-y-2 text-sm mb-6" style={{ background: "hsl(40 20% 92%)" }}>
            <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Booking</span><span className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>#{bookingId}</span></div>
            <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Mode</span><span className="font-medium capitalize" style={{ color: "hsl(220 45% 13%)" }}>{mode}</span></div>
            <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Date</span><span className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>{selectedSlot?.date} at {selectedSlot?.time}</span></div>
            <div className="flex justify-between border-t border-[hsl(40_25%_88%)] pt-2 mt-2">
              <span className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>Total</span>
              <span className="font-bold text-lg" style={{ color: "hsl(43 80% 60%)" }}>GBP {totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid gap-3">
            {bookingId && (
              <Link href={`/session/${bookingId}`} className="block font-medium py-3 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>Open Session Room</Link>
            )}
            <Link href="/bookings" className="block font-medium py-3 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>View My Bookings</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <section className="max-w-2xl mx-auto px-4 py-10">
        <Link href={`/professionals/${id}`} className="inline-flex items-center gap-1.5 text-sm mb-8 hover:text-[hsl(220_55%_20%)] transition-colors" style={{ color: "hsl(220 25% 45%)" }}><ArrowLeft size={14} /> Back to Profile</Link>

        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[hsl(40_25%_88%)]">
          <img src={professional.photoUrl} alt={professional.name} className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: "rgba(201,169,97,0.3)" }} />
          <div>
            <h1 className="font-serif font-bold text-xl" style={{ color: "hsl(220 45% 13%)" }}>{professional.name}</h1>
            <p className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>{professional.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 text-xs">
          {[["mode", "1. Session Mode"], ["slot", "2. Date & Time"], ["details", "3. Your Details"]].map(([stepKey, label]) => (
            <div key={stepKey} className={`flex items-center gap-1 ${step === stepKey ? "font-semibold" : ""}`} style={{ color: step === stepKey ? "hsl(220 55% 20%)" : "hsl(220 25% 45%)" }}>
              <span>{label}</span>{stepKey !== "details" && <span style={{ color: "rgba(10,22,40,0.3)" }}>{">"}</span>}
            </div>
          ))}
        </div>

        {error && <p className="mb-4 text-sm rounded-lg border px-3 py-2" style={{ color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</p>}

        {step === "mode" && (
          <div>
            <h2 className="font-serif text-xl font-bold mb-5" style={{ color: "hsl(220 45% 13%)" }}>Choose Your Session Mode</h2>
            <div className="space-y-3">
              {modes.map((sessionMode) => (
                <button key={sessionMode.key} onClick={() => setMode(sessionMode.key)} className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${mode === sessionMode.key ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.05)]" : "border-[hsl(40_25%_88%)] bg-white hover:border-[hsl(43_80%_60%_/_0.4)]"}`}>
                  <span className="mt-0.5" style={{ color: mode === sessionMode.key ? "hsl(43 80% 60%)" : "hsl(220 25% 45%)" }}>{sessionMode.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "hsl(220 45% 13%)" }}>{sessionMode.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(220 25% 45%)" }}>{sessionMode.desc}</p>
                  </div>
                  {mode === sessionMode.key && <div className="ml-auto w-4 h-4 rounded-full flex-shrink-0 mt-0.5" style={{ background: "hsl(43 80% 60%)" }} />}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(220 45% 13%)" }}>Duration</label>
              <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border border-[hsl(40_25%_88%)]" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }}>
                <option value={60}>60 minutes - GBP {pricePerHour.toFixed(0)}</option>
                <option value={90}>90 minutes - GBP {(pricePerHour * 1.5).toFixed(0)}</option>
                <option value={120}>120 minutes - GBP {(pricePerHour * 2).toFixed(0)}</option>
              </select>
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "hsl(220 25% 45%)" }}><Clock size={11} /> Minimum session is 60 minutes</p>
            </div>
            <button onClick={() => setStep("slot")} className="w-full mt-6 font-medium py-3.5 rounded-lg hover:opacity-90 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Continue to Date & Time</button>
          </div>
        )}

        {step === "slot" && (
          <div>
            <h2 className="font-serif text-xl font-bold mb-5" style={{ color: "hsl(220 45% 13%)" }}>Select a Date & Time</h2>
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
                      {daySlots.map((slot) => (
                        <button key={`${slot.date}-${slot.time}`} onClick={() => setSelectedSlot({ date, time: slot.time })} className={`py-2 text-xs rounded-lg border font-medium transition-all ${selectedSlot?.date === date && selectedSlot?.time === slot.time ? "border-[hsl(43_80%_60%)] bg-[hsl(43_80%_60%_/_0.1)] text-[hsl(43_80%_60%)]" : "border-[hsl(40_25%_88%)]"}`} style={{ color: selectedSlot?.date === date && selectedSlot?.time === slot.time ? "hsl(43 80% 60%)" : "hsl(220 45% 13%)" }}>
                          {slot.time}
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
            <h2 className="font-serif text-xl font-bold mb-5" style={{ color: "hsl(220 45% 13%)" }}>Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(220 45% 13%)" }}>Full Name</label>
                <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Your full name" className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(220 45% 13%)" }}>Email Address</label>
                <input type="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="your@email.com" className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(220 45% 13%)" }}>Notes <span style={{ color: "hsl(220 25% 45%)" }} className="font-normal">(optional)</span></label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Any specific topics..." className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors resize-none" style={{ background: "hsl(40 20% 92%)", color: "hsl(220 45% 13%)" }} />
              </div>
            </div>

            <div className="mt-6 rounded-xl p-4 text-sm space-y-2" style={{ background: "hsl(40 20% 92%)" }}>
              <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Mode</span><span className="capitalize font-medium" style={{ color: "hsl(220 45% 13%)" }}>{mode}</span></div>
              <div className="flex justify-between"><span style={{ color: "hsl(220 25% 45%)" }}>Date</span><span className="font-medium" style={{ color: "hsl(220 45% 13%)" }}>{selectedSlot?.date} at {selectedSlot?.time}</span></div>
              <div className="flex justify-between border-t border-[hsl(40_25%_88%)] pt-2 mt-1">
                <span className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>Total</span>
                <span className="font-bold text-lg" style={{ color: "hsl(43 80% 60%)" }}>GBP {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("slot")} className="flex-1 border border-[hsl(40_25%_88%)] font-medium py-3 rounded-lg hover:bg-[hsl(40_20%_92%)] transition-colors text-sm" style={{ color: "hsl(220 45% 13%)" }}>Back</button>
              <button onClick={handleConfirm} disabled={!clientName || !clientEmail || submitting} className="flex-1 font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                {submitting ? "Confirming..." : `Confirm - GBP ${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
