import { NextResponse } from "next/server";

import { mragentPersistenceConfigured } from "@/lib/mragent";
import { getMRAgentMcpManifest } from "@/lib/mragent-mcp";

export const runtime = "nodejs";

function value(name: string) {
  const raw = process.env[name];
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export async function GET() {
  const manifest = getMRAgentMcpManifest();
  const blobConfigured = mragentPersistenceConfigured();
  const commitSha = value("VERCEL_GIT_COMMIT_SHA") || value("GITHUB_SHA");

  return NextResponse.json({
    status: "ok",
    service: "mindreply-decision-layer",
    timestamp: new Date().toISOString(),
    version: {
      commitSha,
      shortSha: commitSha ? commitSha.slice(0, 12) : null,
      branch: value("VERCEL_GIT_COMMIT_REF") || value("GITHUB_REF_NAME"),
      environment: value("VERCEL_ENV"),
    },
    connectionUrls: {
      primaryMcp: "/mcp",
      fallbackMcp: "/api/mcp",
      version: "/api/version",
      agent: "/agent",
    },
    checks: {
      intakeLayer: "ready",
      actionLayer: "ready",
      memoryLayer: "ready",
      triageAgent: "ready",
      replyAgent: "ready",
      followUpAgent: "ready",
      riskAgent: "ready",
      privacyDefaults: "ready",
      mcpApp: "ready",
      mcpTools: manifest.tools.map((tool) => tool.name),
      generationPersistence: blobConfigured ? "ready" : "fallback",
      blobConfigured,
      providerConfigured: Boolean(process.env.OPENAI_API_KEY),
    },
  });
}
