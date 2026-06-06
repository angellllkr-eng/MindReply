const baseUrl = (process.env.PRODUCTION_BASE_URL || process.env.SMOKE_BASE_URL || "https://www.mind-reply.com").replace(/\/$/, "");
const allowFallback = process.env.ALLOW_FALLBACK === "1";
const ownerSecret = process.env.REVENUE_OWNER_SECRET?.trim() || process.env.OWNER_BEARER_TOKEN?.trim() || "";
const ownerEvidenceRequired = process.env.OWNER_EVIDENCE_REQUIRED === "1";
const retryAttempts = Number(process.env.CHECK_RETRY_ATTEMPTS || 3);
const retryDelayMs = Number(process.env.CHECK_RETRY_DELAY_MS || 500);

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

type RevenueObservationResponse = {
  status: string;
  targetPerDay: number;
  todaySales: number | null;
  measurement: {
    source: "database" | "fallback";
  };
};

type OpsReportResponse = {
  status: string;
  service: string;
  recipient: string;
  salesObserver: RevenueObservationResponse;
  operations: {
    fallbackCount: number;
  };
};

type PermanentAgentsResponse = {
  status: string;
  staffing: {
    totalPermanentRoles: number;
    activeAutomationDesks: number;
  };
  revenueTarget: {
    dailySales: number;
    todaySales: number | null;
  };
};

type EvidenceCheck = {
  name: string;
  status: "pass" | "fail" | "warn";
  evidence: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit) {
  let lastError: unknown;
  const attempts = Math.max(1, retryAttempts);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(retryDelayMs * attempt);
      }
    }
  }

  throw lastError;
}

async function getJson<T>(path: string, headers?: HeadersInit) {
  const response = await fetchWithRetry(`${baseUrl}${path}`, { headers, redirect: "manual" });
  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${response.statusText}`);
  }
  return await response.json() as T;
}

async function statusFor(path: string) {
  const response = await fetchWithRetry(`${baseUrl}${path}`, { redirect: "manual" });
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

  if (ownerSecret) {
    try {
      const ownerHeaders = { authorization: `Bearer ${ownerSecret}` };
      const [revenue, report, permanent] = await Promise.all([
        getJson<RevenueObservationResponse>("/api/revenue/observer", ownerHeaders),
        getJson<OpsReportResponse>("/api/ops/report", ownerHeaders),
        getJson<PermanentAgentsResponse>("/api/agents/permanent", ownerHeaders),
      ]);
      const backedByProviders = revenue.measurement.source === "database" && report.operations.fallbackCount === 0;

      checks.push({
        name: "authorized owner evidence",
        status: backedByProviders ? "pass" : allowFallback ? "warn" : "fail",
        evidence: [
          `revenue=${revenue.status}/${revenue.measurement.source}`,
          `sales=${revenue.todaySales ?? "unmeasured"}/${revenue.targetPerDay}`,
          `ops=${report.status}/${report.operations.fallbackCount} fallback`,
          `agents=${permanent.staffing.activeAutomationDesks}/${permanent.staffing.totalPermanentRoles}`,
        ].join(", "),
      });
    } catch (error) {
      checks.push({
        name: "authorized owner evidence",
        status: "fail",
        evidence: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    checks.push({
      name: "authorized owner evidence",
      status: ownerEvidenceRequired ? "fail" : "warn",
      evidence: "skipped; set REVENUE_OWNER_SECRET or OWNER_BEARER_TOKEN locally to verify owner-only payloads",
    });
  }

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
