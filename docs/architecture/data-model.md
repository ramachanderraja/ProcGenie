# Data Model

> Entity relationships, multi-tenant strategy, and canonical data model for ProcGenie.

## 1. Entity Relationship Overview

The ProcGenie data model spans 10 functional modules. All entities inherit from a `BaseEntity` interface that includes tenant isolation, audit fields, and optimistic concurrency control.

### Base Entity Fields

Every persisted entity includes:

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant identifier for RLS |
| `createdAt` | ISO-8601 timestamp | Record creation time |
| `updatedAt` | ISO-8601 timestamp | Last modification time |
| `createdBy` | UUID | User who created the record |
| `updatedBy` | UUID | User who last modified the record |
| `version` | integer | Optimistic concurrency version counter |

## 2. Module Entity Descriptions

### 2.1 Module 1: Intelligent Intake Management

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `Requisition` | A purchase request submitted by a user | Has many `RequestItem`, belongs to `User`, has one `Workflow` |
| `RequestItem` | Individual line item within a requisition | Belongs to `Requisition`, references `CatalogItem` optionally |
| `Draft` | Incomplete requisition saved for later | Belongs to `User`, can be shared with other users |
| `CatalogItem` | Pre-approved item in the internal marketplace | Belongs to `Vendor`, has `Category` |
| `IntakeTemplate` | Configurable form template for specific categories | Has many conditional field rules |
| `Category` | UNSPSC-based procurement category taxonomy | Self-referential hierarchy (parent/child) |

**Key Relationships:**
```
User ──1:N──▶ Requisition ──1:N──▶ RequestItem
                    │                    │
                    ▼                    ▼
               Workflow            CatalogItem ──N:1──▶ Vendor
                    │
                    ▼
              Approval (N)
```

### 2.2 Module 2: Orchestration & Workflow Engine

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `Workflow` | A workflow instance tracking a business process | Has many `WorkflowStep`, belongs to `WorkflowTemplate` |
| `WorkflowTemplate` | Reusable workflow definition with visual builder | Has many step templates, conditions, and SLA rules |
| `WorkflowStep` | A single step in a workflow execution | Belongs to `Workflow`, has one `Approval` or `AgentTask` |
| `Approval` | Approval decision record | Belongs to `WorkflowStep`, made by `User` |
| `SLAConfig` | SLA timing rules per step | Belongs to `WorkflowTemplate` |
| `Escalation` | Record of an SLA breach escalation | Belongs to `WorkflowStep` |
| `Delegation` | Temporary delegation of approval authority | From `User` to `User`, with scope and expiry |

**Key Relationships:**
```
WorkflowTemplate ──1:N──▶ WorkflowStepTemplate
        │                        │
        ▼                        ▼
   Workflow ──1:N──▶ WorkflowStep ──1:1──▶ Approval
                          │
                          ├──1:1──▶ AgentTask
                          └──1:N──▶ Escalation
```

### 2.3 Module 3: Buying & Execution

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `PurchaseOrder` | Approved order sent to supplier | Created from `Requisition`, sent to `Vendor` |
| `POLineItem` | Individual line in a purchase order | Belongs to `PurchaseOrder`, references `RequestItem` |
| `GoodsReceipt` | Confirmation of goods/services received | Belongs to `PurchaseOrder` |
| `BudgetAllocation` | Budget reservation against a cost center | Referenced by `Requisition` and `PurchaseOrder` |

**Key Relationships:**
```
Requisition ──1:1──▶ PurchaseOrder ──1:N──▶ POLineItem
                          │
                          ├──1:N──▶ GoodsReceipt
                          └──N:1──▶ Vendor
```

### 2.4 Module 4: Agentic AI & Autonomous Operations

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `Agent` | Definition of an AI agent (configuration, tools, guardrails) | Has many `AgentTask` |
| `AgentTask` | A single task assigned to an agent | Belongs to `Agent`, references source entity |
| `AgentExecution` | Execution trace of agent reasoning (ReAct steps) | Belongs to `AgentTask` |
| `Conversation` | Chat/interaction session with an agent | Belongs to `User`, has many `Message` |
| `Embedding` | Vector embedding for RAG retrieval | Belongs to document source, namespaced by tenant |
| `GuardrailLog` | Record of guardrail evaluation (pass/fail/warning) | Belongs to `AgentTask` |

