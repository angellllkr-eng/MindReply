import { NextResponse } from "next/server";
import { db, membershipsTable } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.select().from(membershipsTable);
    return NextResponse.json(rows.map((m) => ({
      id: m.id, tier: m.tier, name: m.name, price: m.price,
      description: m.description, highlighted: m.highlighted,
      features: typeof m.features === "string" ? JSON.parse(m.features) : m.features,
    })));
  } catch (err) {
    console.error("Error listing memberships:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
