# Architecture Overview

> ProcGenie S2P Orchestration Platform -- Technical Architecture Document

## 1. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Web App  │  │ Mobile   │  │ Slack /  │  │ Email    │  │ Supplier │     │
│  │ (Next.js)│  │ App      │  │ Teams    │  │ Gateway  │  │ Portal   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
└───────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────┘
        │              │              │              │              │
┌───────▼──────────────▼──────────────▼──────────────▼──────────────▼──────────┐
│                        Azure Front Door (CDN + WAF)                          │
│                        TLS 1.3 termination, DDoS protection                  │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                          API Gateway (Kong / NestJS)                          │
│                  JWT validation, rate limiting, request routing               │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                         CORE MICROSERVICES                                    │
│                                                                              │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────────────┐      │
│  │   Intake    │ │ Orchestration│ │   Vendor    │ │   Contract      │      │
│  │   Service   │ │   Service    │ │   Service   │ │   Service       │      │
│  └──────┬──────┘ └──────┬───────┘ └──────┬──────┘ └──────┬──────────┘      │
│         │               │                │               │                   │
│  ┌──────┴──────┐ ┌──────┴───────┐ ┌──────┴──────┐                          │
│  │Intelligence │ │ Integration  │ │Notification │                          │
│  │  Service    │ │   Service    │ │  Service    │                          │
│  └─────────────┘ └──────────────┘ └─────────────┘                          │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                          EVENT BUS (Apache Kafka)                             │
│              Tenant-partitioned topics, event sourcing                        │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                           DATA LAYER                                         │
│                                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ │
│  │ PostgreSQL │ │   Redis    │ │ OpenSearch  │ │ ClickHouse │ │ Vector DB │ │
│  │  (RLS)     │ │  Cluster   │ │ (Full-text)│ │ (Analytics)│ │ (pgvector)│ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Monorepo Structure

ProcGenie uses an **npm workspaces** monorepo architecture, enabling shared code, unified tooling, and atomic commits across frontend and backend.

```
procgenie/
├── apps/
│   ├── api/                          # NestJS backend (port 3000)
│   │   ├── src/
│   │   │   ├── main.ts               # Application bootstrap
│   │   │   ├── app.module.ts          # Root module
│   │   │   ├── config/               # Configuration (database, app)
│   │   │   ├── common/               # Shared filters, guards, interceptors
│   │   │   ├── modules/              # Domain modules
│   │   │   │   ├── auth/             # Authentication & authorization
│   │   │   │   ├── intake/           # Intake management
│   │   │   │   ├── workflow/         # Orchestration engine
│   │   │   │   ├── vendor/           # Supplier management
│   │   │   │   ├── contract/         # Contract lifecycle
│   │   │   │   ├── buying/           # Purchase orders
│   │   │   │   ├── invoice/          # Invoice processing
│   │   │   │   ├── analytics/        # Spend analytics
│   │   │   │   ├── sustainability/   # ESG & carbon tracking
│   │   │   │   ├── integration/      # ERP connectors
│   │   │   │   ├── agent/            # AI agent framework
│   │   │   │   └── notification/     # Multi-channel alerts
│   │   │   └── database/             # Migrations & seeds
│   │   ├── test/                     # E2E tests
│   │   └── package.json
│   │
│   └── web/                          # Next.js 15 frontend (port 3001)
│       ├── app/                      # App Router pages
│       ├── components/               # React components
│       ├── lib/                      # Utilities, hooks, stores
│       └── package.json
│
├── packages/
│   └── shared-types/                 # Shared TypeScript interfaces
│       └── src/common.ts             # API envelopes, pagination, enums
│
├── infrastructure/
│   ├── bicep/                        # Azure Bicep IaC templates
│   ├── helm/                         # Kubernetes Helm charts
│   └── scripts/                      # Deployment automation
│
├── docs/                             # Documentation (you are here)
├── .github/workflows/                # CI/CD pipelines
├── package.json                      # Root workspace configuration
└── tsconfig.base.json                # Shared TypeScript config
```

### Workspace Configuration

