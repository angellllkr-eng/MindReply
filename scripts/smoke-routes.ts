const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const retryAttempts = Number(process.env.CHECK_RETRY_ATTEMPTS || 3);
const retryDelayMs = Number(process.env.CHECK_RETRY_DELAY_MS || 500);

type SmokeRoute = {
  path: string;
  expectedStatuses?: number[];
};

const routes = [
  { path: "/" },
  { path: "/professionals" },
  { path: "/bookings" },
  { path: "/tools" },
  { path: "/tools/text-refiner" },
  { path: "/tools/email-polisher" },
  { path: "/agent" },
  { path: "/login" },
  { path: "/sign-in" },
  { path: "/sign-up" },
  { path: "/dashboard" },
  { path: "/dashboard/analytics" },
  { path: "/admin" },
  { path: "/memberships" },
  { path: "/integrations" },
  { path: "/lexicons" },
  { path: "/solutions/psychologists" },
  { path: "/solutions/executives" },
  { path: "/solutions/legal-counsel" },
  { path: "/solutions/financial-advisors" },
  { path: "/health" },
  { path: "/api/health" },
  { path: "/api/agent" },
  { path: "/api/checkout/booking-session" },
  { path: "/api/checkout/credits" },
  { path: "/api/agents/active" },
  { path: "/api/agents/accelerate" },
  { path: "/api/agents/roster" },
  { path: "/api/agents/learning" },
  { path: "/api/agents/execution-queue", expectedStatuses: [401] },
  { path: "/api/agents/permanent", expectedStatuses: [401] },
  { path: "/api/growth/plan" },
  { path: "/api/slack/test" },
  { path: "/api/integrations/status" },
  { path: "/api/integrations/connect/slack" },
  { path: "/api/integrations/connect/gmail" },
  { path: "/api/integrations/connect/notion" },
  { path: "/api/config/requirements" },
  { path: "/api/entitlements" },
  { path: "/api/intelligence/analyze" },
  { path: "/api/ops/status" },
  { path: "/api/ops/report", expectedStatuses: [401] },
  { path: "/api/revenue/observer", expectedStatuses: [401] },
  { path: "/api/professionals" },
  { path: "/api/memberships" },
  { path: "/api/lexicons" },
  { path: "/robots.txt" },
  { path: "/sitemap.xml" },
] satisfies SmokeRoute[];

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

async function checkRoute(route: SmokeRoute) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetchWithRetry(url, { redirect: "manual" });
  const ok = route.expectedStatuses
    ? route.expectedStatuses.includes(response.status)
    : response.status >= 200 && response.status < 400;
  return { route: route.path, expectedStatuses: route.expectedStatuses, status: response.status, ok };
}

async function main() {
  const results = await Promise.all(routes.map(checkRoute));
  const failures = results.filter((result) => !result.ok);

  for (const result of results) {
    const marker = result.ok ? "OK" : "FAIL";
    const expectation = result.expectedStatuses ? ` expected ${result.expectedStatuses.join("|")}` : "";
    console.log(`${marker} ${String(result.status).padStart(3, " ")} ${result.route}${expectation}`);
  }

  if (failures.length > 0) {
    console.error(`Smoke check failed for ${failures.length} route(s) against ${baseUrl}.`);
    process.exitCode = 1;
  } else {
    console.log(`Smoke check passed for ${results.length} route(s) against ${baseUrl}.`);
  }
}

void main();

export {};
