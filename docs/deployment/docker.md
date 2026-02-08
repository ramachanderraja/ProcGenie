# Docker Guide

> Docker image builds, docker-compose usage, production vs development configuration, health checks, logging, and volume management.

## 1. Image Architecture

ProcGenie uses multi-stage Docker builds for both the frontend and backend. This produces minimal, secure production images while enabling efficient development builds.

### Build Stages

```
┌─────────────────────────────────────────────────────────┐
│  Stage 1: base                                            │
│  - Node.js 20 Alpine base image                          │
│  - Install system dependencies                           │
│  - Set working directory                                 │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  Stage 2: deps                                            │
│  - Copy package.json and lock files                      │
│  - Install ALL dependencies (including devDependencies)  │
│  - Cache npm packages                                    │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                              │
┌───────▼───────────┐  ┌──────────────▼──────────────────┐
│  Stage 3: builder  │  │  (dev target stops here)        │
│  - Copy source     │  │  - Source mounted via volumes   │
│  - Run build       │  │  - Uses --watch for hot-reload  │
│  - Type checking   │  └─────────────────────────────────┘
└────────┬──────────┘
         │
┌────────▼──────────────────────────────────────────────┐
│  Stage 4: runner (production)                           │
│  - Fresh Alpine base (no build tools)                  │
│  - Copy ONLY built artifacts from builder              │
│  - Install production dependencies only                │
│  - Run as non-root user                                │
│  - Minimal attack surface                              │
└───────────────────────────────────────────────────────┘
```

### Image Sizes

| Image | Development | Production |
|---|---|---|
| `procgenie-api` | ~850 MB | ~180 MB |
| `procgenie-web` | ~1.2 GB | ~220 MB |

## 2. Building Images

### Development Build

```bash
# Build for development (stops at builder stage)
docker compose build

# Build a specific service
docker compose build api
docker compose build web
```

### Production Build

```bash
# Build production images
docker build -t procgenie-api:latest --target runner -f apps/api/Dockerfile .
docker build -t procgenie-web:latest --target runner -f apps/web/Dockerfile .

# Build with version tag
VERSION=$(git describe --tags --always)
docker build -t procgenie-api:$VERSION --target runner -f apps/api/Dockerfile .
docker build -t procgenie-web:$VERSION --target runner -f apps/web/Dockerfile .
```

### Build Arguments

| Argument | Default | Description |
|---|---|---|
| `NODE_VERSION` | `20-alpine` | Node.js base image version |
| `NPM_TOKEN` | -- | Token for private npm registry (if used) |

### Caching Strategy

Docker BuildKit layer caching is used to speed up rebuilds:

```bash
# Enable BuildKit (usually default in Docker Desktop)
export DOCKER_BUILDKIT=1

# Build with cache export for CI
docker build \
  --cache-from type=registry,ref=acr.azurecr.io/procgenie-api:cache \
  --cache-to type=registry,ref=acr.azurecr.io/procgenie-api:cache,mode=max \
  -t procgenie-api:latest \
  --target runner \
  -f apps/api/Dockerfile .
```

## 3. Docker Compose Usage

### Development Stack

```bash
# Start all services (foreground with logs)
docker compose up

# Start all services (background)
docker compose up -d

# Start specific services
docker compose up -d postgres redis
docker compose up -d api

# View status
docker compose ps

# View logs
docker compose logs -f          # All services
docker compose logs -f api      # Specific service
docker compose logs --tail=100 api  # Last 100 lines

# Stop services
docker compose down             # Stop containers
docker compose down -v          # Stop and remove volumes
docker compose down --rmi local # Stop, remove volumes and images

# Restart a service
docker compose restart api

# Rebuild and start
docker compose up -d --build api
```

### Production Stack

```bash
# Start with production overrides
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api=3 --scale web=2

# View resource usage
docker compose top
docker stats
```

## 4. Production vs Development Configuration

### Key Differences

| Aspect | Development | Production |
|---|---|---|
| Build target | `builder` | `runner` |
| Source code | Volume-mounted for hot-reload | Baked into image |
| Port exposure | All ports exposed to host | No direct port exposure |
| Environment | `NODE_ENV=development` | `NODE_ENV=production` |
| DB sync | `DB_SYNCHRONIZE=true` | `DB_SYNCHRONIZE=false` |
| DB logging | `DB_LOGGING=true` | `DB_LOGGING=false` |
| Log level | `debug` | `warn` |
| Restart policy | `unless-stopped` | `always` |
| Resource limits | None | CPU and memory limits set |
| Replicas | 1 | 2+ per service |
| Debug ports | Exposed (9229) | Not exposed |
| Redis auth | No password | Password required |
| DB password | `procgenie_secret` | Strong password from env |

### Production Security Hardening

