# AgencyComm - Production Deployment Guide

## Option 1: Vercel + Railway (Recommended for MVP)

### Frontend (Vercel)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Select GitHub repo: `Mind-Reply/agencycomm`
   - Framework: Next.js
   - Deploy

2. **Environment Variables** (in Vercel dashboard)
   ```
   NEXT_PUBLIC_API_URL=https://api.agencycomm.app
   ```

3. **Auto-Deploy**
   - Pushes to `main` → auto-deploy to production
   - Pushes to other branches → preview deployments

### Backend (Railway)

1. **Create Railway Project**
   - Go to https://railway.app/
   - New Project → GitHub
   - Select `Mind-Reply/agencycomm`
   - Add services: PostgreSQL, Redis

2. **Configure Backend Service**
   - Set Root Directory: `apps/backend`
   - Start Command: `npm run start`

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...(auto-generated)
   REDIS_URL=redis://...(auto-generated)
   JWT_SECRET=<generate secure key>
   OPENAI_API_KEY=<from OpenAI>
   GMAIL_CLIENT_ID=<from Google Cloud>
   GMAIL_CLIENT_SECRET=<from Google Cloud>
   NODE_ENV=production
   ```

4. **Deploy**
   - Push to main → auto-deploy
   - Railway generates domain: `https://agencycomm-api.up.railway.app`

### Database Setup

```bash
# SSH into Railway environment
railway shell

# Run migrations
cd apps/backend
npx prisma migrate deploy
npx prisma db seed
```

## Option 2: Docker + AWS/GCP (For Scale)

### Build & Push to Container Registry

```bash
# Build image
docker build -t agencycomm-backend:latest .

# Push to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag agencycomm-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/agencycomm-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/agencycomm-backend:latest
```

### Deploy to AWS ECS/Fargate

1. Create task definition with ECR image
2. Create service with auto-scaling
3. Configure load balancer
4. Set environment variables via ECS secrets

### Deploy PostgreSQL (AWS RDS)

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier agencycomm-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username agencycomm \
  --allocated-storage 20

# Run migrations
psql -h <rds-endpoint> -U agencycomm -d agencycomm < migrations.sql
```

## Monitoring & Logging

### Vercel
- Built-in monitoring dashboard
- Check Logs tab for frontend errors

### Railway/AWS
- CloudWatch Logs for backend
- Set up alarms for:
  - High error rates (>1%)
  - High latency (>1s)
  - Database connection failures

### Logging Setup

```typescript
// Backend logs to CloudWatch
import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.CloudWatch({
      logGroupName: '/agencycomm/backend',
      logStreamName: `${Date.now()}`,
    }),
  ],
});
```

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] HTTPS enforced (auto on Vercel/Railway)
- [ ] CORS configured for frontend domain only
- [ ] Database backups enabled
- [ ] Rate limiting enabled
- [ ] JWT secrets rotated quarterly
- [ ] Gmail OAuth scopes limited to necessary (gmail.modify, gmail.readonly)
- [ ] Stripe keys in secure vault (not in code)
- [ ] Error responses don't leak sensitive info
- [ ] Database encrypted at rest
- [ ] API keys rotated monthly

## Performance Optimization

### Frontend (Next.js)
- Vercel automatically optimizes build
- Enable image optimization
- Monitor Core Web Vitals in Vercel dashboard

### Backend
- Enable Redis caching for:
  - User sessions
  - Analysis results (24h)
  - Analytics cache (1h)
- Database connection pooling (Prisma handles automatically)
- Compress API responses (gzip)

### Database
- Create indexes on frequently queried columns:
  ```sql
  CREATE INDEX idx_agency_id ON incoming_messages(agency_id);
  CREATE INDEX idx_status ON approval_queue(status);
  CREATE INDEX idx_scheduled_at ON follow_ups(scheduled_at);
  ```

## Scaling Strategy

**Phase 1: MVP (100 agencies)**
- Single backend instance
- PostgreSQL t3.small (RDS)
- Redis shared
- Costs: ~$100/month

**Phase 2: Growth (1,000 agencies)**
- 2-3 backend instances behind load balancer
- PostgreSQL t3.medium with read replicas
- Separate Redis for cache + queue
- Costs: ~$500/month

**Phase 3: Scale (10,000+ agencies)**
- Kubernetes cluster (EKS/GKE)
- PostgreSQL t3.large with multi-AZ
- Redis cluster
- CDN for static assets
- Costs: ~$2,000+/month

## Disaster Recovery

- Database backups: Daily automated (7-day retention)
- Code backups: GitHub (always available)
- Failover: Hot standby database in different region
- RTO: <1 hour
- RPO: <15 minutes

## Rollback Plan

```bash
# Vercel: Automatic via dashboard
# Railway: 
git revert <commit-hash>
git push origin main

# Database migrations: Keep migration-down.sql for all changes
npm run migrate:down
```

## Monitoring Alerts

Set up alerts for:
- Backend error rate > 1%
- API latency > 1000ms
- Database CPU > 80%
- Redis memory > 80%
- Failed email sends > 5 in 1 hour
- Failed analysis jobs > 3 in 1 hour

## Cost Estimate

| Service | MVP | Growth | Scale |
|---------|-----|--------|-------|
| Frontend (Vercel) | Free | $20/mo | $100/mo |
| Backend (Railway/ECS) | $15/mo | $100/mo | $500/mo |
| Database (RDS) | $15/mo | $50/mo | $150/mo |
| Redis | $5/mo | $20/mo | $50/mo |
| OpenAI API | Variable | Variable | Variable |
| Gmail API | Free | Free | Free |
| **Total** | **~$50** | **~$190** | **~$800** |

(Plus API costs: ~$0.02 per analysis, ~$0.01 per email send)
