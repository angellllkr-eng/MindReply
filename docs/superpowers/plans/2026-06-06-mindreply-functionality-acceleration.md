# MindReply Functionality Acceleration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the next visible platform pass prove faster product delivery: MRagent routes urgent users into Message Rescue, paid rescue users get a dedicated workspace, and CI verifies the revenue path before deployment.

**Architecture:** Keep the production app as a single Next.js App Router codebase. Reuse existing route handlers, localStorage dashboard activation, `logMetric`, and static verification scripts instead of introducing new services. Each task ends with focused verification and a commit so deployment can proceed incrementally.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Stripe Checkout Sessions, Drizzle/Postgres metric logging, GitHub Actions, Vercel deployments.

---

## Scope Check

This plan covers one deployable subsystem: the customer path from MRagent to Message Rescue purchase to delivered workspace to backend evidence. It deliberately does not configure external provider secrets, create real staff accounts, or mutate Neon/Vercel dashboards because those require provider-side access and should be handled in a separate environment-operations plan.

## File Structure

- `lib/agent-engine.ts`: Detect Message Rescue intent and produce a human, sales-aware local reply when AI providers are unavailable.
- `app/agent/page.tsx`: Add a Message Rescue quick prompt and keep visible chat routing aligned with the new offer.
- `scripts/verify-agent-behavior.ts`: Assert MRagent routes rescue, credits, bookings, broad questions, and memberships correctly.
- `app/rescue/workspace/page.tsx`: Dedicated three-message delivery workspace for confirmed or prospective Message Rescue users.
- `components/PurchaseSuccessPanel.tsx`: Link verified rescue purchases into the workspace.
- `app/api/checkout/rescue-session/route.ts`: Verify Stripe session metadata and log fulfilled rescue purchases through `logMetric`.
- `scripts/verify-rescue-offer.ts`: Assert checkout metadata, server verification, workspace delivery, dashboard links, and backend fulfillment evidence.
- `scripts/verify-production-acceleration.ts`: New high-level static verifier for the whole accelerated revenue path.
- `package.json`: Add `production:verify`.
- `.github/workflows/ci.yml`: Run `production:verify` after focused payment/agent checks.

---

### Task 1: Stabilize Current MRagent Message Rescue Routing

**Files:**
- Modify: `lib/agent-engine.ts`
- Modify: `app/agent/page.tsx`
- Modify: `scripts/verify-agent-behavior.ts`

- [ ] **Step 1: Write the failing rescue-intent assertions**

Add this block to `scripts/verify-agent-behavior.ts` after the booking-and-credits assertions:

```ts
const rescuePrompt = "I have a difficult client reply I keep avoiding and need it send-ready today";
const rescueAnalysis = analyzeCommunication(rescuePrompt);
assert.equal(rescueAnalysis.intent, "message_rescue");

const rescueReply = buildLocalAgentReply(rescuePrompt, rescueAnalysis);
assert.match(rescueReply, /Message Rescue/i);
assert.match(rescueReply, /3 difficult messages|send-ready/i);
assert.match(rescueReply, /credits|professional/i);
```

- [ ] **Step 2: Run the verifier and confirm it fails before implementation**

Run:

```bash
npm.cmd run agent:verify
```

Expected before implementation:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal
```

- [ ] **Step 3: Add Message Rescue intent detection**

In `lib/agent-engine.ts`, add this constant after `wantsMembership`:

```ts
const wantsRescue = /\b(rescue|stuck|avoid|avoiding|difficult message|sensitive message|urgent reply|client reply|apology|refund|boundary|fee message|send-ready)\b/i.test(message);
```

Then update the `intent` expression so Message Rescue wins before memberships and credit routing:

```ts
const intent = wantsBooking && wantsCredits
  ? "booking_and_credits"
  : wantsRescue
    ? "message_rescue"
  : wantsMembership
    ? "membership_upgrade"
  : wantsCredits
    ? "credit_purchase"
  : wantsBooking
    ? "professional_booking"
  : lower.includes("email")
    ? "message_refinement"
  : lower.includes("team")
    ? "leadership_alignment"
  : asksBroadQuestion && !wantsGeneralChat
    ? "broad_question"
  : wantsGeneralChat
    ? "general_assistant"
  : "communication_strategy";
