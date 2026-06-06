const baseUrl = (process.env.PRODUCTION_BASE_URL || process.env.SMOKE_BASE_URL || "https://www.mind-reply.com").replace(/\/$/, "");
const allowFallback = process.env.ALLOW_FALLBACK === "1";

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
  checks: Record<string, unknown>;
};

type RequirementsResponse = {
  status: string;
  configuredCount: number;
  fallbackCount: number;
  services: Array<{
    service: string;
    key: string;
    status: "configured" | "fallback";
    nextAction: string;
  }>;
};

type IntegrationStatusResponse = {
  status: "configured" | "fallback";
  integrations: Array<{
    name: string;
    status: "configured" | "fallback";
    requiredEnv: string[];
  }>;
};

type AccelerationResponse = {
  status: string;
  mode: string;
  totalActiveAgents: number;
  multiplier: number;
};

type EvidenceCheck = {
  name: string;
  status: "pass" | "fail" | "warn";
  evidence: string;
};

async function getJson<T>(path: string) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${response.statusText}`);
  }
  return await response.json() as T;
}

async function statusFor(path: string) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  return response.status;
}

function printCheck(check: EvidenceCheck) {
  const marker = check.status.toUpperCase().padEnd(4, " ");
  console.log(`${marker} ${check.name}: ${check.evidence}`);
}

async function main() {
  const checks: EvidenceCheck[] = [];

  console.log(`MindReply production evidence for ${baseUrl}`);
  console.log(`Generated at ${new Date().toISOString()}`);

  let health: HealthResponse;
  let requirements: RequirementsResponse;
  let integrations: IntegrationStatusResponse;
  let acceleration: AccelerationResponse;

  try {
    [health, requirements, integrations, acceleration] = await Promise.all([
      getJson<HealthResponse>("/api/health"),
      getJson<RequirementsResponse>("/api/config/requirements"),
      getJson<IntegrationStatusResponse>("/api/integrations/status"),
      getJson<AccelerationResponse>("/api/agents/accelerate"),
    ]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  checks.push({
    name: "health endpoint",
    status: health.status === "ok" ? "pass" : "fail",
    evidence: `${health.service} ${health.status} at ${health.timestamp}`,
  });

  checks.push({
    name: "provider readiness",
    status: requirements.fallbackCount === 0 ? "pass" : allowFallback ? "warn" : "fail",
    evidence: `${requirements.configuredCount} configured / ${requirements.fallbackCount} fallback`,
  });

  checks.push({
    name: "core integrations",
    status: integrations.status === "configured" ? "pass" : allowFallback ? "warn" : "fail",
    evidence: integrations.integrations
      .map((item) => `${item.name}:${item.status === "configured" ? "configured" : `missing(${item.requiredEnv.length})`}`)
      .join(", "),
  });

  checks.push({
    name: "x66 active desks",
    status: acceleration.mode === "x66 acceleration" && acceleration.totalActiveAgents >= 60 ? "pass" : "fail",
    evidence: `${acceleration.mode}, multiplier ${acceleration.multiplier}, agents ${acceleration.totalActiveAgents}`,
  });

  const ownerGateStatuses = await Promise.all([
    statusFor("/api/revenue/observer"),
    statusFor("/api/ops/report"),
    statusFor("/api/agents/permanent"),
  ]);

  checks.push({
    name: "owner-only revenue gates",
    status: ownerGateStatuses.every((status) => status === 401) ? "pass" : "fail",
    evidence: `/api/revenue/observer=${ownerGateStatuses[0]}, /api/ops/report=${ownerGateStatuses[1]}, /api/agents/permanent=${ownerGateStatuses[2]}`,
  });

  const seoStatuses = await Promise.all([
    statusFor("/sitemap.xml"),
    statusFor("/robots.txt"),
  ]);

  checks.push({
    name: "seo files",
    status: seoStatuses.every((status) => status >= 200 && status < 400) ? "pass" : "fail",
    evidence: `/sitemap.xml=${seoStatuses[0]}, /robots.txt=${seoStatuses[1]}`,
  });

  console.log("");
  for (const check of checks) {
    printCheck(check);
  }

  const fallbackServices = requirements.services.filter((service) => service.status !== "configured");
  if (fallbackServices.length > 0) {
    console.log("");
    console.log("Fallback services:");
    for (const service of fallbackServices) {
      console.log(`- ${service.service}: ${service.nextAction}`);
    }
  }

  const failures = checks.filter((check) => check.status === "fail");
  if (failures.length > 0) {
    console.error("");
    console.error(`Production evidence failed ${failures.length} check(s).`);
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("Production evidence passed.");
}

void main();

export {};
