import { NextResponse } from "next/server";
import { getRevenueObservation } from "@/lib/revenue-observer";

export async function GET() {
  return NextResponse.json(await getRevenueObservation());
}
