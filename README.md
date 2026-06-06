# MindReply

MindReply is a Next.js App Router application for behavioral communication intelligence, professional discovery, bookings, micro-tools, memberships, lexicons, dashboards, and operations health checks.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- Drizzle ORM with PostgreSQL
- Docker standalone output for Azure App Service
- Vercel Speed Insights

## Local Setup

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The app renders with typed fallback data when `DATABASE_URL` is not configured. Set `DATABASE_URL` to use live PostgreSQL-backed routes.

## Required Environment

| Name | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | local, Vercel, GitHub Actions, Azure runtime | PostgreSQL connection string |
| `AZURE_OPENAI_ENDPOINT` | local, Vercel, Azure runtime | Optional Azure OpenAI endpoint for MR Agent |
| `AZURE_OPENAI_API_KEY` | local, Vercel, Azure runtime | Optional Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | local, Vercel, Azure runtime | Optional Azure OpenAI deployment name |
| `AZURE_OPENAI_API_VERSION` | local, Vercel, Azure runtime | Azure OpenAI API version |
| `OPENAI_API_KEY` | local, Vercel, Azure runtime | Alternate AI provider key for MRagent and tools |
| `OPENAI_MODEL` | local, Vercel, Azure runtime | Optional OpenAI model override; defaults to `gpt-4o-mini` |
| `AZURE_WEBAPP_NAME` | GitHub Actions secret | Azure App Service name |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | GitHub Actions secret | Azure publish profile for deployment |

AI provider setup accepts either the Azure OpenAI env group or `OPENAI_API_KEY`. Use `npm run ai:verify` to confirm the requirement and source-label wiring without printing values.

Vercel settings:

- Framework Preset: `Next.js`
- Root Directory: `.`
- Build Command: `npm run build`

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public MindReply site |
| `/professionals` and `/professionals/[id]` | Professional marketplace and profiles |
| `/book/[id]` and `/booking/[id]` | Booking flow |
| `/bookings` | Booking list |
| `/tools` | Tool suite |
| `/tools/text-refiner` | Text refiner |
| `/tools/email-polisher` | Email polisher |
| `/tools/[slug]` | Dynamic micro-tool pages |
| `/agent` | MR Agent page |
| `/orchestrator` | MR-Core multi-agent operator surface |
| `/tasks` | Autonomous production task execution surface |
| `/login` and `/signup` | Account entry |
| `/dashboard` and `/dashboard/analytics` | Member workspace |
| `/admin` | Operations overview |
| `/memberships` | Membership tiers |
| `/lexicons` and `/lexicons/clinical-psychologist` | Professional lexicons |
| `/case-studies`, `/subconscious`, `/premium`, `/enterprise` | Public content pages |
| `/privacy`, `/terms`, `/ethics` | Policy pages |

## API

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | `{ status, service, timestamp, checks }` |
| `/api/agent` | POST | MR Agent response with intent, valence, and power-distance analysis |
| `/api/orchestrate` | GET, POST | Multi-agent orchestration across architecture, integration, research, marketing, and deployment |
| `/api/background` | GET, POST | Bounded background reasoning loop execution |
| `/api/tasks` | GET, POST | Bounded autonomous route, health, orchestration, reasoning, and deployment tasks |
| `/api/professionals` | GET | Filterable professionals |
| `/api/professionals/featured` | GET | Featured professionals |
| `/api/professionals/[id]` | GET | Professional detail |
| `/api/professionals/slots` | GET | Availability slots |
| `/api/bookings` | GET, POST | List and create bookings |
| `/api/bookings/[id]` | GET, PATCH | Booking detail and status update |
| `/api/memberships` | GET | Membership tiers |
| `/api/lexicons` | GET | Lexicon list |
| `/api/lexicons/[id]` | GET | Lexicon detail |
| `/api/analytics/summary` | GET | Dashboard metrics |
| `/api/tools/[slug]` | POST | Text Refiner, Email Polisher, Tone Adjuster, Shortener, Expander, Professional Rewrite, Clarity Booster |
| `/api/tools/refine-email` | POST | Backward-compatible email refinement alias |
| `/api/tools/adjust-tone` | POST | Backward-compatible tone adjustment alias |
| `/api/tools/clarify-note` | POST | Note clarification |
| `/api/tools/plan` | POST | Planning assistant |

## Database

```bash
npm run db:push
npm run db:generate
npm run db:migrate
npm run db:seed
```

`npm run db:seed` uses fallback production data and is idempotent by table. It seeds professionals, memberships, lexicons, users, and baseline metrics. It requires `DATABASE_URL`.

## Deployment

- `.github/workflows/ci.yml` runs `npm ci`, `npm run typecheck`, `npm run agent:verify`, `npm run marketing:verify`, `npm run ai:verify`, and `npm run build`.
- `.github/workflows/azure.yml` builds the Next.js app, pushes a Docker image to GHCR, deploys it to Azure Web App, and seeds the database.
- The previous broad multi-provider deployment workflow has been removed to avoid unrelated secrets and automatic version bumps.
- `scripts/azure-hardening.sh` applies Azure App Service health checks and optional Azure OpenAI, Search, and NAT hardening from environment variables.
