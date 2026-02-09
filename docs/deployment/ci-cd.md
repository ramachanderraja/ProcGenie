# CI/CD Pipeline Guide

> GitHub Actions workflows for continuous integration and deployment of ProcGenie to Azure Container Apps.

## 1. Pipeline Overview

```
Push to main ──> CI Pipeline ──> Deploy Pipeline ──> Smoke Tests
                     |                   |                |
                     ├── Lint            ├── Build Images  ├── Web health check
                     ├── Test (Web)      ├── Push to ACR   ├── API health check
                     ├── Test (API)      └── Notify        └── Response validation
                     ├── Build (Web)
                     └── Build (API)
```

## 2. Workflow Files

```
.github/workflows/
├── ci.yml       # CI pipeline (lint, test, build) - triggers on push to main + PRs
└── deploy.yml   # Deploy pipeline (build, push ACR, smoke tests) - triggers on push to main
```

## 3. CI Pipeline (`ci.yml`)

Triggers on push to `main` and pull requests targeting `main`.

### Jobs

| Job | Duration | What It Does |
|-----|----------|-------------|
| **Lint** | ~45s | ESLint (web + API), TypeScript type-check, Prettier format check |
| **Test (Web)** | ~30s | Jest unit tests for Next.js frontend |
| **Test (API)** | ~50s | Jest tests with PostgreSQL + Redis service containers |
| **Build (Web)** | ~2m | Next.js build + Docker image build + verification |
| **Build (API)** | ~1m | Docker image build + verification |

### Key Configuration Notes

```yaml
env:
  ESLINT_USE_FLAT_CONFIG: "false"  # Required: ESLint 9 + legacy .eslintrc.json
```

- **ESLint**: Uses `ESLINT_USE_FLAT_CONFIG=false` because project has `.eslintrc.json` (legacy format) but ESLint 9.x is installed
- **API Tests**: Uses `--passWithNoTests` flag because no `.spec.ts` files exist yet
- **API Build**: The CI Build (API) job skips `npm run build` and only builds the Docker image. The `nest build` command fails in CI due to missing peer dependencies at the workspace level, but the Dockerfile handles this correctly via multi-stage build with `npx tsc --noCheck`
- **Service Containers**: API tests spin up PostgreSQL 16-alpine and Redis 7-alpine

### Job Dependencies

```
Lint ──> Test (Web) ──> Build (Web)
   └──> Test (API) ──> Build (API)
```

## 4. Deploy Pipeline (`deploy.yml`)

Triggers on push to `main` and `claude/**` branches. Also supports manual dispatch.

### Jobs

| Job | Duration | What It Does |
|-----|----------|-------------|
| **CI Check** | ~3s | Verifies the CI workflow passed for this commit |
| **Build, Push & Deploy** | ~1m | Builds Docker images, pushes to ACR with SHA + latest tags |
| **Smoke Tests** | ~2-3m | Health checks against live Container Apps URLs |
| **Notify** | ~5s | Posts deployment summary to GitHub step summary |

### Authentication

The deploy workflow uses **ACR admin credentials only** -- no Azure service principal login is needed:

```yaml
- name: Login to ACR
  uses: docker/login-action@v3
  with:
    registry: ${{ env.ACR_LOGIN_SERVER }}
    username: ${{ secrets.ACR_USERNAME }}
    password: ${{ secrets.ACR_PASSWORD }}
```

> **Why no Azure login?** GEP's subscription only grants Contributor access (not Owner), so we cannot create role assignments for service principals. The deploy workflow pushes images to ACR and relies on Container Apps' existing configuration to pull the latest images. Smoke tests use direct HTTP to the known Container Apps FQDNs.

### Container Apps FQDNs

The FQDNs are set as environment variables in the workflow:

```yaml
env:
  WEB_FQDN: ca-procgenie-dev-web.happypond-9a781889.westus2.azurecontainerapps.io
  API_FQDN: ca-procgenie-dev-api.happypond-9a781889.westus2.azurecontainerapps.io
```

> These FQDNs are assigned during the initial Bicep deployment and remain stable across updates. If you redeploy the Container App Environment from scratch, these will change and must be updated.

### Image Tags

Each build produces two tags:
- `acrprocgeniedev.azurecr.io/procgenie-web:<git-sha>` (immutable)
- `acrprocgeniedev.azurecr.io/procgenie-web:latest` (mutable, for Container Apps)

## 5. GitHub Secrets

### Repository Secrets

| Secret | Description | How to Obtain |
|--------|-------------|---------------|
| `ACR_USERNAME` | ACR admin username | `az acr credential show --name acrprocgeniedev --query username -o tsv` |
| `ACR_PASSWORD` | ACR admin password | `az acr credential show --name acrprocgeniedev --query 'passwords[0].value' -o tsv` |
| `AZURE_CREDENTIALS` | SP JSON (exists but unused) | Created but SP has no role -- kept for future use when cloud team grants access |

### Setting Secrets via CLI

```bash
gh secret set ACR_USERNAME --body "$(az acr credential show --name acrprocgeniedev --query username -o tsv)"
gh secret set ACR_PASSWORD --body "$(az acr credential show --name acrprocgeniedev --query 'passwords[0].value' -o tsv)"
```

## 6. Manual Container App Update

If Container Apps don't auto-pull the latest image after a push, run:

```bash
az containerapp update \
  --name ca-procgenie-dev-web \
  --resource-group rg-procgenie-dev \
  --image acrprocgeniedev.azurecr.io/procgenie-web:latest

az containerapp update \
  --name ca-procgenie-dev-api \
  --resource-group rg-procgenie-dev \
  --image acrprocgeniedev.azurecr.io/procgenie-api:latest
```

## 7. Rollback

### Revision-Based Rollback

```bash
# List recent revisions
az containerapp revision list \
  --resource-group rg-procgenie-dev \
  --name ca-procgenie-dev-api \
  --query "[].{name:name, active:active, trafficWeight:trafficWeight}" \
  -o table

# Route traffic to a previous revision
az containerapp ingress traffic set \
  --resource-group rg-procgenie-dev \
  --name ca-procgenie-dev-api \
  --revision-weight <revision-name>=100
```

### Image-Based Rollback

```bash
# Deploy a specific image tag (from a previous commit SHA)
az containerapp update \
  --name ca-procgenie-dev-api \
  --resource-group rg-procgenie-dev \
  --image acrprocgeniedev.azurecr.io/procgenie-api:<previous-sha>
```

## 8. Troubleshooting CI/CD

### CI Lint Fails
- Check if ESLint config format changed. Ensure `ESLINT_USE_FLAT_CONFIG=false` is set
- API has ~18 lint warnings (unused vars) that are non-blocking. Only errors cause failure

### CI API Tests Fail
- Ensure `--passWithNoTests` flag is used (no test files exist yet)
- Check service container health (PostgreSQL, Redis)

### CI API Build Fails
- Do NOT use `npm run build --workspace=apps/api` in CI. Missing peer deps (`@nestjs/throttler`, etc.)
- The Docker build handles this correctly via multi-stage with `npx tsc --noCheck`

### Deploy Build Fails
- Verify ACR credentials are valid: `az acr login --name acrprocgeniedev`
- Check Docker buildx cache: try clearing GHA cache

### Smoke Tests Fail
- Container Apps may take 60-90s to pull new images after push
- FQDNs may have changed if Container App Environment was redeployed
- Check Container App logs: `az containerapp logs show --name ca-procgenie-dev-api --resource-group rg-procgenie-dev --tail 100`
