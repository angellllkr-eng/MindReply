import { NextResponse } from "next/server";
import { db, professionalsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(professionalsTable).where(eq(professionalsTable.availabilityStatus, "available")).limit(6);
    return NextResponse.json(rows.map((p) => ({
      id: p.id, name: p.name, role: p.role, niche: p.niche, bio: p.bio,
      rating: p.rating, reviewCount: p.reviewCount,
      priceText: p.priceText, priceVoice: p.priceVoice, priceVideo: p.priceVideo,
      availabilityStatus: p.availabilityStatus,
      languages: p.languages.split(",").map((l) => l.trim()),
      photoUrl: p.photoUrl,
      specializations: p.specializations ? p.specializations.split(",").map((s) => s.trim()) : null,
      yearsExperience: p.yearsExperience,
    })));
  } catch (err) {
    console.error("Error getting featured professionals:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
