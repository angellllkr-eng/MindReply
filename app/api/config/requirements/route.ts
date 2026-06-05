import { NextResponse } from "next/server";
import { getOpsStatus } from "@/lib/ops-status";
import { productionRequirements } from "@/lib/production-requirements";

export async function GET() {
  const opsStatus = getOpsStatus();
  const services = opsStatus.serviceChecks.map((check) => ({
    service: check.service,
    key: check.key,
    status: check.status,
    owner: check.owner
      ? {
          id: check.owner.id,
          role: check.owner.role,
          lane: check.owner.lane,
          escalation: check.owner.escalation,
        }
      : null,
    requirementKeys: check.requirementKeys,
    unlocks: check.unlocks,
    nextAction: check.nextAction,
  }));

  return NextResponse.json({
    status: opsStatus.fallbackCount === 0 ? "configured" : "fallback",
    generatedAt: opsStatus.generatedAt,
    configuredCount: opsStatus.configuredCount,
    fallbackCount: opsStatus.fallbackCount,
    requiredServices: productionRequirements,
    services,
    nextActions: opsStatus.nextActions,
    note: "Secret values are never exposed. This endpoint only reports whether required production environment variables are present.",
  });
}
