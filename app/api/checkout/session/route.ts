import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const validTiers = ["curator", "strategist", "sovereign"] as const;
type Tier = (typeof validTiers)[number];

function normalizeTier(value: string | null): Tier {
  const tier = String(value ?? "").toLowerCase();
  return validTiers.includes(tier as Tier) ? tier as Tier : "strategist";
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const fallbackTier = normalizeTier(req.nextUrl.searchParams.get("tier"));
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({
      configured: false,
      confirmed: false,
      status: "stripe_not_configured",
      paymentStatus: "unknown",
      tier: fallbackTier,
    });
  }

  if (!sessionId) {
    return NextResponse.json({
      configured: true,
      confirmed: false,
      status: "missing_session_id",
      paymentStatus: "unknown",
      tier: fallbackTier,
    }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const tier = normalizeTier(session.metadata?.tier ?? fallbackTier);
    const confirmed = session.status === "complete" || session.payment_status === "paid" || session.payment_status === "no_payment_required";

    return NextResponse.json({
      configured: true,
      confirmed,
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      tier,
      customerEmail: session.customer_details?.email ?? null,
    });
  } catch (error) {
    console.error("Stripe session lookup failed:", error);
    return NextResponse.json({
      configured: true,
      confirmed: false,
      status: "lookup_failed",
      paymentStatus: "unknown",
      tier: fallbackTier,
    }, { status: 500 });
  }
}
