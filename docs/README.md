# ProcGenie S2P Orchestration Platform -- Documentation

> **Version 2.0** | February 2026 | AI Strategy Team

ProcGenie is a next-generation Source-to-Pay (S2P) Orchestration Platform powered by a 15-agent AI architecture. It unifies procurement workflows across intake, sourcing, contracts, purchasing, invoicing, supplier management, and analytics through a single intelligent experience layer.

---

## Table of Contents

### Architecture

- [Architecture Overview](./architecture/overview.md) -- High-level system design, monorepo structure, technology stack, microservices decomposition, event-driven architecture, CQRS patterns, and data flow diagrams.
- [Data Model](./architecture/data-model.md) -- Entity relationships across all 10 modules, multi-tenant data strategy, and canonical data model (OCDS).
- [AI & Agent Architecture](./architecture/ai-architecture.md) -- LLM Gateway, RAG pipeline, 15-agent ReAct architecture, autonomy levels, HITL checkpoints, guardrails, and semantic caching.
- [Security Architecture](./architecture/security.md) -- Authentication, authorization, encryption, multi-tenant isolation, AI-specific security, audit trail, and compliance controls.

### API Reference

- [API Overview](./api/README.md) -- Base URL, authentication, rate limiting, error format, pagination, and endpoint index.
- [Intake API](./api/intake-api.md) -- Purchase request creation, AI analysis, document ingestion, and draft management.
- [Workflow API](./api/workflow-api.md) -- Workflow engine, approval management, SLA tracking, and escalation.
- [Supplier API](./api/supplier-api.md) -- Supplier lifecycle management, onboarding, risk profiles, and performance scoring.
- [Contract API](./api/contract-api.md) -- Contract creation, AI clause analysis, obligation tracking, and renewal management.

### Deployment & Operations

- [Azure Deployment Guide](./deployment/azure-setup.md) -- Resource provisioning, step-by-step deployment, monitoring, scaling, and cost estimation.
- [Local Development Guide](./deployment/local-development.md) -- Prerequisites, quick start, detailed setup, database management, and troubleshooting.
- [Docker Guide](./deployment/docker.md) -- Image builds, docker-compose usage, production vs development configs, health checks, and volumes.
- [CI/CD Pipeline](./deployment/ci-cd.md) -- GitHub Actions workflows, pipeline stages, environment promotion, rollback, and secrets management.

### Security & Compliance

- [RBAC & Access Control](./security/rbac.md) -- Role hierarchy, permission matrix, segregation of duties rules, and API authorization patterns.
- [Compliance Guide](./security/compliance.md) -- SOC 2 Type II, GDPR, CCPA, audit trail capabilities, data residency, and encryption standards.

### User Guides

- [Getting Started](./user-guides/getting-started.md) -- First login, dashboard overview, creating your first request, approvals, and the AI assistant.
- [Intake Module Guide](./user-guides/intake-guide.md) -- Submitting requests, NLP intake, document upload, templates, and status tracking.
- [Vendor Management Guide](./user-guides/vendor-management.md) -- Supplier onboarding, golden record, scorecards, risk profiles, and segmentation.
- [Contract Management Guide](./user-guides/contract-management.md) -- Contract creation, AI clause analysis, obligation tracking, and renewals.

### Runbooks

- [Incident Response](./runbooks/incident-response.md) -- Severity classification, response procedures, communication templates, and post-incident review.
- [Database Operations](./runbooks/database-operations.md) -- Migrations, backups, restore procedures, RLS management, and performance tuning.
- [Scaling Runbook](./runbooks/scaling.md) -- Horizontal scaling, auto-scaling rules, load testing, and capacity planning.

### Architecture Decision Records (ADRs)

- [ADR-001: Monorepo with npm Workspaces](./adr/001-monorepo-structure.md)
- [ADR-002: Next.js App Router for Frontend](./adr/002-nextjs-frontend.md)
- [ADR-003: NestJS for Backend API](./adr/003-nestjs-backend.md)
- [ADR-004: Azure Container Apps for Deployment](./adr/004-azure-container-apps.md)
- [ADR-005: Event Sourcing for Audit Trail](./adr/005-event-sourced-audit.md)
- [ADR-006: PostgreSQL RLS for Multi-Tenancy](./adr/006-multi-tenant-rls.md)

---

## Quick Links

| Resource | URL |
|---|---|
| API Swagger (local) | `http://localhost:3000/docs` |
| API Swagger (production) | `https://api.procgenie.io/docs` |
| Frontend (local) | `http://localhost:3001` |
| Repository | `https://github.com/procgenie/procgenie` |

## Project Structure

```
procgenie/
├── apps/
│   ├── api/                 # NestJS backend API
│   └── web/                 # Next.js 15 frontend
├── packages/
│   └── shared-types/        # Shared TypeScript types
├── infrastructure/
│   ├── bicep/               # Azure Bicep templates
│   ├── helm/                # Helm charts
│   └── scripts/             # Deployment scripts
├── docs/                    # This documentation
├── .github/
│   └── workflows/           # CI/CD pipelines
├── package.json             # Root workspace config
└── tsconfig.base.json       # Shared TypeScript config
```

## Contributing

Please read the [Local Development Guide](./deployment/local-development.md) before contributing. All changes must pass CI checks (lint, test, build) before merging.