**Key Relationships:**
```
Agent ──1:N──▶ AgentTask ──1:N──▶ AgentExecution
                   │
                   ├──1:N──▶ GuardrailLog
                   └──N:1──▶ WorkflowStep (if triggered by workflow)
```

### 2.5 Module 5: Supplier Management & Portal

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `Vendor` | Supplier golden record aggregating all supplier data | Has many `Contract`, `PurchaseOrder`, `Qualification` |
| `VendorContact` | Contact person at a supplier organization | Belongs to `Vendor` |
| `Qualification` | Onboarding document (W-9, SOC2, insurance cert) | Belongs to `Vendor`, has expiry tracking |
| `PerformanceScore` | Periodic performance evaluation | Belongs to `Vendor`, scored by `User` |
| `RiskProfile` | Multi-dimensional risk assessment | Belongs to `Vendor`, updated by Risk Agent |
| `VendorSegment` | Classification tier (Strategic, Preferred, Approved, Restricted) | Assigned to `Vendor` |
| `DiversityCertification` | Supplier diversity status (MBE, WBE, SDVOB, etc.) | Belongs to `Vendor` |

**Key Relationships:**
```
Vendor ──1:N──▶ VendorContact
   │
   ├──1:N──▶ Qualification (with expiry tracking)
   ├──1:N──▶ PerformanceScore (historical)
   ├──1:1──▶ RiskProfile
   ├──N:1──▶ VendorSegment
   ├──1:N──▶ DiversityCertification
   ├──1:N──▶ Contract
   └──1:N──▶ PurchaseOrder
```

### 2.6 Module 6: Contract Lifecycle Management

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `Contract` | Master agreement with a supplier | Belongs to `Vendor`, has many `Clause`, `Amendment` |
| `ContractVersion` | Versioned snapshot of a contract document | Belongs to `Contract` |
| `Clause` | Extracted and classified contract clause | Belongs to `Contract`, has `ClauseType` |
| `ClauseLibrary` | Pre-approved clause templates | Categorized by clause type and risk level |
| `Amendment` | Modification to an existing contract | Belongs to `Contract` |
| `Obligation` | Contractual obligation with due date tracking | Belongs to `Contract` |
| `RenewalAlert` | Automated renewal notification configuration | Belongs to `Contract` |

**Key Relationships:**
```
Contract ──1:N──▶ ContractVersion
    │
    ├──1:N──▶ Clause ──N:1──▶ ClauseType
    ├──1:N──▶ Amendment
    ├──1:N──▶ Obligation (with due dates)
    ├──1:N──▶ RenewalAlert
    └──N:1──▶ Vendor
```

### 2.7 Module 7: Search & Analytics

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `Dashboard` | Custom dashboard configuration | Belongs to `User`, has many `Widget` |
| `Widget` | Individual visualization component | Belongs to `Dashboard` |
| `Report` | Scheduled or ad-hoc report definition | Belongs to `User`, has `ReportSchedule` |
| `ReportSubscription` | User subscriptions to automated reports | Belongs to `Report` and `User` |
| `SavedQuery` | Saved natural language or structured query | Belongs to `User` |
| `SpendRecord` | Denormalized spend fact for analytics | References `Vendor`, `Category`, `Department` |

### 2.8 Module 8: Sustainability & ESG

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `ESGScore` | Multi-dimensional ESG assessment for a supplier | Belongs to `Vendor` |
| `CarbonFootprint` | Estimated CO2e for a purchase order | Belongs to `PurchaseOrder` |
| `EmissionFactor` | Category-level emission factor data | Referenced in carbon calculations |
| `SustainabilityTarget` | Organizational ESG targets | Belongs to tenant |
| `RegulatoryAlert` | ESG regulatory change notification | Tracks 2,500+ global regulations |

### 2.9 Module 9: Integration & Connectivity

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `Connector` | Configuration for an ERP or external system integration | Has many `SyncJob` |
| `ConnectorMapping` | Field-level mapping between platform and external system | Belongs to `Connector` |
| `SyncJob` | Individual sync execution record | Belongs to `Connector`, has status and error log |
| `OutboxEvent` | Transactional outbox record for guaranteed delivery | Referenced by `SyncJob` |
| `RateLimitConfig` | Per-connector rate limiting rules | Belongs to `Connector` |
| `ErrorLog` | Integration error record with retry tracking | Belongs to `SyncJob` |

### 2.10 Module 10: Security, Compliance & Administration

**Core Entities:**

