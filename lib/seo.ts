export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mind-reply.com").replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const targetMarkets = [
  { country: "United Kingdom", code: "GB", priority: "primary" },
  { country: "United States", code: "US", priority: "primary" },
  { country: "Canada", code: "CA", priority: "primary" },
  { country: "Australia", code: "AU", priority: "primary" },
  { country: "Germany", code: "DE", priority: "growth" },
  { country: "Singapore", code: "SG", priority: "growth" },
  { country: "India", code: "IN", priority: "growth" },
  { country: "Ireland", code: "IE", priority: "growth" },
  { country: "Netherlands", code: "NL", priority: "growth" },
  { country: "United Arab Emirates", code: "AE", priority: "growth" },
] as const;

export const seoMarketKeywords = [
  "AI communication intelligence UK",
  "executive communication AI United Kingdom",
  "professional email polisher USA",
  "legal communication AI Canada",
  "financial advisor communication tool Australia",
  "psychologist communication software Germany",
  "AI executive coaching Singapore",
  "professional rewrite tool India",
  "high trust business communication worldwide",
  "multilingual communication intelligence platform",
];

export const publicRoutes = [
  "/",
  "/agent",
  "/professionals",
  "/bookings",
  "/tools",
  "/tools/text-refiner",
  "/tools/email-polisher",
  "/memberships",
  "/premium",
  "/enterprise",
  "/lexicons",
  "/lexicons/clinical-psychologist",
  "/case-studies",
  "/ethics",
  "/privacy",
  "/terms",
];

export const revenueToolRoutes = [
  "/tools/tone-calibrator",
  "/tools/structure-architect",
  "/tools/professional-rewrite",
  "/tools/clarity-booster",
  "/tools/call-scripter",
  "/tools/planning-assistant",
];

export type SolutionPage = {
  slug: string;
  audience: string;
  title: string;
  description: string;
  pain: string;
  offer: string;
  proofPoints: string[];
  useCases: string[];
  primaryHref: string;
  primaryLabel: string;
};

export const solutionPages: SolutionPage[] = [
  {
    slug: "psychologists",
    audience: "Psychologists and clinical practices",
    title: "AI Communication Intelligence for Psychologists",
    description:
      "Refine clinical correspondence, boundary-setting language, client updates, and interdisciplinary messages with calm, ethical precision.",
    pain: "Clinical professionals lose time rewriting sensitive messages where tone, consent, scope, and clarity all matter.",
    offer: "MindReply gives psychologists a private toolkit for therapeutic register, crisis-sensitive phrasing, and professional booking support.",
    proofPoints: ["Clinical lexicon access", "Boundary language templates", "Professional session booking", "Ethical communication framework"],
    useCases: ["Client follow-up emails", "Boundary-setting messages", "Referral and care-team updates", "Crisis-safe response drafts"],
    primaryHref: "/tools/email-polisher?audience=psychologists",
    primaryLabel: "Refine a Clinical Email",
  },
  {
    slug: "legal-counsel",
    audience: "Legal counsel and compliance teams",
    title: "AI Communication Intelligence for Legal Counsel",
    description:
      "Turn legal, compliance, and client-facing drafts into precise correspondence that reduces ambiguity and preserves professional authority.",
    pain: "Legal teams need fast language that is clear, measured, risk-aware, and appropriate for high-stakes client or stakeholder conversations.",
    offer: "MindReply supports counsel with executive-grade email polishing, structure checks, and discipline-specific language refinement.",
    proofPoints: ["Risk-aware wording", "Executive correspondence polish", "Structure and clarity checks", "Professional network access"],
    useCases: ["Client status updates", "Compliance reminders", "Negotiation follow-ups", "Internal risk briefings"],
    primaryHref: "/tools/structure-architect?audience=legal-counsel",
    primaryLabel: "Structure a Legal Message",
  },
  {
    slug: "executives",
    audience: "Founders, executives, and chiefs of staff",
    title: "Executive Communication Intelligence for High-Stakes Leadership",
    description:
      "Write restructuring updates, board notes, client escalations, and leadership messages with clarity, confidence, and strategic restraint.",
    pain: "Leaders cannot afford reactive communication when one message can affect trust, speed, retention, or client confidence.",
    offer: "MindReply gives executives a premium workspace for message architecture, tone calibration, and decision-ready communication.",
    proofPoints: ["Tone calibration", "Decision memo structure", "Leadership message refinement", "Behavioral analytics"],
    useCases: ["Restructuring updates", "Board and investor notes", "Client escalation responses", "Team alignment messages"],
    primaryHref: "/agent?audience=executives",
    primaryLabel: "Start with MRagent",
  },
  {
    slug: "financial-advisors",
    audience: "Financial advisors and wealth teams",
    title: "AI Communication Intelligence for Financial Advisors",
    description:
      "Refine client updates, market explanations, planning notes, and sensitive financial conversations with composed professional language.",
    pain: "Advisors need trust-building language that explains risk, decisions, and uncertainty without sounding vague or alarmist.",
    offer: "MindReply helps advisory teams polish client correspondence and standardize calm, high-trust communication.",
    proofPoints: ["Trust-focused client language", "Risk explanation support", "Planning note refinement", "Premium membership workflow"],
    useCases: ["Market volatility updates", "Portfolio review follow-ups", "Planning next steps", "Sensitive client reassurance"],
    primaryHref: "/tools/text-refiner?audience=financial-advisors",
    primaryLabel: "Refine a Client Note",
  },
];
