import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillBookingCheckoutSession, isBookingCheckoutSession } from "@/lib/fulfillment";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({
      configured: false,
      confirmed: false,
      status: "stripe_not_configured",
      fulfillment: { persisted: false, reason: "stripe_not_configured" },
    });
  }

  if (!sessionId) {
    return NextResponse.json({
      configured: true,
      confirmed: false,
      status: "missing_session_id",
      fulfillment: { persisted: false, reason: "missing_session_id" },
    }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!isBookingCheckoutSession(session)) {
      return NextResponse.json({
        configured: true,
        confirmed: false,
        status: "not_booking_session",
        fulfillment: { persisted: false, reason: "not_booking_session" },
      }, { status: 400 });
    }

    const fulfillment = await fulfillBookingCheckoutSession(session);

    return NextResponse.json({
      configured: true,
      confirmed: fulfillment.confirmed,
      status: session.status,
      paymentStatus: session.payment_status,
      bookingId: fulfillment.bookingId,
      fulfillment: {
        persisted: fulfillment.persisted,
        reason: fulfillment.reason ?? null,
      },
    });
  } catch (error) {
    console.error("Booking checkout session lookup failed:", error);
    return NextResponse.json({
      configured: true,
      confirmed: false,
      status: "lookup_failed",
      fulfillment: { persisted: false, reason: "lookup_failed" },
    }, { status: 500 });
  }
}
