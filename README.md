# ProcGenie

**Next-Generation Source-to-Pay Orchestration Platform**

> An intelligent, AI-powered procurement orchestration platform that unifies intake, workflows, sourcing, contracts, suppliers, and analytics through a single experience layer with 15 specialized AI agents.

---

## Overview

ProcGenie is an enterprise-grade S2P (Source-to-Pay) orchestration platform designed to sit above fragmented ERP ecosystems, providing a unified experience layer powered by Agentic AI. The platform captures 100% of spend through an intelligent "Single Front Door," orchestrates complex multi-stakeholder workflows, and deploys 15 specialized AI agents for autonomous procurement operations.

### Key Capabilities

| Module | Description |
|--------|-------------|
| **Intelligent Intake** | NLP-powered request submission with auto-classification, catalog buying, and policy validation |
| **Workflow Orchestration** | Visual workflow builder with parallel routing, SLA management, and saga-pattern compensation |
| **Buying & Execution** | Catalog integration, automated SOW generation, quick quotes, and 3-way matching |
| **AI Agents** | 15 specialized agents (intake classifier, negotiation, risk monitoring, contract analysis, etc.) |
| **Supplier Management** | Self-service onboarding, golden record, performance scorecards, and risk profiling |
| **Contract Lifecycle** | AI clause analysis, obligation tracking, renewal management, and version control |
| **Analytics & Search** | Natural language reporting, spend dashboards, savings waterfall, and predictive analytics |
| **Sustainability & ESG** | Carbon footprint tracking, ESG scoring, regulatory compliance, and green procurement |
| **Integration Hub** | Pre-built ERP connectors (SAP, NetSuite, Oracle), webhooks, and MCP support |
| **Security & Compliance** | RBAC with SoD, immutable audit trails, SOC 2 / GDPR / ISO 27001 compliance |

### Architecture Highlights

- **Microservices** with domain-driven design bounded contexts
- **Event-sourced** architecture for immutable audit trails
- **CQRS** pattern separating read/write stores
- **Multi-tenant** with PostgreSQL Row-Level Security
- **15 AI agents** operating on ReAct (Reasoning + Acting) pattern
- **Saga pattern** for distributed transactions via Temporal.io

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd ProcGenie

# Install dependencies
npm install

# Start infrastructure (PostgreSQL, Redis)
docker-compose up -d postgres redis

# Run database migrations and seed data
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs

### Docker (Full Stack)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## Project Structure

```
ProcGenie/
├── apps/
│   ├── web/              # Next.js 15 frontend application
│   │   ├── src/
│   │   │   ├── app/      # App Router pages (dashboard, intake, requests, etc.)
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── services/  # API client and mock data
│   │   │   ├── store/     # Zustand state management
│   │   │   └── types/     # Frontend-specific types
│   │   └── Dockerfile
│   └── api/              # NestJS backend API
│       ├── src/
│       │   ├── modules/   # Feature modules (intake, workflow, suppliers, etc.)
│       │   ├── common/    # Shared guards, filters, interceptors
│       │   ├── config/    # Configuration management
│       │   └── database/  # Migrations and seeds
│       └── Dockerfile
├── packages/
│   └── shared-types/     # Shared TypeScript type definitions
├── infrastructure/
│   ├── bicep/            # Azure IaC templates
│   ├── scripts/          # Deployment scripts
│   └── helm/             # Kubernetes charts (future)
├── docs/                 # Comprehensive documentation
│   ├── architecture/     # System design docs
│   ├── api/              # API reference
│   ├── deployment/       # Deploy guides
│   ├── security/         # Security & compliance
│   ├── user-guides/      # End-user docs
│   ├── runbooks/         # Ops runbooks
│   └── adr/              # Architecture decisions
└── .github/workflows/    # CI/CD pipelines
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, React 19, Tailwind CSS | Server-side rendered enterprise UI |
| State Management | Zustand, TanStack Query | Client state and server cache |
| UI Components | Radix UI, Recharts, Lucide React | Accessible components and charts |
| Backend | NestJS, TypeORM | REST API with ORM |
| Database | PostgreSQL 16 | Primary data store with RLS |
| Cache | Redis 7 | Caching, sessions, real-time |
| Queue | Bull (Redis-backed) | Background job processing |
| AI | Claude API (Anthropic) | LLM gateway for all agents |
| Auth | Passport.js, JWT | Authentication and authorization |
| Infrastructure | Azure Container Apps | Serverless container hosting |
| IaC | Bicep | Azure resource provisioning |
| CI/CD | GitHub Actions | Automated build, test, deploy |
| Monitoring | OpenTelemetry, Grafana | Observability stack |

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Architecture Overview](docs/architecture/overview.md)
- [Data Model](docs/architecture/data-model.md)
- [AI & Agent Architecture](docs/architecture/ai-architecture.md)
- [Security Architecture](docs/architecture/security.md)
- [API Reference](docs/api/README.md)
- [Azure Deployment Guide](docs/deployment/azure-setup.md)
- [Local Development Guide](docs/deployment/local-development.md)
- [Docker Guide](docs/deployment/docker.md)
- [CI/CD Pipeline](docs/deployment/ci-cd.md)
- [RBAC & Access Control](docs/security/rbac.md)
- [Compliance Guide](docs/security/compliance.md)
- [User Getting Started](docs/user-guides/getting-started.md)
- [Architecture Decision Records](docs/adr/)

---

## Deployment

### Azure (Production)

```bash
# Deploy infrastructure
./infrastructure/scripts/deploy.sh

# Or use GitHub Actions (automatic on push to main)
git push origin main
```

See [Azure Deployment Guide](docs/deployment/azure-setup.md) for detailed instructions.

---

## Contributing

1. Create a feature branch from `main`
2. Make changes following the existing code patterns
3. Write tests for new functionality
4. Ensure `npm run lint` and `npm run test` pass
5. Create a pull request with a clear description

---

## License

Proprietary - All rights reserved.