The production configuration (`docker-compose.prod.yml`) applies these security measures:

1. **No port exposure** -- Services communicate through the Docker network. External access goes through a reverse proxy.
2. **Non-root user** -- Application processes run as a non-root user inside containers.
3. **Read-only filesystem** -- Where possible, container filesystems are read-only.
4. **Resource limits** -- CPU and memory limits prevent runaway processes.
5. **No source mounts** -- Production images contain only compiled artifacts.
6. **Secret management** -- Passwords injected via environment variables, not hardcoded.
7. **Log rotation** -- JSON log driver with size limits prevents disk exhaustion.

## 5. Health Checks

### Web Service Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

The Next.js application responds to HTTP requests on the root path. A 200 status indicates the service is healthy.

### API Service Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4000/api/v1/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

The API health endpoint returns:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory": { "status": "up", "rss": "145 MB" }
  },
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory": { "status": "up" }
  }
}
```

### PostgreSQL Health Check

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U procgenie -d procgenie_dev"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

### Redis Health Check

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

### Health Check Parameters

| Parameter | Description | Recommendation |
|---|---|---|
| `interval` | Time between checks | 10--30s depending on criticality |
| `timeout` | Maximum time for a check to respond | 5--10s |
| `retries` | Consecutive failures before marking unhealthy | 3--5 |
| `start_period` | Grace period during startup | Match expected startup time |

## 6. Logging

### Development Logging

In development, logs are output to stdout/stderr and visible via `docker compose logs`:

```bash
# Follow all logs
docker compose logs -f

# Follow specific service
docker compose logs -f api

# Show timestamps
docker compose logs -f -t api

# Since a specific time
docker compose logs --since="2026-02-08T10:00:00" api
```

### Production Logging

Production uses the JSON log driver with rotation:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"    # Maximum size of each log file
    max-file: "5"      # Maximum number of log files to retain
    tag: "procgenie-api"
```

### Log Format

The API outputs structured JSON logs:

```json
{
  "level": "info",
  "timestamp": "2026-02-08T14:30:00.000Z",
  "context": "IntakeController",
  "message": "Request created",
  "requestId": "req_01H5K3M7N8P9Q2R4",
  "tenantId": "tenant_acme_corp",
  "userId": "usr_jane_smith",
  "duration": 45
}
```

### Log Aggregation

For production, ship logs to a centralized platform:

| Platform | Configuration |
|---|---|
| Azure Log Analytics | Use Azure Container Apps built-in log shipping |
| ELK Stack | Use Filebeat sidecar or Docker logging driver |
| Datadog | Use `datadog/agent` container with Docker socket |
| Grafana Loki | Use Promtail with Docker log discovery |

## 7. Volume Management

### Named Volumes

| Volume | Purpose | Data Persistence |
|---|---|---|
| `procgenie-postgres-data` | PostgreSQL data directory | Critical -- contains all database data |
| `procgenie-redis-data` | Redis AOF and RDB files | Important -- contains cache and queue state |

### Volume Operations

```bash
# List volumes
docker volume ls | grep procgenie

# Inspect a volume
docker volume inspect procgenie-postgres-data

# Backup PostgreSQL data
docker compose exec postgres pg_dump -U procgenie procgenie_dev > backup.sql

# Restore PostgreSQL data
docker compose exec -T postgres psql -U procgenie procgenie_dev < backup.sql

# Remove a specific volume (WARNING: deletes all data)
docker compose down
docker volume rm procgenie-postgres-data

# Remove all project volumes
docker compose down -v
```

### Development Volume Mounts

In development, source code is mounted as read-only volumes for hot-reload:

```yaml
volumes:
  - ./apps/api/src:/app/apps/api/src:ro
  - ./packages/shared-types/src:/app/packages/shared-types/src:ro
```

The `:ro` flag ensures containers cannot modify source files on the host.

## 8. Networking

### Docker Network

All services communicate on the `procgenie-network` bridge network:

```
procgenie-network (bridge)
├── procgenie-web      → 3000
├── procgenie-api      → 4000
├── procgenie-postgres → 5432
└── procgenie-redis    → 6379
```

### Service Discovery

Services reference each other by container name:
- API connects to `postgres:5432` (not `localhost:5432`)
- API connects to `redis:6379`
- Web connects to `api:4000` (server-side) or `localhost:4000` (client-side)

### Port Mapping Summary

| Service | Container Port | Host Port (Dev) | Host Port (Prod) |
|---|---|---|---|
| Web | 3000 | 3000 | None (via reverse proxy) |
| API | 4000 | 4000 | None (via reverse proxy) |
| API Debug | 9229 | 9229 | None |
| PostgreSQL | 5432 | 5432 | None |
| Redis | 6379 | 6379 | None |
