# ADR-005: Event Sourcing for Audit Trail

> **Status:** Accepted
> **Date:** 2025-12-05
> **Decision Makers:** Engineering Lead, Backend Lead, Security Lead, Compliance Officer

## Context

ProcGenie must maintain an immutable, complete, and tamper-evident record of all state changes for regulatory compliance (SOC 2, GDPR, ISO 27001) and operational traceability. The audit system must support time-travel queries (reconstructing entity state at any historical point), high write throughput (every API mutation generates an audit event), and long-term retention (7+ years).

### Options Considered

1. **Event sourcing with append-only event store** -- Every state change stored as an immutable event
2. **CDC (Change Data Capture) on existing tables** -- Capture changes via database triggers or logical replication
3. **Application-level audit logging** -- Write audit records alongside business operations
4. **Third-party audit service** -- Use an external audit-as-a-service platform

### Key Requirements

- **Immutability:** Audit records must be append-only with no update or delete capability
- **Completeness:** Every state change must be captured (no gaps)
- **Tamper evidence:** It must be detectable if an audit record has been modified
- **Time-travel queries:** Ability to reconstruct any entity's state at any point in history
- **High throughput:** The audit system must not be a bottleneck (target: 10,000+ events/second)
- **Long retention:** Minimum 7-year retention for compliance
- **Multi-tenant isolation:** Audit events must be tenant-scoped
- **AI agent transparency:** Full reasoning traces for AI agent decisions

## Decision

We will implement **event sourcing** for the audit trail, with every state mutation producing an immutable domain event that is appended to the event store and published to Apache Kafka.

### Architecture

```
Application Layer
    │
    ▼ (state mutation)
Domain Service
    │
    ├──▶ Write to PostgreSQL (current state)
    │
    └──▶ Append to Event Store (immutable event)
            │
            └──▶ Publish to Kafka topic: audit.event
                    │
                    ├──▶ OpenSearch (searchable audit index)
                    ├──▶ ClickHouse (audit analytics)
                    └──▶ Cold Storage (7+ year archive)
```

### Event Store Schema

```sql
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  aggregate_type VARCHAR(50) NOT NULL,
  aggregate_id UUID NOT NULL,
  user_id UUID,
  version INTEGER NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB NOT NULL,
  hash VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only: no UPDATE or DELETE permissions granted
-- Partition by month for efficient retention management
CREATE INDEX idx_audit_tenant_aggregate ON audit_events (tenant_id, aggregate_type, aggregate_id);
CREATE INDEX idx_audit_tenant_type ON audit_events (tenant_id, event_type, created_at);
CREATE INDEX idx_audit_tenant_user ON audit_events (tenant_id, user_id, created_at);
```

### Tamper Detection (Hash Chain)

Each event includes a SHA-256 hash computed from:
```
hash = SHA-256(event_data + previous_event_hash)
```

This creates a chain where modifying any event breaks the chain, making tampering detectable.

## Consequences

### Positive

- **Complete audit trail:** Every state change is captured as a first-class event, providing a complete history of all actions in the system.
- **Time-travel queries:** By replaying events up to a specific timestamp, the system can reconstruct the exact state of any entity at any point in history. This is invaluable for compliance investigations and dispute resolution.
- **Tamper evidence:** The cryptographic hash chain makes any modification to historical events immediately detectable. Auditors can verify the integrity of the entire event chain.
- **Regulatory compliance:** The event-sourced audit trail satisfies SOC 2 (CC7.1 -- detection of unauthorized changes), GDPR (Article 30 -- records of processing), and ISO 27001 (A.12.4 -- logging and monitoring) requirements.
- **AI transparency:** Every AI agent reasoning step, tool call, and decision is stored as events, providing full explainability for automated actions.
- **Decoupled consumers:** Publishing events to Kafka enables multiple consumers (search indexing, analytics, archival) without impacting the primary write path.
- **Replay capability:** If a read-optimized projection (OpenSearch index, analytics dashboard) becomes corrupted, it can be rebuilt by replaying events from the event store.

### Negative

- **Storage growth:** Event stores grow continuously and cannot be compacted. A high-traffic system generates significant storage. Mitigated by monthly partitioning and tiered storage (hot/warm/cold).
- **Query complexity:** Querying the current state requires either maintaining projections or replaying events. We maintain both the current state in PostgreSQL tables and the event history in the event store.
- **Schema evolution:** Changing event schemas requires versioning and backward-compatible deserialization (upcasting). Every event must be deserializable regardless of when it was created.
- **Dual write concern:** Writing to both the current state table and the event store must be atomic. We use database transactions encompassing both writes to ensure consistency.
- **Complexity overhead:** Event sourcing adds conceptual and implementation complexity compared to simple audit logging. The team must understand event-driven patterns and projection management.

### Risks

- **Event store performance at scale:** After years of operation, the event store may contain billions of events. Mitigated by monthly partitioning, indexing strategies, and archival to cold storage for events older than 1 year.
- **Hash chain verification at scale:** Verifying the entire hash chain becomes slow as it grows. Mitigated by checkpoint-based verification (verify the chain from the last verified checkpoint) rather than full-chain verification.

## Alternatives Rejected

### CDC (Change Data Capture)

Rejected because CDC captures raw database changes (INSERT, UPDATE, DELETE) rather than domain-meaningful events. CDC records show "column X changed from A to B" but not "Manager John approved requisition REQ-001 because it was within Q1 budget." The semantic richness of domain events is essential for meaningful audit trails.

### Application-Level Audit Logging

Rejected because application-level logging is prone to gaps. If a developer forgets to add an audit log call, the change is not captured. Event sourcing makes auditing structural -- every state mutation flows through the event store by design, eliminating the possibility of unaudited changes.

### Third-Party Audit Service

Rejected due to data residency concerns (audit data must remain in the same region as the tenant's data) and the risk of vendor lock-in for a compliance-critical capability. We also need deep integration with the event store for time-travel queries, which a generic external service cannot provide.
