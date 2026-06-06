import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { productionRequirements } from "../lib/production-requirements";

const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
const envFile = fileArg ? fileArg.slice("--file=".length) : process.env.ENV_FILE;
const environmentArg = process.argv.find((arg) => arg.startsWith("--environment="));
const environment = environmentArg ? environmentArg.slice("--environment=".length) : process.env.VERCEL_ENVIRONMENT || "production";
const apply = process.argv.includes("--apply");
const expectedSiteUrl = (process.env.EXPECTED_SITE_URL || "https://www.mind-reply.com").replace(/\/$/, "").toLowerCase();

function parseEnvFile(path: string) {
  const resolved = resolve(path);
  if (!existsSync(resolved)) {
    throw new Error(`Env file not found: ${resolved}`);
  }

  const values: Record<string, string> = {};
  const lines = readFileSync(resolved, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsAt = line.indexOf("=");
    if (equalsAt <= 0) continue;

    const key = line.slice(0, equalsAt).trim();
    const rawValue = line.slice(equalsAt + 1).trim();
    values[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }

  return values;
}

function isPlaceholder(value: string) {
  const normalized = value.trim().toLowerCase();
  return !normalized
    || normalized === "..."
    || normalized === "changeme"
    || normalized === "change_me"
    || normalized === "todo"
    || normalized === "placeholder"
    || normalized.includes("your_")
    || normalized.includes("example")
    || normalized.includes("password@host")
    || normalized.includes("user:password");
}

function hasUsableValue(values: Record<string, string>, key: string) {
  const value = values[key];
  if (typeof value !== "string" || isPlaceholder(value)) return false;
  if (key === "NEXT_PUBLIC_SITE_URL") {
    return value.replace(/\/$/, "").toLowerCase() === expectedSiteUrl;
  }
  return true;
}

function groupsFor(requirement: typeof productionRequirements[number]) {
  return requirement.alternativeKeyGroups?.length ? requirement.alternativeKeyGroups : [requirement.keys];
}

function selectedKeys(values: Record<string, string>) {
  const keys = new Set<string>();
  const failures: string[] = [];

  for (const requirement of productionRequirements) {
    const groups = groupsFor(requirement);
    const configuredGroup = groups.find((group) => group.every((key) => hasUsableValue(values, key)));

    if (!configuredGroup) {
      failures.push(`${requirement.service}: ${groups.map((group) => group.join(", ")).join(" OR ")}`);
      continue;
    }

    for (const key of configuredGroup) {
      keys.add(key);
    }
  }

  return { keys: [...keys], failures };
}

function runVercelEnvAdd(key: string, value: string) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn("vercel", ["env", "add", key, environment], {
      stdio: ["pipe", "inherit", "inherit"],
      shell: process.platform === "win32",
    });

    child.stdin.end(value);
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`vercel env add ${key} ${environment} failed with exit code ${code}`));
    });
  });
}

async function main() {
  if (!envFile) {
    console.error("Provide a local env file with --file=.env.production.local or ENV_FILE=.env.production.local.");
    process.exitCode = 1;
    return;
  }

  let values: Record<string, string>;
  try {
    values = parseEnvFile(envFile);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  const { keys, failures } = selectedKeys(values);
  if (failures.length > 0) {
    console.error("Refusing to upload because required provider groups are incomplete:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    console.error("No values were printed or uploaded.");
    process.exitCode = 1;
    return;
  }

  console.log(`Prepared ${keys.length} Vercel env var(s) for ${environment}.`);
  for (const key of keys) {
    console.log(`- ${key}`);
  }

  if (!apply) {
    console.log("");
    console.log("Dry run only. Add --apply to upload values with vercel env add. Secret values were not printed.");
    return;
  }

  console.log("");
  console.log("Uploading values to Vercel. Secret values will not be printed.");
  for (const key of keys) {
    const value = values[key];
    console.log(`Uploading ${key}...`);
    await runVercelEnvAdd(key, value);
  }

  console.log("");
  console.log("Upload complete. Redeploy with vercel --prod, then run npm run audit:production.");
}

void main();

export {};
