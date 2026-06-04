import { NextRequest, NextResponse } from "next/server";
import { db, professionalsTable } from "@/lib/db";
import { eq, and, lte } from "drizzle-orm";

function mapProfessional(p: typeof professionalsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, role: p.role, niche: p.niche, bio: p.bio,
    rating: p.rating, reviewCount: p.reviewCount,
    priceText: p.priceText, priceVoice: p.priceVoice, priceVideo: p.priceVideo,
    availabilityStatus: p.availabilityStatus,
    languages: p.languages.split(",").map((l) => l.trim()),
    photoUrl: p.photoUrl,
    specializations: p.specializations ? p.specializations.split(",").map((s) => s.trim()) : null,
    yearsExperience: p.yearsExperience,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const role = searchParams.get("role");
    const language = searchParams.get("language");
    const available = searchParams.get("available");
    const maxPrice = searchParams.get("maxPrice");

    const conditions = [];
    if (role) conditions.push(eq(professionalsTable.role, role));
    if (available === "true") conditions.push(eq(professionalsTable.availabilityStatus, "available"));
    if (maxPrice) conditions.push(lte(professionalsTable.priceVideo, parseFloat(maxPrice)));

    const rows = conditions.length
      ? await db.select().from(professionalsTable).where(and(...conditions))
      : await db.select().from(professionalsTable);

    const professionals = rows
      .filter((p) => !language || p.languages.toLowerCase().includes(language.toLowerCase()))
      .map(mapProfessional);

    return NextResponse.json(professionals);
  } catch (err) {
    console.error("Error listing professionals:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
