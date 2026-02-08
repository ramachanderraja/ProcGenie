# ADR-003: NestJS for Backend API

> **Status:** Accepted
> **Date:** 2025-11-20
> **Decision Makers:** Engineering Lead, Backend Lead, Security Lead

## Context

ProcGenie requires a backend framework capable of supporting a complex, multi-module enterprise application with 10 domain modules, 15 AI agents, multi-tenant isolation, event sourcing, and integration with multiple external systems. The framework must enforce architectural patterns that keep the codebase maintainable as the team and feature set grow.

### Options Considered

1. **NestJS** -- Opinionated Node.js framework with modules, dependency injection, and decorators
2. **Express.js** -- Minimal, unopinionated Node.js web framework
3. **Fastify** -- Performance-focused Node.js framework
4. **Spring Boot (Java)** -- Enterprise-grade Java framework
5. **Go (Gin/Echo)** -- High-performance compiled language with lightweight frameworks

### Key Requirements

- Modular architecture to organize 10+ domain modules independently
- Dependency injection for testability and loose coupling
- Built-in support for guards, interceptors, pipes (cross-cutting concerns)
- WebSocket support for real-time notifications
- TypeScript-first development
- OpenAPI/Swagger auto-generation
- Compatibility with TypeORM for PostgreSQL access
- Job queue support (Bull) for async processing
- Team familiarity with Node.js/TypeScript ecosystem

## Decision

We will use **NestJS** as the backend framework for the ProcGenie API.

### Module Structure

```
apps/api/src/modules/
├── auth/           # Authentication & JWT management
├── intake/         # Purchase request management
├── workflow/       # Orchestration engine
├── vendor/         # Supplier lifecycle management
├── contract/       # Contract lifecycle management
├── buying/         # Purchase orders & catalog
├── invoice/        # Invoice processing & matching
├── analytics/      # Spend analytics & dashboards
├── sustainability/ # ESG & carbon tracking
├── integration/    # ERP connectors & sync
├── agent/          # AI agent framework
└── notification/   # Multi-channel alerts
```

Each module encapsulates its own controllers, services, repositories, DTOs, entities, and tests.

### Key Architectural Patterns

| Pattern | NestJS Feature | Purpose |
|---|---|---|
| Dependency injection | `@Injectable()`, module providers | Loose coupling, testability |
| Guards | `@UseGuards()` | Authentication, authorization, SoD enforcement |
| Interceptors | `@UseInterceptors()` | Logging, caching, response transformation |
| Pipes | `@UsePipes()` | Request validation, data transformation |
| Filters | `@Catch()` | Global exception handling, error formatting |
| Decorators | Custom decorators | `@Roles()`, `@Permissions()`, `@TenantContext()` |
| Event emitters | `@nestjs/event-emitter` | Domain events within a module |
| Queues | `@nestjs/bull` | Async job processing (AI tasks, integrations) |
| WebSockets | `@nestjs/websockets` | Real-time notifications |
| Swagger | `@nestjs/swagger` | Auto-generated API documentation |

## Consequences

### Positive

- **Enforced structure:** NestJS modules enforce separation of concerns. Each domain module is self-contained, making it possible for different team members to work on different modules without conflicts.
- **Dependency injection:** DI makes unit testing straightforward by allowing mock injection. Services can be tested in isolation without database connections.
- **Guard chain:** The guard pipeline (JWT extraction, tenant context, role check, permission check, SoD check) is implemented declaratively with decorators and evaluated automatically before every request.
- **TypeORM integration:** First-class `@nestjs/typeorm` package provides repository pattern, migrations, and entity management with minimal configuration.
- **Bull queue integration:** `@nestjs/bull` integrates Redis-backed job queues for async processing (AI agent tasks, integration syncs, report generation) with retry logic and monitoring.
- **Swagger auto-generation:** DTOs decorated with `@ApiProperty()` automatically generate OpenAPI 3.0 specs and interactive Swagger UI documentation.
- **TypeScript throughout:** Full-stack TypeScript with shared types from the monorepo eliminates serialization mismatches between frontend and backend.
- **Active ecosystem:** NestJS has a large community, extensive documentation, and official packages for most common needs (GraphQL, microservices, health checks, config management).

### Negative

- **Learning curve:** NestJS's decorators, modules, and DI patterns require onboarding for developers unfamiliar with Angular-style architecture. Mitigated by comprehensive documentation and code examples.
- **Decorator "magic":** The extensive use of decorators can obscure control flow for debugging. Requires developers to understand the decorator evaluation order and middleware pipeline.
- **Framework overhead:** NestJS adds abstraction overhead compared to raw Express.js. Benchmarks show 10--15% lower throughput on synthetic benchmarks, which is negligible for an enterprise application with database-bound operations.
- **Opinionated patterns:** NestJS enforces specific patterns (module/controller/service). Teams accustomed to flexible architectures may find this constraining.

### Risks

- **Node.js single-thread limitations:** CPU-intensive AI agent processing could block the event loop. Mitigated by offloading heavy computation to Bull worker processes and using worker threads for CPU-bound tasks.
- **NestJS major version upgrades:** Framework upgrades may require migration effort. Mitigated by staying within a major version and following the official migration guide.

## Alternatives Rejected

### Express.js

Rejected because Express provides no architectural guardrails. A 10-module enterprise application without enforced structure would quickly become difficult to maintain. Express also lacks built-in DI, requiring a custom solution or adopting a library like Awilix.

### Fastify

Rejected because while Fastify offers superior raw performance, ProcGenie is a database-bound application where the bottleneck is PostgreSQL queries and LLM API calls, not HTTP framework overhead. Fastify's ecosystem is smaller, and its plugin system is less suited to the module-per-domain pattern we need.

### Spring Boot (Java)

Rejected due to the team's stronger TypeScript expertise and the desire for full-stack TypeScript (shared types with the Next.js frontend). Spring Boot is an excellent enterprise framework but would introduce a language boundary and require a JVM runtime.

### Go (Gin/Echo)

Rejected for similar reasons to Spring Boot -- introducing a second language would eliminate the benefit of shared TypeScript types and increase hiring complexity. Go's concurrency model is excellent but not necessary for ProcGenie's workload profile.
