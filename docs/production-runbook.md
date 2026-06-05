# MindReply Production Runbook

## Daily Operator Checks

Run these checks at shift start, mid-shift, and shift close.

1. Open `https://www.mind-reply.com/api/health`.
   - Required: HTTP 200.
   - Required configured checks: `database`, `auth`, `stripe`, `stripeWebhook`, `analytics`, `monitoring`, `siteUrl`.
   - Escalate if any required check returns `fallback` after production envs are expected to be live.
2. Open the critical pages:
   - `/`
   - `/professionals`
   - `/memberships`
   - `/tools`
   - `/tools/email-polisher`
   - `/login`
   - `/dashboard`
   - `/admin`
   - `/solutions/psychologists`
   - `/solutions/legal-counsel`
   - `/solutions/executives`
   - `/solutions/financial-advisors`
3. Confirm analytics events.
   - Use Google Tag Assistant on the four `/solutions/*` pages.
   - Confirm `solution_landing_conversion_intent` in the data layer.
   - Confirm Meta Pixel `ViewContent` on `/solutions/*`.
   - Confirm membership checkout success emits `membership_checkout_success` after Stripe test checkout.
4. Confirm auth.
   - Login with a test Clerk user.
   - Logout.
   - Refresh `/dashboard` and confirm the session behavior matches the Clerk configuration.
5. Confirm payments.
   - Run one Stripe test checkout in test mode.
   - Confirm return URL contains `checkout=success`, `session_id`, and `tier`.
   - Confirm `/api/webhooks/stripe` has successful deliveries in Stripe Dashboard.
6. Confirm monitoring.
   - Sign in as an authorized operator and trigger `POST /api/monitoring/test`.
   - Confirm the event appears in Sentry.
   - Confirm alert rules cover high error rate and deploy failure notifications.
7. Confirm twice-daily reports.
   - Open `/api/ops/report` and verify report status.
   - Open `/api/revenue/observer` and confirm sales are measured from the database.
   - Confirm `OPS_REPORT_TO` points to `angelllkr@gmail.com`.
   - Manually trigger `POST /api/ops/report` with `Bearer CRON_SECRET` after env setup.
   - Confirm the email arrives and the report includes the 10-sales/day gap.

## First 48-Hour Remediation Sprint

Hour 0-1:
- Add production env vars in Vercel.
- Redeploy production.
- Attach `curl -I https://www.mind-reply.com/health` and `curl https://www.mind-reply.com/api/health` output.
- Attach `curl https://www.mind-reply.com/api/revenue/observer` output.

Hour 1-2:
- Confirm Clerk production origins and redirect URLs.
- Test `/sign-in`, `/sign-up`, `/dashboard`, `/admin`, logout, and refresh persistence.

Hour 2-4:
- Configure Stripe webhook endpoint: `https://www.mind-reply.com/api/webhooks/stripe`.
- Test membership checkout and booking checkout.
- Attach Stripe webhook delivery evidence.

Hour 4-6:
- Confirm GTM, Google Ads, and Meta Pixel env vars are active.
- Verify only the four `/solutions/*` pages emit `solution_landing_conversion_intent`.
- Attach Tag Assistant and Pixel Helper evidence.

Hour 6-12:
- Confirm Sentry test event and alert rules.
- Submit `https://www.mind-reply.com/sitemap.xml` in Search Console.
- Confirm `robots.txt` references the sitemap.
- Confirm twice-daily Vercel Cron jobs are visible for `/api/cron/ops-report`.

Hour 12-24:
- Run Lighthouse on `/`, `/memberships`, and `/solutions/*`.
- Patch only the top three material performance issues.

Day 2:
- Re-run `npm run smoke` and `npm run audit:production` against production.
- File the remediation report with evidence, remaining risks, and next owners.

## Escalation Paths

- P0: Site unavailable, checkout broken, auth broken, Stripe webhooks failing for live payments.
  - Escalate immediately to the primary dev and infra lead.
  - Pause ad spend until checkout and tracking are verified.
- P1: Analytics missing, Sentry missing, sitemap error, dashboard degraded.
  - Escalate during the current shift.
  - Keep ads active only if checkout conversion tracking is still verified.
- P2: Copy/layout issues, non-critical fallback data, low-priority SEO edits.
  - Log in the daily handoff and batch for the next release.

## Two-Week Operating Rhythm

Week 1:
- Day 1: Verify envs, health, auth, Stripe, sitemap, Sentry, GTM, Meta Pixel.
- Day 2: Confirm solution-page tracking and Google Ads auto-tagging.
- Day 3: Run first conversion QA pass from ad click to checkout success.
- Day 4: Review Sentry events and classify repeat errors.
- Day 5: Review Stripe webhook health and failed payments.
- Day 6: Review Search Console coverage and sitemap acceptance.
- Day 7: Publish weekly handoff with incidents, conversion signal, and fixes needed.

Week 2:
- Days 8-10: Monitor ad spend, CTR, landing-page conversion intent, and checkout starts.
- Days 11-12: Tune solution-page copy based on verified conversion paths.
- Day 13: Re-run smoke checks and Lighthouse on the home page and solution pages.
- Day 14: Deliver operator summary, unresolved risks, and next hiring/training needs.

## Shift Plan

- Agent 1: EU/UK business hours, health checks, Sentry, release verification.
- Agent 2: US business hours, ad tracking, Stripe, Search Console, daily handoff.
- Agent 3: Overnight/on-call, uptime, payment failure triage, P0 escalation.

## Six-Hour Status Format

Every status update during the first 48 hours must include:
- Health: `/health` and `/api/health` status plus fallback checks.
- Revenue: `/api/revenue/observer` sales today, first-week gap, and next action.
- Deployment: latest production deployment URL or commit.
- Auth: Clerk login/logout/session result.
- Payments: Stripe checkout and webhook result.
- Analytics: GTM, Google Ads, Meta Pixel evidence on target pages.
- Monitoring: Sentry event and alert status.
- SEO: sitemap/Search Console status.
- Risks: unresolved blockers, owner, next action, ETA.

## Required Access

- Vercel project: environment variables, deployments, logs.
- Stripe: checkout sessions, webhook endpoints, test/live mode, failed payments.
- Clerk: production app settings, redirect URLs, users.
- Sentry: events, alerts, release health.
- Google Tag Manager and Google Ads: tags, conversions, auto-tagging.
- Meta Events Manager: pixel diagnostics.
- Google Search Console: property verification, sitemap submission, indexing.
