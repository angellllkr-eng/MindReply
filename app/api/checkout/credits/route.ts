import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const creditPacks = {
  "5": { credits: 5, amount: 900, label: "MindReply 5 credit pack" },
  "20": { credits: 20, amount: 2900, label: "MindReply 20 credit pack" },
} as const;

type CreditPack = keyof typeof creditPacks;

function isCreditPack(value: string): value is CreditPack {
  return value in creditPacks;
}

export async function GET() {
  return NextResponse.json({
    status: process.env.STRIPE_SECRET_KEY ? "configured" : "fallback",
    configured: Boolean(process.env.STRIPE_SECRET_KEY),
    packs: Object.values(creditPacks).map(({ credits, amount, label }) => ({ credits, amount, label })),
    requiredEnv: ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_SITE_URL"],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { credits?: unknown; email?: unknown } | null;
    const requestedPack = String(body?.credits ?? "");

    if (!isCreditPack(requestedPack)) {
      return NextResponse.json({ error: "Unknown credit pack" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({
        error: "Stripe credit checkout is not configured yet.",
        configured: false,
        missing: ["STRIPE_SECRET_KEY"],
      }, { status: 501 });
    }

    const pack = creditPacks[requestedPack];
    const stripe = new Stripe(secretKey);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const customerEmail = typeof body?.email === "string" && body.email.includes("@") ? body.email : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: pack.amount,
            product_data: {
              name: pack.label,
              description: `${pack.credits} MindReply micro-tool credits for text, email, tone, lexicon, and planning tools.`,
            },
          },
        },
      ],
      allow_promotion_codes: true,
      success_url: `${origin.replace(/\/$/, "")}/dashboard?checkout=credits_success&credits=${pack.credits}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin.replace(/\/$/, "")}/?checkout=credits_cancelled&credits=${pack.credits}`,
      metadata: {
        type: "credits",
        credits: String(pack.credits),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url, configured: true });
  } catch (error) {
    console.error("Stripe credit checkout failed:", error);
    return NextResponse.json({ error: "Stripe credit checkout failed" }, { status: 500 });
  }
}
