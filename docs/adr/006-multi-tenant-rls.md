# ADR-006: PostgreSQL Row-Level Security for Multi-Tenancy

> **Status:** Accepted
> **Date:** 2025-12-10
> **Decision Makers:** Engineering Lead, Backend Lead, Security Lead, Database Administrator

## Context

ProcGenie is a multi-tenant SaaS platform serving multiple organizations (tenants) from a shared infrastructure. Each tenant's data must be strictly isolated -- a user in Tenant A must never be able to read, modify, or even detect the existence of Tenant B's data. The isolation mechanism must be performant, reliable, and defense-in-depth (not relying solely on application-layer filtering).

### Options Considered

1. **PostgreSQL Row-Level Security (RLS)** -- Database-enforced row filtering based on session variables
2. **Application-layer filtering** -- WHERE clause `tenant_id = ?` added by the ORM or middleware
3. **Schema-per-tenant** -- Dedicated PostgreSQL schema per tenant
4. **Database-per-tenant** -- Dedicated PostgreSQL instance per tenant
5. **Hybrid approach** -- RLS for shared tier, schema isolation for enterprise, dedicated database for premium

### Key Requirements

- **Absolute isolation:** A bug in application code must not result in cross-tenant data access
- **Performance:** Minimal overhead per query (< 5ms additional latency)
- **Scalability:** Support 500+ tenants without operational complexity per tenant
- **Compliance:** Satisfy SOC 2 and ISO 27001 data isolation requirements
- **Flexibility:** Support different isolation tiers for different customer segments
- **Auditability:** Cross-tenant access attempts must be detectable and logged
- **Developer experience:** Developers should not need to manually add tenant filtering to every query

## Decision

We will use **PostgreSQL Row-Level Security (RLS)** as the primary multi-tenant isolation mechanism, with a **hybrid tiered approach** offering schema isolation and dedicated databases for premium customers.

### Implementation

**1. Every table includes a `tenant_id` column:**

```sql
CREATE TABLE requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  -- ... other columns
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Composite index with tenant_id first for efficient RLS filtering
CREATE INDEX idx_requisitions_tenant ON requisitions (tenant_id, created_at DESC);
```

**2. RLS policies on every table:**

```sql
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions FORCE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY tenant_isolation ON requisitions
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- SuperAdmin bypass policy
CREATE POLICY superadmin_bypass ON requisitions
  FOR ALL
  USING (current_setting('app.is_superadmin', true)::boolean = true);
```

**3. Tenant context set on every database connection:**

```typescript
// NestJS middleware sets tenant context from JWT claims
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.user?.tenantId;

    if (tenantId) {
      await this.dataSource.query(
        `SET app.current_tenant_id = $1`,
        [tenantId]
      );
    }

    next();
  }
}
```

### Tiered Isolation Model

| Tier | Mechanism | Target Customer | Operational Overhead |
|---|---|---|---|
| **Shared (RLS)** | Row-Level Security on shared database | SMB, mid-market (up to 500 tenants) | Low -- single database to manage |
| **Schema-Isolated** | Dedicated schema per tenant within shared database | Enterprise | Medium -- schema management per tenant |
| **Dedicated** | Dedicated PostgreSQL instance per tenant | Premium, regulated | High -- instance management per tenant |

## Consequences

### Positive

- **Defense-in-depth:** RLS is enforced at the database level, providing a safety net even if application code has a bug that omits a tenant filter. A query without the correct `app.current_tenant_id` setting returns zero rows rather than exposing another tenant's data.
- **Transparent to developers:** Once RLS policies are in place, developers write standard queries without worrying about tenant filtering. TypeORM repositories return only the current tenant's data automatically.
- **Standard SQL:** RLS is a PostgreSQL-native feature (available since version 9.5). No additional tools, extensions, or services are required.
- **Performance:** When `tenant_id` is the first column in composite indexes, the query planner efficiently prunes rows using the RLS policy. Benchmarks show < 2ms additional overhead per query.
- **Scalability:** A single database supporting 500+ tenants is operationally simpler than managing 500 separate schemas or databases.
- **Cost-effective:** Shared infrastructure keeps costs low for the SMB/mid-market customer tier.
- **Compliance:** Database-level isolation satisfies SOC 2 CC6.1 (logical access controls) and ISO 27001 A.9.4.1 (information access restriction).

