import { logMetric } from "@/lib/metrics";
import { runConfiguredChatCompletion, type AIProviderSource } from "@/lib/azure-openai";

export type ToolSlug =
  | "ops-overload-analyzer"
  | "text-refiner"
  | "email-polisher"
  | "call-scripter"
  | "planning-assistant"
  | "correction-engine"
  | "teaching-optimizer"
  | "lexicon-refiner"
  | "tone-adjuster"
  | "tone-calibrator"
  | "shortener"
  | "expander"
  | "professional-rewrite"
  | "clarity-booster"
  | "structure-architect"
  | "cultural-adapter"
  | "prospect-reply-analyzer";

export type ToolResult = {
  tool: ToolSlug;
  name: string;
  creditCost: number;
  result: string;
  originalText: string;
  suggestions: string[];
  analysis: {
    clarity: number;
    authority: number;
    warmth: number;
    brevity: number;
  };
  source: AIProviderSource | "local";
  metricLogged: boolean;
};

export const toolCatalog: Record<ToolSlug, { name: string; creditCost: number; description: string; action: string }> = {
  "ops-overload-analyzer": {
    name: "Ops Overload Analyzer",
    creditCost: 3,
    description: "Turn overloaded messages and task notes into an action queue with urgency, owner, and next response.",
    action: "Process Overload",
  },
  "text-refiner": {
    name: "Text Refiner",
    creditCost: 1,
    description: "Refine casual or imprecise text into polished professional language.",
    action: "Refine Text",
  },
  "email-polisher": {
    name: "Email Polisher",
    creditCost: 2,
    description: "Transform draft emails into executive-grade correspondence.",
    action: "Polish Email",
  },
  "call-scripter": {
    name: "Call Scripter",
    creditCost: 2,
    description: "Generate a focused call script with opening, discovery, objection handling, and close.",
    action: "Generate Script",
  },
  "planning-assistant": {
    name: "Planning Assistant",
    creditCost: 1,
    description: "Turn a goal into a practical plan with milestones and communication checkpoints.",
    action: "Create Plan",
  },
  "correction-engine": {
    name: "Correction Engine",
    creditCost: 1,
    description: "Identify weak phrasing, ambiguity, and authority leaks in professional text.",
    action: "Correct Text",
  },
  "teaching-optimizer": {
    name: "Teaching Optimizer",
    creditCost: 2,
    description: "Restructure instructional content so it is easier to understand and retain.",
    action: "Optimize Teaching",
  },
  "lexicon-refiner": {
    name: "Lexicon Refiner",
    creditCost: 3,
    description: "Adapt language to professional vocabulary and discipline-specific standards.",
    action: "Refine Lexicon",
  },
  "tone-adjuster": {
    name: "Tone Adjuster",
    creditCost: 1,
    description: "Shift a message into a precise communication register.",
    action: "Adjust Tone",
  },
  "tone-calibrator": {
    name: "Tone Calibrator",
    creditCost: 2,
    description: "Adjust emotional valence, directness, and professional register.",
    action: "Calibrate Tone",
  },
  shortener: {
    name: "Shortener",
    creditCost: 1,
    description: "Compress a message while preserving intent and professional tone.",
    action: "Shorten Text",
  },
  expander: {
    name: "Expander",
    creditCost: 1,
    description: "Expand terse notes into complete, composed communication.",
    action: "Expand Text",
  },
  "professional-rewrite": {
    name: "Professional Rewrite",
    creditCost: 2,
    description: "Rewrite informal text for high-trust professional settings.",
    action: "Rewrite Text",
  },
  "clarity-booster": {
    name: "Clarity Booster",
    creditCost: 1,
    description: "Remove ambiguity and strengthen the next action.",
    action: "Boost Clarity",
  },
  "structure-architect": {
    name: "Structure Architect",
    creditCost: 3,
    description: "Rebuild message flow for clarity, decision speed, and recipient confidence.",
    action: "Structure Message",
  },
  "cultural-adapter": {
    name: "Cultural Adapter",
    creditCost: 2,
    description: "Adapt phrasing for cross-cultural clarity, indirectness, and relationship context.",
    action: "Adapt Message",
  },
  "prospect-reply-analyzer": {
    name: "Prospect Reply Analyzer",
    creditCost: 3,
    description: "Diagnose failed prospect replies, repair trust breaks, and rewrite the close.",
    action: "Analyze Replies",
  },
};

