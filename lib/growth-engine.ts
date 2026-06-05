import { solutionPages, targetMarkets } from "@/lib/seo";

export type GrowthAction = {
  id: string;
  priority: "P0" | "P1" | "P2";
  ownerField: string;
  action: string;
  expectedSignal: string;
};

export function getGrowthPlan() {
  const actions: GrowthAction[] = [
    {
      id: "MR-GROWTH-01",
      priority: "P0",
      ownerField: "Platform Operations",
      action: "Keep /api/health fully configured and pause paid ads if checkout, auth, analytics, or monitoring are fallback.",
      expectedSignal: "Reliable visitor-to-payment path.",
    },
    {
      id: "MR-GROWTH-02",
      priority: "P0",
      ownerField: "Growth And Sales",
      action: "Launch UK solution campaigns first and verify solution_landing_conversion_intent before scaling budget.",
      expectedSignal: "Qualified UK visitors reaching solution pages.",
    },
    {
      id: "MR-GROWTH-03",
      priority: "P1",
      ownerField: "Content And SEO",
      action: "Publish country-specific copy variants for UK, US, Canada, Australia, Germany, Singapore, India, Ireland, Netherlands, and UAE.",
      expectedSignal: "Higher organic impressions and market-relevant landing engagement.",
    },
    {
      id: "MR-GROWTH-04",
      priority: "P1",
      ownerField: "Payments And Membership",
      action: "Review failed checkouts daily and fix the highest-friction tier or payment method.",
      expectedSignal: "Higher checkout completion and lower payment abandonment.",
    },
    {
      id: "MR-GROWTH-05",
      priority: "P1",
      ownerField: "Data And Intelligence",
      action: "Compare page views, solution intent, checkout starts, and paid conversions by market every day.",
      expectedSignal: "Budget shifts toward markets with strongest conversion intent.",
    },
    {
      id: "MR-GROWTH-06",
      priority: "P2",
      ownerField: "Professional Advisory",
      action: "Add professional desks in the markets and fields producing the highest booking demand.",
      expectedSignal: "More available specialists in high-intent niches.",
    },
  ];

  return {
    status: "ready",
    rhythm: "daily growth review with weekly market expansion",
    conversionFunnel: [
      "Visitor lands on market/audience solution page",
      "Analytics records solution_landing_conversion_intent",
      "Visitor enters tool, professional booking, or membership checkout",
      "Stripe confirms payment or booking confirms session",
      "Dashboard/session room delivers product and referral loop",
      "Operators review market and funnel signals for the next expansion action",
    ],
    marketLaunches: targetMarkets.map((market, index) => ({
      id: `MR-GROWTH-MARKET-${String(index + 1).padStart(2, "0")}`,
      country: market.country,
      code: market.code,
      priority: market.priority,
      landingPages: solutionPages.map((page) => `/solutions/${page.slug}`),
    })),
    actions,
  };
}
