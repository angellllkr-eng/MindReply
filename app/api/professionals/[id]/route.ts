import { NextRequest, NextResponse } from "next/server";
import { db, professionalsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const [row] = await db.select().from(professionalsTable).where(eq(professionalsTable.id, id));
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: row.id, name: row.name, role: row.role, niche: row.niche, bio: row.bio,
      rating: row.rating, reviewCount: row.reviewCount,
      priceText: row.priceText, priceVoice: row.priceVoice, priceVideo: row.priceVideo,
      availabilityStatus: row.availabilityStatus,
      languages: row.languages.split(",").map((l) => l.trim()),
      photoUrl: row.photoUrl,
      specializations: row.specializations ? row.specializations.split(",").map((s) => s.trim()) : null,
      yearsExperience: row.yearsExperience,
    });
  } catch (err) {
    console.error("Error getting professional:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
