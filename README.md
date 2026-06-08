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

## Local Commands

```bash
npm ci
npm run decision:verify
npm run mcp:verify
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

When no provider key is configured, MRagent returns a deterministic privacy-safe Mind Read from the decision layer. When Blob storage is not configured, generation persistence reports `stored=false` while the response remains usable.