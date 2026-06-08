import { logMetric } from "@/lib/metrics";
import { runConfiguredChatCompletion, type AIProviderSource } from "@/lib/azure-openai";
import { languageNames, normalizeLanguage, type LanguageCode } from "@/lib/language";

type RequiredAction = "reply" | "schedule" | "resolve" | "escalate";

type AgentReply = {
  reply: string;
  analysis: {
    intent: string;
    emotionalValence: "calm" | "pressured" | "uncertain" | "directive";
    powerDistance: "peer" | "upward" | "downward" | "external";
    clarityFramework: string[];
    requiredAction: RequiredAction;
    synthesis: string;
    confidence: number;
  };
  source: AIProviderSource | "local";
  metricLogged: boolean;
  language: LanguageCode;
};

type LocalIntent =
  | "booking_and_credits"
  | "message_rescue"
  | "credit_purchase"
  | "membership_upgrade"
  | "professional_booking"
  | "message_refinement"
  | "leadership_alignment"
  | "general_assistant"
  | "broad_question"
  | "communication_strategy";

function summarizeTopic(message: string) {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 120) return cleaned;
  return `${cleaned.slice(0, 117).trim()}...`;
}

function requiredActionForIntent(intent: LocalIntent): RequiredAction {
  if (intent === "professional_booking" || intent === "booking_and_credits") return "schedule";
  if (intent === "leadership_alignment" || intent === "message_rescue" || intent === "message_refinement") return "reply";
  if (intent === "communication_strategy") return "reply";
  return "resolve";
}

function synthesisForIntent(intent: LocalIntent, message: string) {
  const topic = summarizeTopic(message);

  const synthesis: Record<LocalIntent, string> = {
    booking_and_credits: "The request combines access and expert support; resolve the access question first, then schedule only if the risk needs review.",
    message_rescue: "A reply is stuck because the pressure is higher than the wording; delay is now the main risk.",
    credit_purchase: "The decision is whether the next item is ready to process now; credits fit only when there is a concrete message or task waiting.",
    membership_upgrade: "The repeated decision cost matters more than the plan details; choose the access level that removes daily re-explaining.",
    professional_booking: "The situation likely needs specialist review; the next move is to schedule the smallest suitable review format.",
    message_refinement: "The message needs a clearer decision, owner, and timing so the recipient knows exactly what to do next.",
    leadership_alignment: "The team needs stability and direction; reduce the message to what changes, what stays stable, and the next action.",
    general_assistant: "The user is orienting; the next move is to name the stuck input so it can be reduced to action.",
    broad_question: `The question is about ${topic}; the useful move is to turn it into one concrete action today.`,
    communication_strategy: "The context is not yet narrow enough; the next move is to identify the person, pressure, and desired outcome.",
  };

  return synthesis[intent];
}

function nextMoveForIntent(intent: LocalIntent, action: RequiredAction) {
  const moves: Record<LocalIntent, string> = {
    booking_and_credits: "Confirm the immediate access need, then book review only if the decision carries reputational, legal, clinical, financial, or relationship risk.",
    message_rescue: "Paste the exact reply and state the outcome you want; MRagent will reduce it to a calm response before the thread cools.",
    credit_purchase: "Open the pending item and process it with credits only if it can be completed in this session.",
    membership_upgrade: "Choose the access level that removes the repeated decision today; do not compare features beyond that.",
    professional_booking: "Book expert review for the specific risk, then prepare the message, document, or decision that needs judgment.",
    message_refinement: "Rewrite the first sentence as the decision or request, then close with owner and timing.",
    leadership_alignment: "Send one composed direction: acknowledge pressure, state the decision, assign the next action.",
    general_assistant: "Name the exact reply, task, or decision that is stuck.",
    broad_question: "Write the first action you can complete today, then remove the rest until that action is done.",
    communication_strategy: "State the person involved, the risk, and the outcome in one sentence.",
  };

  return `Recommended action: ${action}. ${moves[intent]}`;
}

