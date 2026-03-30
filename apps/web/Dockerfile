# =============================================================================
# ProcGenie S2P Platform - Web (Next.js) Dockerfile
# Multi-stage build for optimized production image
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy workspace root files needed for npm workspaces resolution
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies for the web workspace only
RUN npm ci --workspace=apps/web --include-workspace-root

# ---------------------------------------------------------------------------
# Stage 2: Build the application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy installed dependencies from deps stage (npm workspaces hoists to root)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY package.json ./
COPY tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

# Set Next.js telemetry off during build
ENV NEXT_TELEMETRY_DISABLED=1

# Accept API URL as build arg so NEXT_PUBLIC_ var is inlined at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js application with standalone output
# outputFileTracingRoot in next.config.ts is set to ../../ (monorepo root)
WORKDIR /app/apps/web
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Production runner
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

LABEL maintainer="ProcGenie Engineering <engineering@procgenie.com>"
LABEL org.opencontainers.image.title="ProcGenie Web"
LABEL org.opencontainers.image.description="ProcGenie S2P Orchestration Platform - Web Frontend"
LABEL org.opencontainers.image.vendor="ProcGenie"
LABEL org.opencontainers.image.source="https://github.com/procgenie/procgenie"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Install security updates
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets (to the monorepo-relative path)
COPY --from=builder /app/apps/web/public ./apps/web/public

# Create .next directory and set ownership
RUN mkdir -p apps/web/.next && chown nextjs:nodejs apps/web/.next

# Copy standalone build output (with outputFileTracingRoot=../../, standalone
# mirrors the monorepo layout: node_modules/ at root, apps/web/server.js, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application (server.js is at apps/web/server.js in monorepo layout)
CMD ["node", "apps/web/server.js"]
