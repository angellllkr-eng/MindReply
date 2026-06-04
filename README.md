# MindReply

> The N1 worldwide behavioral communication intelligence ecosystem — connecting professionals with elite advisors and AI-powered tools that sharpen how people communicate.

## Tech Stack

- **Next.js 15** — App Router, Server Components, Route Handlers
- **TypeScript** — strict mode
- **TailwindCSS v4** — navy/gold/cream design system (Playfair Display + Inter)
- **Drizzle ORM** — PostgreSQL with type-safe queries
- **Docker** — standalone output for Azure deployment

## Quick Start

```bash
cp .env.example .env.local
# Set DATABASE_URL in .env.local

npm install
npm run dev
# → http://localhost:3000
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, featured professionals, AI tools, membership |
| `/professionals` | Filterable marketplace of elite advisors |
| `/professionals/[id]` | Professional profile + availability |
| `/book/[id]` | 3-step booking flow |
| `/tools` | AI tools — Email Refiner, Tone Adjuster, Note Clarifier, Planner |
| `/memberships` | Tier comparison — Curator / Strategist / Sovereign |
| `/lexicons` | Professional vocabulary library |
| `/bookings` | Session history |
| `/analytics` | Platform intelligence dashboard |

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/professionals` | GET | Filterable list (role, language, available, maxPrice) |
| `/api/professionals/featured` | GET | Top 6 available professionals |
| `/api/professionals/[id]` | GET | Single professional |
| `/api/professionals/slots` | GET | 7-day availability slots |
| `/api/bookings` | GET, POST | List / create bookings |
| `/api/bookings/[id]` | GET, PATCH | Get / update status |
| `/api/tools/refine-email` | POST | Email Refiner |
| `/api/tools/adjust-tone` | POST | Tone Adjuster (6 modes) |
| `/api/tools/clarify-note` | POST | Note Clarifier |
| `/api/tools/plan` | POST | Mini-Planner |
| `/api/memberships` | GET | All membership tiers |
| `/api/lexicons` | GET | All lexicons |
| `/api/lexicons/[id]` | GET | Single lexicon |
| `/api/analytics/summary` | GET | Platform metrics |

## Azure Deployment

Automated via `.github/workflows/azure.yml` — push to `main` triggers:
1. Docker build → push to GitHub Container Registry
2. Deploy to Azure App Service

**Required GitHub Secrets:**

| Secret | Source |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Azure Portal → App Service → Get Publish Profile |

## Database Schema

Four tables: `professionals`, `bookings`, `memberships`, `lexicons`

Run migrations with [Drizzle Kit](https://orm.drizzle.team/docs/migrations):
```bash
npx drizzle-kit push
```
