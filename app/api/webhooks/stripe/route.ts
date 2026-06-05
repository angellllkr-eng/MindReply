import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, metricsTable } from "@/lib/db";

const handledEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
]);

async function recordStripeEvent(event: Stripe.Event) {
  try {
    await db.insert(metricsTable).values({
      eventName: `stripe.${event.type}`,
      eventValue: JSON.stringify({
        id: event.id,
        livemode: event.livemode,
        created: event.created,
      }),
    });
  } catch (error) {
    console.warn("Stripe event metric fallback:", error);
  }
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({
      configured: false,
      error: "Stripe webhook is not configured.",
    }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const payload = await req.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  if (handledEvents.has(event.type)) {
    await recordStripeEvent(event);
  }

  return NextResponse.json({
    received: true,
    handled: handledEvents.has(event.type),
    type: event.type,
  });
}
