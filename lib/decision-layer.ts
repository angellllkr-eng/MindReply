export const forbiddenPublicTerms = ["ai", "chatbot", "productivity", "automation", "options", "boost", "hack"] as const;

export const redirectedPublicPaths = [
  "/analytics",
  "/book",
  "/booking",
  "/bookings",
  "/case-studies",
  "/dashboard",
  "/enterprise",
  "/ethics",
  "/forgot-password",
  "/integrations",
  "/lexicons",
  "/login",
  "/memberships",
  "/orchestrator",
  "/premium",
  "/professionals",
  "/rescue",
  "/session",
  "/sign-in",
  "/sign-up",
  "/signup",
  "/solutions",
  "/subconscious",
  "/tasks",
  "/terms",
  "/tools",
] as const;

export type IntakeSource = "manual" | "gmail" | "calendar" | "extension";
export type RecommendedActionKind = "reply" | "schedule" | "resolve" | "escalate";
export type RiskLevel = "low" | "medium" | "high";

export type IntakeRequest = {
  input: string;
  source: IntakeSource;
  userId?: string;
};

export type DecisionResponse = {
  synthesis: string;
  mindRead: {
    reallyAbout: string;
    mindsetProtection: string;
    calmerMove: string;
  };
  recommendedAction: {
    kind: RecommendedActionKind;
    label: string;
    payload: Record<string, string | number | boolean | null>;
  };
  risk: {
    level: RiskLevel;
    reason: string;
  };
  memoryUpdate: {
    applied: boolean;
    summary: string;
  };
  receipt: {
    id: string;
    timestamp: string;
    source: IntakeSource;
    actionKind: RecommendedActionKind;
    riskLevel: RiskLevel;
    confidence: number;
    playbookVersion: string;
    inputHash: string;
    rawContentRedacted: boolean;
  };
};

const highRiskTerms = ["threat", "force", "blackmail", "harass", "illegal", "lawsuit", "regulator"];
const mediumRiskTerms = ["complaint", "refund", "termination", "medical", "legal", "fire"];
const playbookVersion = "mragent-mindread-v1";

function cleanInput(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function makeStableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function makeReceiptId(input: string, timestamp: string) {
  return `mr-${makeStableHash(`${timestamp}:${input}`)}`;
}

function makeInputHash(input: string) {
  return `mrh-${makeStableHash(input)}`;
}

function assessRisk(input: string): DecisionResponse["risk"] {
  const lower = input.toLowerCase();
  if (highRiskTerms.some((term) => lower.includes(term))) {
    return { level: "high", reason: "Risk detected before communication." };
  }
  if (mediumRiskTerms.some((term) => lower.includes(term))) {
    return { level: "medium", reason: "Sensitive context detected; proceed with restraint." };
  }
  return { level: "low", reason: "No blocking risk detected." };
}

function assessConfidence(input: string, risk: DecisionResponse["risk"]) {
  if (!input) return 0.2;
  if (risk.level === "high") return 0.68;
  if (risk.level === "medium") return 0.76;
  return 0.84;
}

function chooseAction(input: string, risk: DecisionResponse["risk"]): RecommendedActionKind {
  if (risk.level === "high") return "escalate";
  const lower = input.toLowerCase();
  if (/(follow up|check in|tomorrow|next week|calendar|later)/.test(lower)) return "schedule";
  if (/(reply|client|email|message|fee|price|response|send)/.test(lower)) return "reply";
  return "resolve";
}

function buildSynthesis(input: string, kind: RecommendedActionKind) {
  if (!input) return "No usable input was provided.";
  if (kind === "escalate") return "This carries risk and needs review before movement.";
  if (kind === "reply") return "This needs a calm response that reduces pressure and preserves the relationship.";
  if (kind === "schedule") return "This needs a quiet follow-up moment rather than more wording now.";
  return "This can be closed with a clear record and no further movement.";
}

function buildMindRead(kind: RecommendedActionKind, risk: DecisionResponse["risk"]): DecisionResponse["mindRead"] {
  if (risk.level === "high" || kind === "escalate") {
    return {
      reallyAbout: "This is not only about wording; it is about preventing pressure from turning into a risky move.",
      mindsetProtection: "You are trying to regain control quickly. The steadier signal is restraint before response.",
      calmerMove: "Do not answer from impact. Hold the message, review the context, and let the next step stay measured.",
    };
  }

  if (kind === "reply") {
    return {
      reallyAbout: "This is less about the surface objection and more about trust, timing, and whether the relationship still feels steady.",
      mindsetProtection: "You are trying to protect the relationship without giving away your position too quickly.",
      calmerMove: "Answer with warmth and limits: acknowledge the concern, name the decision point, and keep the timing clear.",
    };
  }

  if (kind === "schedule") {
    return {
      reallyAbout: "This needs rhythm more than more language. The right move is to place the pressure somewhere contained.",
      mindsetProtection: "You are protecting your attention from being pulled back into the same decision repeatedly.",
      calmerMove: "Set one quiet follow-up moment, then stop carrying it in your head.",
    };
  }

  return {
    reallyAbout: "This is ready to be closed without turning it into a larger decision.",
    mindsetProtection: "You are looking for certainty before moving, but the clean record is enough here.",
    calmerMove: "Mark the decision clearly, keep the receipt, and let it leave your attention.",
  };
}

function buildAction(kind: RecommendedActionKind, synthesis: string): DecisionResponse["recommendedAction"] {
  if (kind === "reply") {
    return {
      kind,
      label: "Send the prepared reply",
      payload: {
        draft:
          "Thank you for being direct. I understand the concern. The next step is to confirm the decision point, protect the relationship, and agree the timing.",
      },
    };
  }
  if (kind === "schedule") {
    return {
      kind,
      label: "Set the follow-up",
      payload: {
        title: "MindReply follow-up",
        delayMinutes: 60,
      },
    };
  }
  if (kind === "escalate") {
    return {
      kind,
      label: "Hold and review",
      payload: {
        reason: synthesis,
      },
    };
  }
  return {
    kind,
    label: "Mark resolved",
    payload: {
      record: synthesis,
    },
  };
}

export function buildDecisionResponse(request: IntakeRequest): DecisionResponse {
  const input = cleanInput(request.input);
  const timestamp = new Date().toISOString();
  const risk = assessRisk(input);
  const kind = chooseAction(input, risk);
  const synthesis = buildSynthesis(input, kind);

  return {
    synthesis,
    mindRead: buildMindRead(kind, risk),
    recommendedAction: buildAction(kind, synthesis),
    risk,
    memoryUpdate: {
      applied: true,
      summary: "Decision memory adjusted quietly.",
    },
    receipt: {
      id: makeReceiptId(input, timestamp),
      timestamp,
      source: request.source,
      actionKind: kind,
      riskLevel: risk.level,
      confidence: assessConfidence(input, risk),
      playbookVersion,
      inputHash: makeInputHash(input),
      rawContentRedacted: true,
    },
  };
}

export function isRedirectedPublicPath(pathname: string) {
  return redirectedPublicPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
