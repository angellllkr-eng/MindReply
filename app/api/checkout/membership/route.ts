import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const priceEnvByTier = {
  growth: ["STRIPE_PRICE_GROWTH", "STRIPE_PRICE_CURATOR"],
  pro: ["STRIPE_PRICE_PRO", "STRIPE_PRICE_STRATEGIST"],
  curator: ["STRIPE_PRICE_GROWTH", "STRIPE_PRICE_CURATOR"],
  strategist: ["STRIPE_PRICE_PRO", "STRIPE_PRICE_STRATEGIST"],
  sovereign: ["STRIPE_PRICE_PRO", "STRIPE_PRICE_SOVEREIGN", "STRIPE_PRICE_STRATEGIST"],
} as const;

type Tier = keyof typeof priceEnvByTier;

function isTier(value: string): value is Tier {
  return value in priceEnvByTier;
}

function normalizeCheckoutTier(value: Tier) {
  if (value === "curator") return "growth";
  if (value === "strategist" || value === "sovereign") return "pro";
  return value;
}

function findPriceId(tier: Tier) {
  const envNames = priceEnvByTier[tier];
  const found = envNames.find((name) => process.env[name]?.trim());
  return {
    priceId: found ? process.env[found] : "",
    priceEnv: found ?? envNames[0],
    envNames,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { tier?: unknown } | null;
    const { tier } = body ?? {};
    const requestedTier = String(tier ?? "").toLowerCase();

    if (requestedTier === "signal") {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
      return NextResponse.json({
        id: null,
        url: `${origin.replace(/\/$/, "")}/dashboard?checkout=signal&tier=signal`,
        configured: true,
        free: true,
      });
    }

    if (!isTier(requestedTier)) {
      return NextResponse.json({ error: "Unknown membership tier" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const checkoutTier = normalizeCheckoutTier(requestedTier);
    const { priceId, priceEnv, envNames } = findPriceId(requestedTier);

    if (!secretKey || !priceId) {
      return NextResponse.json({
        error: "Stripe checkout is not configured yet.",
        configured: false,
        missing: [!secretKey ? "STRIPE_SECRET_KEY" : "", !priceId ? envNames.join(" or ") : ""].filter(Boolean),
      }, { status: 501 });
    }

    const stripe = new Stripe(secretKey);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}&tier=${checkoutTier}`,
      cancel_url: `${origin}/memberships?checkout=cancelled&tier=${checkoutTier}`,
      metadata: { tier: checkoutTier, requestedTier, priceEnv },
    });

    return NextResponse.json({ id: session.id, url: session.url, configured: true });
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