export function analyzeCommunication(message: string): AgentReply["analysis"] {
  const lower = message.toLowerCase();
  const wantsBooking = /\b(book|booking|session|video|voice|call|professional|consultation|expert|therapist|psychologist|lawyer|advisor|review)\b/i.test(message);
  const wantsCredits = /\b(credit|credits|buy|purchase|checkout|payment|access)\b/i.test(message);
  const wantsMembership = /\b(signal|growth|pro|membership|upgrade|price|pricing|plan|subscribe|subscription|tier)\b/i.test(message);
  const wantsRescue = /\b(rescue|stuck|avoid|avoiding|difficult message|sensitive message|urgent reply|client reply|apology|refund|boundary|fee message|send-ready|follow-up|follow up)\b/i.test(message);
  const wantsGeneralChat = /\b(hello|hi|hey|how are you|what can you do|help|question|talk|anything|general)\b/i.test(message);
  const asksBroadQuestion = /[?]$|^\s*(what|how|why|where|when|who|can|could|should|do|does|is|are|am)\b/i.test(message);
  const intent: LocalIntent = wantsBooking && wantsCredits
    ? "booking_and_credits"
    : wantsRescue
      ? "message_rescue"
      : wantsMembership
        ? "membership_upgrade"
        : wantsCredits
          ? "credit_purchase"
          : wantsBooking
            ? "professional_booking"
            : lower.includes("email") || lower.includes("reply") || lower.includes("message")
              ? "message_refinement"
              : lower.includes("team") || lower.includes("manager") || lower.includes("staff")
                ? "leadership_alignment"
                : asksBroadQuestion && !wantsGeneralChat
                  ? "broad_question"
                  : wantsGeneralChat
                    ? "general_assistant"
                    : "communication_strategy";
  const emotionalValence = /\burgent|angry|frustrated|worried|sensitive|overwhelmed|panic|stressed|pressure|risk\b/i.test(message) ? "pressured" : /\bmaybe|unsure|confused|not sure\b/i.test(message) ? "uncertain" : /\bmust|need|decide|confirm\b/i.test(message) ? "directive" : "calm";
  const powerDistance = /\bceo|board|investor|client|customer|prospect\b/i.test(message) ? "external" : /\bmanager|leadership|director|boss\b/i.test(message) ? "upward" : /\bteam|employee|assistant|staff\b/i.test(message) ? "downward" : "peer";
  const requiredAction = requiredActionForIntent(intent);

  return {
    intent,
    emotionalValence,
    powerDistance,
    requiredAction,
    synthesis: synthesisForIntent(intent, message),
    confidence: 0.78,
    clarityFramework: ["Name the desired outcome before adding more context"],
  };
}

function localizedFrame(language: LanguageCode, synthesis: string, nextMove: string) {
  if (language === "EN") return `Synthesis: ${synthesis}\n${nextMove}`;

  const responseLanguage = languageNames[language];
  return `Synthesis (${responseLanguage}): ${synthesis}\n${nextMove}`;
}

export function buildLocalAgentReply(message: string, analysis: AgentReply["analysis"] = analyzeCommunication(message), language: LanguageCode = "EN") {
  const intent = analysis.intent as LocalIntent;
  const action = analysis.requiredAction;
  return localizedFrame(language, analysis.synthesis, nextMoveForIntent(intent, action));
}

async function callDecisionProvider(message: string, analysis: AgentReply["analysis"], language: LanguageCode) {
  const responseLanguage = languageNames[language];

  return runConfiguredChatCompletion({
    temperature: 0.2,
    maxTokens: 220,
    messages: [
      {
        role: "system",
        content: `You are MRagent for MindReply, a private decision filter. Reply in ${responseLanguage}. Never call yourself AI, chatbot, automation, or assistant. Do not provide options. Do not sell features. Return exactly two lines: "Synthesis: ..." and "Recommended action: reply|schedule|resolve|escalate. ...". The synthesis must be 1-2 short lines. The recommended action must be one action only and make the next move obvious. Use calm, precise, discreet language.`,
      },
      {
        role: "user",
        content: `Input: ${message}\nDetected action: ${analysis.requiredAction}\nDetected synthesis: ${analysis.synthesis}`,
      },
    ],
  });
}

function providerReplyIsSingleAction(content: string, action: RequiredAction) {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 2) return false;
  if (!/^Synthesis:/i.test(lines[0])) return false;
  if (!new RegExp(`^Recommended action:\\s*${action}\\b`, "i").test(lines[1])) return false;
  return !/\b(option|options|choose from|alternatives|AI|chatbot|automation tool|productivity app)\b/i.test(content);
}

export async function runAgent(message: string, userId?: number | null, requestedLanguage?: string | null): Promise<AgentReply> {
  const text = message.trim();
  if (!text) throw new Error("message is required");

  const language = normalizeLanguage(requestedLanguage) ?? "EN";
  const analysis = analyzeCommunication(text);
  let reply = buildLocalAgentReply(text, analysis, language);
  let source: AgentReply["source"] = "local";

  try {
    const providerReply = await callDecisionProvider(text, analysis, language);
    if (providerReply && providerReplyIsSingleAction(providerReply.content, analysis.requiredAction)) {
      reply = providerReply.content;
      source = providerReply.source;
    }
  } catch (error) {
    console.warn("MRagent using local decision layer:", error);
  }

  const metric = await logMetric({
    userId: userId ?? null,
    eventName: "agent.message",
    eventValue: {
      source,
      inputLength: text.length,
      intent: analysis.intent,
      emotionalValence: analysis.emotionalValence,
      powerDistance: analysis.powerDistance,
      requiredAction: analysis.requiredAction,
      confidence: analysis.confidence,
      language,
    },
  });

  return {
    reply,
    analysis,
    source,
    metricLogged: metric.logged,
    language,
  };
}
