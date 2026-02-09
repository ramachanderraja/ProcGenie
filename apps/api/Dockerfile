# =============================================================================
# ProcGenie S2P Platform - API (NestJS) Dockerfile
# Multi-stage build for optimized production image
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy workspace root files needed for npm workspaces resolution
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --workspace=apps/api --include-workspace-root

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
COPY apps/api ./apps/api

# Build the NestJS application (transpile only, skip type checking)
WORKDIR /app/apps/api
RUN npx tsc -p tsconfig.json --noCheck

# Prune devDependencies for production (from root, since workspaces hoist)
WORKDIR /app
RUN npm prune --omit=dev

# ---------------------------------------------------------------------------
# Stage 3: Production runner
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

LABEL maintainer="ProcGenie Engineering <engineering@procgenie.com>"
LABEL org.opencontainers.image.title="ProcGenie API"
LABEL org.opencontainers.image.description="ProcGenie S2P Orchestration Platform - Backend API"
LABEL org.opencontainers.image.vendor="ProcGenie"
LABEL org.opencontainers.image.source="https://github.com/procgenie/procgenie"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Install security updates and runtime dependencies
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache curl dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs && chown nestjs:nestjs /app/logs

# Switch to non-root user
USER nestjs

# Expose the application port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4000/api/v1/health || exit 1

# Use dumb-init to handle PID 1 and signal forwarding
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
