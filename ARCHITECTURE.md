# AgencyComm: Architecture & Technical Blueprint

## Service Overview
**AgencyComm** is a human-supervised, agent-operated system for managing client communications and follow-ups for creative agencies.

### Core Value Proposition
- **Automated email intake & summarization** - Captures client emails with AI-generated summaries
- **Intelligent reply drafts** - Generates contextual reply suggestions for human review
- **Smart follow-up scheduling** - Proposes reminders and nudge sequences
- **Time tracking dashboard** - Shows time saved, follow-ups completed, engagement metrics
- **Human-in-the-loop approvals** - All outgoing communication requires human review before sending
- **Escalation pathways** - Critical/unclear messages route to designated team members

---

## Technical Stack

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **Deployment**: Vercel (auto-scaling, serverless)
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Context + TanStack Query (data fetching)
- **Authentication**: NextAuth.js (OAuth + email)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **API Layer**: RESTful with OpenAPI documentation
- **Authentication**: JWT tokens, secure session management
- **Rate Limiting**: Token bucket algorithm for API quotas

### Database
- **Primary**: PostgreSQL (managed: AWS RDS or Render)
- **Caching**: Redis (for session, rate limits, job queues)
- **Search**: PostgreSQL full-text search (initial MVP)

### External Integrations
- **Email**: Gmail API, Microsoft Graph API (for email intake)
- **AI/Content Generation**: OpenAI GPT-4 (summaries, drafts, follow-up logic)
- **Background Jobs**: Bull Queue (Redis-backed job processor)
- **Payment**: Stripe (subscriptions, usage-based billing)
- **Monitoring**: Sentry (error tracking), LogRocket (session replay)

---

## Data Model

### Core Entities

#### User
```
- id (UUID)
- email (unique)
- name
- organization_id (FK)
- role (admin, team_member)
- auth_provider (google, microsoft, email)
- created_at
- updated_at
```

#### Organization
```
- id (UUID)
- name
- stripe_customer_id
- subscription_tier (free, pro, enterprise)
- email_integrations (JSON: list of connected email accounts)
- settings (JSON: approval workflows, escalation rules)
- created_at
```

#### EmailMessage
```
- id (UUID)
- organization_id (FK)
- from_email
- to_email
- subject
- body_raw
- body_text
- received_at
- ingested_at
- status (ingested, summarized, draft_ready, pending_approval, sent, archived)
- created_at
```

#### MessageSummary
```
- id (UUID)
- email_message_id (FK)
- summary_text
- key_topics (JSON array)
- sentiment (positive, neutral, negative)
- requires_escalation (boolean)
- escalation_reason (text)
- generated_at
- updated_by (FK to User, if edited)
```

#### ReplyDraft
```
- id (UUID)
- email_message_id (FK)
- draft_content
- tone (professional, friendly, urgent)
- generated_at
- status (pending_review, approved, rejected, sent)
- reviewed_by (FK to User)
- reviewed_at
- sent_at (nullable)
- created_at
```

#### FollowUpTask
```
- id (UUID)
- email_message_id (FK)
- organization_id (FK)
- scheduled_for (datetime)
- task_type (reminder, nudge, escalation)
- status (scheduled, triggered, completed, cancelled)
- created_by (FK to User)
- completed_by (FK to User, nullable)
- created_at
- updated_at
```

#### Dashboard Metrics
```
- id (UUID)
- organization_id (FK)
- date
- emails_processed
- summaries_generated
- drafts_reviewed
- follow_ups_scheduled
- follow_ups_completed
- estimated_time_saved_minutes
- created_at
```

---

## Workflow Pipelines

### 1. Email Ingestion & Processing

```
[Gmail/Outlook Webhook]
         ↓
[Email Received Handler]
         ↓
[Store Raw Email] → EmailMessage (status: ingested)
         ↓
[Queue Summarization Job] → Bull Queue
         ↓
[AI Agent: Generate Summary] (OpenAI)
         ↓
[Store Summary] → MessageSummary
         ↓
[Evaluate Escalation Logic]
         ├─ If requires escalation → Notify designated admin
         └─ If standard → Queue draft generation
```

### 2. Reply Draft Generation

```
[Message Ready for Draft]
         ↓
[Queue Draft Job]
         ↓
[AI Agent: Generate Reply]
  - Context: Previous conversation thread
  - Tone: From template or org settings
  - Length: Brief (2-3 paragraphs)
         ↓
[Store Draft] → ReplyDraft (status: pending_review)
         ↓
[Notify Assigned User]
  - Dashboard notification
  - Optional: Slack/email alert
         ↓
[Human Reviews Draft]
  ├─ Approve → Queue send
  ├─ Reject → Delete or re-prompt AI
  └─ Edit → Store edited version & queue send
```

### 3. Outbound Email (Approved Replies)

```
[Draft Approved by Human]
         ↓
[Queue Send Job]
         ↓
[Send via Connected Email Account]
  - Gmail API or Outlook API
  - Preserve thread/reply-to headers
         ↓
[Store sent email] → ReplyDraft (status: sent, sent_at: now)
         ↓
[Queue Follow-up Scheduling]
  - Determine if/when to follow-up
  - Create FollowUpTask entries
         ↓
[Update Metrics] → Dashboard
```

### 4. Follow-up Automation

