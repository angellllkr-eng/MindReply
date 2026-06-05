# MindReply Production Audit Checklist

## Environment Variables

Add these to the active production hosting project for `mind-reply.com`.

Core:
- `NEXT_PUBLIC_SITE_URL=https://mind-reply.com`
- `DATABASE_URL`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION=2024-02-15-preview`

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
- `STRIPE_PRICE_CURATOR`
- `STRIPE_PRICE_STRATEGIST`
- `STRIPE_PRICE_SOVEREIGN`
- `STRIPE_WEBHOOK_SECRET`

Monitoring:
- `SENTRY_DSN`

## Vercel Setup

1. Open Vercel project `mindreply` in the active MindReply scope.
2. Confirm Framework Preset is `Next.js`.
3. Confirm Root Directory is `.`.
4. Confirm Build Command is `npm run build`.
5. Add production env vars above in Settings -> Environment Variables.
6. Redeploy the latest production deployment.
7. Open `https://www.mind-reply.com/api/health`.
8. Confirm these checks are `configured`: database, auth, stripe, stripeWebhook, analytics, monitoring, siteUrl.

## Automated Checks

Route availability:
- Command: `SMOKE_BASE_URL=https://www.mind-reply.com npm run smoke`
- Expected: all public pages, solution pages, and readiness APIs return 2xx/3xx.
- GitHub workflow: `.github/workflows/production-smoke.yml`
- CircleCI job: `production_smoke`

Production env readiness:
- Command: `PRODUCTION_BASE_URL=https://www.mind-reply.com npm run audit:production`
- Expected: `database`, `auth`, `stripe`, `stripeWebhook`, `analytics`, `monitoring`, and `siteUrl` are `configured`.
- Until encrypted provider env vars are added, this command is expected to fail and list the fallback checks.
- Requirements API: `https://www.mind-reply.com/api/config/requirements`
- Health API includes a `requirements` array that maps each fallback service to exact env var names and what that service unlocks.
- Entitlement API: `https://www.mind-reply.com/api/entitlements` returns the tier delivery catalog that checkout verification and Stripe webhooks use for product access.
- Intelligence API: `https://www.mind-reply.com/api/intelligence/analyze` reports readiness for MR intent, emotional-valence, power-distance, clarity, and persuasion-frame analysis. POST `{ "text": "..." }` to receive the full analysis payload.
- Ops Status API: `https://www.mind-reply.com/api/ops/status` maps each configured/fallback provider service to the active owner, required env var names, and next production action.
- Booking checkout API: `https://www.mind-reply.com/api/checkout/booking-session` verifies paid professional-session checkout returns. Run `npm run db:migrate` after deploy so `bookings.payment_status`, `bookings.stripe_session_id`, and `bookings.stripe_payment_intent_id` exist before enabling live booking checkout.

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

## Sentry Verification

1. Add `SENTRY_DSN` to Vercel production env.
2. Redeploy.
3. Sign in as an authorized operator and send `POST https://www.mind-reply.com/api/monitoring/test`.
4. Confirm a `MindReply production monitoring test` event appears in Sentry.
5. Add alert rules:
   - High error rate.
   - New issue in production.
   - Deployment failure notification through Vercel or GitHub Actions.

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
