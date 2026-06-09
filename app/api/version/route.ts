import { NextResponse } from "next/server";

export const runtime = "nodejs";

function value(name: string) {
  const raw = process.env[name];
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export async function GET() {
  const commitSha = value("VERCEL_GIT_COMMIT_SHA") || value("GITHUB_SHA");
  const branch = value("VERCEL_GIT_COMMIT_REF") || value("GITHUB_REF_NAME");

  return NextResponse.json({
    status: "ok",
    service: "mindreply-decision-layer",
    timestamp: new Date().toISOString(),
    deployment: {
      commitSha,
      shortSha: commitSha ? commitSha.slice(0, 12) : null,
      branch,
      environment: value("VERCEL_ENV"),
      url: value("VERCEL_URL"),
      projectProductionUrl: value("VERCEL_PROJECT_PRODUCTION_URL"),
      region: value("VERCEL_REGION"),
    },
  });
}
