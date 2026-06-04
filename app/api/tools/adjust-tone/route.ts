import { NextRequest, NextResponse } from "next/server";

const toneDescriptions: Record<string, string> = {
  professional: "formal, authoritative, and precise",
  warm: "approachable, empathetic, and personable",
  assertive: "direct, confident, and action-oriented",
  empathetic: "understanding, compassionate, and supportive",
  concise: "brief, clear, and to-the-point",
  diplomatic: "tactful, balanced, and considerate",
};

const toneMap: Record<string, (t: string) => string> = {
  professional: (t) => t.replace(/\bI think\b/g, "It is my assessment that").replace(/\bsorry\b/gi, "I apologize").replace(/\bthanks\b/gi, "Thank you").replace(/\bget back to you\b/gi, "follow up with you"),
  concise: (t) => t.replace(/\bIn order to\b/g, "To").replace(/\bdue to the fact that\b/g, "because").replace(/\bat this point in time\b/g, "now").replace(/\bin the event that\b/g, "if"),
  warm: (t) => t.replace(/\bPlease note\b/g, "Just so you know").replace(/\bI require\b/g, "I'd love to have").replace(/\bfailure to\b/g, "if you're unable to"),
  assertive: (t) => t.replace(/\bI think\b/g, "I am certain").replace(/\bmaybe\b/g, "definitely").replace(/\bperhaps\b/g, "clearly"),
  empathetic: (t) => t.replace(/\bYou must\b/g, "I understand this may be challenging, but it would help to").replace(/\bYou failed\b/g, "I notice there was a difficulty with"),
  diplomatic: (t) => t.replace(/\bNo\b/g, "While I appreciate your perspective,").replace(/\bWrong\b/g, "There may be an alternative view"),
};

export async function POST(req: NextRequest) {
  try {
    const { text, targetTone } = await req.json();
    if (!text || !targetTone) return NextResponse.json({ error: "text and targetTone are required" }, { status: 400 });
    const transform = toneMap[targetTone];
    const result = transform ? transform(text) : text;
    const desc = toneDescriptions[targetTone] ?? targetTone;
    return NextResponse.json({
      result,
      originalText: text,
      suggestions: [
        `The adjusted text reflects a ${desc} style.`,
        "Review for any phrases that may still conflict with the target tone.",
        "Consider the recipient's cultural background when applying tone adjustments.",
      ],
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
