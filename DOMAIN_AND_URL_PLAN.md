# DOMAIN AND URL PLAN

## Verified public surface
- Repository: `angellllkr-eng/MindReply`
- Default branch: `main`

## Target public URLs
- Main site: `https://www.mind-reply.com`
- Operator surface: `https://admin.mind-reply.com`
- Control plane: `https://ops.mind-reply.com`

## Preview strategy
- Preview deploy for every branch
- Smoke test before production promotion
- Production URL only after preview evidence is captured

## DNS work required
- Confirm A/CNAME targets
- Confirm HTTPS certificate issuance
- Confirm redirect rules for legacy surfaces

## Exact next action
Bind preview and production URLs after hosting access is verified.
