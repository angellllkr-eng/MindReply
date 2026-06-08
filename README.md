# MindReply

MindReply is an Executive Nervous System and Decision Infrastructure Layer. It sits between input and action so the next move becomes obvious.

## Layers

- Intake Layer: reads the pressure and produces one synthesis.
- Action Layer: returns one recommended action.
- Memory Layer: adjusts derived preferences quietly.

## Agents

- Triage Agent
- Reply Agent
- Follow-Up Agent
- Risk Agent

## Public Surface

- `/`
- `/privacy`
- `/api/intake`
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
