import { NextRequest, NextResponse } from "next/server";

function refineParagraph(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.map((s) => {
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!s.match(/[.!?]$/)) s += ".";
    return s;
  }).join(" ");
}

export async function POST(req: NextRequest) {
  try {
    const { text, tone } = await req.json();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });
    const result = refineParagraph(text);
    return NextResponse.json({
      result,
      originalText: text,
      suggestions: [
        "Consider opening with the primary request to capture attention immediately.",
        "Use the recipient's name in the greeting for a more personal connection.",
        "Close with a specific call-to-action and clear timeline.",
      ],
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