const toneDescriptors: Record<string, string> = {
  professional: "formal, composed, and precise",
  warm: "approachable, respectful, and human",
  assertive: "direct, confident, and outcome-led",
  empathetic: "sensitive, validating, and steady",
  concise: "brief, clear, and low-friction",
  diplomatic: "balanced, tactful, and relationship-aware",
};

function normalize(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function sentenceCase(text: string) {
  const cleaned = normalize(text);
  if (!cleaned) return cleaned;
  const withCapital = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(withCapital) ? withCapital : `${withCapital}.`;
}

function score(text: string, result: string) {
  const wordCount = result.split(/\s+/).filter(Boolean).length;
  const hasAction = /\b(confirm|send|review|decide|schedule|reply|approve|share)\b/i.test(result);
  const hasWeakener = /\bjust|maybe|perhaps|kind of|sort of|I think\b/i.test(result);

  return {
    clarity: Math.min(98, 78 + (hasAction ? 12 : 5) + (result.length < text.length * 1.15 ? 4 : 0)),
    authority: Math.min(97, 76 + (hasWeakener ? 2 : 13)),
    warmth: Math.min(96, 78 + (/\bthank|appreciate|understand\b/i.test(result) ? 10 : 4)),
    brevity: Math.max(62, Math.min(98, 100 - Math.max(0, wordCount - 55))),
  };
}

function refineText(text: string) {
  const base = sentenceCase(text)
    .replace(/\bhey\b/gi, "Hello")
    .replace(/\bjust checking in\b/gi, "I am following up")
    .replace(/\bASAP\b/g, "at the earliest practical opportunity")
    .replace(/\blet me know\b/gi, "please confirm");

  return `Thank you for the context. ${base} Please confirm the preferred next step so we can move forward with clarity.`;
}

function polishEmail(text: string, tone = "professional") {
  const descriptor = toneDescriptors[tone] ?? toneDescriptors.professional;
  const body = sentenceCase(text);
  return `Subject: Clear next steps\n\nHello,\n\nThank you for your message. I have reviewed the context and want to respond in a ${descriptor} way.\n\n${body}\n\nTo keep momentum, please confirm the decision owner, timing, and any constraints I should account for.\n\nBest regards`;
}

function adjustTone(text: string, tone = "professional") {
  const descriptor = toneDescriptors[tone] ?? toneDescriptors.professional;
  const base = sentenceCase(text)
    .replace(/\bI think\b/gi, "My assessment is")
    .replace(/\bmaybe\b/gi, "a practical option is")
    .replace(/\bsorry\b/gi, "thank you for your patience");

  return `Reframed in a ${descriptor} tone:\n\n${base}`;
}

function shorten(text: string) {
  const cleaned = normalize(text);
  if (cleaned.length <= 220) return cleaned;
  return `${cleaned.slice(0, 217).replace(/\s+\S*$/, "").trim()}.`;
}

function expand(text: string) {
  const base = sentenceCase(text);
  return `Thank you for raising this. ${base}\n\nThe practical next step is to clarify the intended outcome, confirm who owns the decision, and agree when a response or action is needed. This keeps the conversation specific, respectful, and easy to act on.`;
}

function professionalRewrite(text: string) {
  const base = sentenceCase(text)
    .replace(/\bwanna\b/gi, "would like to")
    .replace(/\bgonna\b/gi, "going to")
    .replace(/\bkinda\b/gi, "somewhat")
    .replace(/\bstuff\b/gi, "details");

  return `I would like to clarify the following point with a composed and professional framing:\n\n${base}\n\nPlease confirm whether this direction aligns with your expectations, or whether a different approach would be more appropriate.`;
}

function clarityBoost(text: string) {
  return `Context: ${sentenceCase(text)}\n\nDecision needed: Confirm the intended outcome.\n\nNext action: Assign an owner, deadline, and response format.\n\nSuggested wording: Please confirm the preferred next step and the date by which you need it completed.`;
}

function callScripter(text: string) {
  const base = sentenceCase(text);
  return [
    "Opening: Thank you for making time today. I want to make this conversation useful, specific, and easy to act on.",
    "",
    `Objective: ${base}`,
    "",
    "Discovery: What outcome would make this discussion worthwhile for you, and what constraint should we respect first?",
    "",
    "Objection handling: I understand the concern. The practical way forward is to separate risk, timing, and ownership so the decision stays clear.",
    "",
    "Close: Shall we confirm the next action, owner, and date now?",
  ].join("\n");
}

function planningAssistant(text: string) {
  const base = sentenceCase(text);
  return [
    `Objective: ${base}`,
    "",
    "1. Define the exact result and decision owner.",
    "2. Identify stakeholders, constraints, and success signals.",
    "3. Set three milestones with one accountable owner per milestone.",
    "4. Confirm the communication cadence and escalation path.",
    "5. Review progress weekly and adjust only from evidence.",
  ].join("\n");
}

function correctionEngine(text: string) {
  const base = sentenceCase(text)
    .replace(/\bjust\b/gi, "")
    .replace(/\bmaybe\b/gi, "a practical option is")
    .replace(/\bI think\b/gi, "my assessment is")
    .replace(/\bsorry\b/gi, "thank you for your patience")
    .replace(/\s+/g, " ")
    .trim();

  return [
    "Correction review:",
    "",
    "Authority leaks: Remove hesitant qualifiers and indirect requests.",
    "Ambiguity risk: State the decision, owner, and timing explicitly.",
    "Tone risk: Keep the message calm, specific, and outcome-led.",
    "",
    `Corrected version: ${base}`,
  ].join("\n");
}

function teachingOptimizer(text: string) {
  const base = sentenceCase(text);
  return [
    `Learning objective: ${base}`,
    "",
    "Core idea: State the principle in one sentence before adding detail.",
    "Sequence: Begin with context, show the action, then explain the reason.",
    "Retention cue: End with one practical checkpoint the learner can apply immediately.",
    "",
    "Optimized instruction: Explain the concept, demonstrate the step, ask the learner to apply it, then confirm what changed.",
  ].join("\n");
}

function lexiconRefiner(text: string) {
  return [
    "Professional lexicon version:",
    "",
    professionalRewrite(text),
    "",
    "Vocabulary upgrade: Use terms that signal evidence, constraints, ownership, risk, and measurable outcomes.",
  ].join("\n");
}

function toneCalibrator(text: string, tone = "professional") {
  const descriptor = toneDescriptors[tone] ?? toneDescriptors.professional;
  return [
    `Tone calibration: ${descriptor}.`,
    "",
    adjustTone(text, tone),
    "",
    "Calibration note: Keep warmth in the opening, authority in the request, and precision in the close.",
  ].join("\n");
}

function structureArchitect(text: string) {
  const base = sentenceCase(text);
  return [
    "Executive structure:",
    "",
    `1. Context: ${base}`,
    "2. Decision: State the choice or approval needed.",
    "3. Evidence: Add the strongest supporting reason.",
    "4. Risk: Name the main constraint without overexplaining.",
    "5. Close: Confirm owner, action, and deadline.",
  ].join("\n");
}

function culturalAdapter(text: string) {
  const base = sentenceCase(text);
  return [
    "Cross-cultural adaptation:",
    "",
    base,
    "",
    "Relationship framing: Lead with respect and context before the request.",
    "Directness level: Use clear action language while avoiding unnecessary pressure.",
    "Confirmation: Ask for alignment, timing, and preferred next step.",
  ].join("\n");
}

function opsOverloadAnalyzer(text: string) {
  const items = text
    .split(/\n{2,}|\n[-*]\s+|\n\d+[.)]\s+/)
    .map((item) => normalize(item))
    .filter(Boolean)
    .slice(0, 10);
  const reviewed = items.length ? items : [normalize(text)];
  const urgent = reviewed.filter((item) => /\b(today|urgent|asap|blocked|client|deadline|approval|late|stuck|tomorrow)\b/i.test(item));
  const owners = reviewed.map((item, index) => {
    const owner = /\b(client|customer)\b/i.test(item) ? "Client-facing owner" : /\b(team|internal|ops|project)\b/i.test(item) ? "Operations owner" : "Decision owner";
    const priority = urgent.includes(item) ? "High" : index < 3 ? "Medium" : "Normal";
    return `${index + 1}. ${priority} priority - ${owner}: ${item}`;
  });

  return [
    "Ops Overload Analyzer",
    "",
    "Immediate overload diagnosis:",
    `You have ${reviewed.length} item${reviewed.length === 1 ? "" : "s"} competing for attention. ${urgent.length || "No"} item${urgent.length === 1 ? "" : "s"} look urgent enough to create missed-detail or client-delay risk today.`,
    "",
    "What is costing time:",
    "The workflow is forcing manual triage, context switching, and follow-up decisions before any real work starts. That is where the 2+ hours/day loss appears.",
    "",
    "Action queue:",
    ...owners,
    "",
    "Next 24-hour operating move:",
    "Handle the high-priority client or deadline items first, convert every vague message into owner + deadline + next action, then batch the rest instead of reacting all day.",
    "",
    "Send-ready response:",
    "I have this. To keep it moving today, please confirm the owner, deadline, and the single next action needed. I will prioritize the urgent items first and batch the rest so nothing critical slips.",
    "",
    "Upgrade trigger:",
    "Free preview processes 10 messages/tasks. Upgrade when new items are queued and you need immediate processing instead of another manual triage loop.",
    "",
    "Outcome promise:",
    "MindReply consolidates and actions incoming communications so operations teams stop losing 2+ hours daily to manual processing and follow-ups within 24 hours.",
  ].join("\n");
}

