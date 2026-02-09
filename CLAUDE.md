# ProcGenie - S2P Orchestration Platform

## Project Overview
ProcGenie is a next-generation Source-to-Pay (S2P) Orchestration Platform with 10 modules, 120+ features, 15 AI agents, and 12 user personas. It is designed for Fortune 500 enterprises.

## Repository Structure
```
ProcGenie/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router, React 19, Tailwind CSS)
│   └── api/          # NestJS backend (TypeORM, PostgreSQL, Redis, Bull)
├── packages/
│   ├── shared-types/  # Shared TypeScript types across all apps
│   ├── ui-components/ # Shared UI component library
│   └── eslint-config/ # Shared ESLint configuration
├── infrastructure/
│   ├── bicep/        # Azure Bicep IaC templates
│   ├── scripts/      # Deployment and setup scripts
│   └── helm/         # Kubernetes Helm charts (future)
├── docs/             # Comprehensive documentation
│   ├── architecture/ # System architecture docs
│   ├── api/          # API reference documentation
│   ├── deployment/   # Deployment guides
│   ├── security/     # Security & compliance docs
│   ├── user-guides/  # End-user documentation
│   ├── runbooks/     # Operational runbooks
│   └── adr/          # Architecture Decision Records
└── .github/workflows/ # CI/CD pipelines
```

## Development Commands
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:web` - Start frontend only (port 3000)
- `npm run dev:api` - Start backend only (port 4000)
- `npm run build` - Build all workspaces
- `npm run test` - Run all tests
- `npm run lint` - Lint all workspaces
- `npm run docker:up` - Start full stack with Docker Compose

## Technology Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Zustand, TanStack Query/Table, Recharts
- **Backend**: NestJS, TypeORM, PostgreSQL 16, Redis 7, Bull (queues)
- **AI**: Azure OpenAI GPT-4o (`sourceai-dev-oai-k8nq50` in westus, deployment `gpt-4o`)
- **Infrastructure**: Azure Container Apps, ACR, PostgreSQL Flex, Redis Cache, Front Door, Key Vault
- **CI/CD**: GitHub Actions, Docker multi-stage builds
- **Region**: `westus2` (eastus restricted by GEP policy)

## Key Patterns
- **Monorepo**: npm workspaces for code sharing (deps hoisted to root `node_modules`)
- **CQRS**: Separate read/write models
- **Event Sourcing**: Immutable audit trail
- **Saga Pattern**: Distributed transaction management via Temporal.io
- **Multi-Tenant**: PostgreSQL RLS with tenant_id on all tables
- **ReAct Agents**: Reasoning + Acting loop for AI agents

## Azure Deployment (Current State)
- **Resource Group**: `rg-procgenie-dev` in `westus2`
- **Subscription**: `GEPRnD` (`6cfdb802-f41a-41fe-b648-e1806b6adee9`)
- **Web**: `https://ca-procgenie-dev-web.happypond-9a781889.westus2.azurecontainerapps.io`
- **API**: `https://ca-procgenie-dev-api.happypond-9a781889.westus2.azurecontainerapps.io`
- **ACR**: `acrprocgeniedev.azurecr.io`
- **GitHub**: `https://github.com/ramachanderraja/ProcGenie`

## GEP Azure Policy Constraints (CRITICAL)
- **Required RG Tags**: `documentTeam=Architecture`, `projectName=IT`
- **Key Vault**: Must have `publicNetworkAccess=Disabled`, `networkAcls.defaultAction=Deny`
- **ACR**: Only `Basic` and `Standard` SKUs. Basic does NOT support `retentionPolicy`
- **PostgreSQL**: Region `eastus` is restricted. Use `westus2`
- **Role Assignments**: User has `Contributor` (NOT Owner). Cannot create role assignments. Use ACR admin creds + KV access policies instead of RBAC
- **Git Bash**: Use `MSYS_NO_PATHCONV=1` prefix for `az` commands with `/subscriptions/...` paths

## CI/CD Pipeline
Both workflows trigger on push to `main` or `claude/**` branches.

### CI Workflow (`ci.yml`)
- Lint (ESLint + TypeScript + Prettier) - uses `ESLINT_USE_FLAT_CONFIG=false` for ESLint 9 + `.eslintrc.json`
- Test (Web) - Jest unit tests
- Test (API) - Jest with `--passWithNoTests` (PostgreSQL + Redis service containers)
- Build (Web) - Next.js build + Docker image
- Build (API) - Docker image only (skips `nest build` due to strict mode TS errors)

### Deploy Workflow (`deploy.yml`)
- CI Check gate
- Build & Push to ACR (uses `ACR_USERNAME`/`ACR_PASSWORD` secrets, NO Azure login needed)
- Smoke Tests (direct HTTP to hardcoded Container Apps FQDNs)
- Notify (GitHub step summary)

### GitHub Secrets
- `ACR_USERNAME` - ACR admin username
- `ACR_PASSWORD` - ACR admin password
- `AZURE_CREDENTIALS` - SP JSON (exists but SP has no role; not currently used by deploy workflow)

## Docker Build Notes
- npm workspaces hoist all deps to root `node_modules` - Dockerfiles must COPY from root, not per-workspace
- API build uses `npx tsc -p tsconfig.json --noCheck` to skip 403+ strict TypeScript errors
- API tsconfig has `strictPropertyInitialization: false`, `useUnknownInCatchVariables: false`
- `nest-cli.json` has `typeCheck: false`
- `@azure/openai` max version is `^2.0.0` (not 2.1.0)

## Module Reference
1. Intelligent Intake Management
2. Orchestration & Workflow Engine
3. Buying & Execution
4. Agentic AI & Autonomous Operations
5. Supplier Management & Portal
6. Contract Lifecycle Management
7. Search & Analytics
8. Sustainability & ESG
9. Integration & Connectivity
10. Security, Compliance & Administration
