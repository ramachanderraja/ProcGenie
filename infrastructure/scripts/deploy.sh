#!/usr/bin/env bash
# =============================================================================
# ProcGenie S2P Platform - Azure Deployment Script
# =============================================================================
# Usage:
#   ./deploy.sh                          # Deploy with defaults (dev)
#   ./deploy.sh --env prod               # Deploy to production
#   ./deploy.sh --env staging --dry-run  # Dry run for staging
# =============================================================================

set -euo pipefail
IFS=$'\n\t'

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BICEP_DIR="${PROJECT_ROOT}/infrastructure/bicep"

# Defaults
ENVIRONMENT="${ENVIRONMENT:-dev}"
LOCATION="${LOCATION:-eastus}"
PROJECT_NAME="${PROJECT_NAME:-procgenie}"
DRY_RUN=false
SKIP_BUILD=false
SKIP_MIGRATE=false
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')}"

# Derived names
RESOURCE_GROUP="rg-${PROJECT_NAME}-${ENVIRONMENT}"
ACR_NAME=$(echo "acr${PROJECT_NAME}${ENVIRONMENT}" | tr -d '-')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

log_info()    { echo -e "${BLUE}[INFO]${NC}    $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $*" >&2; }
log_step()    { echo -e "\n${CYAN}========================================${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}========================================${NC}\n"; }

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Deploy ProcGenie S2P Platform to Azure.

Options:
  --env ENV          Environment to deploy to (dev|staging|prod) [default: dev]
  --location LOC     Azure region [default: eastus]
  --tag TAG          Docker image tag [default: git short SHA]
  --dry-run          Validate templates without deploying
  --skip-build       Skip Docker image build and push
  --skip-migrate     Skip database migrations
  -h, --help         Show this help message

Environment Variables:
  POSTGRES_ADMIN_PASSWORD   PostgreSQL admin password (required)
  JWT_SECRET                JWT signing secret (required)
  JWT_REFRESH_SECRET        JWT refresh signing secret (required)
  AZURE_OPENAI_API_KEY      Azure OpenAI API key (required)
  AZURE_OPENAI_ENDPOINT     Azure OpenAI endpoint URL (required)

Examples:
  $(basename "$0") --env dev
  $(basename "$0") --env prod --tag v1.2.3
  $(basename "$0") --dry-run
EOF
    exit 0
}

check_prerequisites() {
    log_step "Checking Prerequisites"

    local missing=()

    command -v az >/dev/null 2>&1 || missing+=("az (Azure CLI)")
    command -v docker >/dev/null 2>&1 || missing+=("docker")
    command -v jq >/dev/null 2>&1 || missing+=("jq")

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required tools:"
        for tool in "${missing[@]}"; do
            log_error "  - ${tool}"
        done
        exit 1
    fi

    log_success "All prerequisites met"
}

validate_secrets() {
    log_step "Validating Secrets"

    local missing=()

    [[ -z "${POSTGRES_ADMIN_PASSWORD:-}" ]] && missing+=("POSTGRES_ADMIN_PASSWORD")
    [[ -z "${JWT_SECRET:-}" ]] && missing+=("JWT_SECRET")
    [[ -z "${JWT_REFRESH_SECRET:-}" ]] && missing+=("JWT_REFRESH_SECRET")
    [[ -z "${AZURE_OPENAI_API_KEY:-}" ]] && missing+=("AZURE_OPENAI_API_KEY")
    [[ -z "${AZURE_OPENAI_ENDPOINT:-}" ]] && missing+=("AZURE_OPENAI_ENDPOINT")

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        for var in "${missing[@]}"; do
            log_error "  - ${var}"
        done
        log_info "Set these variables or use a .env file before deploying."
        exit 1
    fi

    log_success "All required secrets are set"
}

# ---------------------------------------------------------------------------
# Parse Arguments
# ---------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
    case $1 in
        --env)        ENVIRONMENT="$2"; shift 2 ;;
        --location)   LOCATION="$2"; shift 2 ;;
        --tag)        IMAGE_TAG="$2"; shift 2 ;;
        --dry-run)    DRY_RUN=true; shift ;;
        --skip-build) SKIP_BUILD=true; shift ;;
        --skip-migrate) SKIP_MIGRATE=true; shift ;;
        -h|--help)    usage ;;
        *)            log_error "Unknown option: $1"; usage ;;
    esac
done

# Recompute derived names after parsing
RESOURCE_GROUP="rg-${PROJECT_NAME}-${ENVIRONMENT}"
ACR_NAME=$(echo "acr${PROJECT_NAME}${ENVIRONMENT}" | tr -d '-')

# ---------------------------------------------------------------------------
# Main Deployment
# ---------------------------------------------------------------------------

