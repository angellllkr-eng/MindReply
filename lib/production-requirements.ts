export type ProductionRequirement = {
  service: string;
  keys: string[];
  healthCheck: string;
  publicValue: boolean;
  unlocks: string;
};

export const productionRequirements: ProductionRequirement[] = [
  {
    service: "Site URL",
    keys: ["NEXT_PUBLIC_SITE_URL"],
    healthCheck: "siteUrl",
    publicValue: true,
    unlocks: "Canonical URLs, redirects, checkout return URLs, SEO metadata, and smoke/audit consistency.",
  },
  {
    service: "Database",
    keys: ["DATABASE_URL"],
    healthCheck: "database",
    publicValue: false,
    unlocks: "Persistent professionals, bookings, lexicons, memberships, users, metrics, and seed/migration workflows.",
  },
  {
    service: "Clerk Auth",
    keys: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY", "ADMIN_CLERK_IDS"],
    healthCheck: "auth",
    publicValue: false,
    unlocks: "Login, signup, protected dashboard, admin access, sessions, and sign-out behavior.",
  },
  {
    service: "Stripe Checkout",
    keys: ["STRIPE_SECRET_KEY", "STRIPE_PRICE_CURATOR", "STRIPE_PRICE_STRATEGIST", "STRIPE_PRICE_SOVEREIGN"],
    healthCheck: "stripe",
    publicValue: false,
    unlocks: "Membership checkout, purchase confirmation, dashboard access activation, and paid workflow delivery.",
  },
  {
    service: "Stripe Webhooks",
    keys: ["STRIPE_WEBHOOK_SECRET"],
    healthCheck: "stripeWebhook",
    publicValue: false,
    unlocks: "Signed checkout/subscription events, payment failure tracking, and membership event metrics.",
  },
  {
    service: "Professional Booking Checkout",
    keys: ["DATABASE_URL", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    healthCheck: "bookingPayments",
    publicValue: false,
    unlocks: "Paid professional bookings, pending-to-confirmed session delivery, Stripe return verification, and booking webhook fulfillment.",
  },
  {
    service: "Analytics",
    keys: ["NEXT_PUBLIC_GTM_ID", "NEXT_PUBLIC_GOOGLE_ADS_ID", "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL", "NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL", "NEXT_PUBLIC_META_PIXEL_ID"],
    healthCheck: "analytics",
    publicValue: true,
    unlocks: "GTM, Google Ads conversions, Meta Pixel events, solution-page conversion intent, and checkout conversion tracking.",
  },
  {
    service: "Monitoring",
    keys: ["SENTRY_DSN"],
    healthCheck: "monitoring",
    publicValue: false,
    unlocks: "Production monitoring test events, alert routing, and Sentry issue verification.",
  },
  {
    service: "Twice-Daily Ops Reports",
    keys: ["RESEND_API_KEY", "OPS_REPORT_TO", "OPS_REPORT_FROM", "CRON_SECRET"],
    healthCheck: "opsReports",
    publicValue: false,
    unlocks: "Permanent-agent reporting, 10-sales/day observer emails, recruiter handoffs, and twice-daily executive updates.",
  },
  {
    service: "Azure OpenAI",
    keys: ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_DEPLOYMENT", "AZURE_OPENAI_API_VERSION"],
    healthCheck: "azureOpenAI",
    publicValue: false,
    unlocks: "Advanced MRagent intelligence, micro-tool processing, and background reasoning expansion.",
  },
];

function hasEnvValue(key: string) {
  return Boolean(process.env[key]?.trim());
}

export function isProductionRequirementConfigured(healthCheck: string) {
  const requirement = productionRequirements.find((item) => item.healthCheck === healthCheck);
  return Boolean(requirement && requirement.keys.every(hasEnvValue));
}

export function summarizeProductionRequirements(checks: Record<string, unknown>) {
  return productionRequirements.map((requirement) => ({
    ...requirement,
    status: checks[requirement.healthCheck] === "configured" ? "configured" : "fallback",
  }));
}