function classifyProspectReply(reply: string) {
  const lower = reply.toLowerCase();
  if (/\b(price|cost|expensive|budget|afford)\b/.test(lower)) return "price_pushback";
  if (/\b(later|not now|busy|no time|next month|next quarter)\b/.test(lower)) return "not_now";
  if (/\b(send|info|information|details|deck|brochure)\b/.test(lower)) return "send_info";
  if (/\b(ai|chatgpt|crm|already|using|have a tool|we have)\b/.test(lower)) return "already_have_solution";
  if (/\b(not interested|no thanks|pass|not for us)\b/.test(lower)) return "polite_no";
  if (/\b(trust|proof|case study|results|guarantee|who are you)\b/.test(lower)) return "low_trust";
  if (/\b(team|partner|boss|approval|discuss internally)\b/.test(lower)) return "needs_approval";
  return "curious_but_not_convinced";
}

function diagnosisForReplyType(type: string) {
  if (type === "price_pushback") {
    return {
      why: "They do not connect the price to recovered revenue.",
      friction: "Cost feels like software spend instead of a way to rescue warm conversations.",
      trust: "ROI is not concrete enough.",
      strategy: "Compare the price to lost replies, delayed calls, and stalled deals.",
    };
  }
  if (type === "not_now") {
    return {
      why: "The offer sounds like extra work during an already busy period.",
      friction: "The first step feels bigger than the pain relief.",
      trust: "They do not believe the result can happen quickly.",
      strategy: "Make the first action a small reply batch with a fast turnaround.",
    };
  }
  if (type === "send_info") {
    return {
      why: "They are avoiding commitment because the value is not sharp enough yet.",
      friction: "Information request creates a passive follow-up loop.",
      trust: "They want proof before spending time.",
      strategy: "Send one proof-led sentence, then ask for a yes/no micro-commitment.",
    };
  }
  if (type === "already_have_solution") {
    return {
      why: "They think this is another AI or CRM tool.",
      friction: "Category confusion makes the offer easy to dismiss.",
      trust: "They do not see a unique operating outcome.",
      strategy: "Position Message Rescue as recovering stalled replies, not replacing their stack.",
    };
  }
  if (type === "low_trust") {
    return {
      why: "Belief broke before the offer reached urgency.",
      friction: "They need a low-risk proof step.",
      trust: "Delivery confidence is weak.",
      strategy: "Use a small batch diagnosis before asking for a bigger rollout.",
    };
  }
  if (type === "needs_approval") {
    return {
      why: "The buyer is not armed with a simple internal business case.",
      friction: "Approval adds delay and weakens momentum.",
      trust: "The value is not packaged for another stakeholder.",
      strategy: "Give them a one-sentence ROI case and a small pilot ask.",
    };
  }
  if (type === "polite_no") {
    return {
      why: "They did not feel a painful enough revenue problem.",
      friction: "The offer did not attach to an urgent workflow.",
      trust: "They may see it as generic outreach.",
      strategy: "Challenge gently with a specific revenue-leak question.",
    };
  }
  return {
    why: "They are interested but not convinced enough to act.",
    friction: "The next step is not obvious or urgent.",
    trust: "The result feels plausible but not necessary today.",
    strategy: "Turn curiosity into a small batch test with a deadline.",
  };
}

