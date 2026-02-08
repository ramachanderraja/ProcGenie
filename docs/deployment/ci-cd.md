# CI/CD Pipeline Guide

> GitHub Actions workflows, pipeline stages, environment promotion, rollback procedures, and secrets management.

## 1. Pipeline Overview

ProcGenie uses GitHub Actions for continuous integration and deployment. The pipeline is structured as a series of workflows that handle different stages of the software delivery lifecycle.

```
Pull Request ──▶ CI Pipeline ──▶ Merge to main ──▶ CD Pipeline ──▶ Production
                     │                                    │
                     ├── Lint                             ├── Build Images
                     ├── Type Check                      ├── Push to ACR
                     ├── Unit Tests                      ├── Deploy to Staging
                     ├── Integration Tests               ├── Smoke Tests
                     ├── Build Check                     ├── Manual Approval
                     └── Security Scan                   └── Deploy to Production
```

## 2. Workflow Files

```
.github/workflows/
├── ci.yml                  # CI pipeline (on PR)
├── cd-staging.yml          # Deploy to staging (on merge to main)
├── cd-production.yml       # Deploy to production (manual trigger + approval)
├── security-scan.yml       # Weekly security scan
├── dependency-update.yml   # Automated dependency updates
└── release.yml             # Create release tags
```

## 3. CI Pipeline (ci.yml)

Triggered on every pull request targeting `main` or `develop`.

### Stages

```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: procgenie
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: procgenie_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U procgenie"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: procgenie
          DB_PASSWORD: test_password
          DB_DATABASE: procgenie_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

  build:
    name: Build Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build

  docker-build:
    name: Docker Build Check
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api, web]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/${{ matrix.service }}/Dockerfile
          target: runner
          push: false
          cache-from: type=gha
          cache-to: type=gha,mode=max

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: fs
          ignore-unfixed: true
          severity: HIGH,CRITICAL
```

### Required Checks

All of the following must pass before a PR can be merged:

| Check | Required | Description |
|---|---|---|
| Lint & Format | Yes | ESLint + Prettier compliance |
| Type Check | Yes | TypeScript compilation without errors |
| Unit Tests | Yes | All unit tests pass with >80% coverage |
| Integration Tests | Yes | E2E tests pass against real services |
| Build Check | Yes | Both API and web build successfully |
| Docker Build | Yes | Docker images build without errors |
| Security Scan | Yes | No HIGH/CRITICAL vulnerabilities |

## 4. CD Pipeline (Staging)

Triggered automatically on merge to `main`.

```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    name: Build & Push Images
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.ACR_LOGIN_SERVER }}/procgenie-api
          tags: |
            type=sha,prefix=
            type=raw,value=staging
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/api/Dockerfile
          target: runner
          push: true
          tags: ${{ steps.meta.outputs.tags }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          target: runner
          push: true
          tags: |
            ${{ secrets.ACR_LOGIN_SERVER }}/procgenie-web:${{ steps.meta.outputs.version }}
            ${{ secrets.ACR_LOGIN_SERVER }}/procgenie-web:staging

  deploy-staging:
    name: Deploy to Staging
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - name: Deploy API
        uses: azure/container-apps-deploy-action@v1
        with:
          resourceGroup: rg-procgenie-staging
          containerAppName: ca-procgenie-api-staging
          imageToDeploy: >-
            ${{ secrets.ACR_LOGIN_SERVER }}/procgenie-api:${{ needs.build-and-push.outputs.image-tag }}
      - name: Deploy Web
        uses: azure/container-apps-deploy-action@v1
        with:
          resourceGroup: rg-procgenie-staging
          containerAppName: ca-procgenie-web-staging
          imageToDeploy: >-
            ${{ secrets.ACR_LOGIN_SERVER }}/procgenie-web:${{ needs.build-and-push.outputs.image-tag }}
      - name: Run Migrations
        run: |
          az containerapp exec \
            --resource-group rg-procgenie-staging \
            --name ca-procgenie-api-staging \
            --command "npm run db:migrate"

  smoke-tests:
    name: Smoke Tests
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Health Check
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://staging-api.procgenie.io/api/v1/health)
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed"
              exit 0
            fi
            echo "Attempt $i: Status $STATUS, retrying..."
            sleep 10
          done
          echo "Health check failed after 30 attempts"
          exit 1
      - name: API Smoke Tests
        run: npm run test:smoke
        env:
          API_URL: https://staging-api.procgenie.io/api/v1
```

## 5. CD Pipeline (Production)

Triggered manually with required approval from designated reviewers.

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      image-tag:
        description: 'Image tag to deploy (defaults to latest staging tag)'
        required: false
        type: string
      run-migrations:
        description: 'Run database migrations'
        required: true
        type: boolean
        default: true

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.procgenie.io
    steps:
      - uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS_PROD }}
      - name: Deploy API
        uses: azure/container-apps-deploy-action@v1
        with:
          resourceGroup: rg-procgenie-prod
          containerAppName: ca-procgenie-api
          imageToDeploy: >-
            ${{ secrets.ACR_LOGIN_SERVER }}/procgenie-api:${{ inputs.image-tag || 'staging' }}
      - name: Deploy Web
        uses: azure/container-apps-deploy-action@v1
        with:
          resourceGroup: rg-procgenie-prod
          containerAppName: ca-procgenie-web
          imageToDeploy: >-
            ${{ secrets.ACR_LOGIN_SERVER }}/procgenie-web:${{ inputs.image-tag || 'staging' }}
      - name: Run Migrations
        if: inputs.run-migrations
        run: |
          az containerapp exec \
            --resource-group rg-procgenie-prod \
            --name ca-procgenie-api \
            --command "npm run db:migrate"
      - name: Production Health Check
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.procgenie.io/api/v1/health)
            if [ "$STATUS" = "200" ]; then
              echo "Production health check passed"
              exit 0
            fi
            sleep 10
          done
          exit 1
