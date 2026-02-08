# Local Development Guide

> Prerequisites, setup, running services, database management, environment variables, and troubleshooting for local development.

## 1. Prerequisites

### Required Software

| Software | Minimum Version | Installation |
|---|---|---|
| Node.js | 20.0.0+ | [nodejs.org](https://nodejs.org) or via `nvm` |
| npm | 10.0.0+ | Included with Node.js |
| Docker Desktop | 4.25+ | [docker.com](https://www.docker.com/products/docker-desktop) |
| Docker Compose | 2.23+ | Included with Docker Desktop |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |

### Recommended Tools

| Tool | Purpose |
|---|---|
| VS Code | IDE with recommended extensions listed in `.vscode/extensions.json` |
| Postman or Bruno | API testing (OpenAPI collection available at `/docs`) |
| pgAdmin or DBeaver | Database GUI client |
| RedisInsight | Redis GUI client |
| nvm | Node.js version management |

### System Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Disk | 10 GB free | 20 GB free |

## 2. Quick Start

Get running in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/procgenie/procgenie.git
cd procgenie

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start infrastructure (PostgreSQL + Redis)
docker compose up -d postgres redis

# 5. Wait for services to be healthy
docker compose ps  # verify both show "healthy"

# 6. Run database migrations
npm run db:migrate

# 7. Seed the database with sample data
npm run db:seed

# 8. Start the development servers
npm run dev
```

After startup:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api/v1
- **Swagger Docs:** http://localhost:4000/docs
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### Default Login Credentials (Seed Data)

| Role | Email | Password |
|---|---|---|
| SuperAdmin | `admin@procgenie.io` | `Admin123!@#` |
| TenantAdmin | `tenant.admin@acme.com` | `TenantAdmin1!` |
| ProcurementManager | `procurement@acme.com` | `Procurement1!` |
| Requester | `requester@acme.com` | `Requester1!` |
| Approver | `approver@acme.com` | `Approver1!` |
| Supplier | `supplier@globex.com` | `Supplier1!` |

## 3. Running Services

### Option A: Full Stack with Docker Compose

Start all services (frontend, API, PostgreSQL, Redis) in containers:

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f api
docker compose logs -f web

# Stop all services
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

### Option B: Hybrid (Recommended for Development)

Run infrastructure in Docker, application code natively for faster iteration and hot-reload:

```bash
# Start only infrastructure
docker compose up -d postgres redis

# Start backend (with hot-reload)
npm run dev:api

# Start frontend in a separate terminal (with hot-reload)
npm run dev:web
```

### Option C: Individual Service Commands

```bash
# Frontend only (port 3000)
npm run dev:web

# Backend only (port 4000)
npm run dev:api

# Both frontend and backend
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Workspace Commands

Run commands in specific workspaces:

```bash
# Run tests for API only
npm run test --workspace=apps/api

# Run tests for web only
npm run test --workspace=apps/web

# Add a dependency to the API
npm install lodash --workspace=apps/api

# Add a dev dependency to shared-types
npm install -D typescript --workspace=packages/shared-types
```

## 4. Database Management

### Migrations

```bash
# Generate a new migration from entity changes
npm run migration:generate --workspace=apps/api -- -n AddSupplierSegment

# Run pending migrations
npm run db:migrate

# Revert the last migration
npm run migration:revert --workspace=apps/api

# Show migration status
npm run migration:show --workspace=apps/api
```

### Seeding

```bash
# Run all seeds (categories, templates, sample data)
npm run db:seed

# Reset database and re-seed
npm run db:reset
```

### Direct Database Access

```bash
# Connect via psql
docker compose exec postgres psql -U procgenie -d procgenie_dev

# Common queries
SELECT * FROM tenants;
SELECT * FROM users WHERE tenant_id = '<tenant-id>';
SELECT count(*) FROM requisitions;

# Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'requisitions';
```

### pgAdmin Connection

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `procgenie_dev` |
| Username | `procgenie` |
| Password | `procgenie_secret` |

## 5. Environment Variables Reference

The `.env` file at the project root configures all services. Copy `.env.example` as a starting point.

### Application

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `4000` | API server port |
| `API_PREFIX` | `api/v1` | API route prefix |
| `APP_NAME` | `ProcGenie` | Application display name |
| `APP_URL` | `http://localhost:4000` | Backend URL |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |

### Database

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | `procgenie` | Database user |
| `DB_PASSWORD` | `procgenie_secret` | Database password |
| `DB_DATABASE` | `procgenie_dev` | Database name |
| `DB_SSL` | `false` | Enable SSL connection |
| `DB_SYNCHRONIZE` | `true` | Auto-sync entities (dev only, never in prod) |
| `DB_LOGGING` | `true` | Log SQL queries |
| `DB_MAX_CONNECTIONS` | `20` | Connection pool maximum |

### Redis

| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | (empty) | Redis auth password |
| `REDIS_DB` | `0` | Redis database number |
| `REDIS_TTL` | `3600` | Default cache TTL (seconds) |

### Authentication

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | (required) | JWT access token signing key |
| `JWT_EXPIRES_IN` | `1h` | Access token expiration |
| `JWT_REFRESH_SECRET` | (required) | JWT refresh token signing key |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiration |
| `NEXTAUTH_URL` | `http://localhost:3000` | NextAuth callback URL |
| `NEXTAUTH_SECRET` | (required) | NextAuth encryption key |

### Azure AD SSO (Optional)

| Variable | Default | Description |
|---|---|---|
| `AZURE_AD_TENANT_ID` | -- | Azure AD tenant ID |
| `AZURE_AD_CLIENT_ID` | -- | Azure AD application ID |
| `AZURE_AD_CLIENT_SECRET` | -- | Azure AD client secret |

### AI / LLM

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | (required for AI features) | Anthropic Claude API key |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | Default Claude model |
| `ANTHROPIC_MAX_TOKENS` | `4096` | Maximum response tokens |

### Bull Queue

| Variable | Default | Description |
|---|---|---|
| `BULL_QUEUE_PREFIX` | `procgenie` | Queue key prefix |
| `BULL_QUEUE_DEFAULT_ATTEMPTS` | `3` | Default retry attempts |
| `BULL_QUEUE_DEFAULT_BACKOFF` | `5000` | Retry backoff (ms) |

### Frontend (NEXT_PUBLIC_ prefix)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | API base URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:4000` | WebSocket URL |
| `NEXT_PUBLIC_APP_NAME` | `ProcGenie` | Application name |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend URL |

### Feature Flags

| Variable | Default | Description |
|---|---|---|
| `FEATURE_AI_ANALYSIS` | `true` | Enable AI-powered analysis |
| `FEATURE_ESG_SCORING` | `true` | Enable ESG scoring module |
| `FEATURE_PREDICTIVE_ANALYTICS` | `true` | Enable predictive analytics |
| `FEATURE_AUTO_APPROVAL` | `false` | Enable autonomous auto-approval |

### Logging

| Variable | Default | Description |
|---|---|---|
| `LOG_LEVEL` | `debug` | Log level: `debug`, `info`, `warn`, `error` |
| `LOG_FORMAT` | `json` | Log format: `json`, `pretty` |

## 6. Troubleshooting

### Port Conflicts

**Problem:** `EADDRINUSE: address already in use :::4000`

```bash
# Find the process using the port
lsof -i :4000

# Kill it
kill -9 <PID>

# Or change the port in .env
PORT=4001
```

### Docker Issues

**Problem:** PostgreSQL container won't start or is unhealthy

```bash
# Check container logs
docker compose logs postgres

# Reset the database volume
docker compose down -v
docker compose up -d postgres redis

# Wait for healthy status
docker compose ps
```

**Problem:** Docker Compose up fails with image build errors

```bash
# Rebuild without cache
docker compose build --no-cache

# Prune unused Docker data
docker system prune -f
```

### Database Issues

**Problem:** `ECONNREFUSED 127.0.0.1:5432`

Ensure PostgreSQL is running:
```bash
docker compose ps postgres
# If not running:
docker compose up -d postgres
```

**Problem:** Migration errors after pulling new code

```bash
# Reset database and re-run everything
npm run db:reset
npm run db:migrate
npm run db:seed
```

**Problem:** `relation "xxx" does not exist`

```bash
# Ensure all migrations have run
npm run migration:show --workspace=apps/api
npm run db:migrate
```

### Node.js Issues

**Problem:** `ERESOLVE unable to resolve dependency tree`

```bash
# Clear npm cache and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules packages/*/node_modules
npm cache clean --force
npm install
```

**Problem:** TypeScript compilation errors after pulling

```bash
# Rebuild shared types
npm run build --workspace=packages/shared-types

# Then restart dev servers
npm run dev
```

### Redis Issues

**Problem:** `ECONNREFUSED 127.0.0.1:6379`

```bash
# Verify Redis is running
docker compose ps redis

# Restart Redis
docker compose restart redis

# Test connection
docker compose exec redis redis-cli ping
# Expected: PONG
```

### General Tips

1. **Always pull and install after switching branches:**
   ```bash
   git pull
   npm install
   npm run db:migrate
   ```

2. **Check Node.js version matches requirements:**
   ```bash
   node --version  # Should be 20.x+
   npm --version   # Should be 10.x+
   ```

3. **Use the Swagger UI for API testing:** Visit http://localhost:4000/docs for interactive API documentation with try-it-out functionality.

4. **Hot-reload not working?** Ensure you are running services natively (not in Docker) for the fastest hot-reload experience. Docker volume mounts can introduce delays on macOS and Windows.