function prospectReplyAnalyzer(text: string) {
  const replies = text
    .split(/\n{2,}|\n[-*]\s+|\n\d+[.)]\s+/)
    .map((item) => normalize(item))
    .filter(Boolean);
  const sampledReplies = replies.length ? replies.slice(0, 8) : [normalize(text)];
  const types = sampledReplies.map(classifyProspectReply);
  const primaryType = types.sort((a, b) => types.filter((type) => type === b).length - types.filter((type) => type === a).length)[0];
  const diagnosis = diagnosisForReplyType(primaryType);
  const urgency = /price_pushback|not_now|polite_no/.test(primaryType) ? "medium" : "high";
  const trustLevel = /low_trust|send_info|already_have_solution/.test(primaryType) ? "low" : "medium";

  return [
    "Prospect Reply Analyzer",
    "",
    `Reply pattern: ${primaryType.replace(/_/g, " ")}`,
    `Urgency level: ${urgency}`,
    `Trust level: ${trustLevel}`,
    "",
    "Why they did not convert:",
    diagnosis.why,
    "",
    "Where friction exists:",
    diagnosis.friction,
    "",
    "Where trust breaks:",
    diagnosis.trust,
    "",
    "Rewritten messaging:",
    "This is not another AI tool. It is a revenue recovery layer for replies your team already receives but is not converting. The fastest win is not more leads; it is rescuing the prospects who already raised their hand.",
    "",
    "Rewritten offer:",
    "Send 10 recent prospect replies. We will diagnose where the close is breaking, rewrite the follow-up path, and give you a sharper close sequence designed to recover stalled conversations within days.",
    "",
    "Rewritten closing:",
    "Can you send 10 recent replies today? I will show you exactly where money is leaking and the close I would use before more warm conversations go cold.",
    "",
    "Minimum 30% close-rate improvement rationale:",
    "The current path is likely losing buyers through vague value, weak urgency, or low trust. This rewrite improves close probability by making the first step smaller, connecting the offer to recovered revenue, and replacing passive follow-up with a direct batch test.",
    "",
    "MOA agent routing:",
    "Growth Agent: use the rewritten close immediately.",
    "AI Content Agent: turn the strongest reply type into a DM and email variant.",
    "Support Agent: prepare objection responses for price, trust, timing, and approval.",
    "Business Agent: keep the low-risk batch offer and remove any vague platform language.",
    "Security Agent: remove private prospect data before sharing examples externally.",
  ].join("\n");
}

