# MindReply 60-Agent Operating Model

## Purpose

This model defines 60 permanent operating roles for MindReply across professional advisory, platform operations, payments, analytics, security, content, and growth. It is a staffing blueprint and operating contract; it does not claim humans are already hired until access, shifts, and accountability are assigned.

## Field Coverage

- Clinical Communication: 6 roles
- Executive Advisory: 6 roles
- Legal Communication: 6 roles
- Finance And Advisory: 6 roles
- Growth And Sales: 6 roles
- Platform Operations: 6 roles
- Payments And Membership: 6 roles
- Auth And Security: 6 roles
- Content And SEO: 6 roles
- Data And Intelligence: 6 roles

Total: 60 roles.

## Permanent Coverage Rules

- Every field has one owner, one backup, and one escalation contact.
- Every shift produces a written handoff with evidence.
- P0 events pause ad spend until checkout, auth, and tracking are verified.
- Professional advisory roles must not provide regulated advice beyond platform-approved scope without human professional review.
- Platform operators must never paste secrets into chat or public logs.

## Hiring Priority

Phase 1:
- Vercel Deployment Watch
- Stripe Checkout Monitor
- Clerk Session Auditor
- Google Ads Monitor
- Sentry/Monitoring Operator
- Incident Commander

Phase 2:
- Clinical Boundary Reviewer
- Legal Communication Reviewer
- Financial Client Communication Reviewer
- Landing Page Conversion Analyst
- Search Console Monitor
- Dashboard Metrics Analyst

Phase 3:
- Fill remaining specialist desks and backups until all 60 roles have owners.

## Daily Output

Each active role reports:
- Status: green, amber, or red.
- Evidence link or screenshot.
- Action taken.
- Risk remaining.
- Next owner.

## Source Of Truth

The structured roster is available in code at:
- `lib/agent-roster.ts`
- `GET /api/agents/roster`

Operators use:
- `docs/production-runbook.md`
- `docs/production-audit-checklist.md`
- `docs/background-agent-hiring-brief.md`
