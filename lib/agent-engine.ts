import { logMetric } from "@/lib/metrics";
import { runAzureChatCompletion } from "@/lib/azure-openai";

type AgentReply = {
  reply: string;
  analysis: {
    intent: string;
    emotionalValence: "calm" | "pressured" | "uncertain" | "directive";
    powerDistance: "peer" | "upward" | "downward" | "external";
    clarityFramework: string[];
  };
  source: "azure-openai" | "local";
  metricLogged: boolean;
};

export function analyzeCommunication(message: string): AgentReply["analysis"] {
  const lower = message.toLowerCase();
  const wantsBooking = /\b(book|booking|session|video|voice|call|professional|consultation)\b/i.test(message);
  const wantsCredits = /\b(credit|credits|buy|purchase|tool|tools|checkout|payment)\b/i.test(message);
  const wantsMembership = /\b(signal|growth|pro|membership|upgrade|price|pricing|plan|subscribe|subscription)\b/i.test(message);
  const wantsGeneralChat = /\b(hello|hi|hey|how are you|what can you do|help|question|talk|chat)\b/i.test(message);
  const intent = wantsBooking && wantsCredits
    ? "booking_and_credits"
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

function localReply(message: string) {
  const analysis = analyzeCommunication(message);

  if (analysis.intent === "booking_and_credits") {
    return "Absolutely. The clean path is: buy a credit pack for tools, then book the right professional session. Use video for complex or sensitive situations, voice for fast advisory support, and text when you want careful written review. After payment, your dashboard confirms access and the booking opens the session room. If you want the strongest setup, Growth gives you continuity and Pro gives you the permanent memory plus integrations.";
  }

  if (analysis.intent === "credit_purchase") {
    return "Yes. Credits are for the micro-tools: email polishing, text refining, tone work, planning, and professional rewrites. The 20-credit pack is the better value if you expect to use the tools more than once or twice. Once Stripe is live, checkout opens from the homepage and your dashboard confirms the balance.";
  }

  if (analysis.intent === "membership_upgrade") {
    return "Here is the simple version: Signal is free and temporary, Growth at £49/month gives you 30 days of context memory, and Pro at £129/month is the serious operating layer with unlimited memory plus Slack, Gmail, Notion, Character Profiles, and Momentum Clarity. If you are using MindReply for real work, Growth is the natural start. If you want it to become part of your daily system, Pro is the one.";
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
    return "I am here. You can ask me about messages, decisions, bookings, tools, memberships, or anything you are trying to think through. I will keep it practical and calm. If the situation matters, the fastest value is usually to refine the message with credits, then use Growth or Pro when you need memory and continuity.";
  }

  return "I can help with that. Give me the situation, who it involves, and what outcome you want. I will make the answer practical first, then suggest the best MindReply path only if it helps: a tool for fast wording, a professional session for specialist guidance, Growth for memory, or Pro for ongoing operating leverage.";
}

async function callAzureOpenAI(message: string, analysis: AgentReply["analysis"]) {
  return runAzureChatCompletion({
    temperature: 0.35,
    maxTokens: 450,
    messages: [
      {
        role: "system",
        content: "You are MRagent for MindReply: a warm, human, commercially aware assistant. Answer a broad range of user questions naturally and helpfully. Stay calm, concise, confident, and practical. Discreetly guide users toward the right MindReply value path when relevant: credits for tools, professional bookings for specialist help, Growth for 30-day memory, and Pro for unlimited memory plus Slack, Gmail, Notion, Character Profiles, and Momentum Clarity. Never sound pushy; behave like a trusted consultative salesperson.",
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
  let reply = localReply(text);
  let source: AgentReply["source"] = "local";

  try {
    const azureReply = await callAzureOpenAI(text, analysis);
    if (azureReply) {
      reply = azureReply;
      source = "azure-openai";
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