```

## 6. Environment Promotion

### Promotion Flow

```
Feature Branch ──▶ develop ──▶ main ──▶ Staging ──▶ Production
                      │            │         │            │
                   PR + CI      Merge     Auto-deploy   Manual + Approval
```

| Stage | Trigger | Approval | Automated Tests |
|---|---|---|---|
| CI | Pull request opened/updated | Peer code review (1+ approvals) | Lint, typecheck, unit, integration, build, security |
| Staging | Merge to `main` | None (automatic) | Smoke tests after deploy |
| Production | Manual workflow dispatch | Required: 2 approvers from `@procgenie/platform-leads` | Health check after deploy |

### Environment Configuration

| Setting | Staging | Production |
|---|---|---|
| Resource Group | `rg-procgenie-staging` | `rg-procgenie-prod` |
| API URL | `staging-api.procgenie.io` | `api.procgenie.io` |
| Web URL | `staging.procgenie.io` | `app.procgenie.io` |
| DB Instance | `psql-procgenie-staging` | `psql-procgenie-prod` |
| Redis Instance | `redis-procgenie-staging` | `redis-procgenie-prod` |
| API Replicas | 1 | 2--20 (auto-scaled) |
| Web Replicas | 1 | 2--10 (auto-scaled) |
| DB Tier | Burstable B2ms | General Purpose D4ds_v4 |
| Log Level | `info` | `warn` |

## 7. Rollback Procedures

### Automatic Rollback

Azure Container Apps supports revision-based rollback. If a deployment fails health checks, traffic remains on the previous revision.

### Manual Rollback

```bash
# List recent revisions
az containerapp revision list \
  --resource-group rg-procgenie-prod \
  --name ca-procgenie-api \
  --query "[].{name:name, active:active, trafficWeight:trafficWeight, created:createdTime}" \
  -o table

# Route 100% traffic to a specific revision
az containerapp ingress traffic set \
  --resource-group rg-procgenie-prod \
  --name ca-procgenie-api \
  --revision-weight ca-procgenie-api--<revision-suffix>=100

# Or deploy a specific previous image tag
gh workflow run cd-production.yml \
  -f image-tag="abc1234" \
  -f run-migrations=false
```

### Database Rollback

If a migration causes issues:

```bash
# Revert last migration
az containerapp exec \
  --resource-group rg-procgenie-prod \
  --name ca-procgenie-api \
  --command "npm run migration:revert"
```

> **Important:** Always test migrations in staging first. Ensure migrations are backward-compatible (additive only) so that rollback does not require database changes.

### Rollback Checklist

1. **Identify the issue** -- Check Application Insights for error spikes, latency changes, or health check failures
2. **Decide scope** -- Is this an application-only rollback or does it require database migration revert?
3. **Execute rollback** -- Use revision traffic switching for instant rollback
4. **Verify** -- Confirm health checks pass and error rates return to baseline
5. **Communicate** -- Notify the team via Slack `#deployments` channel
6. **Root cause** -- Create a post-incident ticket to investigate the failed deployment

## 8. Secrets Management

### GitHub Secrets Configuration

Secrets are stored in GitHub repository settings under **Settings > Secrets and variables > Actions**.

#### Repository Secrets

| Secret | Description | Used In |
|---|---|---|
| `ACR_LOGIN_SERVER` | Azure Container Registry login server | CD pipeline |
| `ACR_USERNAME` | ACR admin username | CD pipeline |
| `ACR_PASSWORD` | ACR admin password | CD pipeline |
| `AZURE_CREDENTIALS` | Azure service principal JSON (staging) | CD staging |
| `AZURE_CREDENTIALS_PROD` | Azure service principal JSON (production) | CD production |

#### Environment Secrets (per environment)

| Secret | Environments | Description |
|---|---|---|
| `DB_PASSWORD` | staging, production | PostgreSQL password |
| `REDIS_PASSWORD` | staging, production | Redis auth password |
| `JWT_SECRET` | staging, production | JWT signing key |
| `JWT_REFRESH_SECRET` | staging, production | Refresh token signing key |
| `ANTHROPIC_API_KEY` | staging, production | Claude API key |
| `SMTP_PASSWORD` | staging, production | Email service password |

### Creating the Azure Service Principal

```bash
# Create service principal with Contributor role
az ad sp create-for-rbac \
  --name "sp-procgenie-github-actions" \
  --role Contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/rg-procgenie-prod \
  --json-auth

# Output is the JSON to store as AZURE_CREDENTIALS secret
```

### Secret Rotation

| Secret | Rotation Frequency | Rotation Method |
|---|---|---|
| ACR credentials | 90 days | Azure CLI: `az acr credential renew` |
| Service principal | 12 months | Azure CLI: `az ad sp credential reset` |
| JWT secrets | 6 months | Update Key Vault, then GitHub secret |
| Database passwords | 90 days | Azure CLI: `az postgres flexible-server update` |
| API keys | Per provider policy | Provider dashboard |

### Security Best Practices

1. **Never commit secrets** to the repository. Use `.env.example` with placeholder values.
2. **Use environment-scoped secrets** so staging and production have independent credentials.
3. **Require approval** for production deployments via GitHub environment protection rules.
4. **Audit secret access** through GitHub audit logs.
5. **Rotate secrets regularly** per the schedule above.
6. **Use managed identities** where possible to eliminate stored credentials.
