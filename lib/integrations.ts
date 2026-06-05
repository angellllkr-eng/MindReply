import { isSlackConfigured } from "@/lib/slack";

export type IntegrationKey = "slack" | "gmail" | "notion";

type IntegrationStatus = {
  key: IntegrationKey;
  name: string;
  status: "configured" | "fallback";
  requiredEnv: string[];
  revenueUse: string;
};

function hasAll(keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]?.trim()));
}

export function getIntegrationStatuses(): IntegrationStatus[] {
  const gmailEnv = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
  const notionEnv = ["NOTION_CLIENT_ID", "NOTION_CLIENT_SECRET"];

  return [
    {
      key: "slack",
      name: "Slack",
      status: isSlackConfigured() ? "configured" : "fallback",
      requiredEnv: ["SLACK_WEBHOOK_URL"],
      revenueUse: "Team workflow penetration and multi-user dependency for Pro.",
    },
    {
      key: "gmail",
      name: "Gmail",
      status: hasAll(gmailEnv) ? "configured" : "fallback",
      requiredEnv: gmailEnv,
      revenueUse: "Inbox takeover for daily founder and agency communication workflows.",
    },
    {
      key: "notion",
      name: "Notion",
      status: hasAll(notionEnv) ? "configured" : "fallback",
      requiredEnv: notionEnv,
      revenueUse: "Knowledge and operations memory layer for long-term retention.",
    },
  ];
}

export function areCoreIntegrationsConfigured() {
  return getIntegrationStatuses().every((integration) => integration.status === "configured");
}
