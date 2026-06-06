# MindReply Production Audit Checklist

## Environment Variables

Add these to the active production hosting project for `mind-reply.com`.

Core:
- `NEXT_PUBLIC_SITE_URL=https://www.mind-reply.com`
- `DATABASE_URL`

AI Provider, choose one:
- Azure OpenAI group:
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_DEPLOYMENT`
  - `AZURE_OPENAI_API_VERSION=2024-02-15-preview`
- OpenAI group:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL=gpt-4o-mini` optional

Analytics:
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`
- `NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL`
- `NEXT_PUBLIC_META_PIXEL_ID`

Auth:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
- `ADMIN_CLERK_IDS`

Payments:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_CURATOR`
- `STRIPE_PRICE_STRATEGIST`
- `STRIPE_PRICE_SOVEREIGN`
- `STRIPE_WEBHOOK_SECRET`
- Credit-pack checkout uses `STRIPE_SECRET_KEY` with inline price data for 5-credit and 20-credit packs.
- Preferred membership prices are `STRIPE_PRICE_GROWTH` and `STRIPE_PRICE_PRO`; legacy Curator/Strategist/Sovereign env names remain accepted as aliases.

Monitoring:
- `SENTRY_DSN`
- `SLACK_WEBHOOK_URL`

Core Pro integrations:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NOTION_CLIENT_ID`
- `NOTION_CLIENT_SECRET`
- Slack uses `SLACK_WEBHOOK_URL`; Gmail and Notion use OAuth app credentials.

Permanent ops reports:
- `RESEND_API_KEY`
- `OPS_REPORT_FROM`
- `OPS_REPORT_SALES_TARGET=10`
- `OPS_REVENUE_WEEK_START`
- `CRON_SECRET`
- `REVENUE_OWNER_SECRET`
- `AZURE_OPS_REPORT_WEBHOOK_URL` optional
- `AZURE_OPS_REPORT_WEBHOOK_KEY` optional

## Vercel Setup

1. Open Vercel project `mindreply` in the active MindReply scope.
2. Confirm Framework Preset is `Next.js`.
3. Confirm Root Directory is `.`.
4. Confirm Build Command is `npm run build`.
5. Add production env vars above in Settings -> Environment Variables.
6. Redeploy the latest production deployment.
7. Open `https://www.mind-reply.com/health` and `https://www.mind-reply.com/api/health`.
8. Confirm these checks are `configured`: database, auth, stripe, stripeWebhook, analytics, monitoring, opsReports, siteUrl.

CLI alternative for operators with Vercel access:

```bash
npm run env:vercel-plan
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add ADMIN_CLERK_IDS production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PRICE_GROWTH production
vercel env add STRIPE_PRICE_PRO production
vercel env add STRIPE_PRICE_CURATOR production
vercel env add STRIPE_PRICE_STRATEGIST production
vercel env add STRIPE_PRICE_SOVEREIGN production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_GTM_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL production
vercel env add NEXT_PUBLIC_META_PIXEL_ID production
vercel env add SENTRY_DSN production
vercel env add SLACK_WEBHOOK_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add NOTION_CLIENT_ID production
vercel env add NOTION_CLIENT_SECRET production
vercel env add RESEND_API_KEY production
vercel env add OPS_REPORT_FROM production
vercel env add OPS_REPORT_SALES_TARGET production
vercel env add OPS_REVENUE_WEEK_START production
vercel env add CRON_SECRET production
vercel env add REVENUE_OWNER_SECRET production
vercel env add AZURE_OPENAI_ENDPOINT production
vercel env add AZURE_OPENAI_API_KEY production
vercel env add AZURE_OPENAI_DEPLOYMENT production
vercel env add AZURE_OPENAI_API_VERSION production
# Alternative AI provider path:
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_MODEL production
vercel --prod
```

Do not paste secret values into chat, tickets, source files, or shell history. Use the Vercel dashboard, a vault, or an approved secure secret entry process.

Use `npm run env:vercel-plan` before entering values. It reads `https://www.mind-reply.com/api/config/requirements`, prints only fallback services, and generates the current `vercel env add ... production` queue without exposing secret values.

