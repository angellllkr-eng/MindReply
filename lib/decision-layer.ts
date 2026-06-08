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
    return { level: "high", reason: "The pressure could push a move that deserves review before it leaves your hands." };
  }
  if (mediumRiskTerms.some((term) => lower.includes(term))) {
    return { level: "medium", reason: "The situation is tender enough to need slower language and firmer edges." };
  }
  return { level: "low", reason: "No blocking risk detected; this can move with care." };
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
  if (/(follow up|check in|tomorrow|next week|calendar|later|wait|pause)/.test(lower)) return "schedule";
  if (/(reply|client|email|message|fee|price|response|send|say|wording)/.test(lower)) return "reply";
  return "resolve";
}

function buildSynthesis(input: string, kind: RecommendedActionKind) {
  if (!input) return "No usable input was provided.";
  if (kind === "escalate") return "This is not a wording problem yet; it is a restraint problem, and restraint is the wiser move.";
  if (kind === "reply") return "The visible question is wording, but the real pressure is trust, timing, and not sounding smaller than you are.";
  if (kind === "schedule") return "The feeling wants an answer now, but the steadier move is to give it a clean place in time.";
  return "This is complete enough to be named, recorded, and released from your attention.";
}

function buildMindRead(kind: RecommendedActionKind, risk: DecisionResponse["risk"]): DecisionResponse["mindRead"] {
  if (risk.level === "high" || kind === "escalate") {
    return {
      reallyAbout: "This is not really about winning the moment. It is about stopping pressure from borrowing your voice.",
      mindsetProtection: "Your mind is trying to regain command quickly. That urgency is protective, but it is not the best captain here.",
      calmerMove: "Hold the response. Let review be the action, then return with a cleaner signal and no scorch in the wording.",
    };
  }

  if (kind === "reply") {
    return {
      reallyAbout: "This is about keeping warmth and authority in the same room. The other person needs steadiness more than extra explanation.",
      mindsetProtection: "You are protecting the bond, but also protecting your position. That is not cold; it is mature equipoise.",
      calmerMove: "Answer softly, keep the boundary visible, and name the next step without chasing approval.",
    };
  }

  if (kind === "schedule") {
    return {
      reallyAbout: "This needs rhythm, not more rumination. The pressure relaxes when it is placed somewhere reliable.",
      mindsetProtection: "Your attention is trying to keep the matter alive so nothing slips. Sweet instinct, costly method.",
      calmerMove: "Give it one follow-up moment, then let your mind stop rehearsing it.",
    };
  }

  return {
    reallyAbout: "This is asking to be closed, not enlarged. The clean record is enough.",
    mindsetProtection: "You are seeking one more sign of certainty, but enough certainty is already present.",
    calmerMove: "Name the decision, keep the receipt, and let the quiet do its work.",
  };
}

function buildAction(kind: RecommendedActionKind, synthesis: string): DecisionResponse["recommendedAction"] {
  if (kind === "reply") {
    return {
      kind,
      label: "Send the warm clear reply",
      payload: {
        draft:
          "Thank you for being direct. I understand the concern. The clean next step is to keep the decision point clear, protect the relationship, and agree the timing without turning this into more pressure.",
      },
    };
  }
  if (kind === "schedule") {
    return {
      kind,
      label: "Set one quiet follow-up",
      payload: {
        title: "MindReply follow-up",
        delayMinutes: 60,
      },
    };
  }
  if (kind === "escalate") {
    return {
      kind,
      label: "Hold it for review",
      payload: {
        reason: synthesis,
      },
    };
  }
  return {
    kind,
    label: "Mark it resolved",
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
      summary: "Tone preference and pressure pattern noted without saving the raw text.",
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
