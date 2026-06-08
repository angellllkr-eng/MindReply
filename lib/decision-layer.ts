export const forbiddenPublicTerms = ["ai", "chatbot", "productivity", "automation", "options", "boost", "hack"] as const;

export const redirectedPublicPaths = [
  "/agent",
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
  };
};

const highRiskTerms = ["threat", "force", "blackmail", "harass", "illegal", "lawsuit", "regulator"];
const mediumRiskTerms = ["complaint", "refund", "termination", "medical", "legal", "fire"];

function cleanInput(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function makeReceiptId(input: string, timestamp: string) {
  let hash = 0;
  const value = `${timestamp}:${input}`;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `mr-${Math.abs(hash).toString(36)}`;
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
    },
  };
}

export function isRedirectedPublicPath(pathname: string) {
  return redirectedPublicPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
