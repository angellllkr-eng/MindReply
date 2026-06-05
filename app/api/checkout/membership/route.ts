import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const priceEnvByTier = {
  curator: "STRIPE_PRICE_CURATOR",
  strategist: "STRIPE_PRICE_STRATEGIST",
  sovereign: "STRIPE_PRICE_SOVEREIGN",
} as const;

type Tier = keyof typeof priceEnvByTier;

function isTier(value: string): value is Tier {
  return value in priceEnvByTier;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { tier?: unknown } | null;
    const { tier } = body ?? {};
    const requestedTier = String(tier ?? "").toLowerCase();

    if (!isTier(requestedTier)) {
      return NextResponse.json({ error: "Unknown membership tier" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceEnv = priceEnvByTier[requestedTier];
    const priceId = process.env[priceEnv];

    if (!secretKey || !priceId) {
      return NextResponse.json({
        error: "Stripe checkout is not configured yet.",
        configured: false,
        missing: [!secretKey ? "STRIPE_SECRET_KEY" : "", !priceId ? priceEnv : ""].filter(Boolean),
      }, { status: 501 });
    }

    const stripe = new Stripe(secretKey);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}&tier=${requestedTier}`,
      cancel_url: `${origin}/memberships?checkout=cancelled&tier=${requestedTier}`,
      metadata: { tier: requestedTier },
    });

    return NextResponse.json({ id: session.id, url: session.url, configured: true });
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
