import { NextResponse } from "next/server";
import { db, lexiconsTable } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.select().from(lexiconsTable);
    return NextResponse.json(rows.map((l) => ({
      id: l.id, name: l.name, category: l.category, description: l.description,
      terms: typeof l.terms === "string" ? JSON.parse(l.terms) : l.terms,
    })));
  } catch (err) {
    console.error("Error listing lexicons:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