```
[Scheduled Follow-up Time Reached]
         ↓
[Cron Job / Bull Queue] triggers at scheduled_for
         ↓
[Evaluate Task Type]
  ├─ Reminder: Create internal notification
  ├─ Nudge: Generate new draft for human review
  └─ Escalation: Route to admin/manager
         ↓
[Mark Complete] → FollowUpTask (status: completed)
         ↓
[Update Metrics]
```

---

## API Endpoints (Minimal MVP)

### Authentication
- `POST /api/auth/login` - Email/OAuth login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user info

### Messages
- `GET /api/messages` - List ingested messages (with filters)
- `GET /api/messages/:id` - Get single message + summary + draft
- `GET /api/messages/:id/thread` - Get full email thread

### Drafts & Approvals
- `GET /api/drafts/pending` - List pending review
- `POST /api/drafts/:id/approve` - Approve and queue send
- `POST /api/drafts/:id/reject` - Reject draft
- `PUT /api/drafts/:id` - Edit draft content
- `POST /api/drafts/:id/send` - Manual send (if needed)

### Follow-ups
- `GET /api/followups` - List scheduled follow-ups
- `POST /api/followups/:id/complete` - Mark complete
- `DELETE /api/followups/:id` - Cancel follow-up

### Integrations
- `POST /api/integrations/email/connect` - Connect Gmail/Outlook
- `GET /api/integrations/email/accounts` - List connected accounts
- `DELETE /api/integrations/email/:account_id` - Disconnect

### Dashboard
- `GET /api/dashboard/metrics` - Get time-saved metrics, volume stats
- `GET /api/dashboard/metrics/export` - Export as CSV

### Admin
- `GET /api/org/settings` - Get organization settings
- `PUT /api/org/settings` - Update approval workflows, escalation rules

---

## Security & Compliance

### Secrets Management
- All API keys, credentials stored in environment variables
- Use `.env.local` for local development (Git-ignored)
- Use environment variable groups in Vercel/deployment platform
- Rotate keys quarterly; automated alerts on exposure

### Data Privacy
- GDPR-compliant data storage (EU option available)
- User data encrypted in transit (HTTPS)
- Email data at rest: encrypted (AES-256)
- Compliance: CCPA, GDPR, SOC 2 ready
- Data retention: Configurable per organization (default: 90 days after archival)

### Access Control
- Role-based access control (RBAC): Admin, Team Lead, Team Member
- API rate limits: 100 requests/min per user, 1000/min per org
- Session timeout: 30 minutes of inactivity
- Audit logs: All actions logged with user, timestamp, action type

### Email Integration Security
- OAuth 2.0 for email provider authentication
- Token refresh: Auto-refresh before expiration
- Scope limitation: Read mail, send mail (no delete/archive without explicit approval)
- Webhook signature verification (HMAC)

---

## Deployment & Infrastructure

### Frontend (Vercel)
- Auto-deploy from GitHub (main branch)
- Environment variables injected at build time
- CDN distribution, SSL/TLS enforced
- Analytics: Vercel Analytics + custom logging

### Backend (Render or Railway)
- Node.js app deployed as Docker container
- Auto-scale based on traffic (CPU/memory)
- Managed PostgreSQL and Redis
- CI/CD: GitHub Actions → Docker push → Deployment

### CI/CD Pipeline
```
Commit to main
       ↓
GitHub Actions triggered
       ├─ Run tests (Jest, Supertest)
       ├─ Lint & format check (ESLint, Prettier)
       ├─ Build frontend (Next.js)
       ├─ Build backend (Babel/TypeScript)
       └─ If all pass: Deploy to Vercel + Render
```

---

## Monitoring & Observability

### Logs
- Application logs: Structured JSON (Winston + transports)
- API request logs: Method, path, status, latency, user_id
- Error logs: Stack trace, context, severity level
- Retention: 30 days (searchable via logging service)

### Metrics
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Job queue depth (pending/processing jobs)
- Database connection pool health
- Email processing success rate

### Alerts
- Error rate > 5% → Page on-call
- Job queue > 1000 items → Page on-call
- Database CPU > 80% → Alert
- Stripe payment failures → Alert

---

## Roadmap (Post-MVP)

### Phase 2 (Month 2)
- **Slack Integration**: Post notifications to Slack channels
- **Conversation Context**: Pull full conversation history for better drafts
- **Custom Templates**: Org-specific reply templates
- **Bulk Actions**: Approve multiple drafts at once

### Phase 3 (Month 3)
- **Predictive Follow-ups**: ML model predicts best follow-up timing
- **A/B Testing**: Test different reply tones/templates
- **CRM Integration**: Zapier / Make.com integrations
- **Custom Branding**: White-label option for agencies

### Phase 4 (Month 4+)
- **Multi-channel Support**: SMS, WhatsApp, Facebook Messenger
- **Team Analytics**: Per-user performance dashboards
- **AI Learning**: Fine-tune GPT models on org's communication patterns
- **Competitor Analysis**: Auto-compare response times vs industry benchmarks

---

## Success Metrics (MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Setup Time | < 5 min | Time from signup to first email processed |
| Email Processing | < 30 sec | Time from inbox receipt to summary ready |
| Draft Quality | 90%+ approval | % of AI drafts approved without major edits |
| Time Saved | 5-8 hours/week | Survey + metrics dashboard |
| Team Adoption | 80%+ active | % of org users with >= 1 approval/week |
| Retention | 70%+ (3mo) | Users still active after 3 months |