The root `package.json` defines workspaces and shared scripts:

```json
{
  "name": "procgenie",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "db:migrate": "npm run migration:run --workspace=apps/api",
    "db:seed": "npm run seed --workspace=apps/api"
  },
  "engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }
}
```

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.1+ | React framework with App Router, server components, Turbopack |
| React | 19.0+ | UI library with concurrent features |
| Tailwind CSS | 4.0+ | Utility-first CSS framework |
| Zustand | 5.0+ | Lightweight state management |
| TanStack React Query | 5.62+ | Server state management and caching |
| TanStack React Table | 8.20+ | Headless table component |
| React Hook Form + Zod | 7.54+ / 3.24+ | Form management with schema validation |
| Radix UI | Latest | Accessible, unstyled component primitives |
| Recharts | 2.15+ | Data visualization and charting |
| Framer Motion | 11.15+ | Animation library |
| Socket.IO Client | 4.8+ | Real-time WebSocket communication |
| NextAuth.js | 4.24+ | Authentication for Next.js |
| Lucide React | 0.468+ | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| NestJS | 10.4+ | Enterprise Node.js framework (modules, DI, guards, pipes) |
| TypeORM | 0.3.20+ | ORM with migration support |
| PostgreSQL | 15+ | Primary relational database with Row-Level Security |
| Redis | 7+ | Caching, session management, Bull queues |
| Bull | 4.16+ | Job queue for async processing (Redis-backed) |
| Passport + JWT | Latest | Authentication middleware |
| Socket.IO | 4.8+ | WebSocket server for real-time features |
| Swagger/OpenAPI | 7.4+ | Auto-generated API documentation |
| Helmet | 8.0+ | HTTP security headers |
| class-validator | 0.14+ | Request DTO validation |

### AI & Intelligence

| Technology | Version | Purpose |
|---|---|---|
| Anthropic Claude API | SDK 0.34+ | Primary LLM for agent reasoning and generation |
| LiteLLM / TrueFoundry | Latest | LLM Gateway for provider abstraction |
| pgvector / Pinecone | Latest | Vector database for RAG embeddings |
| NeMo Guardrails | Latest | Input/output safety guardrails |
| OpenAI text-embedding-3 | Latest | Embedding model for semantic search |

### Infrastructure

| Technology | Purpose |
|---|---|
| Azure Container Apps | Serverless container hosting with auto-scaling |
| Azure Container Registry (ACR) | Private Docker image registry |
| Azure Database for PostgreSQL Flexible Server | Managed PostgreSQL with HA |
| Azure Cache for Redis | Managed Redis cluster |
| Azure Front Door | Global CDN, WAF, and TLS termination |
| Azure Key Vault | Secrets and encryption key management |
| Azure Blob Storage | Document and file storage |
| Azure Application Insights | APM, distributed tracing, logging |
| Apache Kafka (Event Hubs) | Event streaming and pub/sub messaging |
| Temporal.io | Durable workflow orchestration engine |

### DevOps

| Technology | Purpose |
|---|---|
| GitHub Actions | CI/CD pipeline automation |
| Docker / Docker Compose | Containerization and local development |
| Azure Bicep | Infrastructure as Code |
| Helm | Kubernetes package management |
| OpenTelemetry | Distributed observability |
| Prettier + ESLint | Code formatting and linting |
| Jest + Supertest | Testing framework |

## 4. Microservices Decomposition

The platform decomposes into **seven core services** aligned with domain-driven design bounded contexts:

