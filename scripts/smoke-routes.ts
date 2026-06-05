const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const routes = [
  "/",
  "/professionals",
  "/bookings",
  "/tools",
  "/tools/text-refiner",
  "/tools/email-polisher",
  "/agent",
  "/login",
  "/sign-in",
  "/sign-up",
  "/dashboard",
  "/dashboard/analytics",
  "/admin",
  "/memberships",
  "/lexicons",
  "/solutions/psychologists",
  "/solutions/executives",
  "/solutions/legal-counsel",
  "/solutions/financial-advisors",
  "/api/health",
  "/api/agents/active",
  "/api/agents/roster",
  "/api/growth/plan",
  "/api/config/requirements",
  "/api/entitlements",
  "/api/intelligence/analyze",
  "/api/ops/status",
  "/api/professionals",
  "/api/memberships",
  "/api/lexicons",
  "/robots.txt",
  "/sitemap.xml",
] as const;

async function checkRoute(route: string) {
  const url = `${baseUrl}${route}`;
  const response = await fetch(url, { redirect: "manual" });
  const ok = response.status >= 200 && response.status < 400;
  return { route, status: response.status, ok };
}

async function main() {
  const results = await Promise.all(routes.map(checkRoute));
  const failures = results.filter((result) => !result.ok);

  for (const result of results) {
    const marker = result.ok ? "OK" : "FAIL";
    console.log(`${marker} ${String(result.status).padStart(3, " ")} ${result.route}`);
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
