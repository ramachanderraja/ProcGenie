#!/usr/bin/env bash
# =============================================================================
# ProcGenie S2P Platform - Local Development Setup
# =============================================================================
# Usage:
#   ./setup-local.sh           # Full setup
#   ./setup-local.sh --reset   # Reset and restart everything
# =============================================================================

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}    $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $*" >&2; }
log_step()    { echo -e "\n${CYAN}--- $* ---${NC}\n"; }

RESET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --reset) RESET=true; shift ;;
        -h|--help)
            echo "Usage: $(basename "$0") [--reset] [-h|--help]"
            echo "  --reset   Tear down existing containers and volumes, then re-setup"
            exit 0
            ;;
        *) log_error "Unknown option: $1"; exit 1 ;;
    esac
done

# ---------------------------------------------------------------------------
# Step 1: Check Prerequisites
# ---------------------------------------------------------------------------
log_step "Step 1: Checking Prerequisites"

check_command() {
    local cmd=$1
    local min_version=${2:-""}
    local install_hint=${3:-""}

    if ! command -v "${cmd}" &>/dev/null; then
        log_error "${cmd} is not installed."
        [[ -n "${install_hint}" ]] && log_info "Install: ${install_hint}"
        return 1
    fi

    local version
    version=$("${cmd}" --version 2>/dev/null | head -1 || echo "unknown")
    log_success "${cmd} found: ${version}"
    return 0
}

errors=0

check_command "node" "20" "https://nodejs.org/ or use nvm" || ((errors++))
check_command "npm" "10" "Comes with Node.js" || ((errors++))
check_command "docker" "" "https://docs.docker.com/get-docker/" || ((errors++))

# Check Docker daemon is running
if command -v docker &>/dev/null; then
    if ! docker info &>/dev/null; then
        log_error "Docker daemon is not running. Please start Docker Desktop or the Docker service."
        ((errors++))
    else
        log_success "Docker daemon is running"
    fi
fi

# Check docker compose
if docker compose version &>/dev/null; then
    log_success "docker compose found: $(docker compose version --short 2>/dev/null || echo 'available')"
elif command -v docker-compose &>/dev/null; then
    log_success "docker-compose found (legacy): $(docker-compose --version 2>/dev/null | head -1)"
else
    log_error "docker compose is not available"
    ((errors++))
fi

# Check Node.js version >= 20
if command -v node &>/dev/null; then
    NODE_MAJOR=$(node -v | cut -d. -f1 | tr -d 'v')
    if [[ "${NODE_MAJOR}" -lt 20 ]]; then
        log_error "Node.js version 20+ is required. Found: $(node -v)"
        ((errors++))
    fi
fi

if [[ ${errors} -gt 0 ]]; then
    log_error "Please install the missing prerequisites and try again."
    exit 1
fi

log_success "All prerequisites met"

# ---------------------------------------------------------------------------
# Step 2: Environment Files
# ---------------------------------------------------------------------------
log_step "Step 2: Setting Up Environment Files"

# Root .env
if [[ ! -f "${PROJECT_ROOT}/.env" ]]; then
    if [[ -f "${PROJECT_ROOT}/.env.example" ]]; then
        cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env"
        log_success "Created .env from .env.example"
    else
        log_warn "No .env.example found at project root"
    fi
else
    log_info ".env already exists at project root (skipping)"
fi

# API .env
if [[ ! -f "${PROJECT_ROOT}/apps/api/.env" ]]; then
    if [[ -f "${PROJECT_ROOT}/apps/api/.env.example" ]]; then
        cp "${PROJECT_ROOT}/apps/api/.env.example" "${PROJECT_ROOT}/apps/api/.env"
        log_success "Created apps/api/.env from .env.example"
    fi
else
    log_info "apps/api/.env already exists (skipping)"
fi

# Web .env.local
if [[ ! -f "${PROJECT_ROOT}/apps/web/.env.local" ]]; then
    cat > "${PROJECT_ROOT}/apps/web/.env.local" <<'ENVEOF'
# ProcGenie Web - Local Development Environment
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_NAME=ProcGenie
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-change-in-production
ENVEOF
    log_success "Created apps/web/.env.local"
else
    log_info "apps/web/.env.local already exists (skipping)"
fi

# ---------------------------------------------------------------------------
# Step 3: Install Dependencies
# ---------------------------------------------------------------------------
log_step "Step 3: Installing Dependencies"

cd "${PROJECT_ROOT}"

