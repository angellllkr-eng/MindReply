# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

RUN npm ci
RUN cd apps/backend && npm ci
RUN cd apps/backend && npx prisma generate

COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/

RUN cd apps/backend && npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

COPY apps/backend/package.json ./apps/backend/

EXPOSE 3001

WORKDIR /app/apps/backend

CMD ["npm", "run", "start"]
