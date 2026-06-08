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
- `/api/intake`
- `/api/agent`
- `/api/health`

Old public surfaces are redirected into the decision layer.

## Local Commands

```bash
npm ci
npm run decision:verify
npm run typecheck
npm run build
python -m unittest discover src
```

## Environment

Copy `.env.example` to `.env.local` and set only the values needed for the deployment target. Integrations read credentials from environment variables and do not hardcode secrets.

Optional MRagent provider settings:

```bash
OPENAI_API_KEY=
MRAGENT_MODEL=gpt-5
```

When no provider key is configured, MRagent returns a deterministic privacy-safe Mind Read from the decision layer.
