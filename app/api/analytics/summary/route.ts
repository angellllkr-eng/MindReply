import { NextResponse } from "next/server";
import { db, professionalsTable, bookingsTable } from "@/lib/db";

export async function GET() {
  try {
    const allProfessionals = await db.select().from(professionalsTable);
    const allBookings = await db.select().from(bookingsTable);

    const totalProfessionals = allProfessionals.length;
    const availableProfessionals = allProfessionals.filter((p) => p.availabilityStatus === "available").length;
    const totalBookings = allBookings.length;
    const avgRating = totalProfessionals > 0
      ? allProfessionals.reduce((sum, p) => sum + p.rating, 0) / totalProfessionals
      : 0;

    const roleCounts: Record<string, number> = {};
    for (const p of allProfessionals) {
      roleCounts[p.role] = (roleCounts[p.role] ?? 0) + 1;
    }
    const popularRoles = Object.entries(roleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([role, count]) => ({ role, count }));

    return NextResponse.json({
      totalProfessionals, availableProfessionals, totalBookings,
      activeMembers: 1240,
      avgRating: Math.round(avgRating * 10) / 10,
      popularRoles,
    });
  } catch (err) {
    console.error("Error getting analytics summary:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