| Entity | Description | Key Relationships |
|---|---|---|
| `User` | Platform user account | Belongs to `Tenant`, has many `Role` |
| `Role` | RBAC role definition | Has many `Permission` |
| `Permission` | Granular permission (resource + action) | Belongs to `Role` |
| `SoDRule` | Segregation of duties conflict rule | References two conflicting `Permission` sets |
| `AuditEvent` | Immutable audit trail entry (event-sourced) | References source entity, user, and tenant |
| `Tenant` | Organization/customer account | Has many `User`, `TenantConfig` |
| `TenantConfig` | Tenant-specific settings (isolation tier, features) | Belongs to `Tenant` |
| `Session` | Active user session record | Belongs to `User` |

**Key Relationships:**
```
Tenant ──1:N──▶ User ──N:N──▶ Role ──N:N──▶ Permission
   │                │
   │                └──1:N──▶ Session
   │
   ├──1:1──▶ TenantConfig
   └──1:N──▶ AuditEvent
```

## 3. Multi-Tenant Data Strategy

ProcGenie supports three tiers of tenant isolation, configurable per customer:

### Tier 1: Shared Database with Row-Level Security (SMB)

```sql
-- Every table includes tenant_id column
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON requisitions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Set tenant context on every connection
SET app.current_tenant_id = '<tenant-uuid>';
```

- All tenants share a single PostgreSQL database
- RLS policies enforce isolation at the database level
- Application sets `tenant_id` from JWT claims on every request
- Most cost-effective option for small/mid-market customers

### Tier 2: Schema Isolation (Enterprise)

```sql
-- Each tenant gets a dedicated schema
CREATE SCHEMA tenant_acme;
CREATE TABLE tenant_acme.requisitions (...);

-- Search path set per connection
SET search_path TO tenant_acme, public;
```

- Dedicated schema per tenant within a shared database
- Stronger isolation with separate indexes and constraints
- Dedicated RAG namespaces per tenant
- Suitable for Fortune 1000 customers

### Tier 3: Dedicated Database (Premium / Regulated)

- Fully dedicated PostgreSQL instance per tenant
- BYOK (Bring Your Own Key) encryption support
- Dedicated AI model instances
- Customer-managed encryption keys via Azure Key Vault
- Required for financial services, healthcare, and government customers

### Data Isolation Matrix

| Aspect | Shared (RLS) | Schema-Isolated | Dedicated |
|---|---|---|---|
| Database instance | Shared | Shared | Dedicated |
| Schema | Shared | Dedicated | Dedicated |
| Indexes | Shared | Dedicated | Dedicated |
| Connection pool | Shared | Shared | Dedicated |
| Backups | Shared | Shared | Dedicated |
| Encryption keys | Platform-managed | Platform-managed | Customer-managed (BYOK) |
| RAG namespace | Filtered by tenant_id | Dedicated collection | Dedicated instance |
| AI context window | Shared inference, filtered | Dedicated namespace | Dedicated model |

## 4. Canonical Data Model (OCDS)

ProcGenie uses the **Open Contracting Data Standard (OCDS)** as its canonical data model for cross-system data interchange. This ensures consistency when integrating with multiple ERPs.

### Master Data Ownership

| Data Domain | Master System | Sync Direction | Conflict Resolution |
|---|---|---|---|
| GL codes, cost centers | ERP | ERP → Platform | ERP always wins |
| Vendor payment details | ERP | ERP → Platform | ERP always wins |
| Request data, approvals | Platform | Platform → ERP | Platform always wins |
| Vendor risk, documents | Platform | Platform → ERP | Platform always wins |
| Vendor master (basic) | Hybrid | Bidirectional | Last-write-wins with merge rules |

### Data Synchronization

- **Inbound (ERP to Platform):** Change Data Capture (CDC) or webhooks for near-real-time updates
- **Outbound (Platform to ERP):** Transactional Outbox Pattern ensuring zero data loss
- **Canonical Format:** All data transformed to OCDS format at the integration layer before storage

### Entity Naming Conventions

| Convention | Example | Description |
|---|---|---|
| Table names | `requisitions` | Lowercase, plural, snake_case |
| Column names | `created_at` | Lowercase, snake_case |
| Foreign keys | `vendor_id` | Referenced table (singular) + `_id` |
| Indexes | `idx_requisitions_tenant_status` | `idx_` + table + key columns |
| Enum types | `requisition_status` | Table (singular) + field name |
