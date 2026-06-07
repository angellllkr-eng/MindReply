import { logMetric } from "@/lib/metrics";
import { runConfiguredChatCompletion, type AIProviderSource } from "@/lib/azure-openai";
import { languageNames, normalizeLanguage, type LanguageCode } from "@/lib/language";

type AgentReply = {
  reply: string;
  analysis: {
    intent: string;
    emotionalValence: "calm" | "pressured" | "uncertain" | "directive";
    powerDistance: "peer" | "upward" | "downward" | "external";
    clarityFramework: string[];
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

export function analyzeCommunication(message: string): AgentReply["analysis"] {
  const lower = message.toLowerCase();
  const wantsBooking = /\b(book|booking|session|video|voice|call|professional|consultation|expert|therapist|psychologist|lawyer|advisor)\b/i.test(message);
  const wantsCredits = /\b(credit|credits|buy|purchase|tool|tools|checkout|payment)\b/i.test(message);
  const wantsMembership = /\b(signal|growth|pro|membership|upgrade|price|pricing|plan|subscribe|subscription)\b/i.test(message);
  const wantsRescue = /\b(rescue|stuck|avoid|avoiding|difficult message|sensitive message|urgent reply|client reply|apology|refund|boundary|fee message|send-ready)\b/i.test(message);
  const wantsGeneralChat = /\b(hello|hi|hey|how are you|what can you do|help|question|talk|chat|anything|general)\b/i.test(message);
  const asksBroadQuestion = /[?]$|^\s*(what|how|why|where|when|who|can|could|should|do|does|is|are|am)\b/i.test(message);
  const intent = wantsBooking && wantsCredits
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
  const emotionalValence = /\burgent|angry|frustrated|worried|sensitive|overwhelmed|panic|stressed\b/i.test(message) ? "pressured" : /\bmaybe|unsure|confused|not sure\b/i.test(message) ? "uncertain" : /\bmust|need|decide|confirm\b/i.test(message) ? "directive" : "calm";
  const powerDistance = /\bceo|board|investor|client|customer|prospect\b/i.test(message) ? "external" : /\bmanager|leadership|director|boss\b/i.test(message) ? "upward" : /\bteam|employee|assistant|staff\b/i.test(message) ? "downward" : "peer";

  return {
    intent,
    emotionalValence,
    powerDistance,
    clarityFramework: ["State the outcome", "Name the constraint", "Define the next action", "Close with timing"],
  };
}

function summarizeTopic(message: string) {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 90) return cleaned;
  return `${cleaned.slice(0, 87).trim()}...`;
}

function languageOpening(language: LanguageCode) {
  return {
    EN: "I can help.",
    FR: "Je peux vous aider.",
    DE: "Ich kann helfen.",
    ES: "Puedo ayudar.",
    BG: "Moga da pomogna.",
    IT: "Posso aiutare.",
    PT: "Posso ajudar.",
  }[language];
}

function languageCloser(language: LanguageCode) {
  return {
    EN: "If you want, paste the exact situation and I will shape the next message calmly.",
    FR: "Collez la situation exacte et je structurerai le prochain message avec calme.",
    DE: "Fugen Sie die genaue Situation ein, und ich formuliere die nachste ruhige Nachricht.",
    ES: "Pega la situacion exacta y preparare el siguiente mensaje con calma.",
    BG: "Postavete tochniya kontekst i shte oformya spokoyno sledvashtoto saobshtenie.",
    IT: "Incolla la situazione esatta e preparero il prossimo messaggio con calma.",
    PT: "Cole a situacao exata e eu preparo a proxima mensagem com calma.",
  }[language];
}

function localizedSummary(language: LanguageCode, english: string) {
  if (language === "EN") return english;
  return `${languageOpening(language)} ${english}\n\n${languageCloser(language)}`;
}

export function buildLocalAgentReply(message: string, analysis: AgentReply["analysis"] = analyzeCommunication(message), language: LanguageCode = "EN") {
  const topic = summarizeTopic(message);
  const intent = analysis.intent as LocalIntent;

  const englishReplies: Record<LocalIntent, string> = {
    booking_and_credits: "Absolutely. The clean path is: use credits for tools, then book the right professional session if the issue needs expert judgment. Use video for complex or sensitive situations, voice for fast advisory support, and text when you want careful written review. After confirmation, your dashboard or session room gives the next step.",
    message_rescue: "Use Message Rescue for this. It is built for the moment when one reply is taking too much mental bandwidth: paste the difficult message, name the outcome, and get calm send-ready wording. If the message is high-stakes or specialist, pair the rescue with a professional review.",
    credit_purchase: "Yes. Credits are for the micro-tools: email polishing, text refining, tone work, planning, and professional rewrites. The 20-credit pack is better if you expect to use the tools more than once or twice.",
    membership_upgrade: "Simple version: Signal is the starting layer, Growth gives you 30 days of context memory, and Pro is for serious daily use with unlimited memory, specialist lexicons, Character Profiles, Momentum Clarity, and priority review. If you repeat the same context every day, Growth or Pro saves more time than one-off credits.",
    professional_booking: "I can help with that. Go to Professionals, choose the field you need, then pick video, voice, or text. Video is best for high-stakes or nuanced topics, voice is fast and focused, and text is strong for message or document review. If you are not ready to book yet, ask MRagent as an expert preview first.",
    message_refinement: "Lead with the decision or request, then add only the context needed to make that request easy to answer. Close with a specific owner, date, and response format. This keeps the message calm, authoritative, and hard to misread.",
    leadership_alignment: "Frame the message around stability and direction: acknowledge the pressure, define what is changing, state what is not changing, and give the team one concrete next step. Authority should feel composed, not forceful.",
    general_assistant: "I am here. You can ask normal questions, think through a situation, refine a message, choose a plan, or prepare for a conversation. I will answer like a person first, then point to MindReply only when it genuinely saves time.",
    broad_question: `On "${topic}", start practical: name the real pressure, choose the first useful action, and make the next step small enough to do today. If this connects to work communication, paste the exact message or situation and I can turn it into a calm first draft.`,
    communication_strategy: "Give me the situation, who it involves, and what outcome you want. I will answer practically first, then suggest the best MindReply path only if it helps: a tool for fast wording, a professional session for specialist guidance, Growth for memory, or Pro for daily continuity.",
  };

  return localizedSummary(language, englishReplies[intent] ?? englishReplies.communication_strategy);
}

async function callAIProvider(message: string, analysis: AgentReply["analysis"], language: LanguageCode) {
  const responseLanguage = languageNames[language];

  return runConfiguredChatCompletion({
    temperature: 0.45,
    maxTokens: 520,
    messages: [
      {
        role: "system",
        content: `You are MRagent for MindReply: a warm, human, commercially aware assistant. Reply in ${responseLanguage} unless the user explicitly asks for another language. You can chat about normal topics, professional communication, bookings, plans, and decisions. Answer naturally, safely, and helpfully before selling. Be nice, engaging, calm, and practical. Discreetly guide users toward the right MindReply value path only when it saves time: credits for tools, professional bookings for specialist help, Growth for 30-day memory, and Pro for unlimited memory, specialist lexicons, Character Profiles, Momentum Clarity, and priority review. Never sound pushy, never guarantee outcomes, never claim a human professional is present unless a session is booked, and behave like a trusted consultative salesperson who genuinely helps first.`,
      },
      {
        role: "user",
        content: `Message: ${message}\n\nDetected intent: ${analysis.intent}\nEmotional valence: ${analysis.emotionalValence}\nPower distance: ${analysis.powerDistance}`,
      },
    ],
  });
}

export async function runAgent(message: string, userId?: number | null, requestedLanguage?: string | null): Promise<AgentReply> {
  const text = message.trim();
  if (!text) throw new Error("message is required");

  const language = normalizeLanguage(requestedLanguage) ?? "EN";
  const analysis = analyzeCommunication(text);
  let reply = buildLocalAgentReply(text, analysis, language);
  let source: AgentReply["source"] = "local";

  try {
    const providerReply = await callAIProvider(text, analysis, language);
    if (providerReply) {
      reply = providerReply.content;
      source = providerReply.source;
    }
  } catch (error) {
    console.warn("MR Agent using local intelligence:", error);
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