### Negative

- **Connection context management:** Every database connection must have `app.current_tenant_id` set before executing queries. If the middleware fails to set it, queries return empty results (fail-safe) rather than exposing data (fail-open).
- **Connection pooling complexity:** Connection pools (PgBouncer, TypeORM pool) must set the tenant context on every connection checkout, not just on connection creation. This adds overhead to connection management.
- **Shared indexes:** In the shared RLS tier, all tenants share indexes. A large tenant's data can affect query performance for smaller tenants if indexes are poorly designed. Mitigated by always including `tenant_id` as the first column in composite indexes.
- **Migration complexity:** Schema changes (new tables, columns, indexes) must include RLS policy creation as part of the migration. A checklist enforces this during code review.
- **SuperAdmin access:** The SuperAdmin bypass policy requires careful control. SuperAdmin access is restricted to FIDO2/WebAuthn-authenticated sessions and logged in the audit trail.

### Risks

- **Noisy neighbor:** A tenant with a very large dataset or heavy query patterns could degrade performance for other tenants on the same database. Mitigated by upgrading large tenants to schema-isolated or dedicated tiers, and by implementing per-tenant query rate limiting.
- **RLS policy bugs:** An incorrectly written RLS policy could either leak data (too permissive) or block access (too restrictive). Mitigated by automated nightly tests that verify isolation between test tenants and by requiring two reviewers for any RLS policy changes.
- **Session variable spoofing:** If a malicious actor could set `app.current_tenant_id` to another tenant's ID, they could access that tenant's data. Mitigated by restricting the `SET` permission to the application's database user, which is authenticated via a secret connection string. Direct database access requires VPN + MFA + bastion host.

## Alternatives Rejected

### Application-Layer Filtering Only

Rejected because application-layer filtering relies entirely on the ORM or middleware correctly adding `WHERE tenant_id = ?` to every query. A single missed filter in any query, repository method, or raw SQL statement would expose data cross-tenant. This was considered an unacceptable risk for a platform handling financial and contract data for Fortune 500 enterprises.

### Schema-Per-Tenant (as default)

Rejected as the default tier because managing hundreds of schemas introduces significant operational complexity: each schema requires independent migrations, index management, and monitoring. However, schema isolation is offered as an upgrade tier for enterprise customers who require stronger isolation.

### Database-Per-Tenant (as default)

Rejected as the default because the operational cost of managing hundreds of PostgreSQL instances (backups, upgrades, monitoring, connection management) is prohibitive. However, dedicated databases are offered for premium/regulated customers (financial services, healthcare, government) who require the strongest isolation and BYOK encryption.

## Verification

Automated nightly tests verify tenant isolation:

```
Test Suite: Multi-Tenant Isolation Verification
  1. Create test data in Tenant A and Tenant B
  2. Set context to Tenant A
     - Query requisitions → Assert 0 Tenant B records
     - Query vendors → Assert 0 Tenant B records
     - Query contracts → Assert 0 Tenant B records
     - Query audit_events → Assert 0 Tenant B records
  3. Set context to Tenant B
     - Query requisitions → Assert 0 Tenant A records
     - (repeat for all tables)
  4. Attempt cross-tenant INSERT → Assert rejected
  5. Attempt cross-tenant UPDATE → Assert 0 rows affected
  6. Verify SuperAdmin bypass requires explicit flag
  7. Verify audit log captures all access attempts
```

These tests run against a dedicated test database with representative data volumes and are included in the CI/CD pipeline for every release.
