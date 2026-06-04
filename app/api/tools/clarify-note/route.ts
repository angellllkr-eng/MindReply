import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, outputFormat } = await req.json();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

    let result = text.trim();
    const fmt = outputFormat ?? "bullet";

    if (fmt === "bullet") {
      const sentences = result.split(/(?<=[.!?])\s+/).filter(Boolean);
      result = sentences.map((s: string) => `• ${s.trim()}`).join("\n");
    } else if (fmt === "executive") {
      result = `SUMMARY: ${result.charAt(0).toUpperCase() + result.slice(1).replace(/\s+/g, " ")}`;
    } else {
      result = result.charAt(0).toUpperCase() + result.slice(1);
      if (!result.match(/[.!?]$/)) result += ".";
    }

    return NextResponse.json({
      result,
      originalText: text,
      suggestions: [
        "Verify all action items have clear ownership and deadlines.",
        "Consider adding context for readers unfamiliar with the topic.",
      ],
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
