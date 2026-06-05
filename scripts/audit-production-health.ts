const baseUrl = (process.env.SMOKE_BASE_URL || process.env.PRODUCTION_BASE_URL || "https://www.mind-reply.com").replace(/\/$/, "");

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
  checks: Record<string, unknown>;
  requirements?: Array<{
    service: string;
    keys: string[];
    healthCheck: string;
    status: string;
    unlocks: string;
  }>;
};

const requiredConfiguredChecks = [
  "database",
  "auth",
  "stripe",
  "stripeWebhook",
  "bookingPayments",
  "analytics",
  "monitoring",
  "slack",
  "coreIntegrations",
  "opsReports",
  "siteUrl",
] as const;

async function main() {
  const response = await fetch(`${baseUrl}/api/health`);
  if (!response.ok) {
    console.error(`Health endpoint failed: ${response.status} ${response.statusText}`);
    process.exitCode = 1;
    return;
  }

  const health = await response.json() as HealthResponse;
  console.log(`Health ${health.status} for ${health.service} at ${health.timestamp}`);

  const fallbackChecks = requiredConfiguredChecks.filter((key) => health.checks[key] !== "configured");
  for (const key of requiredConfiguredChecks) {
    console.log(`${key}: ${String(health.checks[key])}`);
  }

  if (fallbackChecks.length > 0) {
    console.error(`Production env audit failed. Fallback checks: ${fallbackChecks.join(", ")}`);
    if (health.requirements?.length) {
      console.error("Missing service requirements:");
      for (const requirement of health.requirements.filter((item) => item.status !== "configured")) {
        console.error(`- ${requirement.service}: ${requirement.keys.join(", ")} -> ${requirement.unlocks}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  console.log("Production env audit passed. Required checks are configured.");
}

void main();

export {};
