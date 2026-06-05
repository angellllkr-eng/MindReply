# Background Operations Agent Hiring Brief

## Role

Background Operations Agent for MindReply production.

## Mission

Keep `mind-reply.com` healthy, measurable, monetized, and responsive. Operators monitor production health, payment flow, analytics, ads, and incidents, then escalate with clear written evidence.

## Responsibilities

- Check uptime and `/api/health` three times per shift.
- Monitor Sentry events, error spikes, deploy failures, and alert routing.
- Verify GTM, Google Ads, and Meta Pixel events on solution landing pages.
- Watch Stripe checkout sessions, failed payments, disputes, and webhook delivery.
- Confirm Clerk login, signup, logout, and production redirect behavior.
- Review Google Search Console sitemap/indexing status.
- Monitor ad spend, CTR, conversion intent, checkout starts, and paid conversions.
- Write shift handoffs with evidence, links, screenshots, and next actions.

## Required Skills

- Basic Vercel or Netlify production operations.
- Google Tag Manager, Google Ads, and Meta Pixel diagnostics.
- Stripe checkout and webhook familiarity.
- Clerk or similar auth dashboard familiarity.
- Sentry event triage and alert routing.
- Basic Next.js route and deployment literacy.
- Concise incident writing and escalation discipline.

## Staffing Plan

- Hire 2 operators immediately for 16-hour weekday coverage.
- Add a third operator for overnight and weekend on-call rotation.
- Agent 1 owns infrastructure and release checks.
- Agent 2 owns ads, analytics, and payment checks.
- Agent 3 owns overnight incident triage and daily summaries.

## Rapid 60-Agent Surge Plan

Use this only when funding, access controls, and contractor management are ready. It is a staffing plan, not a claim that the agents are already hired.

- Engineering Ops: 20 agents for env setup, deploys, runtime errors, Sentry, webhooks, CI, and hotfixes.
- Advertising And Paid Growth: 12 agents for Google Ads, budgets, auto-tagging, landing-page CRO, and daily ROAS reporting.
- SEO And Content: 10 agents for sitemap submission, structured data, technical SEO, and content calendar execution.
- Engagement And Community: 8 agents for onboarding sequences, support triage, payment/auth issue follow-up, and retention.
- Ad Ops And Analytics QA: 6 agents for GTM containers, Tag Assistant QA, conversion reconciliation, and event diagnostics.
- Security And Compliance: 4 agents for TLS, headers, CSP, secret rotation, access reviews, and least-privilege audits.

First 12 assignments for Day 0:
- 4 Engineering Ops: production env vars, redeploy, health, Sentry, Stripe webhook.
- 4 Advertising: Google Ads conversion setup, auto-tagging, launch guardrails, spend pause rules.
- 2 SEO: sitemap, robots, Search Console, priority metadata checks.
- 1 Engagement: checkout and onboarding handoff flow.
- 1 Ad Ops QA: Tag Assistant, Meta Pixel Helper, conversion event evidence.

## Interview Scorecard

- Can explain how to verify a Stripe webhook signature delivery.
- Can explain how to use Tag Assistant to confirm a conversion event.
- Can read a Sentry issue and separate user impact from developer noise.
- Can test auth redirects without exposing secrets.
- Can write a five-line incident handoff with severity, impact, evidence, owner, and next step.

## Onboarding Checklist

- Vercel project access: deployments, logs, env var names, domain settings.
- Stripe access: checkout sessions, webhook endpoint, failed payments, test mode.
- Clerk access: production instance, redirect URLs, users, sessions.
- Sentry access: issues, alerts, releases, test event route.
- Google Tag Manager and Google Ads access.
- Meta Events Manager access.
- Google Search Console property access.
- Read `docs/production-runbook.md`.
- Run first supervised shift check and file handoff.

## First Week Deliverables

- Daily health summary.
- First analytics verification report.
- First Stripe webhook verification report.
- First Search Console sitemap/indexing status report.
- List of top five conversion or reliability risks.
- Six-hour status reports for the first 48 hours if the rapid surge plan is active.
- Twice-daily executive reports sent to `angelllkr@gmail.com`.
- 10-sales/day observer status and gap report every shift.