function localToolResult(slug: ToolSlug, text: string, tone?: string) {
  if (slug === "ops-overload-analyzer") return opsOverloadAnalyzer(text);
  if (slug === "text-refiner") return refineText(text);
  if (slug === "email-polisher") return polishEmail(text, tone);
  if (slug === "call-scripter") return callScripter(text);
  if (slug === "planning-assistant") return planningAssistant(text);
  if (slug === "correction-engine") return correctionEngine(text);
  if (slug === "teaching-optimizer") return teachingOptimizer(text);
  if (slug === "lexicon-refiner") return lexiconRefiner(text);
  if (slug === "tone-adjuster") return adjustTone(text, tone);
  if (slug === "tone-calibrator") return toneCalibrator(text, tone);
  if (slug === "shortener") return shorten(text);
  if (slug === "expander") return expand(text);
  if (slug === "professional-rewrite") return professionalRewrite(text);
  if (slug === "structure-architect") return structureArchitect(text);
  if (slug === "cultural-adapter") return culturalAdapter(text);
  if (slug === "prospect-reply-analyzer") return prospectReplyAnalyzer(text);
  return clarityBoost(text);
}

async function azureToolResult(slug: ToolSlug, text: string, tone?: string) {
  const catalog = toolCatalog[slug];
  return runConfiguredChatCompletion({
    temperature: 0.28,
    maxTokens: 520,
    messages: [
      {
        role: "system",
        content: [
          "You are MindReply's MR intelligence layer.",
          "Rewrite and process professional communication with calm authority, emotional intelligence, subconscious intent awareness, and precise next-action framing.",
          "Return only the finished user-facing result. Do not mention policies, implementation, model details, or internal analysis.",
        ].join(" "),
      },
      {
        role: "user",
        content: [
          `Tool: ${catalog.name}`,
          `Action: ${catalog.action}`,
          `Target tone: ${tone ?? "professional"}`,
          "",
          "Input:",
          text,
        ].join("\n"),
      },
    ],
  });
}

