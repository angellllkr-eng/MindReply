# MindReply 30 Active Agent Acceleration Desk

## Purpose

This desk activates 30 of the 60 permanent operating roles for immediate production acceleration. It is the working layer for faster optimization across revenue, platform reliability, trust, professional quality, and intelligence.

## Operating Contract

- Each active desk owns one production lane and one written handoff.
- Evidence is required for every status: route checked, dashboard checked, log checked, or action taken.
- P0 desks hand off hourly until green.
- P1 and P2 desks hand off twice daily.
- No operator stores or repeats secrets in tickets, chat, logs, or reports.
- Professional advisory operators escalate regulated advice to qualified human review.

## Active Desk API

- `GET /api/agents/active`
- Source: `lib/agent-roster.ts`
- Expected count: 30 active agents

## Lanes

- Revenue: growth, sales, Stripe checkout, webhooks, memberships, failed payment recovery.
- Platform: Vercel, GitHub, CircleCI, Azure, database, Clerk, security, incident response.
- Trust: clinical, legal, finance, and executive communication quality.
- Intelligence: MRagent, micro-tools, dashboard metrics, SEO content, lexicons, reporting.

## Daily Command Rhythm

1. Check `/api/health`, `/api/config/requirements`, `/api/agents/active`, and `/api/entitlements`.
2. Run production smoke or review the latest scheduled smoke result.
3. Review payment and auth readiness before ad spend increases.
4. Review top solution pages, sitemap, and tracking events.
5. Write one concise handoff: status, evidence, action, risk, next owner.
