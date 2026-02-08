# ADR-004: Azure Container Apps for Deployment

> **Status:** Accepted
> **Date:** 2025-12-01
> **Decision Makers:** Engineering Lead, DevOps Lead, CTO

## Context

ProcGenie needs a container hosting platform that supports auto-scaling, health-based traffic routing, revision management for zero-downtime deployments, and integration with Azure managed services (PostgreSQL, Redis, Key Vault). The platform must balance operational simplicity with production-grade reliability.

### Options Considered

1. **Azure Container Apps (ACA)** -- Serverless container platform built on Kubernetes
2. **Azure Kubernetes Service (AKS)** -- Fully managed Kubernetes cluster
3. **Azure App Service** -- PaaS for web applications
4. **AWS ECS/Fargate** -- AWS container orchestration
5. **Self-managed Kubernetes** -- On-premises or cloud Kubernetes

### Key Requirements

- Container-based deployments with Docker multi-stage builds
- HTTP-based and CPU-based auto-scaling
- Zero-downtime deployments with revision-based traffic routing
- Integration with Azure managed services (PostgreSQL, Redis, Key Vault)
- Secret management via Key Vault references
- Built-in observability (logging, metrics, tracing)
- Cost-effective for variable workloads
- Minimal Kubernetes operational overhead
- Support for background workers (Bull queue processors)

## Decision

We will use **Azure Container Apps** as the primary hosting platform for ProcGenie's containerized services.

### Deployment Architecture

```
Azure Front Door (CDN + WAF)
        │
        ├──▶ Container App: procgenie-web (Next.js)
        │       ├── Revision A (90% traffic)
        │       └── Revision B (10% traffic -- canary)
        │
        └──▶ Container App: procgenie-api (NestJS)
                ├── Revision A (100% traffic)
                └── Workers (Bull queue processors)
```

### Configuration Summary

| Setting | API Service | Web Service | Workers |
|---|---|---|---|
| Min replicas | 2 | 2 | 1 |
| Max replicas | 20 | 10 | 5 |
| CPU per replica | 1.0 | 0.5 | 1.0 |
| Memory per replica | 2 Gi | 1 Gi | 2 Gi |
| Scale trigger | HTTP (50 req) + CPU (70%) | HTTP (100 req) | Queue depth |
| Ingress | External (HTTPS) | External (HTTPS) | None (internal) |
| Health probe | `/api/v1/health` | `/` | Liveness only |

## Consequences

### Positive

- **Serverless operations:** No Kubernetes cluster to manage, patch, or monitor. Azure manages the underlying infrastructure, including node pools, networking, and certificate rotation.
- **Scale to zero (optional):** For development and staging environments, services can scale to zero replicas when idle, reducing costs to near zero during off-hours.
- **Revision management:** Each deployment creates a new revision. Traffic can be split between revisions for canary deployments (e.g., 90/10), with instant rollback by routing 100% traffic to the previous revision.
- **Built-in KEDA scaling:** Auto-scaling is powered by KEDA (Kubernetes Event-Driven Autoscaling), supporting HTTP triggers, CPU/memory metrics, and custom queue-based triggers.
- **Dapr integration (optional):** Container Apps includes built-in Dapr sidecar support for service-to-service communication, state management, and pub/sub -- useful for future microservices decomposition.
- **Key Vault integration:** Secrets are referenced directly from Azure Key Vault, eliminating the need to store secrets in environment variables or configuration files.
- **Cost efficiency:** Consumption-based pricing means you pay only for active compute time. For ProcGenie's variable workload (peak during business hours, low overnight), this is significantly cheaper than fixed-capacity VMs.
- **Managed TLS:** HTTPS certificates are automatically provisioned and renewed.

### Negative

- **Azure lock-in:** Container Apps is an Azure-specific service. Migrating to another cloud would require switching to Kubernetes or another container platform. Mitigated by using standard Docker containers that run anywhere.
- **Limited customization:** Unlike full Kubernetes, Container Apps does not expose all Kubernetes primitives. Custom resource definitions (CRDs), service mesh configuration, and advanced networking require AKS.
- **Cold start latency:** If scaling from zero (used in non-production), the first request may experience 5--10 seconds of latency as the container starts. Mitigated by maintaining minimum 2 replicas in production.
- **Debugging limitations:** Container Apps provides less debugging capability than a full Kubernetes cluster. No `kubectl exec` equivalent for interactive debugging. Mitigated by comprehensive logging and Application Insights.

### Risks

- **Service maturity:** Container Apps is relatively newer compared to AKS or App Service. Some edge cases may have less community documentation. Mitigated by Microsoft's active development and GA status.
- **Scaling limits:** Container Apps has per-subscription limits (e.g., 30 container apps per environment, 300 replicas per environment). For ProcGenie's current scale, these limits are sufficient. Enterprise customers with very high traffic may need AKS.

## Alternatives Rejected

### Azure Kubernetes Service (AKS)

Rejected because AKS requires dedicated Kubernetes operations expertise (cluster upgrades, node pool management, network policies, Helm chart maintenance). ProcGenie's current team size (5--15 developers) does not justify a dedicated platform engineering team. If the platform outgrows Container Apps, AKS is a natural upgrade path.

### Azure App Service

Rejected because App Service's container support is limited compared to Container Apps. App Service lacks KEDA-based auto-scaling, revision management, and multi-container deployment patterns. It is optimized for simple web applications rather than multi-service architectures.

### AWS ECS/Fargate

Rejected because ProcGenie's target customers are primarily Azure-first enterprises. Using AWS would require managing cross-cloud networking for Azure managed services (PostgreSQL Flexible Server, Azure AD, Key Vault). The Azure-native stack provides better integration and simpler security posture.

### Self-Managed Kubernetes

Rejected due to the significant operational overhead of managing Kubernetes infrastructure. The team should focus on building procurement features, not managing infrastructure.
