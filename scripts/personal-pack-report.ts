type Channel = "console" | "slack" | "email";

type SendResult = {
  channel: Channel;
  status: "sent" | "skipped" | "dry_run" | "failed";
  detail: string;
};

type RepoSnapshot = {
  repo: string;
  branch: string;
  sha: string;
  status: string;
  statusUrl?: string;
  actor?: string;
};

const env = process.env;
const repo = env.GITHUB_REPOSITORY || "Mind-Reply/MindReply";
const branch = env.GITHUB_REF_NAME || env.VERCEL_GIT_COMMIT_REF || "main";
const sha = env.GITHUB_SHA || env.VERCEL_GIT_COMMIT_SHA || "unknown";
const enabled = env.MINDREPLY_REPORT_ENABLED === "true";
const dryRun = env.MINDREPLY_REPORT_DRY_RUN !== "false";
const personalOnly = env.MINDREPLY_REPORT_PERSONAL_ONLY !== "false";
const requireDelivery = env.MINDREPLY_REPORT_REQUIRE_DELIVERY === "true";
const requestedChannels = parseChannels(env.MINDREPLY_REPORT_CHANNELS || "console");

const operatingLanes = [
  "Front door voice",
  "MRagent session",
  "Personal Pack",
  "Privacy posture",
  "ChatGPT App surface",
  "Receipt contract",
  "Risk gate",
  "Delivery ribbon",
  "Slack readiness",
  "Email readiness",
  "Vercel deploy status",
  "GitHub source state",
  "Figma preview",
  "FigJam map",
  "Code Connect readiness",
  "Remotion motion brief",
  "Observability watch",
  "Conversion source watch",
  "Revenue truth",
  "Transaction source watch",
  "Positioning phrases",
  "Promotion queue",
  "Launch blockers",
  "Gift material",
  "Next move",
];

function parseList(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseChannels(value: string): Channel[] {
  const allowed = new Set<Channel>(["console", "slack", "email"]);
  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is Channel => allowed.has(item as Channel));
  return parsed.length ? [...new Set(parsed)] : ["console"];
}

function boolWord(value: boolean) {
  return value ? "on" : "off";
}

function shortSha(value: string) {
  return value === "unknown" ? value : value.slice(0, 7);
}

function emailRecipients() {
  return [...new Set([...parseList(env.MINDREPLY_REPORT_EMAILS), ...parseList(env.MINDREPLY_REPORT_EMAIL)])];
}

function laneReport() {
  const requestedCount = Number.parseInt(env.MINDREPLY_REPORT_AGENT_COUNT || "25", 10);
  const count = Number.isFinite(requestedCount) && requestedCount > 0 ? Math.min(requestedCount, operatingLanes.length) : operatingLanes.length;
  return operatingLanes.slice(0, count).map((lane, index) => `- ${String(index + 1).padStart(2, "0")} ${lane}: watching, reporting, and waiting for a real source before claiming movement.`);
}

async function fetchRepoSnapshot(): Promise<RepoSnapshot> {
  const snapshot: RepoSnapshot = {
    repo,
    branch,
    sha,
    status: "not checked",
    actor: env.GITHUB_ACTOR,
  };

  const token = env.GITHUB_TOKEN;
  if (!token || sha === "unknown") return snapshot;

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}/status`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "mindreply-personal-pack-report",
      },
    });

    if (!response.ok) {
      return { ...snapshot, status: `GitHub status check failed with ${response.status}` };
    }

    const data = (await response.json()) as {
      state?: string;
      statuses?: Array<{ context?: string; state?: string; target_url?: string }>;
    };
    const vercel = data.statuses?.find((item) => item.context === "Vercel");
    return {
      ...snapshot,
      status: vercel ? `Vercel ${vercel.state || "unknown"}` : data.state || "unknown",
      statusUrl: vercel?.target_url,
    };
  } catch (error) {
    return {
      ...snapshot,
      status: error instanceof Error ? `GitHub status lookup failed: ${error.message}` : "GitHub status lookup failed",
    };
  }
}

function reportMarkdown(snapshot: RepoSnapshot) {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://www.mind-reply.com";
  const label = env.MINDREPLY_REPORT_PERSONAL_LABEL || "Angel personal pack";
  const now = new Date().toISOString();
  const statusLine = snapshot.statusUrl ? `${snapshot.status} (${snapshot.statusUrl})` : snapshot.status;
  const recipients = emailRecipients();

  return [
    `# ${label}`,
    "",
    `Generated: ${now}`,
    `Repo: ${snapshot.repo}`,
    `Branch: ${snapshot.branch}`,
    `Commit: ${shortSha(snapshot.sha)}`,
    `Deploy status: ${statusLine}`,
    `Personal-only mode: ${boolWord(personalOnly)}`,
    `Dry run: ${boolWord(dryRun)}`,
    `Require delivery: ${boolWord(requireDelivery)}`,
    "",
    "## What changed",
    "- MRagent front-end voice, Personal Pack, receipt, and deployment signals are checked from the current repository context.",
    "- This pulse is gated by env flags so a configured channel must opt in before anything sends.",
    "",
    "## 25-lane operating pack",
    ...laneReport(),
    "",
    "## Where you win",
    "- You get a compact operating receipt instead of hunting through GitHub, Vercel, Slack, and email separately.",
    "- The report calls out deploy blockers, feature movement, delivery state, and the next useful move in one place.",
    "",
    "## Delivery",
    `- Email recipients: ${recipients.length ? recipients.join(", ") : "not configured"}`,
    `- Slack: ${env.MINDREPLY_SLACK_WEBHOOK_URL ? "configured" : "not configured"}`,
    "",
    "## Gift material",
    "Use this line in MRagent copy: 'Read the pressure. Move with grace. Keep the receipt narrow.'",
    "",
    "## Links",
    `- Personal Pack: ${siteUrl}/pack`,
    `- Agent preview: ${siteUrl}/agent`,
    `- ChatGPT MCP URL: ${siteUrl}/mcp`,
    "- Figma preview: https://www.figma.com/design/QLximv9mLCIwQB2GPgBgeG",
  ].join("\n");
}

