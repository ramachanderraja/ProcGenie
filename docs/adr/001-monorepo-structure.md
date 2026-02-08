# ADR-001: Monorepo with npm Workspaces

> **Status:** Accepted
> **Date:** 2025-11-15
> **Decision Makers:** Engineering Lead, Frontend Lead, Backend Lead

## Context

ProcGenie consists of multiple applications (Next.js frontend, NestJS backend) and shared packages (TypeScript types, UI components, ESLint configuration). We needed to decide on the repository structure for managing these interconnected codebases.

### Options Considered

1. **Polyrepo** -- Separate repositories for frontend, backend, and shared packages
2. **Monorepo with npm workspaces** -- Single repository with npm's built-in workspace feature
3. **Monorepo with Nx** -- Single repository using the Nx build system
4. **Monorepo with Turborepo** -- Single repository using Vercel's Turborepo

### Key Requirements

- Shared TypeScript types between frontend and backend to prevent API contract drift
- Unified CI/CD pipeline for atomic deployments
- Fast local development with cross-package hot-reload
- Low setup complexity and maintenance overhead
- No vendor lock-in to proprietary build tools

## Decision

We will use a **monorepo with npm workspaces** as the repository structure.

### Workspace Configuration

```json
{
  "name": "procgenie",
  "workspaces": ["apps/*", "packages/*"],
  "engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }
}
```

### Directory Structure

```
procgenie/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── shared-types/ # Shared TypeScript interfaces
│   ├── ui-components/# Shared UI component library
│   └── eslint-config/# Shared ESLint configuration
├── package.json      # Root workspace config
└── tsconfig.base.json# Shared TypeScript config
```

## Consequences

### Positive

- **Type safety across boundaries:** Frontend and backend share TypeScript interfaces from `shared-types`, eliminating API contract drift. A change to an API response type immediately surfaces type errors in the frontend.
- **Atomic commits:** Changes spanning multiple packages (e.g., adding a field to an API response and updating the frontend) are a single commit with a single PR.
- **Simplified dependency management:** Shared dependencies are hoisted to the root `node_modules`, reducing disk usage and installation time.
- **Unified CI/CD:** One pipeline builds, tests, and deploys all packages, ensuring consistency.
- **No additional tooling:** npm workspaces are built into npm 7+, requiring no additional build tools or configuration.
- **Low learning curve:** Developers familiar with npm need minimal onboarding.

### Negative

- **Larger repository size:** All code is in one repository, which grows over time. Mitigated by Docker-layer caching and selective testing in CI.
- **CI pipeline runs all checks:** A change to the frontend triggers backend tests as well. Mitigated with path-based CI triggers (e.g., `apps/web/**` only triggers frontend tests).
- **Limited build caching:** npm workspaces lack the sophisticated build caching of Nx or Turborepo. If build times become a bottleneck, we can add Turborepo as an incremental improvement without restructuring.
- **No task orchestration:** npm workspaces do not provide parallel task execution or dependency-aware builds. We use `concurrently` for parallel dev servers and can adopt Turborepo later if needed.

### Risks

- **Scaling concern:** If the team grows beyond 30+ developers, the monorepo may need more sophisticated tooling (Nx or Turborepo) for build performance. This is a future concern; the workspace structure is compatible with both tools.
- **Merge conflicts:** High commit frequency from a large team could increase merge conflicts. Branch protection and small PRs mitigate this.

## Alternatives Rejected

### Polyrepo

Rejected because maintaining type consistency between separate frontend and backend repositories requires publishing and versioning shared types as npm packages, introducing significant overhead and latency in the development cycle.

### Nx

Rejected due to higher complexity and opinionated project structure. Nx's benefits (computation caching, affected commands) are valuable for larger teams but add unnecessary overhead for our current team size (5--15 developers).

### Turborepo

Considered as a strong alternative. Rejected for initial implementation because npm workspaces satisfy our current needs with zero additional tooling. Turborepo can be adopted incrementally if build times become a bottleneck, as it works with existing npm workspace configurations.
