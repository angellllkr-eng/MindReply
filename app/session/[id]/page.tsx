"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Calendar, CheckCircle2, Copy, MessageSquare, Phone, Video } from "lucide-react";

type Booking = {
  id: number;
  professionalId: number;
  professionalName: string;
  mode: "text" | "voice" | "video";
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

function getLocalBooking(id: number) {
  const saved = window.localStorage.getItem("mindreply.bookings");
  if (!saved) return null;
  try {
    const bookings = JSON.parse(saved) as Booking[];
    return bookings.find((booking) => booking.id === id) ?? null;
  } catch {
    window.localStorage.removeItem("mindreply.bookings");
    return null;
  }
}

function getRoomUrl(booking: Booking) {
  const room = `MindReply-${booking.id}-${booking.professionalName.replace(/[^a-z0-9]/gi, "").slice(0, 20)}`;
  return `https://meet.jit.si/${room}`;
}

export default function SessionDeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const bookingId = Number(id);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const local = getLocalBooking(bookingId);
    if (local) {
      setBooking(local);
      setLoading(false);
      return;
    }

    fetch(`/api/bookings/${bookingId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("not-found");
        return response.json() as Promise<Booking>;
      })
      .then((data) => {
        if (!active) return;
        setBooking(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingId]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    if (checkout !== "success" || !sessionId || !bookingId) return;

    let active = true;
    fetch(`/api/checkout/booking-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data: { confirmed?: boolean; bookingId?: number }) => {
        if (!active || !data.confirmed) return;
        setBooking((current) => current ? {
          ...current,
          status: "confirmed",
          paymentStatus: "paid",
          stripeSessionId: sessionId,
        } : current);
      })
      .catch((error) => {
        console.warn("Booking checkout verification skipped:", error);
      });

    return () => {
      active = false;
    };
  }, [bookingId, searchParams]);

  const roomUrl = useMemo(() => booking ? getRoomUrl(booking) : "", [booking]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 px-4" style={{ background: "hsl(40 33% 97%)" }}>
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <p className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>Loading session delivery...</p>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen pt-24 px-4" style={{ background: "hsl(40 33% 97%)" }}>
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <h1 className="font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Session not found</h1>
          <p className="mt-2 text-sm" style={{ color: "hsl(220 25% 45%)" }}>Open your booking from the same browser or connect the production database for cross-device booking retrieval.</p>
          <Link href="/bookings" className="mt-6 inline-flex rounded-lg px-5 py-3 text-sm font-semibold" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>Back to bookings</Link>
        </div>
      </main>
    );
  }

  const isLiveCall = booking.mode === "video" || booking.mode === "voice";
  const callIcon = booking.mode === "video" ? <Video size={18} /> : booking.mode === "voice" ? <Phone size={18} /> : <MessageSquare size={18} />;

  async function copyRoom() {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen pt-24 px-4 pb-16" style={{ background: "hsl(40 33% 97%)" }}>
      <section className="mx-auto max-w-5xl">
        <div className="rounded-2xl border bg-[hsl(220_45%_13%)] p-7 text-[hsl(40_33%_97%)]" style={{ borderColor: "rgba(248,245,240,0.16)" }}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[hsl(43_80%_60%)]">
                <CheckCircle2 size={15} />
                Product delivered
              </p>
              <h1 className="font-serif text-3xl font-bold md:text-4xl">{booking.professionalName} session room</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgba(248,245,240,0.72)]">
                Your booking is confirmed. Use this room to join the session, prepare your message brief, and keep the communication objective clear.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(248,245,240,0.18)] px-3 py-2 text-sm font-semibold text-[hsl(43_70%_88%)]">
              {callIcon}
              {booking.mode} session
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <section className="rounded-2xl border bg-white p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <h2 className="font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Session access</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <span className="flex items-center gap-2" style={{ color: "hsl(220 25% 45%)" }}><Calendar size={16} />Time</span>
                <span className="font-semibold text-right" style={{ color: "hsl(220 45% 13%)" }}>{new Date(booking.scheduledAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <span style={{ color: "hsl(220 25% 45%)" }}>Duration</span>
                <span className="font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{booking.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <span style={{ color: "hsl(220 25% 45%)" }}>Status</span>
                <span className="font-semibold capitalize" style={{ color: "hsl(43 80% 38%)" }}>{booking.status}</span>
              </div>
            </div>

            {isLiveCall ? (
              <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: "hsl(40 25% 88%)", background: "hsl(40 20% 96%)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 38%)" }}>Live room</p>
                <p className="mt-2 break-all text-sm" style={{ color: "hsl(220 25% 45%)" }}>{roomUrl}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a href={roomUrl} target="_blank" rel="noreferrer" className="inline-flex flex-1 justify-center rounded-lg px-5 py-3 text-sm font-semibold" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                    Join {booking.mode} room
                  </a>
                  <button type="button" onClick={copyRoom} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold" style={{ borderColor: "hsl(40 25% 82%)", color: "hsl(220 45% 13%)" }}>
                    <Copy size={16} />
                    {copied ? "Copied" : "Copy room link"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: "hsl(40 25% 88%)", background: "hsl(40 20% 96%)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 38%)" }}>Text session workspace</p>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={7}
                  placeholder="Write the exact context, decision pressure, intended outcome, and words you want to avoid."
                  className="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "hsl(40 25% 82%)", color: "hsl(220 45% 13%)" }}
                />
                <button type="button" onClick={() => navigator.clipboard.writeText(message)} className="mt-3 rounded-lg px-5 py-3 text-sm font-semibold" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                  Copy text brief
                </button>
              </div>
            )}
          </section>

          <aside className="rounded-2xl border bg-white p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <h2 className="font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>Pre-session brief</h2>
            <div className="mt-5 grid gap-3">
              {[
                "What outcome should this conversation create?",
                "What emotion must the other person feel after reading or hearing it?",
                "What risk, boundary, or decision must be made explicit?",
                "What should remain unsaid to preserve authority?",
              ].map((item) => (
                <div key={item} className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 35% 30%)" }}>{item}</div>
              ))}
            </div>
            <Link href="/tools/email-polisher" className="mt-5 inline-flex w-full justify-center rounded-lg px-5 py-3 text-sm font-semibold" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              Refine the message first
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
