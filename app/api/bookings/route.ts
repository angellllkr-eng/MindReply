import { NextRequest, NextResponse } from "next/server";
import { db, bookingsTable, professionalsTable } from "@/lib/db";
import { fallbackBookings, fallbackProfessionals, type BookingDto } from "@/lib/fallback-data";
import { eq } from "drizzle-orm";

function mapBooking(b: typeof bookingsTable.$inferSelect) {
  return {
    id: b.id, professionalId: b.professionalId, professionalName: b.professionalName,
    mode: b.mode, scheduledAt: b.scheduledAt, durationMinutes: b.durationMinutes,
    totalPrice: b.totalPrice, status: b.status, paymentStatus: b.paymentStatus, stripeSessionId: b.stripeSessionId,
    clientName: b.clientName, clientEmail: b.clientEmail, notes: b.notes,
  };
}

function mapFallbackBooking(b: BookingDto) {
  return b;
}

export async function GET() {
  try {
    const rows = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);
    return NextResponse.json(rows.map(mapBooking));
  } catch (err) {
    console.warn("Using fallback bookings:", err);
    return NextResponse.json(fallbackBookings.map(mapFallbackBooking));
  }
}

export async function POST(req: NextRequest) {
  const { professionalId, mode, scheduledAt, durationMinutes, clientName, clientEmail, notes } = await req.json();

  if (!professionalId || !mode || !scheduledAt || !durationMinutes || !clientName || !clientEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const [professional] = await db.select().from(professionalsTable).where(eq(professionalsTable.id, professionalId));
    if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    const pricePerHour =
      mode === "text" ? professional.priceText :
      mode === "voice" ? professional.priceVoice :
      professional.priceVideo;

    const totalPrice = pricePerHour * (durationMinutes / 60);

    const [booking] = await db.insert(bookingsTable).values({
      professionalId, professionalName: professional.name, mode, scheduledAt,
      durationMinutes, totalPrice, status: "confirmed",
      paymentStatus: "manual_confirmed",
      clientName, clientEmail, notes: notes ?? null,
    }).returning();

    return NextResponse.json(mapBooking(booking), { status: 201 });
  } catch (err) {
    console.warn("Creating fallback booking:", err);
    const professional = fallbackProfessionals.find((p) => p.id === Number(professionalId));
    if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    const pricePerHour =
      mode === "text" ? professional.priceText :
      mode === "voice" ? professional.priceVoice :
      professional.priceVideo;

    return NextResponse.json({
      id: Date.now(),
      professionalId: professional.id,
      professionalName: professional.name,
      mode,
      scheduledAt,
      durationMinutes,
      totalPrice: pricePerHour * (Number(durationMinutes) / 60),
      status: "confirmed",
      paymentStatus: "local_fallback",
      stripeSessionId: null,
      clientName,
      clientEmail,
      notes: notes ?? null,
    }, { status: 201 });
  }
}
