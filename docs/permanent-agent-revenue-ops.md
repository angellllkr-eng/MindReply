# Permanent Agent Revenue Ops

## Purpose

MindReply now has a code-backed operating loop for permanent agent management, recruiter handoffs, twice-daily executive email reports, and the first-week 10-sales/day observer.

This is automation infrastructure. Human hiring is only complete after real operators are contracted, given least-privilege access, trained on the runbook, and assigned to shifts.

## Live Endpoints

- `GET /api/agents/roster` - 60 permanent roles.
- `GET /api/agents/active` - active operating desks by lane.
- `GET /api/revenue/observer` - 10-sales/day watcher and first-week gap.
- `GET /api/ops/report` - report preview for agents and operators.
- `POST /api/ops/report` - sends the report when authorized with `Bearer CRON_SECRET`.
- `GET /api/cron/ops-report` - Vercel Cron entrypoint for twice-daily reports.
- `GET /api/ops/status` - provider owners, fallback checks, next actions.

## Required Env Vars

Email and cron:

- `RESEND_API_KEY`
- `OPS_REPORT_TO=angelllkr@gmail.com`
- `OPS_REPORT_FROM`
- `OPS_REPORT_SALES_TARGET=10`
- `OPS_REVENUE_WEEK_START`
- `CRON_SECRET`

Optional Azure Functions relay:

- `AZURE_OPS_REPORT_WEBHOOK_URL`
- `AZURE_OPS_REPORT_WEBHOOK_KEY`

The Azure relay is optional. When configured, the same report payload is posted to the Azure Function with `x-functions-key`.

## Schedule

`vercel.json` runs the report twice daily:

- `0 8 * * *`
- `0 20 * * *`

Both schedules call `/api/cron/ops-report`. Vercel sends the authorization header when `CRON_SECRET` is configured.

## Sales Observer

Target:

- 10 sales per day.
- 70 sales in the first week.

Signals counted:

- `membership.fulfilled`
- `booking.fulfilled`
- confirmed paid bookings

The observer requires `DATABASE_URL` and Stripe webhook fulfillment. Stripe Dashboard remains the financial source of truth for payments, disputes, and payouts.

## First-Day Operator Command

1. Set all provider env vars in Vercel.
2. Redeploy production.
3. Confirm `GET /api/health` shows `opsReports: configured`.
4. Manually send the first report:

```bash
curl -X POST https://www.mind-reply.com/api/ops/report \
  -H "Authorization: Bearer $CRON_SECRET"
```

5. Confirm the email arrives at `angelllkr@gmail.com`.
6. Confirm `GET /api/revenue/observer` shows database measurement, not fallback.
7. File the first handoff with sales gap, provider fallbacks, active agents, and next actions.

## Hiring And Learning Loop

Recruiter mission:

- Keep hiring until all 60 roles have owners, backups, evidence cadence, and escalation paths.
- Contractors must use least-privilege access and must not receive secrets in chat.
- Every shift starts by reading the previous handoff, `/api/ops/status`, `/api/revenue/observer`, and the production runbook.
- Every shift ends with evidence: health, revenue, payments, analytics, satisfaction, incidents, and next owner.

Learning loop:

- Daily: add incident lessons and sales objections to the handoff.
- Twice daily: report health and revenue status by email.
- Weekly: update skills and scripts based on failed checkouts, support tickets, ad search terms, and high-converting pages.
