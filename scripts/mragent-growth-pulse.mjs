import { existsSync, readFileSync, writeFileSync } from "node:fs";

const outputPath = process.env.MRAGENT_GROWTH_PULSE_JSON || "mragent-growth-pulse.json";
const sources = {
  visibilityPlan: "site/growth/visibility-plan.yml",
  liveCopySync: "site/growth/live-copy-sync.yml",
  searchIntents: "site/growth/search-intents.yml",
  adMessaging: "site/ads/messaging.yml",
  adCopyTests: "site/ads/copy-tests.yml",
  previewQa: "site/growth/preview-qa.yml",
  previewResults: "site/growth/preview-results.yml",
};

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

function firstMatch(text, pattern, fallback = null) {
  const match = text.match(pattern);
  return match?.[1]?.trim() || fallback;
}

function collectKeys(text, sectionName) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim() === `${sectionName}:`);
  if (start === -1) return [];
  const keys = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const match = line.match(/^\s{2}([a-z0-9_]+):/i);
    if (match) keys.push(match[1]);
  }
  return keys;
}

function collectBullets(text, sectionName) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim() === `${sectionName}:`);
  if (start === -1) return [];
  const bullets = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const match = line.match(/^\s*-\s+(.+)$/);
    if (match) bullets.push(match[1].trim());
  }
  return bullets;
}

function containsAll(text, values) {
  return values.every((value) => text.includes(value));
}

const files = Object.fromEntries(Object.entries(sources).map(([label, path]) => [label, { path, present: existsSync(path), content: read(path) }]));
const visibility = files.visibilityPlan.content;
const liveCopy = files.liveCopySync.content;
const search = files.searchIntents.content;
const adMessaging = files.adMessaging.content;
const adCopy = files.adCopyTests.content;
const previewResults = files.previewResults.content;

const promise = firstMatch(adMessaging, /^promise:\s*(.+)$/m) || firstMatch(visibility, /^\s+promise:\s*(.+)$/m);
const strongestAngle = firstMatch(visibility, /^\s+strongest_angle:\s*(.+)$/m) || firstMatch(search, /^\s+promise:\s*(.+)$/m);
const primaryLane = firstMatch(search, /^primary_lane:\s*(.+)$/m);
const nextVisibilityTask = firstMatch(visibility, /^\s*-\s+(.+)$/m);
const nextSyncTask = firstMatch(liveCopy, /^next_sync_task:\s*(.+)$/m);
const searchClusters = collectKeys(search, "intent_clusters");
const copyTests = collectKeys(adCopy, "tests");
const guardrails = collectBullets(visibility, "guardrails");
const copyAligned = containsAll(liveCopy, ["status: aligned", "Warm mind read. Clear next move.", "Capture fresh /agent production preview"]);
const previewPending = /pending_capture/i.test(previewResults);
const requiredFilesReady = Object.values(files).every((file) => file.present);

const recommendedAction = previewPending
  ? "Capture fresh /agent production preview after the active deployment/domain mismatch is cleared."
  : nextSyncTask || nextVisibilityTask || "Review search and ad copy against live page text.";
const status = requiredFilesReady && promise && primaryLane && copyTests.length >= 3 ? "ready" : "check";
const generatedAt = new Date().toISOString();

const pulse = {
  generatedAt,
  status,
  positioning: {
    promise,
    strongestAngle,
    primaryLane,
    guardrails,
  },
  search: {
    clusters: searchClusters,
    count: searchClusters.length,
  },
  ads: {
    tests: copyTests,
    count: copyTests.length,
  },
  alignment: {
    requiredFilesReady,
    copyAligned,
    previewPending,
  },
  next: {
    visibilityTask: nextVisibilityTask,
    syncTask: nextSyncTask,
    recommendedAction,
  },
  sources: Object.fromEntries(Object.entries(files).map(([label, file]) => [label, { path: file.path, present: file.present }])),
};

writeFileSync(outputPath, `${JSON.stringify(pulse, null, 2)}\n`, "utf-8");

console.log("# MRagent growth pulse");
console.log("");
console.log(`Time: ${generatedAt}`);
console.log(`Status: ${status}`);
console.log(`Promise: ${promise || "missing"}`);
console.log(`Primary lane: ${primaryLane || "missing"}`);
console.log(`Search clusters: ${searchClusters.join(", ") || "missing"}`);
console.log(`Ad tests: ${copyTests.join(", ") || "missing"}`);
console.log(`Copy aligned: ${copyAligned ? "yes" : "check"}`);
console.log(`Preview pending: ${previewPending ? "yes" : "no"}`);
console.log(`Next: ${recommendedAction}`);
