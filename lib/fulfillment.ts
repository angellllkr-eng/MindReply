import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { bookingsTable, db, hasDatabaseUrl, usersTable } from "@/lib/db";
import { logMetric } from "@/lib/metrics";

export type MembershipTier = "signal" | "growth" | "pro";

export type MembershipEntitlement = {
  tier: MembershipTier;
  name: string;
  creditsMonthly: number | "unlimited";
  toolAccess: "core" | "full" | "full-plus";
  lexiconAccess: "starter" | "all" | "custom";
  bookingPriority: "standard" | "priority" | "white-glove";
  dashboardAccess: "member" | "analytics" | "executive";
  supportLevel: string;
  deliveredProducts: string[];
};

export type FulfillmentInput = {
  tier: unknown;
  email?: string | null;
  name?: string | null;
  source: "checkout_session" | "stripe_webhook" | "manual_admin";
  stripeCustomerId?: string | null;
  stripeSessionId?: string | null;
  stripeSubscriptionId?: string | null;
};

export type FulfillmentResult = {
  entitlement: MembershipEntitlement;
  persisted: boolean;
  reason?: "database_not_configured" | "missing_email" | "database_error";
};

export type BookingFulfillmentResult = {
  bookingId: number | null;
  confirmed: boolean;
  persisted: boolean;
  reason?: "database_not_configured" | "missing_booking_id" | "payment_not_confirmed" | "booking_not_found" | "database_error";
};

const entitlements: Record<MembershipTier, MembershipEntitlement> = {
  signal: {
    tier: "signal",
    name: "Signal",
    creditsMonthly: 0,
    toolAccess: "core",
    lexiconAccess: "starter",
    bookingPriority: "standard",
    dashboardAccess: "member",
    supportLevel: "Self-serve Signal workspace",
    deliveredProducts: [
      "Starter MRagent access",
      "Signal clarity workspace",
      "Professional marketplace browsing",
      "Upgrade prompts for memory and integrations",
    ],
  },
  growth: {
    tier: "growth",
    name: "Growth",
    creditsMonthly: 50,
    toolAccess: "full",
    lexiconAccess: "all",
    bookingPriority: "priority",
    dashboardAccess: "analytics",
    supportLevel: "Growth member support",
    deliveredProducts: [
      "30 days context memory",
      "Core micro-tool suite",
      "Growth dashboard",
      "Professional booking priority",
      "Signal-to-Growth upgrade workspace",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    creditsMonthly: "unlimited",
    toolAccess: "full-plus",
    lexiconAccess: "custom",
    bookingPriority: "white-glove",
    dashboardAccess: "executive",
    supportLevel: "Pro operator support and integration priority",
    deliveredProducts: [
      "Unlimited context memory",
      "Slack, Gmail, and Notion integration path",
      "Character Profiles",
      "Momentum Clarity",
      "Priority professional booking and operator review",
    ],
  },
};

export function normalizeMembershipTier(value: unknown): MembershipTier {
  const tier = String(value ?? "").toLowerCase();
  if (tier === "signal") return "signal";
  if (tier === "growth" || tier === "curator") return "growth";
  if (tier === "pro" || tier === "strategist" || tier === "sovereign") return "pro";
  return "growth";
}

export function getMembershipEntitlement(value: unknown): MembershipEntitlement {
  return entitlements[normalizeMembershipTier(value)];
}

function displayNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "MindReply Member";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "MindReply Member";
}

function emailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "unknown";
}

function stripeId(value: string | { id?: string } | null) {
  return typeof value === "string" ? value : value?.id ?? null;
}

export function isBookingCheckoutSession(session: Stripe.Checkout.Session) {
  return session.metadata?.type === "booking" && Boolean(session.metadata?.bookingId);
}

export async function fulfillMembershipPurchase(input: FulfillmentInput): Promise<FulfillmentResult> {
  const entitlement = getMembershipEntitlement(input.tier);
  const email = input.email?.trim().toLowerCase();

  if (!email) {
    return { entitlement, persisted: false, reason: "missing_email" };
  }

  if (!hasDatabaseUrl()) {
    return { entitlement, persisted: false, reason: "database_not_configured" };
  }

  try {
    const name = input.name?.trim() || displayNameFromEmail(email);
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (existing[0]) {
      await db.update(usersTable)
        .set({ name, membershipTier: entitlement.tier })
        .where(eq(usersTable.email, email));
    } else {
      await db.insert(usersTable).values({
        name,
        email,
        membershipTier: entitlement.tier,
      });
    }

    await logMetric({
      eventName: "membership.fulfilled",
      eventValue: {
        tier: entitlement.tier,
        source: input.source,
        emailDomain: emailDomain(email),
        stripeCustomerId: input.stripeCustomerId ?? null,
        stripeSessionId: input.stripeSessionId ?? null,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      },
    });

    return { entitlement, persisted: true };
  } catch (error) {
    console.warn("Membership fulfillment skipped:", error);
    return { entitlement, persisted: false, reason: "database_error" };
  }
}

export async function fulfillBookingCheckoutSession(session: Stripe.Checkout.Session): Promise<BookingFulfillmentResult> {
  const bookingId = Number(session.metadata?.bookingId);
  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return { bookingId: null, confirmed: false, persisted: false, reason: "missing_booking_id" };
  }

  const confirmed = session.status === "complete" || session.payment_status === "paid" || session.payment_status === "no_payment_required";
  if (!confirmed) {
    return { bookingId, confirmed: false, persisted: false, reason: "payment_not_confirmed" };
  }

  if (!hasDatabaseUrl()) {
    return { bookingId, confirmed: true, persisted: false, reason: "database_not_configured" };
  }

  try {
    const [booking] = await db.update(bookingsTable)
      .set({
        status: "confirmed",
        paymentStatus: session.payment_status ?? "paid",
        stripeSessionId: session.id,
        stripePaymentIntentId: stripeId(session.payment_intent),
      })
      .where(eq(bookingsTable.id, bookingId))
      .returning();

    if (!booking) {
      return { bookingId, confirmed: true, persisted: false, reason: "booking_not_found" };
    }

    await logMetric({
      eventName: "booking.fulfilled",
      eventValue: {
        bookingId,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        mode: booking.mode,
        professionalId: booking.professionalId,
      },
    });

    return { bookingId, confirmed: true, persisted: true };
  } catch (error) {
    console.warn("Booking fulfillment skipped:", error);
    return { bookingId, confirmed: true, persisted: false, reason: "database_error" };
  }
}