log_info "Installing npm dependencies (this may take a few minutes)..."
npm install

log_success "Dependencies installed"

# ---------------------------------------------------------------------------
# Step 4: Docker Compose
# ---------------------------------------------------------------------------
log_step "Step 4: Starting Docker Services"

if [[ "${RESET}" == "true" ]]; then
    log_warn "Resetting: tearing down existing containers and volumes..."
    docker compose -f "${PROJECT_ROOT}/docker-compose.yml" down -v --remove-orphans 2>/dev/null || true
fi

# Create the init-db.sql file if it does not exist
if [[ ! -f "${PROJECT_ROOT}/infrastructure/scripts/init-db.sql" ]]; then
    cat > "${PROJECT_ROOT}/infrastructure/scripts/init-db.sql" <<'SQLEOF'
-- =============================================================================
-- ProcGenie S2P Platform - PostgreSQL Initialization
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the application schema
CREATE SCHEMA IF NOT EXISTS procgenie;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE procgenie_dev TO procgenie;
GRANT ALL PRIVILEGES ON SCHEMA procgenie TO procgenie;
GRANT ALL PRIVILEGES ON SCHEMA public TO procgenie;

-- Set default search path
ALTER DATABASE procgenie_dev SET search_path TO procgenie, public;
SQLEOF
    log_success "Created init-db.sql"
fi

log_info "Starting database and cache services..."
docker compose -f "${PROJECT_ROOT}/docker-compose.yml" up -d postgres redis

# ---------------------------------------------------------------------------
# Step 5: Wait for Services to Be Healthy
# ---------------------------------------------------------------------------
log_step "Step 5: Waiting for Services to Be Healthy"

wait_for_service() {
    local service=$1
    local max_attempts=${2:-30}
    local attempt=0

    while [[ ${attempt} -lt ${max_attempts} ]]; do
        local health
        health=$(docker inspect --format='{{.State.Health.Status}}' "procgenie-${service}" 2>/dev/null || echo "not_found")

        case "${health}" in
            healthy)
                log_success "${service} is healthy"
                return 0
                ;;
            unhealthy)
                log_error "${service} is unhealthy"
                return 1
                ;;
            *)
                ((attempt++))
                printf "\r  Waiting for ${service}... (%d/%d)" "${attempt}" "${max_attempts}"
                sleep 2
                ;;
        esac
    done

    echo ""
    log_error "${service} did not become healthy within $((max_attempts * 2)) seconds"
    return 1
}

wait_for_service "postgres" 30
wait_for_service "redis" 15

# ---------------------------------------------------------------------------
# Step 6: Run Migrations and Seed Data
# ---------------------------------------------------------------------------
log_step "Step 6: Running Migrations and Seed Data"

# Set database env vars for local TypeORM CLI
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=procgenie
export DB_PASSWORD=procgenie_secret
export DB_DATABASE=procgenie_dev

if [[ -f "${PROJECT_ROOT}/apps/api/src/config/database.config.ts" ]]; then
    log_info "Running database migrations..."
    cd "${PROJECT_ROOT}"
    npm run db:migrate 2>/dev/null && log_success "Migrations applied" || log_warn "Migration step skipped (may not be configured yet)"

    log_info "Seeding initial data..."
    npm run db:seed 2>/dev/null && log_success "Seed data applied" || log_warn "Seed step skipped (may not be configured yet)"
else
    log_warn "Database config not found; skipping migrations and seeding"
    log_info "Run 'npm run db:migrate' manually after setting up the API"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
log_step "Local Development Environment Ready"

echo ""
echo "  Services:"
echo "    PostgreSQL:  localhost:5432  (user: procgenie / db: procgenie_dev)"
echo "    Redis:       localhost:6379"
echo ""
echo "  Start development servers:"
echo "    npm run dev        # Start both web and API"
echo "    npm run dev:web    # Start web only (http://localhost:3000)"
echo "    npm run dev:api    # Start API only (http://localhost:4000)"
echo ""
echo "  Useful commands:"
echo "    npm run test                     # Run all tests"
echo "    npm run lint                     # Lint all workspaces"
echo "    npm run db:migrate               # Run database migrations"
echo "    npm run db:seed                  # Seed development data"
echo "    docker compose logs -f postgres  # View PostgreSQL logs"
echo "    docker compose down              # Stop all Docker services"
echo ""

log_success "Setup complete! Run 'npm run dev' to start developing."
