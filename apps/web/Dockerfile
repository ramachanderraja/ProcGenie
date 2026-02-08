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

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules 2>/dev/null || true

# Copy source code
COPY package.json ./
COPY tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

# Set Next.js telemetry off during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application with standalone output
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

# Copy public assets
COPY --from=builder /app/apps/web/public ./public

# Create .next directory and set ownership
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "apps/web/server.js"]
