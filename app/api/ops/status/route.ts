import { NextResponse } from "next/server";
import { getOpsStatus } from "@/lib/ops-status";

export async function GET() {
  return NextResponse.json(getOpsStatus());
}
