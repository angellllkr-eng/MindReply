import { NextRequest, NextResponse } from "next/server";
import { getMembershipEntitlement, normalizeMembershipTier } from "@/lib/fulfillment";

const tiers = ["signal", "growth", "pro"] as const;

export async function GET(req: NextRequest) {
  const requestedTier = req.nextUrl.searchParams.get("tier");
  const tier = normalizeMembershipTier(requestedTier);

  return NextResponse.json({
    status: "ready",
    selected: getMembershipEntitlement(tier),
    catalog: tiers.map((value) => getMembershipEntitlement(value)),
  });
}
