"use server";

import { db, hasDatabaseUrl, bookingsTable, professionalsTable } from "@/lib/db";
import { fallbackProfessionals } from "@/lib/fallback-data";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export type BookingActionInput = {
  professionalId: number;
  mode: "text" | "voice" | "video";
  scheduledAt: string;
  durationMinutes: number;
  clientName: string;
  clientEmail: string;
  notes?: string | null;
  origin?: string;
};

function mapBooking(booking: {
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
}) {
  return {
    id: booking.id,
    professionalId: booking.professionalId,
    professionalName: booking.professionalName,
    mode: booking.mode,
    scheduledAt: booking.scheduledAt,
    durationMinutes: booking.durationMinutes,
    totalPrice: booking.totalPrice,
    status: booking.status,
    paymentStatus: booking.paymentStatus ?? "unpaid",
    stripeSessionId: booking.stripeSessionId ?? null,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    notes: booking.notes,
  };
}

type BookingActionBooking = ReturnType<typeof mapBooking>;
type BookingActionResult =
  | { ok: true; booking: BookingActionBooking; checkoutUrl?: string | null; paymentRequired: boolean }
  | { ok: false; error: string };

function bookingCheckoutConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

async function createBookingCheckoutSession(input: {
  booking: BookingActionBooking;
  origin?: string;
}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  const stripe = new Stripe(secretKey);
  const origin = input.origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const amount = Math.max(50, Math.round(input.booking.totalPrice * 100));

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.booking.clientEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: amount,
          product_data: {
            name: `MindReply ${input.booking.mode} session with ${input.booking.professionalName}`,
            description: `${input.booking.durationMinutes} minute ${input.booking.mode} consultation`,
          },
        },
      },
    ],
    success_url: `${origin.replace(/\/$/, "")}/session/${input.booking.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin.replace(/\/$/, "")}/book/${input.booking.professionalId}?checkout=cancelled&booking=${input.booking.id}`,
    metadata: {
      type: "booking",
      bookingId: String(input.booking.id),
      professionalId: String(input.booking.professionalId),
      mode: input.booking.mode,
    },
  });
}

export async function createBookingAction(input: BookingActionInput): Promise<BookingActionResult> {
  if (!input.professionalId || !input.mode || !input.scheduledAt || !input.durationMinutes || !input.clientName || !input.clientEmail) {
    return { ok: false, error: "Missing required booking fields" };
  }

  if (!hasDatabaseUrl()) {
    const professional = fallbackProfessionals.find((p) => p.id === Number(input.professionalId));
    if (!professional) return { ok: false, error: "Professional not found" };

    const pricePerHour = input.mode === "text" ? professional.priceText : input.mode === "voice" ? professional.priceVoice : professional.priceVideo;
    return {
      ok: true,
      booking: mapBooking({
        id: Date.now(),
        professionalId: professional.id,
        professionalName: professional.name,
        mode: input.mode,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        totalPrice: pricePerHour * (input.durationMinutes / 60),
        status: "confirmed",
        paymentStatus: "local_fallback",
        stripeSessionId: null,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        notes: input.notes ?? null,
      }),
      checkoutUrl: null,
      paymentRequired: false,
    };
  }

  const [professional] = await db.select().from(professionalsTable).where(eq(professionalsTable.id, input.professionalId));
  if (!professional) return { ok: false, error: "Professional not found" };

  const pricePerHour = input.mode === "text" ? professional.priceText : input.mode === "voice" ? professional.priceVoice : professional.priceVideo;
  const stripeEnabled = bookingCheckoutConfigured();
  const [booking] = await db.insert(bookingsTable).values({
    professionalId: input.professionalId,
    professionalName: professional.name,
    mode: input.mode,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    totalPrice: pricePerHour * (input.durationMinutes / 60),
    status: stripeEnabled ? "pending" : "confirmed",
    paymentStatus: stripeEnabled ? "checkout_pending" : "manual_confirmed",
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    notes: input.notes ?? null,
  }).returning();

  const mapped = mapBooking(booking);
  if (!stripeEnabled) {
    return { ok: true, booking: mapped, checkoutUrl: null, paymentRequired: false };
  }

  const checkout = await createBookingCheckoutSession({ booking: mapped, origin: input.origin });
  if (!checkout?.url) {
    return { ok: false, error: "Unable to create booking checkout session." };
  }

  const [updated] = await db.update(bookingsTable)
    .set({ stripeSessionId: checkout.id })
    .where(eq(bookingsTable.id, mapped.id))
    .returning();

  return { ok: true, booking: mapBooking(updated ?? booking), checkoutUrl: checkout.url, paymentRequired: true };
}
