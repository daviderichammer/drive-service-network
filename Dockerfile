# Drive Service Network — Multi-Stage Dockerfile
# Global Drive Holdings Inc.

# ============================================================
# Stage 1: Base
# ============================================================
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================================
# Stage 2: Dependencies
# ============================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# ============================================================
# Stage 3: Development
# ============================================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=development

CMD ["pnpm", "dev"]

# ============================================================
# Stage 4: Builder
# ============================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ============================================================
# Stage 5: Production Runner
# ============================================================
FROM node:22-alpine AS production

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
