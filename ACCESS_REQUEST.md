# ACCESS REQUEST

## Confirmed access
- GitHub write access: confirmed
- Branch/PR creation: confirmed

## Not yet verified in this chat
- Vercel / hosting write access
- Domain / DNS access
- Secret store access
- Database access
- n8n access
- Stripe access
- Email/messaging provider access
- CI/CD provider access outside GitHub Actions

## Minimum access needed to proceed to go-live
1. Hosting write access for preview and production deploys
2. DNS access for domain binding
3. Secret store access for production credentials rotation
4. Database access for schema and data checks
5. n8n access for workflow validation
6. Stripe access for webhook verification
7. Email provider access for delivery validation

## Exact next action
Grant the missing provider access, then run cleanup, preview deploy, smoke test, and production deploy in order.
