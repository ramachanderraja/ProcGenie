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
- **AI**: Claude API (Anthropic), RAG pipeline, 15 specialized agents
- **Infrastructure**: Azure Container Apps, ACR, PostgreSQL Flex, Redis Cache, Front Door, Key Vault
- **CI/CD**: GitHub Actions, Docker multi-stage builds

## Key Patterns
- **Monorepo**: npm workspaces for code sharing
- **CQRS**: Separate read/write models
- **Event Sourcing**: Immutable audit trail
- **Saga Pattern**: Distributed transaction management via Temporal.io
- **Multi-Tenant**: PostgreSQL RLS with tenant_id on all tables
- **ReAct Agents**: Reasoning + Acting loop for AI agents

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
