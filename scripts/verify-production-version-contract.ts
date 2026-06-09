import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(path: string) {
  const fullPath = join(process.cwd(), path);
  assert(existsSync(fullPath), `${path} must exist.`);
  return readFileSync(fullPath, "utf-8");
}

function includes(label: string, value: string, expected: string) {
  assert(value.includes(expected), `${label} must include: ${expected}`);
}

const versionRoute = read("app/api/version/route.ts");
const healthRoute = read("app/api/health/route.ts");
const monitorReport = read("scripts/mragent-monitor-report.mjs");
const reportSchema = read("site/automation/report-schema.yml");

includes("version route", versionRoute, "VERCEL_GIT_COMMIT_SHA");
includes("version route", versionRoute, "VERCEL_PROJECT_PRODUCTION_URL");
includes("version route", versionRoute, "shortSha");
includes("health route", healthRoute, "version:");
includes("health route", healthRoute, "\"/api/version\"");
includes("monitor report", monitorReport, "{ label: \"version\"");
includes("monitor report", monitorReport, "productionVersion");
includes("monitor report", monitorReport, "production is stale");
includes("monitor report", monitorReport, "matchesRun");
includes("report schema", reportSchema, "productionVersion:");
includes("report schema", reportSchema, "https://www.mind-reply.com/api/version");

console.log("Production version contract verification passed.");
