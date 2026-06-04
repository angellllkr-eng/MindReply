# MindReply — Architecture

## Overview
MindReply is the N1 worldwide behavioral communication intelligence ecosystem — connecting professionals with elite advisors and AI-powered tools.

## Stack
- **Frontend + API**: Next.js 15 (App Router, Route Handlers)
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: TailwindCSS v4 (navy/gold/cream, Playfair Display + Inter)
- **Deployment**: Azure App Service via GitHub Actions + Docker

## Key Design Decisions
- OpenAPI-contract-driven development in the Replit monorepo
- Professionals store `languages` and `specializations` as comma-separated text (parsed at route layer)
- Memberships and Lexicons store `features`/`terms` as JSON strings in a text column
- Availability slots generated dynamically (7-day rolling window), not stored
- AI tools (Email Refiner, Tone Adjuster, Note Clarifier, Planner) use deterministic transformations; upgradeable to LLM backends

## Directory Structure
```
app/                   Next.js App Router pages + API routes
  api/                 Route Handlers (server-side, direct DB access)
  professionals/       Marketplace + individual profiles
  book/[id]/           3-step booking flow
  tools/               AI communication tools
  memberships/         Tier comparison
  lexicons/            Professional vocabulary library
  bookings/            Session history
  analytics/           Platform intelligence
components/            Nav, MRAgent, ProfessionalCard
lib/
  db.ts                Drizzle instance + pg Pool
  schema/              Drizzle table definitions
styles/                TailwindCSS globals
```

## Product
- **Professionals marketplace** — psychologists, lawyers, financial advisors, coaches, HR leaders
- **Session booking** — Text/Chat, Voice Call, Video Call with per-mode pricing
- **Behavioral AI tools** — Email Refiner, Tone Adjuster, Note Clarifier, Mini-Planner
- **Membership tiers** — Curator (£49/mo), Strategist (£149/mo), Sovereign (£499/mo)
- **Lexicon library** — curated professional communication vocabularies
- **MR Agent** — floating AI concierge

## Deployment
Push to `main` → GitHub Actions → Docker build → GHCR → Azure App Service
