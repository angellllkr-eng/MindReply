# MindReply

MindReply is an Executive Nervous System and Decision Infrastructure Layer. It sits between input and action so the next move becomes obvious.

## MRagent

MRagent is the gentle Mind Read surface for MindReply. It reflects what the pressure is really about, what the user's mindset is protecting, the calmer move, and one recommended action.

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
- `/privacy`
- `/mcp`
- `/api/intake`
- `/api/agent`
- `/api/health`

Old public surfaces are redirected into the decision layer.

## ChatGPT App Surface

`/mcp` exposes the internal MRagent MCP Apps endpoint for ChatGPT Developer Mode.

Tools:

- `prepare_mindread`: prepares one synthesis, one action, risk gate, receipt, and persistence status.
- `render_mindread`: prepares the result and attaches the MRagent widget resource.
- `fetch_receipt`: fetches a privacy-safe receipt by id when Blob storage is configured.

Widget resource:

- URI: `ui://widget/mragent-mindread-v1.html`
- MIME: `text/html;profile=mcp-app`

## Personal Pack Reports

`npm run report:personal-pack` generates a personal-only pulse with deploy status, MRagent links, the Figma preview, a short "where you win" section, and one reusable gift-material line.

The scheduled workflow is `.github/workflows/personal-pack-report.yml`. It can be run manually with `workflow_dispatch` or by cron. GitHub cron cannot keep a perfect rolling 23-minute interval across every hour; the workflow uses `*/23 * * * *` as the closest built-in schedule.

Sending is disabled by default. Console preview is safe without secrets.

Required opt-in variables:

```bash
MINDREPLY_REPORT_ENABLED=true
MINDREPLY_REPORT_DRY_RUN=false
MINDREPLY_REPORT_CHANNELS=console,slack,email
MINDREPLY_REPORT_PERSONAL_ONLY=true
MINDREPLY_REPORT_PERSONAL_LABEL=Angel personal pack
```

Slack delivery uses a GitHub secret or deployment secret named `MINDREPLY_SLACK_WEBHOOK_URL`. A Slack app field id is not enough to send; the runtime needs a webhook URL or a connected Slack write destination.

Email delivery uses GitHub or deployment secrets:

```bash
RESEND_API_KEY=
MINDREPLY_REPORT_EMAIL=
MINDREPLY_REPORT_EMAIL_ALLOWLIST=
MINDREPLY_REPORT_FROM=
```

When `MINDREPLY_REPORT_PERSONAL_ONLY=true`, email sends only when `MINDREPLY_REPORT_EMAIL` appears in `MINDREPLY_REPORT_EMAIL_ALLOWLIST`.

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
