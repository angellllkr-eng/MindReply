import { desc } from "drizzle-orm";
import { bookingsTable, db, hasDatabaseUrl, metricsTable } from "@/lib/db";

export type RevenueObservation = {
  status: "green" | "amber" | "red" | "blocked";
  generatedAt: string;
  targetPerDay: number;
  todaySales: number | null;
  requiredRemainingToday: number | null;
  firstWeek: {
    startsAt: string;
    daysElapsed: number;
    targetSales: number;
    actualSales: number | null;
    gap: number | null;
  };
  measurement: {
    source: "database" | "fallback";
    salesSignals: string[];
    notes: string[];
  };
  nextActions: string[];
};

type MetricRow = typeof metricsTable.$inferSelect;
type BookingRow = typeof bookingsTable.$inferSelect;

const salesMetricNames = new Set(["membership.fulfilled", "booking.fulfilled"]);

function numericEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function configuredWeekStart(now: Date) {
  const configured = process.env.OPS_REVENUE_WEEK_START?.trim();
  if (!configured) return startOfUtcDay(now);

  const parsed = new Date(configured.includes("T") ? configured : `${configured}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? startOfUtcDay(now) : parsed;
}

function safeDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseMetricValue(metric: MetricRow) {
  if (!metric.eventValue) return null;
  try {
    return JSON.parse(metric.eventValue) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function metricSalesKey(metric: MetricRow) {
  const payload = parseMetricValue(metric);
  const sessionId = typeof payload?.stripeSessionId === "string" ? payload.stripeSessionId : null;
  const bookingId = typeof payload?.bookingId === "number" || typeof payload?.bookingId === "string" ? payload.bookingId : null;
  return sessionId ? `session:${sessionId}` : bookingId ? `booking:${bookingId}` : `metric:${metric.id}`;
}

function bookingIsPaid(booking: BookingRow) {
  return booking.status === "confirmed" && ["paid", "no_payment_required", "complete"].includes(booking.paymentStatus);
}

function countSalesBetween(metrics: MetricRow[], bookings: BookingRow[], startsAt: Date, endsAt: Date) {
  const sales = new Set<string>();

  for (const metric of metrics) {
    const createdAt = safeDate(metric.createdAt);
    if (!createdAt || createdAt < startsAt || createdAt > endsAt) continue;
    if (salesMetricNames.has(metric.eventName)) {
      sales.add(metricSalesKey(metric));
    }
  }

  for (const booking of bookings) {
    const createdAt = safeDate(booking.createdAt);
    if (!createdAt || createdAt < startsAt || createdAt > endsAt) continue;
    if (bookingIsPaid(booking)) {
      sales.add(`booking:${booking.id}`);
    }
  }

  return sales.size;
}

function statusFor(todaySales: number, targetPerDay: number): RevenueObservation["status"] {
  if (todaySales >= targetPerDay) return "green";
  if (todaySales >= Math.ceil(targetPerDay / 2)) return "amber";
  return "red";
}

export async function getRevenueObservation(now = new Date()): Promise<RevenueObservation> {
  const targetPerDay = numericEnv("OPS_REPORT_SALES_TARGET", 10);
  const todayStart = startOfUtcDay(now);
  const weekStart = configuredWeekStart(now);
  const dayMs = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.max(1, Math.min(7, Math.ceil((now.getTime() - weekStart.getTime() + 1) / dayMs)));

  if (!hasDatabaseUrl()) {
    return {
      status: "blocked",
      generatedAt: now.toISOString(),
      targetPerDay,
      todaySales: null,
      requiredRemainingToday: null,
      firstWeek: {
        startsAt: weekStart.toISOString(),
        daysElapsed,
        targetSales: targetPerDay * 7,
        actualSales: null,
        gap: null,
      },
      measurement: {
        source: "fallback",
        salesSignals: ["membership.fulfilled", "booking.fulfilled", "confirmed paid bookings"],
        notes: ["DATABASE_URL is required before sales can be counted from production events."],
      },
      nextActions: [
        "Set DATABASE_URL in production.",
        "Run database migrations.",
        "Verify Stripe webhook fulfillment is logging membership.fulfilled and booking.fulfilled events.",
      ],
    };
  }

  try {
    const [metrics, bookings] = await Promise.all([
      db.select().from(metricsTable).orderBy(desc(metricsTable.id)).limit(1000),
      db.select().from(bookingsTable),
    ]);

    const todaySales = countSalesBetween(metrics, bookings, todayStart, now);
    const weekSales = countSalesBetween(metrics, bookings, weekStart, now);
    const gap = Math.max(0, targetPerDay * 7 - weekSales);

    return {
      status: statusFor(todaySales, targetPerDay),
      generatedAt: now.toISOString(),
      targetPerDay,
      todaySales,
      requiredRemainingToday: Math.max(0, targetPerDay - todaySales),
      firstWeek: {
        startsAt: weekStart.toISOString(),
        daysElapsed,
        targetSales: targetPerDay * 7,
        actualSales: weekSales,
        gap,
      },
      measurement: {
        source: "database",
        salesSignals: ["membership.fulfilled", "booking.fulfilled", "confirmed paid bookings"],
        notes: [
          "Counts confirmed Stripe membership fulfillment and paid booking fulfillment signals.",
          "Use Stripe dashboard as the financial source of truth for payout and dispute reconciliation.",
        ],
      },
      nextActions: todaySales >= targetPerDay
        ? ["Keep tracking checkout completion and protect ad spend against broken provider checks."]
        : [
            "Do not scale paid ads until checkout, analytics, and webhook checks are configured.",
            "Prioritize UK solution campaigns with verified conversion events.",
            "Review failed checkouts and trigger member follow-up within the same day.",
          ],
    };
  } catch (error) {
    console.warn("Revenue observation fallback:", error);
    return {
      status: "blocked",
      generatedAt: now.toISOString(),
      targetPerDay,
      todaySales: null,
      requiredRemainingToday: null,
      firstWeek: {
        startsAt: weekStart.toISOString(),
        daysElapsed,
        targetSales: targetPerDay * 7,
        actualSales: null,
        gap: null,
      },
      measurement: {
        source: "fallback",
        salesSignals: ["membership.fulfilled", "booking.fulfilled", "confirmed paid bookings"],
        notes: ["Revenue observer could not query the production database."],
      },
      nextActions: ["Check DATABASE_URL, migrations, and metrics/bookings table health."],
    };
  }
}
