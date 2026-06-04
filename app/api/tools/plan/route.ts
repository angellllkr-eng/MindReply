import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { goal, timeframe, constraints } = await req.json();
    if (!goal) return NextResponse.json({ error: "goal is required" }, { status: 400 });

    const tf = timeframe ?? "30 days";
    const steps = [
      `Define success metrics for: ${goal}`,
      "Identify key stakeholders and decision-makers",
      "Break the goal into 3 actionable milestones",
      "Schedule weekly check-ins to monitor progress",
      "Review and adjust the plan at the midpoint",
      "Document learnings and results upon completion",
    ];

    const plan = `A structured ${tf} plan to achieve: ${goal}. ${constraints ? `Constraints considered: ${constraints}.` : ""} The approach focuses on measurable milestones, stakeholder alignment, and consistent review cycles.`;

    return NextResponse.json({ plan, steps, timeframe: tf });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