After pulling Vercel envs locally, verify that required groups are present without printing values:

```bash
vercel env pull .env.production.local --environment=production --yes
npm run env:verify -- --file=.env.production.local
```

If values are stored in a local secure `.env.production.local` file and the Vercel CLI is authenticated, dry-run the upload first. The command prints key names only, never values:

```bash
npm run env:vercel-upload -- --file=.env.production.local --environment=production
npm run env:vercel-upload -- --file=.env.production.local --environment=production --apply
```

## Automated Checks

Route availability:
- Command: `SMOKE_BASE_URL=https://www.mind-reply.com npm run smoke`
- Expected: all public pages, solution pages, `/health`, `/api/health`, and readiness APIs return 2xx/3xx.
- GitHub workflow: `.github/workflows/production-smoke.yml`
- CircleCI job: `production_smoke`

Production env readiness:
- Command: `PRODUCTION_BASE_URL=https://www.mind-reply.com npm run audit:production`
- Evidence bundle: `PRODUCTION_BASE_URL=https://www.mind-reply.com npm run evidence:production`
- Pre-env route/gate evidence: `ALLOW_FALLBACK=1 PRODUCTION_BASE_URL=https://www.mind-reply.com npm run evidence:production`
- Owner-only evidence: `OWNER_EVIDENCE_REQUIRED=1 REVENUE_OWNER_SECRET=<local secret> PRODUCTION_BASE_URL=https://www.mind-reply.com npm run evidence:production`
- Env setup queue: `npm run env:vercel-plan`
- Local env verifier: `npm run env:verify -- --file=.env.production.local`
- Local Vercel env uploader: `npm run env:vercel-upload -- --file=.env.production.local --environment=production`
- AI provider verifier: `npm run ai:verify`
- Expected: `database`, `auth`, `stripe`, `stripeWebhook`, `bookingPayments`, `analytics`, `monitoring`, `slack`, `coreIntegrations`, `opsReports`, `siteUrl`, and `azureOpenAI` are `configured`. The `azureOpenAI` internal health key now accepts either the Azure OpenAI env group or `OPENAI_API_KEY`.
- Until encrypted provider env vars are added, this command is expected to fail and list the fallback checks.
- Current production status on June 6, 2026: route health is online, but the 12 provider-backed checks report `fallback` until production env vars are set in the active hosting project.
- Requirements API: `https://www.mind-reply.com/api/config/requirements`
- Health API includes a `requirements` array that maps each fallback service to exact env var names and what that service unlocks.
- Entitlement API: `https://www.mind-reply.com/api/entitlements` returns the tier delivery catalog that checkout verification and Stripe webhooks use for product access.
- Intelligence API: `https://www.mind-reply.com/api/intelligence/analyze` reports readiness for MR intent, emotional-valence, power-distance, clarity, and persuasion-frame analysis. POST `{ "text": "..." }` to receive the full analysis payload.
- Ops Status API: `https://www.mind-reply.com/api/ops/status` maps each configured/fallback provider service to the active owner, required env var names, and next production action.
- Integration Status API: `https://www.mind-reply.com/api/integrations/status` maps Slack, Gmail, and Notion readiness for the Pro upgrade path.
- Ops Report API: `https://www.mind-reply.com/api/ops/report` previews the owner-only twice-daily report sent to `angelllkr@gmail.com`; requires `Bearer REVENUE_OWNER_SECRET`.
- Revenue Observer API: `https://www.mind-reply.com/api/revenue/observer` tracks the owner-only 10-sales/day target, first-week sales gap, and forecast; requires `Bearer REVENUE_OWNER_SECRET`.
- Booking checkout API: `https://www.mind-reply.com/api/checkout/booking-session` verifies paid professional-session checkout returns. Run `npm run db:migrate` after deploy so `bookings.payment_status`, `bookings.stripe_session_id`, and `bookings.stripe_payment_intent_id` exist before enabling live booking checkout.
- Credit checkout API: `https://www.mind-reply.com/api/checkout/credits` reports readiness for micro-tool credit packs and opens Stripe Checkout from the homepage credit buttons when `STRIPE_SECRET_KEY` is configured.

## Analytics Verification

