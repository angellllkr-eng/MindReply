# AgencyComm - AI-Assisted Client Email Management

A human-supervised, agent-operated system for managing client communications in creative and service-based agencies.

## Features

- **Email Ingestion**: Automatically sync Gmail inbox
- **AI Analysis**: Generate summaries, sentiment analysis, and suggested replies using GPT-4
- **Human Approval Layer**: All outgoing replies require human review before sending
- **Smart Follow-ups**: Automated follow-up scheduling with customizable cadence
- **Dashboard**: Real-time metrics on messages handled, time saved, and follow-up status
- **Escalation Path**: Automatic flagging of urgent/unclear messages for expert review

## Tech Stack

- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **AI**: OpenAI GPT-4
- **Email**: Gmail API (OAuth2)
- **Auth**: JWT + Gmail OAuth2

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Gmail account (OAuth2 setup required)
- OpenAI API key

### Setup

1. **Clone & Install**
```bash
git clone https://github.com/Mind-Reply/agencycomm.git
cd agencycomm
npm install