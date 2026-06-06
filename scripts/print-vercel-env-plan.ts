import { productionRequirements } from "../lib/production-requirements";

const baseUrl = (process.env.PRODUCTION_BASE_URL || "https://www.mind-reply.com").replace(/\/$/, "");
const environment = process.env.VERCEL_ENVIRONMENT || "production";

type RequirementStatus = {
  service: string;
  key: string;
  status: "configured" | "fallback";
  nextAction: string;
};

type RequirementsResponse = {
  status: string;
  configuredCount: number;
  fallbackCount: number;
  services: RequirementStatus[];
};

function envKeysFor(requirementKey: string) {
  const requirement = productionRequirements.find((item) => item.healthCheck === requirementKey);
  if (!requirement) return [];
  return requirement.alternativeKeyGroups?.[0] ?? requirement.keys;
}

function alternativeNote(requirementKey: string) {
  const requirement = productionRequirements.find((item) => item.healthCheck === requirementKey);
  if (!requirement?.alternativeKeyGroups || requirement.alternativeKeyGroups.length < 2) return null;
  return `Aliases accepted: ${requirement.alternativeKeyGroups.map((group) => group.join(" + ")).join(" OR ")}`;
}

async function main() {
  const response = await fetch(`${baseUrl}/api/config/requirements`);
  if (!response.ok) {
    console.error(`Could not load production requirements: ${response.status} ${response.statusText}`);
    process.exitCode = 1;
    return;
  }

  const requirements = await response.json() as RequirementsResponse;
  const fallbackServices = requirements.services.filter((service) => service.status !== "configured");
  const commandKeys = new Set<string>();

  console.log(`MindReply Vercel env plan for ${baseUrl}`);
  console.log(`Status: ${requirements.configuredCount} configured / ${requirements.fallbackCount} fallback`);
  console.log("");

  if (fallbackServices.length === 0) {
    console.log("All provider groups are configured. Run:");
    console.log(`PRODUCTION_BASE_URL=${baseUrl} npm run audit:production`);
    return;
  }

  console.log("Fallback services and next actions:");
  for (const service of fallbackServices) {
    console.log(`- ${service.service}: ${service.nextAction}`);
    const note = alternativeNote(service.key);
    if (note) console.log(`  ${note}`);
    for (const key of envKeysFor(service.key)) {
      commandKeys.add(key);
    }
  }

  console.log("");
  console.log("Run these from the repo root with Vercel access. Enter secret values only into the Vercel prompt or dashboard:");
  for (const key of commandKeys) {
    console.log(`vercel env add ${key} ${environment}`);
  }

  console.log("");
  console.log("Then redeploy and verify:");
  console.log("vercel --prod");
  console.log(`PRODUCTION_BASE_URL=${baseUrl} npm run audit:production`);
  console.log(`SMOKE_BASE_URL=${baseUrl} npm run smoke`);
  console.log("");
  console.log("Do not paste secret values into chat, docs, commits, shell history, or issue trackers.");
}

void main();

export {};