Target pages:
- `https://www.mind-reply.com/solutions/psychologists`
- `https://www.mind-reply.com/solutions/legal-counsel`
- `https://www.mind-reply.com/solutions/executives`
- `https://www.mind-reply.com/solutions/financial-advisors`

Required events:
- GTM loads the configured container.
- Data layer includes `mindreply_page_view`.
- Data layer includes `solution_landing_conversion_intent`.
- Google Ads conversion fires only when `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` is set.
- Meta Pixel fires `PageView` and `ViewContent`.

Checkout event:
- Returning to `/dashboard?checkout=success&session_id=...&tier=...` emits `membership_checkout_success`.

## Stripe Verification

1. Stripe Dashboard -> Developers -> Webhooks.
2. Add endpoint: `https://www.mind-reply.com/api/webhooks/stripe`.
3. Events to send:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Run a test checkout from `/memberships`.
6. Confirm dashboard return includes `session_id`.
7. Confirm Stripe webhook delivery status is successful.

## Clerk Verification

1. Clerk Dashboard -> application instance.
2. Confirm allowed origins include:
   - `https://mind-reply.com`
   - `https://www.mind-reply.com`
3. Confirm sign-in and sign-up redirects include:
   - `/sign-in`
   - `/sign-up`
   - `/dashboard`
4. Test login, logout, refresh, and direct navigation to `/dashboard`.
5. Add admin Clerk user IDs to `ADMIN_CLERK_IDS`.
6. Enable social providers in Clerk:
   - Google OAuth.
   - Apple Sign in.
   - Facebook Login.
7. Confirm each social provider redirects back to `/dashboard` after signup and sign-in.

## Sentry Verification

1. Add `SENTRY_DSN` to Vercel production env.
2. If official Sentry Next.js instrumentation is needed, run this locally in the repo root after Sentry auth is available:

```bash
npx @sentry/wizard@latest -i nextjs --saas --org mind-reply --project mind-reply
```

3. Redeploy.
4. Sign in as an authorized operator and send `POST https://www.mind-reply.com/api/monitoring/test`.
5. Confirm a `MindReply production monitoring test` event appears in Sentry.
6. Add alert rules:
   - High error rate.
   - New issue in production.
   - Deployment failure notification through Vercel or GitHub Actions.

## Slack Verification

1. Revoke any Slack token pasted into chat or logs.
2. Create a Slack incoming webhook for the private MindReply ops channel.
3. Add only the webhook URL to `SLACK_WEBHOOK_URL` in Vercel production env.
4. Redeploy.
5. Send owner-authorized `POST https://www.mind-reply.com/api/slack/test`.
6. Confirm the Slack channel receives the MindReply test notification.

## Core Integration Verification

1. Slack: verify `SLACK_WEBHOOK_URL` and owner-authorized `POST /api/slack/test`.
2. Gmail: create OAuth app credentials and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
3. Notion: create OAuth integration credentials and set `NOTION_CLIENT_ID` and `NOTION_CLIENT_SECRET`.
4. Open `https://www.mind-reply.com/api/integrations/status`.
5. Confirm Slack, Gmail, and Notion each report `configured`.

## SEO Verification

1. Open `https://www.mind-reply.com/sitemap.xml`.
2. Open `https://www.mind-reply.com/robots.txt`.
3. Google Search Console -> verify `mind-reply.com`.
4. Submit sitemap URL.
5. Confirm Google accepts the sitemap.

## Security And Performance

Security headers are configured in `next.config.ts`:
- HSTS.
- `X-Content-Type-Options`.
- `X-Frame-Options`.
- Referrer policy.
- Permissions policy.

Performance checks:
- Run Lighthouse on `/`, `/memberships`, and the four `/solutions/*` pages.
- Prioritize LCP image size, unused JavaScript, render-blocking scripts, and mobile layout shifts.

## Acceptance Evidence

Collect and attach:
- `/api/health` JSON screenshot after envs are configured.
- Vercel deployment success log.
- Tag Assistant screenshot for each solution page.
- Meta Pixel Helper screenshot for each solution page.
- Stripe webhook delivery screenshot.
- Sentry test event screenshot.
- Search Console sitemap accepted screenshot.
