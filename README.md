# MindReply

MindReply is an Executive Nervous System and Decision Infrastructure Layer. It sits between pressure and action so the next move becomes calm, visible, and defensible.

## MRagent

MRagent is the Mind Read surface for MindReply. It reflects what the pressure is really about, what the user's mindset is protecting, the calmer move, and one recommended action.

## Layers

- Intake Layer: reads the pressure and produces one synthesis.
- Mind Read Layer: reflects the pressure, mindset protection, and calmer move.
- Action Layer: returns one recommended action.
- Memory Layer: adjusts derived preferences quietly.

## Agents

- Triage Agent
- Reply Agent
- Follow-Up Agent
- Risk Agent

## Public Surface

- `/`
- `/agent`
- `/pack`
- `/privacy`
- `/mcp`
- `/api/intake`
- `/api/agent`
- `/api/health`

Old public surfaces are redirected into the decision layer.

## Front End Operating Pack

`docs/front_end_operating_pack.md` explains the full front-end system: Home, MRagent, Personal Pack, privacy posture, 30-minute reporting, Figma/FigJam state, Remotion motion direction, promotion guardrails, and observability watch.

Design links:

- Figma preview: https://www.figma.com/design/QLximv9mLCIwQB2GPgBgeG
- Front-end direction file: https://www.figma.com/design/PuRHREBbTixXGxPsBEI1yz
- FigJam operating map: https://www.figma.com/board/G0lSiegpqHSoQDpmgoYKDL

## ChatGPT App Surface

`/mcp` exposes the internal MRagent MCP Apps endpoint for ChatGPT Developer Mode.

Tools:

- `prepare_mindread`: prepares one synthesis, one action, risk gate, receipt, and persistence status.
- `render_mindread`: prepares the result and attaches the MRagent widget resource.
- `fetch_receipt`: fetches a privacy-safe receipt by id when Blob storage is configured.

Widget resource:

- URI: `ui://widget/mragent-mindread-v1.html`
- MIME: `text/html;profile=mcp-app`

## Personal Pack Preview

`/pack` is the personal operating surface for Angel's pack. It shows the four quiet lanes, configured delivery destinations, live preview links, truthful transaction/revenue counters, and current movement signals.

Revenue and transaction counters are environment-driven so the page does not invent numbers:

```bash
NEXT_PUBLIC_PACK_TRANSACTION_COUNT=0
NEXT_PUBLIC_PACK_REVENUE_TOTAL=$0
NEXT_PUBLIC_PACK_REVENUE_NOTE=No connected transaction source yet.
```

## Personal Pack Reports

`npm run report:personal-pack` generates a personal-only pulse with deploy status, MRagent links, the Figma preview, delivery status, the 25-lane operating pack, a short "where you win" section, and one reusable gift-material line.

The scheduled workflow is `.github/workflows/personal-pack-report.yml`. It can be run manually with `workflow_dispatch` or by cron. The workflow uses `*/30 * * * *`, which runs twice an hour.

Sending is disabled by default. Console preview is safe without secrets.

Required opt-in variables:

```bash
MINDREPLY_REPORT_ENABLED=true
MINDREPLY_REPORT_DRY_RUN=false
MINDREPLY_REPORT_CHANNELS=console,slack,email
MINDREPLY_REPORT_REQUIRE_DELIVERY=true
MINDREPLY_REPORT_PERSONAL_ONLY=true
MINDREPLY_REPORT_PERSONAL_LABEL=Angel personal pack
MINDREPLY_REPORT_AGENT_COUNT=25
```

When `MINDREPLY_REPORT_REQUIRE_DELIVERY=true`, console output does not count as delivery. At least one Slack or email channel must return `sent`, or the workflow fails loudly.

Slack delivery uses a GitHub secret or deployment secret named `MINDREPLY_SLACK_WEBHOOK_URL`. A Slack app field id such as `Xf0B6WHC2SBH` and a workspace invite link are useful setup context, but they are not enough to send; the runtime needs a webhook URL or a connected Slack write destination. For phone-visible Slack updates, create an incoming webhook in the Mind Reply Slack workspace, point it at the preferred channel or direct-message workflow, and store the webhook URL only as `MINDREPLY_SLACK_WEBHOOK_URL`.

Email delivery uses GitHub or deployment secrets:

```bash
RESEND_API_KEY=
MINDREPLY_REPORT_EMAILS=angelllkr@gmail.com,Info@mind-reply.com
MINDREPLY_REPORT_EMAIL_ALLOWLIST=angelllkr@gmail.com,info@mind-reply.com
MINDREPLY_REPORT_FROM=
```

`MINDREPLY_REPORT_EMAIL` is still supported as a single-recipient fallback. Prefer `MINDREPLY_REPORT_EMAILS` for Angel plus the MindReply inbox.

When `MINDREPLY_REPORT_PERSONAL_ONLY=true`, every email recipient must appear in `MINDREPLY_REPORT_EMAIL_ALLOWLIST`.

## Local Commands

```bash
npm ci
npm run decision:verify
npm run mcp:verify
npm run report:personal-pack
npm run typecheck
npm run build
python -m unittest discover src
```

## Environment

Use `.env` for the committed base configuration. Put real local-only secrets in `.env.local`, and set production secrets in the deployment provider. Integrations read credentials from environment variables and do not hardcode secrets.

Optional MRagent provider settings:

```bash
OPENAI_API_KEY=
MRAGENT_MODEL=gpt-5
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SITE_URL=https://www.mind-reply.com
```

When no provider key is configured, MRagent returns a deterministic privacy-safe Mind Read from the decision layer. When Blob storage is not configured, generation persistence reports `stored=false` while the response remains usable. When Blob storage is configured, MRagent writes private records and does not expose Blob URLs in tool output.