| Service | Responsibility | Primary Data Store | Key Aggregates |
|---|---|---|---|
| **Intake Service** | Request submission, form rendering, draft persistence, NLP classification | PostgreSQL + Redis | Requisition, RequestItem, Catalog, Draft |
| **Orchestration Service** | Stateful workflow engine, saga coordination, SLA timers, approval routing | PostgreSQL + Temporal.io | Workflow, WorkflowStep, SLA, Approval |
| **Vendor Service** | Supplier golden record, sync logic, onboarding portal, performance scoring | PostgreSQL + Elasticsearch | Vendor, Qualification, PerformanceScore |
| **Contract Service** | Contract lifecycle, clause extraction, obligation tracking, version control | PostgreSQL + Vector DB | Contract, Amendment, Clause, Obligation |
| **Intelligence Service** | RAG pipelines, LLM gateway, agent framework, guardrails | Vector DB + Redis | Agent, AgentTask, Conversation, Embedding |
| **Integration Service** | ERP connectors, adapter management, rate limiting, data transformation | PostgreSQL + Redis | Connector, SyncJob, Mapping, ErrorLog |
| **Notification Service** | Multi-channel alerts (email, Slack, Teams, push), preference management | PostgreSQL + Redis | Notification, Preference, Template, Channel |

### Service Communication

- **Internal (service-to-service):** gRPC for high-performance synchronous calls
- **External (client-facing):** REST/JSON over HTTPS with OpenAPI 3.1 specs
- **Asynchronous:** Apache Kafka domain events for decoupled communication
- **Real-time:** WebSocket (Socket.IO) for live dashboard updates and notifications

## 5. Event-Driven Architecture

Apache Kafka serves as the central event bus. All services communicate asynchronously via domain events. Event partitioning by `tenant_id` guarantees ordering within a tenant while enabling cross-tenant parallelism.

### Kafka Topics

| Topic | Producer | Consumers | Description |
|---|---|---|---|
| `intake.request.created` | Intake Service | Orchestration, Intelligence, Notification | New purchase request submitted |
| `intake.request.updated` | Intake Service | Orchestration, Analytics | Request modified or resubmitted |
| `workflow.step.completed` | Orchestration Service | Notification, Analytics, Audit | Workflow step approved/rejected |
| `workflow.sla.breached` | Orchestration Service | Notification, Analytics | SLA threshold exceeded |
| `vendor.approved` | Vendor Service | Integration, Notification | Supplier approved for use |
| `vendor.risk.alert` | Intelligence Service | Vendor, Notification, Orchestration | Risk monitoring triggered |
| `contract.created` | Contract Service | Orchestration, Analytics | New contract finalized |
| `contract.expiring` | Contract Service | Notification, Intelligence | Contract approaching expiry |
| `invoice.received` | Integration Service | Intelligence, Orchestration | Invoice ingested for matching |
| `invoice.matched` | Intelligence Service | Orchestration, Notification | Three-way match completed |
| `agent.action.completed` | Intelligence Service | Audit, Analytics | AI agent task finished |
| `agent.escalation` | Intelligence Service | Notification, Orchestration | Agent escalated to human |
| `integration.sync.completed` | Integration Service | Analytics, Notification | ERP sync cycle completed |
| `integration.sync.failed` | Integration Service | Notification, Orchestration | ERP sync error occurred |
| `audit.event` | All Services | Audit Service | Immutable event log entry |

### Key Event Flows

**Request-to-PO Flow:**
```
RequestCreated
  ├── Orchestration Service: starts approval workflow
  ├── Intelligence Service: runs risk/compliance checks
  └── Notification Service: emails requester confirmation
      │
WorkflowStepCompleted (all approvals)
  ├── Orchestration Service: initiates PO creation saga
  └── Notification Service: notifies requester of approval
      │
PO Created in ERP (via Integration Service)
  ├── Notification Service: alerts supplier
  └── Analytics Service: updates spend dashboards
```

**Supplier Onboarding Flow:**
```
VendorRegistered
  ├── Intelligence Service: sanctions screening, verification
  └── Notification Service: sends onboarding confirmation
      │
VendorVerified
  ├── Orchestration Service: routes for internal approval
  └── Vendor Service: updates golden record
      │
VendorApproved
  ├── Integration Service: syncs to ERP
  └── Notification Service: notifies supplier of activation
```

## 6. CQRS Pattern

Command-Query Responsibility Segregation separates write operations from read-optimized stores for performance at scale.

### Write Side (Commands)

All state mutations go through PostgreSQL with event sourcing. Every change produces a domain event that is appended to the event store and published to Kafka.

