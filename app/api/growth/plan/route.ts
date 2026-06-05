import { NextResponse } from "next/server";
import { getGrowthPlan } from "@/lib/growth-engine";

export async function GET() {
  return NextResponse.json(getGrowthPlan());
}
