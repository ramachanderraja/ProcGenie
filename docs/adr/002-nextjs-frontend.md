# ADR-002: Next.js 15 App Router for Frontend

> **Status:** Accepted
> **Date:** 2025-11-18
> **Decision Makers:** Engineering Lead, Frontend Lead, UX Lead

## Context

ProcGenie requires a modern, performant frontend framework for building a complex enterprise procurement application with 10 modules, rich data tables, real-time updates, and AI-powered interactions. The frontend must support server-side rendering (SSR) for initial page loads, client-side interactivity for rich form experiences, and efficient data fetching patterns.

### Options Considered

1. **Next.js 15 with App Router** -- React meta-framework with server components, streaming SSR, and Turbopack
2. **Remix** -- React meta-framework focused on web standards and nested routing
3. **Vite + React SPA** -- Traditional single-page application with client-side routing
4. **Angular** -- Enterprise framework with built-in DI, forms, and state management

### Key Requirements

- Server-side rendering for SEO (public pages) and fast initial load
- Rich client-side interactivity (complex forms, data tables, drag-and-drop workflows)
- Real-time updates via WebSocket
- Strong TypeScript support
- Large ecosystem of UI libraries and components
- Developer experience with fast hot-reload
- Accessibility (WCAG 2.1 AA compliance)

## Decision

We will use **Next.js 15 with the App Router** as the frontend framework, paired with React 19, Tailwind CSS, and Radix UI primitives.

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, routing, API routes, middleware |
| UI Library | React 19 | Component model with concurrent features |
| Styling | Tailwind CSS 4 | Utility-first CSS framework |
| UI Primitives | Radix UI | Accessible, unstyled component primitives |
| State (Server) | TanStack React Query | Server state management and caching |
| State (Client) | Zustand | Lightweight client state management |
| Forms | React Hook Form + Zod | Form management with schema validation |
| Tables | TanStack React Table | Headless table with sorting, filtering, pagination |
| Charts | Recharts | Data visualization |
| Animation | Framer Motion | Fluid animations and transitions |
| Icons | Lucide React | Consistent icon library |
| Auth | NextAuth.js | Authentication with SSO support |

## Consequences

### Positive

- **React Server Components (RSC):** Server components reduce client-side JavaScript bundle size by rendering data-heavy views (supplier directories, contract lists) on the server. Only interactive components ship JavaScript to the client.
- **Streaming SSR:** Long data fetches (analytics dashboards) stream incrementally, showing above-the-fold content immediately with Suspense boundaries for loading states.
- **Turbopack:** Fast development server with sub-second hot-reload, significantly improving developer experience for a large codebase.
- **React 19 features:** Concurrent rendering, useTransition for smooth navigation, and Server Actions for form submissions without API routes.
- **Middleware:** Next.js middleware enables authentication checks, tenant resolution, and feature flag evaluation at the edge before page rendering.
- **Massive ecosystem:** React's ecosystem provides solutions for every need: rich text editors, drag-and-drop, PDF viewers, signature pads, etc.
- **Vercel and Azure support:** Next.js can be deployed as a Docker container on Azure Container Apps or on Vercel for edge-optimized delivery.

### Negative

- **App Router complexity:** The App Router introduces new concepts (server components, client components, server actions) that require a learning investment. Team must understand the boundary between server and client.
- **Hydration issues:** Mismatched server/client rendering can cause hydration errors. Requires discipline in separating server-only and client-only code.
- **Bundle size management:** Without careful code splitting, JavaScript bundles for a 10-module application can grow large. Mitigated by dynamic imports and route-based code splitting.
- **Lock-in to React:** Choosing Next.js ties the frontend to the React ecosystem. Rewriting in another framework would be a major effort.

### Risks

- **Next.js rapid evolution:** The App Router is evolving quickly. Breaking changes between major versions could require migration effort. Mitigated by pinning to stable releases and following upgrade guides.
- **RSC adoption maturity:** React Server Components are relatively new. Some third-party libraries may not yet be RSC-compatible. Mitigated by using `'use client'` directive where needed.

## Alternatives Rejected

### Remix

Rejected because Remix's data loading patterns (loaders/actions) are excellent for form-heavy CRUD apps but less suited for ProcGenie's real-time dashboard-centric experience. Remix's ecosystem is also smaller than Next.js, with fewer enterprise-grade UI libraries.

### Vite + React SPA

Rejected because a pure SPA lacks server-side rendering, which is needed for fast initial page loads on data-heavy dashboards. An SPA also cannot leverage server components to reduce client-side JavaScript.

### Angular

Rejected because Angular's opinionated architecture and heavier framework overhead do not align with the team's React expertise. The smaller component ecosystem compared to React would require more custom development.