```
Client Request
  → API Gateway
    → Command Handler (NestJS)
      → Validate (class-validator)
        → Business Logic (Domain Service)
          → Persist to PostgreSQL (TypeORM)
            → Emit Domain Event (Kafka)
```

### Read Side (Queries)

Read-optimized projections are maintained by consuming domain events and updating specialized stores:

| Read Store | Use Case | Update Source |
|---|---|---|
| **PostgreSQL** | Transactional reads, joins, RLS-protected queries | Direct (primary write store) |
| **OpenSearch** | Full-text search across contracts, suppliers, requests | Kafka consumer projections |
| **ClickHouse** | Columnar analytics for spend dashboards, trend analysis | Kafka consumer projections |
| **Redis** | Real-time dashboards, caching, session data | Kafka consumer + TTL invalidation |
| **Vector DB (pgvector)** | Semantic search for RAG, supplier matching, contract similarity | Batch embedding pipeline |

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        WRITE PATH                                 │
│                                                                   │
│  Client ──▶ API ──▶ Command Handler ──▶ PostgreSQL                │
│                           │                  │                    │
│                           ▼                  ▼                    │
│                     Kafka Event         Event Store               │
│                           │              (append-only)            │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                       READ PATH (Projections)                     │
│                                                                   │
│  Kafka ──┬──▶ OpenSearch Indexer ──▶ OpenSearch                   │
│          │                                                        │
│          ├──▶ Analytics Projector ──▶ ClickHouse                  │
│          │                                                        │
│          ├──▶ Cache Invalidator ──▶ Redis                         │
│          │                                                        │
│          └──▶ Embedding Pipeline ──▶ Vector DB                    │
│                                                                   │
│  Client ──▶ API ──▶ Query Handler ──▶ Optimized Read Store        │
└───────────────────────────────────────────────────────────────────┘
```

## 7. Saga Pattern for Distributed Transactions

The Orchestration Service implements orchestration-based Sagas using **Temporal.io** for all cross-system transactions. This ensures data consistency without distributed ACID transactions.

### Example: PO Creation Saga

```
Step 1: Validate PO data in Platform DB
  State: PO_VALIDATED
  Compensation: (none - read-only)

Step 2: Reserve budget in Platform DB
  State: BUDGET_RESERVED
  Compensation: Release budget reservation

Step 3: Create PO in ERP via API
  State: PO_CREATED_IN_ERP
  Compensation: Void PO in ERP

Step 4: Notify supplier via email/portal
  State: SUPPLIER_NOTIFIED
  Compensation: Send cancellation notice

Step 5: Update platform status
  State: PO_COMPLETED
  Compensation: Revert status to PENDING
```

On failure at any step, the orchestrator executes compensation transactions in reverse order. Temporal.io's durable execution ensures workflows survive infrastructure restarts and can sleep for days or weeks (e.g., waiting for legal approval) without losing state.

### Transactional Outbox Pattern

For ERP synchronization, the platform uses the Transactional Outbox pattern:

1. Business object is finalized in a database transaction
2. An event record is written to the `outbox` table in the **same transaction**
3. A separate Publisher process polls the outbox and pushes events to the target system
4. Successfully published events are marked as delivered

This ensures zero data loss even if the message broker is temporarily unavailable.

## 8. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Throughput | Concurrent requests without degradation | 10,000 concurrent |
| API Latency | 95th percentile response time | < 200ms |
| Workflow Transition | State change execution time | < 500ms |
| Search Latency | Vector + keyword search | < 1 second |
| AI Agent Response | Agent task completion | < 10s (simple), < 60s (complex) |
| Availability | Uptime SLA | 99.99% |
| RPO | Recovery Point Objective | < 15 minutes |
| RTO | Recovery Time Objective | < 1 hour |
| Deployment | Multi-AZ configuration | Active-active across 2+ AZs |
| Scalability | Horizontal Pod Autoscaling | CPU/Memory/Queue-depth based |
| Accessibility | WCAG compliance level | 2.1 AA |
| Localization | i18n support | Multi-currency, multi-language |