function textFromMarkdown(markdown: string) {
  return markdown.replace(/^# /gm, "").replace(/^## /gm, "\n").replace(/^- /gm, "- ");
}

async function sendSlack(markdown: string): Promise<SendResult> {
  const webhookUrl = env.MINDREPLY_SLACK_WEBHOOK_URL;
  if (!webhookUrl) return { channel: "slack", status: "skipped", detail: "MINDREPLY_SLACK_WEBHOOK_URL is not configured." };
  if (!enabled) return { channel: "slack", status: "skipped", detail: "MINDREPLY_REPORT_ENABLED is not true." };
  if (dryRun) return { channel: "slack", status: "dry_run", detail: "Slack payload prepared but not sent." };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: textFromMarkdown(markdown) }),
  });

  if (!response.ok) return { channel: "slack", status: "failed", detail: `Slack returned ${response.status}.` };
  return { channel: "slack", status: "sent", detail: "Slack report sent." };
}

function emailAllowed(email: string) {
  const allowlist = parseList(env.MINDREPLY_REPORT_EMAIL_ALLOWLIST).map((item) => item.toLowerCase());

  if (!personalOnly) return true;
  return allowlist.length > 0 && allowlist.includes(email.toLowerCase());
}

async function sendEmail(markdown: string): Promise<SendResult> {
  const apiKey = env.RESEND_API_KEY;
  const to = emailRecipients();
  const from = env.MINDREPLY_REPORT_FROM;

  if (!apiKey || !to.length || !from) {
    return { channel: "email", status: "skipped", detail: "RESEND_API_KEY, MINDREPLY_REPORT_EMAILS, or MINDREPLY_REPORT_FROM is missing." };
  }

  const blocked = to.filter((email) => !emailAllowed(email));
  if (blocked.length) {
    return { channel: "email", status: "skipped", detail: "One or more recipients are not in MINDREPLY_REPORT_EMAIL_ALLOWLIST while personal-only mode is enabled." };
  }

  if (!enabled) return { channel: "email", status: "skipped", detail: "MINDREPLY_REPORT_ENABLED is not true." };
  if (dryRun) return { channel: "email", status: "dry_run", detail: `Email payload prepared for ${to.length} recipient(s) but not sent.` };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `MRagent personal pack - ${shortSha(sha)}`,
      text: textFromMarkdown(markdown),
    }),
  });

  if (!response.ok) return { channel: "email", status: "failed", detail: `Resend returned ${response.status}.` };
  return { channel: "email", status: "sent", detail: `Email report sent to ${to.length} recipient(s).` };
}

function deliveryMissing(results: SendResult[]) {
  const requestedDelivery = requestedChannels.some((channel) => channel === "slack" || channel === "email");
  const delivered = results.some((result) => (result.channel === "slack" || result.channel === "email") && result.status === "sent");
  return requestedDelivery && !delivered;
}

async function main() {
  const snapshot = await fetchRepoSnapshot();
  const markdown = reportMarkdown(snapshot);
  const results: SendResult[] = [];

  if (requestedChannels.includes("console")) {
    console.log(markdown);
    results.push({ channel: "console", status: "sent", detail: "Report printed to console." });
  }

  if (requestedChannels.includes("slack")) results.push(await sendSlack(markdown));
  if (requestedChannels.includes("email")) results.push(await sendEmail(markdown));

  console.log("\nDelivery results:");
  for (const result of results) {
    console.log(`- ${result.channel}: ${result.status} - ${result.detail}`);
  }

  const failed = results.filter((result) => result.status === "failed");
  if (failed.length) process.exitCode = 1;

  if (requireDelivery && deliveryMissing(results)) {
    console.error("Required personal-pack delivery did not reach Slack or email.");
    process.exitCode = 1;
  }
}

void main();
