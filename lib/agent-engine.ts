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
  const intent = lower.includes("book") ? "professional_booking" : lower.includes("email") ? "message_refinement" : lower.includes("team") ? "leadership_alignment" : "communication_strategy";
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

  if (analysis.intent === "professional_booking") {
    return "Use the professionals directory and choose by role, language, availability, and session mode. For a high-stakes issue, book video; for precise document review, text or voice is more efficient.";
  }

  if (analysis.intent === "message_refinement") {
    return "Lead with the decision or request, then add only the context needed to make that request easy to answer. Close with a specific owner, date, and response format. This keeps the message calm, authoritative, and hard to misread.";
  }

  if (analysis.intent === "leadership_alignment") {
    return "Frame the message around stability and direction: acknowledge the pressure, define what is changing, state what is not changing, and give the team one concrete next step. Authority should feel composed, not forceful.";
  }

  return "Treat the communication as a decision system: clarify the outcome, identify the recipient's likely resistance, remove vague language, and close with a clean next action. That is the fastest route to trust and movement.";
}

async function callAzureOpenAI(message: string, analysis: AgentReply["analysis"]) {
  return runAzureChatCompletion({
    temperature: 0.35,
    maxTokens: 450,
    messages: [
      {
        role: "system",
        content: "You are MR Agent for MindReply: calm, precise, strategic, emotionally intelligent, high-status, professional, and solution-oriented. Give concise communication intelligence with subconscious analysis, power-distance awareness, and clear next actions.",
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