```

- [ ] **Step 4: Add the local Message Rescue reply**

In `buildLocalAgentReply`, insert this block after the `booking_and_credits` branch:

```ts
if (analysis.intent === "message_rescue") {
  return "Use Message Rescue for this. It is built for the moment when one reply is taking too much mental bandwidth: pay once, paste up to 3 difficult messages, and use the workspace to turn them into calm, send-ready wording. If you only need one light rewrite, credits are enough. If the message is high-stakes or specialist, pair the rescue with a professional review.";
}
```

- [ ] **Step 5: Add the visible quick prompt**

In `app/agent/page.tsx`, change the icon import:

```ts
import { Bot, CalendarDays, CreditCard, MessageSquare, Send, Sparkles, TrendingUp } from "lucide-react";
```

Insert this first item in `quickPrompts`:

```ts
{ icon: MessageSquare, label: "Rescue message", prompt: "I have a difficult client reply I keep avoiding. What is the fastest way to handle it?" },
```

Change the MRagent sublabel to:

```tsx
<p className="text-xs" style={{ color: "hsl(220 25% 45%)" }}>Online for chat, Message Rescue, credits, bookings, and plan routing</p>
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm.cmd run agent:verify
npm.cmd run typecheck
npm.cmd run build
Run the repository secret scan command used in current project verification, excluding `node_modules` and `.next`.
```

Expected:

```text
MRagent behavior checks passed.
Route types generated successfully
Compiled successfully
```

The secret scan command should exit with no matches.

Commit:

```bash
git add -- lib/agent-engine.ts app/agent/page.tsx scripts/verify-agent-behavior.ts
git commit -m "Route MRagent into message rescue"
```

---

### Task 2: Add a Product-Delivery Workspace Verification Gate

**Files:**
- Modify: `scripts/verify-rescue-offer.ts`
- Verify existing: `app/rescue/workspace/page.tsx`
- Verify existing: `components/PurchaseSuccessPanel.tsx`

- [ ] **Step 1: Add workspace assertions**

In `scripts/verify-rescue-offer.ts`, define the workspace path:

```ts
const rescueWorkspacePath = "app/rescue/workspace/page.tsx";
```

Read the file:

```ts
const rescueWorkspace = readProjectFile(rescueWorkspacePath);
```

Add these assertions after the rescue page checkout assertion:

```ts
assert(
  /\/api\/tools\/email-polisher/.test(rescueWorkspace),
  "Message Rescue workspace must deliver output through the existing tool API.",
);
assert(
  /mindreply\.rescue\.workspace/.test(rescueWorkspace),
  "Message Rescue workspace must persist the buyer's three message slots.",
);
```

Add this dashboard assertion after the localStorage activation assertion:

```ts
assert(/\/rescue\/workspace/.test(purchasePanel), "Verified checkout success must link to the Message Rescue workspace.");
```

- [ ] **Step 2: Run the verifier**

Run:

```bash
npm.cmd run rescue:verify
```

Expected:

```text
Message Rescue offer verification passed.
```

- [ ] **Step 3: Commit if any verifier edits were made**

Run:

```bash
git add -- scripts/verify-rescue-offer.ts
git commit -m "Verify message rescue delivery workspace"
```

Expected:

```text
[main <sha>] Verify message rescue delivery workspace
```

---

### Task 3: Persist Backend Fulfillment Evidence for Message Rescue

**Files:**
- Modify: `app/api/checkout/rescue-session/route.ts`
- Modify: `scripts/verify-rescue-offer.ts`

- [ ] **Step 1: Extend the verifier first**

In `scripts/verify-rescue-offer.ts`, add these assertions after the offer slug metadata assertion:

```ts
assert(
  /eventName:\s*"message_rescue\.fulfilled"/.test(sessionRoute),
  "Confirmed Message Rescue purchases must be logged for backend fulfillment evidence.",
);
assert(
  /persisted:\s*metric\.logged/.test(sessionRoute),
  "Message Rescue verification must return whether backend fulfillment evidence was persisted.",
);
```

Run:

```bash
npm.cmd run rescue:verify
```

Expected before implementation:

```text
Confirmed Message Rescue purchases must be logged for backend fulfillment evidence.
```

- [ ] **Step 2: Import metric logging**

At the top of `app/api/checkout/rescue-session/route.ts`, add:

```ts
import { logMetric } from "@/lib/metrics";
```

- [ ] **Step 3: Add persisted response support**

Change the `rescueVerificationResponse` input type from:

```ts
function rescueVerificationResponse(input: {
  configured: boolean;
  confirmed: boolean;
  status: string;
  paymentStatus: string;
  reason?: string | null;
}) {
```

to:

```ts
function rescueVerificationResponse(input: {
  configured: boolean;
  confirmed: boolean;
  status: string;
  paymentStatus: string;
  persisted?: boolean;
  reason?: string | null;
}) {
```

Then change the fulfillment payload from:

```ts
fulfillment: {
  persisted: false,
  reason: input.reason ?? null,
},
```

to:

```ts
fulfillment: {
  persisted: input.persisted ?? false,
  reason: input.reason ?? null,
},
```

- [ ] **Step 4: Log confirmed rescue sessions**

Replace the final confirmed response block with:

```ts
const confirmed = isConfirmedRescuePayment(session);
const metric = confirmed
  ? await logMetric({
      eventName: "message_rescue.fulfilled",
      eventValue: {
        sessionId: session.id,
        customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
        paymentStatus: session.payment_status,
        offer: messageRescueOffer.slug,
        messages: messageRescueOffer.messages,
        deliveryMinutes: messageRescueOffer.deliveryMinutes,
      },
    })
  : { logged: false as const, reason: "payment_not_confirmed" as const };

return rescueVerificationResponse({
  configured: true,
  confirmed,
  status: session.status ?? "unknown",
  paymentStatus: session.payment_status ?? "unknown",
  persisted: metric.logged,
  reason: confirmed ? (metric.logged ? "server_rescue_metric" : "client_rescue_delivery") : "payment_not_confirmed",
});
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm.cmd run rescue:verify
npm.cmd run typecheck
npm.cmd run build
Run the repository secret scan command used in current project verification, excluding `node_modules` and `.next`.
```

Expected:

```text
Message Rescue offer verification passed.
Route types generated successfully
Compiled successfully
```

Commit:

```bash
git add -- app/api/checkout/rescue-session/route.ts scripts/verify-rescue-offer.ts
git commit -m "Log message rescue fulfillment evidence"
```

---

### Task 4: Add a Unified Production Acceleration Verifier

**Files:**
- Create: `scripts/verify-production-acceleration.ts`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the verifier**

Create `scripts/verify-production-acceleration.ts` with this complete content:

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const requiredFiles = [
  "app/rescue/page.tsx",
  "app/rescue/workspace/page.tsx",
  "app/api/checkout/rescue/route.ts",
  "app/api/checkout/rescue-session/route.ts",
  "components/PurchaseSuccessPanel.tsx",
  "lib/agent-engine.ts",
  "scripts/verify-agent-behavior.ts",
  "scripts/verify-rescue-offer.ts",
];

for (const file of requiredFiles) {
  assert(existsSync(join(process.cwd(), file)), `Missing required acceleration file: ${file}`);
}

const home = readProjectFile("app/page.tsx");
const agent = readProjectFile("app/agent/page.tsx");
const agentEngine = readProjectFile("lib/agent-engine.ts");
const rescuePage = readProjectFile("app/rescue/page.tsx");
const rescueWorkspace = readProjectFile("app/rescue/workspace/page.tsx");
const rescueSession = readProjectFile("app/api/checkout/rescue-session/route.ts");
const successPanel = readProjectFile("components/PurchaseSuccessPanel.tsx");
const ci = readProjectFile(".github/workflows/ci.yml");
const packageJson = readProjectFile("package.json");

assert(/href="\/rescue"/.test(home), "Homepage must route primary revenue CTA to /rescue.");
assert(/Rescue message/.test(agent), "MRagent UI must expose a Message Rescue quick prompt.");
assert(/message_rescue/.test(agentEngine), "MRagent engine must detect message_rescue intent.");
assert(/Message Rescue/.test(rescuePage), "Message Rescue public page must use customer-facing offer copy.");
assert(/\/api\/checkout\/rescue/.test(rescuePage), "Message Rescue page must post to the rescue checkout route.");
assert(/mindreply\.rescue\.workspace/.test(rescueWorkspace), "Workspace must persist delivery slots locally.");
assert(/\/api\/tools\/email-polisher/.test(rescueWorkspace), "Workspace must generate output through an existing tool API.");
assert(/message_rescue\.fulfilled/.test(rescueSession), "Rescue session verification must log backend fulfillment evidence.");
assert(/\/api\/checkout\/rescue-session/.test(successPanel), "Dashboard success panel must verify rescue sessions.");
assert(/\/rescue\/workspace/.test(successPanel), "Dashboard success panel must link to the rescue workspace.");
assert(/"production:verify"/.test(packageJson), "package.json must expose production:verify.");
assert(/npm run production:verify/.test(ci), "CI must run the production acceleration verifier.");

console.log("Production acceleration verification passed.");
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add this script after `ai:verify`:

```json
"production:verify": "tsx scripts/verify-production-acceleration.ts",
```

The surrounding script section should include:

```json
"agent:verify": "tsx scripts/verify-agent-behavior.ts",
"agents:queue:verify": "tsx scripts/verify-agent-execution-queue.ts",
"marketing:verify": "tsx scripts/verify-marketing-events.ts",
"payments:verify": "tsx scripts/verify-payment-delivery.ts",
"rescue:verify": "tsx scripts/verify-rescue-offer.ts",
"ai:verify": "tsx scripts/verify-ai-provider.ts",
"production:verify": "tsx scripts/verify-production-acceleration.ts",
"audit:production": "tsx scripts/audit-production-health.ts",
```

- [ ] **Step 3: Wire the verifier into CI**

In `.github/workflows/ci.yml`, add this step after `Verify Message Rescue offer`:

```yaml
      - name: Verify production acceleration path
        run: npm run production:verify
```

- [ ] **Step 4: Run the verifier**

Run:

```bash
npm.cmd run production:verify
```

Expected:

```text
Production acceleration verification passed.
```

- [ ] **Step 5: Run the full local gate and commit**

Run:

```bash
npm.cmd run agent:verify
npm.cmd run rescue:verify
npm.cmd run production:verify
npm.cmd run typecheck
npm.cmd run build
Run the repository secret scan command used in current project verification, excluding `node_modules` and `.next`.
```

Expected:

```text
MRagent behavior checks passed.
Message Rescue offer verification passed.
Production acceleration verification passed.
Route types generated successfully
Compiled successfully
```

Commit:

```bash
git add -- scripts/verify-production-acceleration.ts package.json .github/workflows/ci.yml
git commit -m "Verify production acceleration path"
```

---

### Task 5: Push and Check Deployment Status

**Files:**
- No file edits.

- [ ] **Step 1: Push main**

Run:

```bash
git push origin refs/heads/main:refs/heads/main
```

Expected:

```text
main -> main
```

- [ ] **Step 2: Check GitHub combined status**

Use the GitHub connector for the latest SHA:

```text
repo_full_name: Mind-Reply/MindReply
commit_sha: <latest full or short SHA>
```

Expected:

```text
Vercel statuses appear for the pushed commit.
At least one canonical production project status reaches success before claiming production visibility.
```

- [ ] **Step 3: Run live smoke when network is available**

Run:

```bash
$env:SMOKE_BASE_URL="https://www.mind-reply.com"; npm.cmd run smoke
```

Expected:

```text
Smoke check passed for 50+ route(s) against https://www.mind-reply.com.
```

If the shell cannot connect to `github.com`, `vercel.app`, or `mind-reply.com`, record the connection failure exactly and do not claim live verification.

---

## Self-Review

**Spec coverage:** The plan covers MRagent sales routing, direct revenue path, product delivery workspace, backend fulfillment evidence, CI verification, push, and deployment status checks. Provider-side secrets, Neon database creation, and staff hiring are intentionally outside this plan because they require external account operations.

**Placeholder scan:** The plan contains concrete file paths, exact code snippets, exact commands, and expected outputs. It does not use unresolved implementation placeholders.

**Type consistency:** The plan consistently uses `message_rescue`, `mindreply.rescue.workspace`, `/api/checkout/rescue-session`, `message_rescue.fulfilled`, and `production:verify` across tasks.

---

Plan complete and saved to `docs/superpowers/plans/2026-06-06-mindreply-functionality-acceleration.md`. Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - execute tasks in this session using executing-plans, batch execution with checkpoints
