import { logMetric } from "@/lib/metrics";
import { runConfiguredChatCompletion, type AIProviderSource } from "@/lib/azure-openai";

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
};

export function analyzeCommunication(message: string): AgentReply["analysis"] {
  const lower = message.toLowerCase();
  const wantsBooking = /\b(book|booking|session|video|voice|call|professional|consultation)\b/i.test(message);
  const wantsCredits = /\b(credit|credits|buy|purchase|tool|tools|checkout|payment)\b/i.test(message);
  const wantsMembership = /\b(signal|growth|pro|membership|upgrade|price|pricing|plan|subscribe|subscription)\b/i.test(message);
  const wantsRescue = /\b(rescue|stuck|avoid|avoiding|difficult message|sensitive message|urgent reply|client reply|apology|refund|boundary|fee message|send-ready)\b/i.test(message);
  const wantsGeneralChat = /\b(hello|hi|hey|how are you|what can you do|help|question|talk|chat)\b/i.test(message);
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
        : lower.includes("email")
          ? "message_refinement"
          : lower.includes("team")
            ? "leadership_alignment"
            : asksBroadQuestion && !wantsGeneralChat
              ? "broad_question"
              : wantsGeneralChat
              ? "general_assistant"
              : "communication_strategy";
  const emotionalValence = /\burgent|angry|frustrated|worried|sensitive\b/i.test(message) ? "pressured" : /\bmaybe|unsure|confused|not sure\b/i.test(message) ? "uncertain" : /\bmust|need|decide|confirm\b/i.test(message) ? "directive" : "calm";
  const powerDistance = /\bceo|board|investor|client|customer\b/i.test(message) ? "external" : /\bmanager|leadership|director\b/i.test(message) ? "upward" : /\bteam|employee|assistant\b/i.test(message) ? "downward" : "peer";

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

export function buildLocalAgentReply(message: string, analysis: AgentReply["analysis"] = analyzeCommunication(message)) {
  const topic = summarizeTopic(message);

  if (analysis.intent === "booking_and_credits") {
    return "Absolutely. The clean path is: buy a credit pack for tools, then book the right professional session. Use video for complex or sensitive situations, voice for fast advisory support, and text when you want careful written review. After payment, your dashboard confirms access and the booking opens the session room. If you want the strongest setup, Growth gives you continuity and Pro gives you the permanent memory plus integrations.";
  }

  if (analysis.intent === "message_rescue") {
    return "Use Message Rescue for this. It is built for the moment when one reply is taking too much mental bandwidth: pay once, paste up to 3 difficult messages, and use the workspace to turn them into calm, send-ready wording. If you only need one light rewrite, credits are enough. If the message is high-stakes or specialist, pair the rescue with a professional review.";
  }

  if (analysis.intent === "credit_purchase") {
    return "Yes. Credits are for the micro-tools: email polishing, text refining, tone work, planning, and professional rewrites. The 20-credit pack is the better value if you expect to use the tools more than once or twice. Once Stripe is live, checkout opens from the homepage and your dashboard confirms the balance.";
  }

  if (analysis.intent === "membership_upgrade") {
    return "Here is the simple version: Signal is free and temporary, Growth at GBP 49/month gives you 30 days of context memory, and Pro at GBP 129/month is the serious operating layer with unlimited memory plus Slack, Gmail, Notion, Character Profiles, and Momentum Clarity. If you are using MindReply for real work, Growth is the natural start. If you want it to become part of your daily system, Pro is the one.";
  }

  if (analysis.intent === "professional_booking") {
    return "I can help with that. Go to Professionals, choose the field you need, then pick video, voice, or text. Video is best for high-stakes or nuanced topics, voice is fast and focused, and text is strong for message/document review. Once payment is confirmed, the session room opens with preparation prompts so you arrive clear.";
  }

  if (analysis.intent === "message_refinement") {
    return "Lead with the decision or request, then add only the context needed to make that request easy to answer. Close with a specific owner, date, and response format. This keeps the message calm, authoritative, and hard to misread.";
  }

  if (analysis.intent === "leadership_alignment") {
    return "Frame the message around stability and direction: acknowledge the pressure, define what is changing, state what is not changing, and give the team one concrete next step. Authority should feel composed, not forceful.";
  }

  if (analysis.intent === "general_assistant") {
    return "I am here. You can ask me normal questions, think through a situation, refine a message, choose a plan, or prepare for a conversation. I will answer like a person first, then point to MindReply only when it saves time: credits for one-off wording, a professional session for specialist help, Growth for memory, or Pro for ongoing workflow.";
  }

  if (analysis.intent === "broad_question") {
    return `Yes. On "${topic}", start practical: name the real pressure, choose the first useful action, and make the next step small enough to do today. If this connects to work communication, paste the exact message or situation and I can turn it into a calm first draft. For one-off wording, credits are enough. If this keeps coming back, Growth or Pro is the better route because memory and continuity save more time than repeating context.`;
  }

  return "I can help with that. Give me the situation, who it involves, and what outcome you want. I will answer practically first, then suggest the best MindReply path only if it helps: a tool for fast wording, a professional session for specialist guidance, Growth for memory, or Pro for ongoing operating leverage.";
}

async function callAIProvider(message: string, analysis: AgentReply["analysis"]) {
  return runConfiguredChatCompletion({
    temperature: 0.35,
    maxTokens: 450,
    messages: [
      {
        role: "system",
        content: "You are MRagent for MindReply: a warm, human, commercially aware assistant. Answer ordinary questions and professional questions naturally, safely, and helpfully before selling. Stay calm, concise, confident, and practical. Discreetly guide users toward the right MindReply value path only when it saves time: credits for tools, professional bookings for specialist help, Growth for 30-day memory, and Pro for unlimited memory plus Slack, Gmail, Notion, Character Profiles, and Momentum Clarity. Never sound pushy, never guarantee outcomes, and behave like a trusted consultative salesperson.",
      },
      {
        role: "user",
        content: `Message: ${message}\n\nDetected intent: ${analysis.intent}\nEmotional valence: ${analysis.emotionalValence}\nPower distance: ${analysis.powerDistance}`,
      },
    ],
  });
}

export async function runAgent(message: string, userId?: number | null): Promise<AgentReply> {
  const text = message.trim();
  if (!text) throw new Error("message is required");

  const analysis = analyzeCommunication(text);
  let reply = buildLocalAgentReply(text, analysis);
  let source: AgentReply["source"] = "local";

  try {
    const providerReply = await callAIProvider(text, analysis);
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
    },
  });

  return {
    reply,
    analysis,
    source,
    metricLogged: metric.logged,
  };
}
