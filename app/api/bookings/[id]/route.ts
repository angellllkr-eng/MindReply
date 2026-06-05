import { NextRequest, NextResponse } from "next/server";
import { db, bookingsTable } from "@/lib/db";
import { fallbackBookings, type BookingDto } from "@/lib/fallback-data";
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const [b] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
    if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapBooking(b));
  } catch (err) {
    console.warn("Using fallback booking detail:", err);
    const booking = fallbackBookings.find((b) => b.id === id);
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapFallbackBooking(booking));
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { status } = await req.json();
  if (!status) return NextResponse.json({ error: "status is required" }, { status: 400 });

  try {
    const [b] = await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, id)).returning();
    if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapBooking(b));
  } catch (err) {
    console.warn("Updating fallback booking detail:", err);
    const booking = fallbackBookings.find((b) => b.id === id);
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapFallbackBooking({ ...booking, status }));
  }
}