export function isToolSlug(value: string): value is ToolSlug {
  return value in toolCatalog;
}

export async function runTool(slug: ToolSlug, input: { text: string; tone?: string; userId?: number | null }): Promise<ToolResult> {
  const text = normalize(input.text);
  if (!text) {
    throw new Error("text is required");
  }

  const catalog = toolCatalog[slug];
  let result = localToolResult(slug, text, input.tone);
  let source: ToolResult["source"] = "local";

  if (slug !== "prospect-reply-analyzer" && slug !== "ops-overload-analyzer") {
    try {
      const providerResult = await azureToolResult(slug, text, input.tone);
      if (providerResult) {
        result = providerResult.content;
        source = providerResult.source;
      }
    } catch (error) {
      console.warn(`Tool ${slug} using local intelligence:`, error);
    }
  }

  const analysis = score(text, result);
  const metric = await logMetric({
    userId: input.userId ?? null,
    eventName: `tool.${slug}`,
    eventValue: {
      creditCost: catalog.creditCost,
      source,
      inputLength: text.length,
      outputLength: result.length,
      analysis,
    },
  });

  return {
    tool: slug,
    name: catalog.name,
    creditCost: catalog.creditCost,
    result,
    originalText: text,
    suggestions: slug === "ops-overload-analyzer"
      ? [
        "Process the first 10 items, then make the upgrade moment visible.",
        "Prioritize client, deadline, approval, and blocked-work messages first.",
        "Tie payment to immediate processing and 2+ hours/day reclaimed.",
      ]
      : slug === "prospect-reply-analyzer"
      ? [
        "Send the rewritten close today, while the reply is still warm.",
        "Ask for 10 replies instead of a broad demo.",
        "Tie payment to recovered conversations, not software features.",
      ]
      : [
        "Check that the next action is explicit.",
        "Confirm the tone matches the recipient's status and context.",
        "Remove any remaining ambiguity before sending.",
      ],
    analysis,
    source,
    metricLogged: metric.logged,
  };
}
