import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const professionalId = parseInt(searchParams.get("professionalId") ?? "");
    const date = searchParams.get("date");

    if (isNaN(professionalId)) return NextResponse.json({ error: "professionalId is required" }, { status: 400 });

    const baseDate = date ? new Date(date) : new Date();
    const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
    const slots = [];

    for (let d = 0; d < 7; d++) {
      const slotDate = new Date(baseDate);
      slotDate.setDate(slotDate.getDate() + d);
      const dateStr = slotDate.toISOString().split("T")[0];
      for (const time of times) {
        slots.push({ date: dateStr, time, available: Math.random() > 0.3 });
      }
    }

    return NextResponse.json(slots);
  } catch (err) {
    console.error("Error getting slots:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