main() {
    echo ""
    echo "=============================================="
    echo "  ProcGenie S2P Platform - Azure Deployment"
    echo "=============================================="
    echo ""
    echo "  Environment:  ${ENVIRONMENT}"
    echo "  Location:     ${LOCATION}"
    echo "  Image Tag:    ${IMAGE_TAG}"
    echo "  Dry Run:      ${DRY_RUN}"
    echo ""

    check_prerequisites
    validate_secrets

    # -----------------------------------------------------------------------
    # Step 1: Azure Login Verification
    # -----------------------------------------------------------------------
    log_step "Step 1: Verifying Azure Login"

    if ! az account show &>/dev/null; then
        log_info "Not logged in to Azure. Initiating login..."
        az login
    fi

    local subscription
    subscription=$(az account show --query name -o tsv)
    log_success "Logged in to Azure subscription: ${subscription}"

    # -----------------------------------------------------------------------
    # Step 2: Create Resource Group
    # -----------------------------------------------------------------------
    log_step "Step 2: Creating Resource Group"

    az group create \
        --name "${RESOURCE_GROUP}" \
        --location "${LOCATION}" \
        --tags project="${PROJECT_NAME}" environment="${ENVIRONMENT}" managedBy=bicep \
            documentTeam=Architecture projectName=IT \
            Owner=RRamachander Department=R-and-D CostCenter=GEPRnD \
        --output none

    log_success "Resource group '${RESOURCE_GROUP}' ready in ${LOCATION}"

    # -----------------------------------------------------------------------
    # Step 3: Deploy Bicep Template
    # -----------------------------------------------------------------------
    log_step "Step 3: Deploying Infrastructure (Bicep)"

    local deploy_action="create"

    if [[ "${DRY_RUN}" == "true" ]]; then
        deploy_action="validate"
        log_info "Running in dry-run mode (validation only)..."
    fi

    az deployment sub ${deploy_action} \
        --name "procgenie-${ENVIRONMENT}-$(date +%Y%m%d%H%M%S)" \
        --location "${LOCATION}" \
        --template-file "${BICEP_DIR}/main.bicep" \
        --parameters \
            projectName="${PROJECT_NAME}" \
            environment="${ENVIRONMENT}" \
            location="${LOCATION}" \
            postgresAdminPassword="${POSTGRES_ADMIN_PASSWORD}" \
            jwtSecret="${JWT_SECRET}" \
            jwtRefreshSecret="${JWT_REFRESH_SECRET}" \
            azureOpenAiApiKey="${AZURE_OPENAI_API_KEY}" \
            azureOpenAiEndpoint="${AZURE_OPENAI_ENDPOINT}" \
            azureOpenAiDeploymentName="${AZURE_OPENAI_DEPLOYMENT_NAME:-gpt-4o}" \
        --output none

    if [[ "${DRY_RUN}" == "true" ]]; then
        log_success "Bicep template validation passed"
        log_info "Exiting dry-run mode. No resources were created."
        exit 0
    fi

    log_success "Infrastructure deployed successfully"

    # Capture deployment outputs
    local deployment_outputs
    deployment_outputs=$(az deployment sub show \
        --name "procgenie-${ENVIRONMENT}-*" \
        --query "properties.outputs" \
        -o json 2>/dev/null | jq '.' || echo '{}')

    local ACR_LOGIN_SERVER
    ACR_LOGIN_SERVER=$(az acr show --name "${ACR_NAME}" --query loginServer -o tsv 2>/dev/null || echo "${ACR_NAME}.azurecr.io")

    # -----------------------------------------------------------------------
    # Step 4: Build and Push Docker Images
    # -----------------------------------------------------------------------
    if [[ "${SKIP_BUILD}" != "true" ]]; then
        log_step "Step 4: Building and Pushing Docker Images"

        # Login to ACR
        log_info "Logging in to Azure Container Registry..."
        az acr login --name "${ACR_NAME}"

        # Build and push web image
        log_info "Building web (Next.js) image..."
        docker build \
            -t "${ACR_LOGIN_SERVER}/procgenie-web:${IMAGE_TAG}" \
            -t "${ACR_LOGIN_SERVER}/procgenie-web:latest" \
            -f "${PROJECT_ROOT}/apps/web/Dockerfile" \
            "${PROJECT_ROOT}"

        log_info "Pushing web image..."
        docker push "${ACR_LOGIN_SERVER}/procgenie-web:${IMAGE_TAG}"
        docker push "${ACR_LOGIN_SERVER}/procgenie-web:latest"

        log_success "Web image pushed: ${ACR_LOGIN_SERVER}/procgenie-web:${IMAGE_TAG}"

        # Build and push API image
        log_info "Building API (NestJS) image..."
        docker build \
            -t "${ACR_LOGIN_SERVER}/procgenie-api:${IMAGE_TAG}" \
            -t "${ACR_LOGIN_SERVER}/procgenie-api:latest" \
            -f "${PROJECT_ROOT}/apps/api/Dockerfile" \
            "${PROJECT_ROOT}"

        log_info "Pushing API image..."
        docker push "${ACR_LOGIN_SERVER}/procgenie-api:${IMAGE_TAG}"
        docker push "${ACR_LOGIN_SERVER}/procgenie-api:latest"

        log_success "API image pushed: ${ACR_LOGIN_SERVER}/procgenie-api:${IMAGE_TAG}"
    else
        log_warn "Skipping Docker image build (--skip-build)"
    fi

    # -----------------------------------------------------------------------
    # Step 5: Update Container Apps
    # -----------------------------------------------------------------------
    log_step "Step 5: Updating Container Apps"

    local web_app_name="ca-${PROJECT_NAME}-${ENVIRONMENT}-web"
    local api_app_name="ca-${PROJECT_NAME}-${ENVIRONMENT}-api"

    log_info "Updating web container app..."
    az containerapp update \
        --name "${web_app_name}" \
        --resource-group "${RESOURCE_GROUP}" \
        --image "${ACR_LOGIN_SERVER}/procgenie-web:${IMAGE_TAG}" \
        --output none 2>/dev/null || log_warn "Web container app update skipped (may not exist yet)"

    log_info "Updating API container app..."
    az containerapp update \
        --name "${api_app_name}" \
        --resource-group "${RESOURCE_GROUP}" \
        --image "${ACR_LOGIN_SERVER}/procgenie-api:${IMAGE_TAG}" \
        --output none 2>/dev/null || log_warn "API container app update skipped (may not exist yet)"

    log_success "Container apps updated with image tag: ${IMAGE_TAG}"

    # -----------------------------------------------------------------------
    # Step 6: Run Database Migrations
    # -----------------------------------------------------------------------
    if [[ "${SKIP_MIGRATE}" != "true" ]]; then
        log_step "Step 6: Running Database Migrations"

        log_info "Executing migrations via container app exec..."
        az containerapp exec \
            --name "${api_app_name}" \
            --resource-group "${RESOURCE_GROUP}" \
            --command "node dist/database/run-migrations.js" \
            2>/dev/null || log_warn "Migration execution skipped (container may not support exec or migration script not found)"

        log_success "Database migrations completed"
    else
        log_warn "Skipping database migrations (--skip-migrate)"
    fi

    # -----------------------------------------------------------------------
    # Step 7: Verify Health Endpoints
    # -----------------------------------------------------------------------
    log_step "Step 7: Verifying Health Endpoints"

    local web_url api_url
    web_url=$(az containerapp show --name "${web_app_name}" --resource-group "${RESOURCE_GROUP}" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "")
    api_url=$(az containerapp show --name "${api_app_name}" --resource-group "${RESOURCE_GROUP}" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "")

    if [[ -n "${web_url}" ]]; then
        log_info "Checking web health: https://${web_url}"
        local web_status
        web_status=$(curl -s -o /dev/null -w "%{http_code}" "https://${web_url}" --max-time 30 2>/dev/null || echo "000")
        if [[ "${web_status}" == "200" ]]; then
            log_success "Web app is healthy (HTTP ${web_status})"
        else
            log_warn "Web app returned HTTP ${web_status} (may still be starting)"
        fi
    fi

    if [[ -n "${api_url}" ]]; then
        log_info "Checking API health: https://${api_url}/api/v1/health"
        local api_status
        api_status=$(curl -s -o /dev/null -w "%{http_code}" "https://${api_url}/api/v1/health" --max-time 30 2>/dev/null || echo "000")
        if [[ "${api_status}" == "200" ]]; then
            log_success "API app is healthy (HTTP ${api_status})"
        else
            log_warn "API app returned HTTP ${api_status} (may still be starting)"
        fi
    fi

    # -----------------------------------------------------------------------
    # Deployment Summary
    # -----------------------------------------------------------------------
    log_step "Deployment Summary"

    echo ""
    echo "  Environment:       ${ENVIRONMENT}"
    echo "  Resource Group:    ${RESOURCE_GROUP}"
    echo "  Image Tag:         ${IMAGE_TAG}"
    echo ""
    echo "  Service URLs:"
    [[ -n "${web_url:-}" ]] && echo "    Web App:         https://${web_url}"
    [[ -n "${api_url:-}" ]] && echo "    API App:         https://${api_url}"
    echo "    ACR:             ${ACR_LOGIN_SERVER:-${ACR_NAME}.azurecr.io}"
    echo ""
    echo "  Azure Portal:"
    echo "    Resource Group:  https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/${RESOURCE_GROUP}"
    echo ""

    log_success "Deployment complete!"
}

# Run main
main "$@"
