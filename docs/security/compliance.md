# Compliance Guide

> SOC 2 Type II controls, GDPR compliance, audit trail capabilities, data residency, and encryption standards.

## 1. SOC 2 Type II Controls

ProcGenie is designed to satisfy all five Trust Services Criteria (TSC) defined by AICPA for SOC 2 Type II certification.

### Security (Common Criteria)

| Control ID | Control | ProcGenie Implementation |
|---|---|---|
| CC1.1 | COSO Principle 1: Integrity and ethical values | Code of conduct policy; SoD enforcement in RBAC |
| CC2.1 | Internal communication of ISMS objectives | Security training program; policy documentation in wiki |
| CC3.1 | Risk assessment process | Quarterly risk assessments; automated vulnerability scanning |
| CC4.1 | Monitoring activities | Application Insights APM; real-time security dashboards |
| CC5.1 | Control activities related to IT | RBAC with 8 built-in roles; SoD rules; JWT authentication |
| CC6.1 | Logical access controls | JWT + RBAC + PostgreSQL RLS; MFA for admin roles; FIDO2 for privileged operations |
| CC6.2 | Access provisioning/de-provisioning | SCIM 2.0 automated provisioning; JIT access for emergency scenarios |
| CC6.3 | Role-based access restrictions | 8-role hierarchy with granular permissions; [see RBAC guide](./rbac.md) |
| CC6.6 | Encryption of data in transit | TLS 1.3 via Azure Front Door; mTLS for service-to-service |
| CC6.7 | Encryption of data at rest | AES-256 for database, storage, backups; BYOK for premium tenants |
| CC6.8 | Protection against malicious software | Container image scanning (Trivy); dependency auditing (npm audit) |
| CC7.1 | Detection of unauthorized changes | Event-sourced audit trail; cryptographic hash chain for integrity |
| CC7.2 | Monitoring for security incidents | Azure Sentinel integration; anomaly detection alerts |
| CC7.3 | Incident response procedures | Documented runbook; [see Incident Response](../runbooks/incident-response.md) |
| CC7.4 | Recovery from incidents | Multi-AZ deployment; automated failover; RPO < 15 min |
| CC8.1 | Change management process | CI/CD pipeline with required reviews; [see CI/CD guide](../deployment/ci-cd.md) |
| CC9.1 | Risk mitigation through system design | Multi-tenant isolation; network segmentation; defense in depth |

### Availability

| Control | ProcGenie Implementation |
|---|---|
| A1.1 -- Processing capacity and availability management | Azure Container Apps auto-scaling (2--20 replicas); load testing |
| A1.2 -- Recovery time and objectives | RPO < 15 minutes; RTO < 1 hour; multi-AZ deployment |
| A1.3 -- Business continuity testing | Quarterly DR drills; chaos engineering tests |

### Processing Integrity

| Control | ProcGenie Implementation |
|---|---|
| PI1.1 -- System processing completeness and accuracy | Input validation (class-validator + Zod); three-way invoice matching |
| PI1.2 -- Quality assurance | CI pipeline with >80% code coverage; integration tests against real services |
| PI1.3 -- Error handling and correction | Saga pattern with compensating transactions; dead letter queues |

### Confidentiality

| Control | ProcGenie Implementation |
|---|---|
| C1.1 -- Confidential information identification | Data classification framework (public, internal, confidential, restricted) |
| C1.2 -- Confidential information disposal | Soft delete with 30-day retention; scheduled hard purge; secure storage wipe |

### Privacy

| Control | ProcGenie Implementation |
|---|---|
| P1.1 -- Privacy notice | Privacy policy published at `/privacy`; consent collection on registration |
| P2.1 -- Choice and consent | Granular consent flags per processing purpose; opt-out capability |
| P3.1 -- Collection limitation | Minimum necessary data collection; purpose limitation |
| P4.1 -- Use, retention, and disposal | Configurable retention policies per tenant; automated data lifecycle |
| P5.1 -- Access by data subjects | Self-service data export API; data subject request workflow |
| P6.1 -- Disclosure of personal information | Third-party data processing agreements; sub-processor registry |
| P7.1 -- Data quality | Golden record pattern for supplier data; deduplication rules |
| P8.1 -- Complaints resolution | Data protection contact published; 72-hour response SLA |

## 2. GDPR Compliance

### Data Subject Rights Implementation

| Right | Article | Implementation | API Endpoint |
|---|---|---|---|
| Right of access | Art. 15 | Full data export in machine-readable format (JSON/CSV) | `GET /api/v1/privacy/data-export` |
| Right to rectification | Art. 16 | Self-service profile editing; admin correction tools | `PATCH /api/v1/users/:id` |
| Right to erasure | Art. 17 | Anonymization pipeline with configurable retention | `POST /api/v1/privacy/erasure-request` |
| Right to restrict processing | Art. 18 | Per-purpose processing consent flags | `PUT /api/v1/privacy/consent` |
| Right to data portability | Art. 20 | Structured JSON/CSV export of personal data | `GET /api/v1/privacy/data-export?format=csv` |
| Right to object | Art. 21 | Opt-out flags for marketing, profiling, AI processing | `PUT /api/v1/privacy/preferences` |
| Right not to be subject to automated decisions | Art. 22 | HITL checkpoints for AI agent decisions; override capability | Agent HITL framework |

### Data Processing Records (Art. 30)

ProcGenie maintains a Record of Processing Activities (ROPA) that includes:

| Field | Description |
|---|---|
| Processing purpose | Procurement lifecycle management, supplier relationship management |
| Categories of data subjects | Employees (requesters, approvers), supplier contacts |
| Categories of personal data | Name, email, phone, title, department, approval decisions |
| Recipients | Configured ERP systems, supplier portal users |
| Retention period | Configurable per tenant (default: 7 years for procurement records) |
| Technical measures | Encryption, RLS, access controls, pseudonymization |

### Data Protection Impact Assessment (DPIA)

A DPIA has been conducted for:

1. **AI Agent processing** -- Agents process personal data in procurement decisions. Mitigated by guardrails, HITL checkpoints, and bias detection.
2. **Supplier risk monitoring** -- Continuous monitoring includes news and financial data. Mitigated by data minimization and purpose limitation.
3. **Cross-border data transfers** -- Data may flow between regions for multi-national tenants. Mitigated by Standard Contractual Clauses (SCCs) and data residency controls.

### Breach Notification Workflow

```
Data breach detected (manual report or automated detection)
    │
    ▼ (within 1 hour)
Incident Response Team activated
    │
    ▼ (within 24 hours)
Impact assessment completed
    ├── Affected data subjects identified
    ├── Categories of data impacted
    ├── Likely consequences evaluated
    └── Remediation measures initiated
    │
    ▼ (within 72 hours -- GDPR Art. 33)
Supervisory authority notified
    │
    ▼ (without undue delay -- GDPR Art. 34)
Affected data subjects notified (if high risk)
    │
    ▼ (within 30 days)
Post-incident review completed
Root cause analysis and preventive measures documented
```

## 3. Audit Trail

### Event-Sourced Audit Architecture

Every state change in ProcGenie is captured as an immutable event. The audit system uses event sourcing to maintain a complete, tamper-evident record of all actions.

### Audit Event Types

| Category | Event Types |
|---|---|
| Authentication | `auth.login`, `auth.logout`, `auth.login_failed`, `auth.mfa_challenged`, `auth.token_refreshed` |
| Authorization | `authz.permission_granted`, `authz.permission_denied`, `authz.sod_violation` |
| User Management | `user.created`, `user.updated`, `user.deactivated`, `user.role_changed` |
| Requisitions | `requisition.created`, `requisition.updated`, `requisition.submitted`, `requisition.cancelled` |
| Workflows | `workflow.created`, `workflow.step_approved`, `workflow.step_rejected`, `workflow.escalated` |
| Suppliers | `supplier.created`, `supplier.updated`, `supplier.onboarded`, `supplier.suspended` |
| Contracts | `contract.created`, `contract.signed`, `contract.amended`, `contract.expired` |
| AI Agents | `agent.task_assigned`, `agent.task_completed`, `agent.escalated`, `agent.decision_overridden` |
| Data Access | `data.exported`, `data.bulk_downloaded`, `data.erasure_requested`, `data.erasure_completed` |
| Configuration | `config.changed`, `config.integration_added`, `config.sod_rule_modified` |

### Audit Event Structure

```json
{
  "eventId": "evt_01H5K3M7N8P9Q2R4",
  "tenantId": "tenant_acme_corp",
  "eventType": "workflow.step_approved",
  "aggregateType": "Workflow",
  "aggregateId": "wf_01H5K3M7N8P9Q2R4",
  "userId": "usr_john_manager",
  "timestamp": "2026-02-08T15:45:00.000Z",
  "version": 3,
  "payload": {
    "stepId": "step_01",
    "stepName": "Manager Approval",
    "decision": "approved",
    "comment": "Approved. Within Q1 budget.",
    "previousStatus": "pending",
    "newStatus": "completed"
  },
  "metadata": {
    "ipAddress": "10.0.1.45",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "sessionId": "sess_abc123",
    "correlationId": "corr_xyz789",
    "geoLocation": "US-IL"
  },
  "hash": "sha256:a7f3c1e8d9b4..."
}
```

### Tamper Detection

Events are chained using cryptographic hashes:

```
Event N:
  hash = SHA-256(event_data + previous_event_hash)

Verification:
  Recompute hash chain from genesis event
  Compare with stored hashes
  Any mismatch indicates tampering
```

### Audit Query Capabilities

| Capability | Description |
|---|---|
| Time-travel queries | Reconstruct any entity's state at any point in history |
| User activity audit | All actions performed by a specific user within a date range |
| Entity history | Complete change history for any record |
| Compliance reports | Pre-built reports for SOC 2 auditors |
| Real-time streaming | Kafka topic for real-time audit event consumption |
| Bulk export | JSON/CSV export for external audit tools |

### Retention Policies

| Data Type | Default Retention | Configurable | Notes |
|---|---|---|---|
| Audit events | 7 years | Yes (minimum 1 year) | Immutable, append-only |
| Authentication logs | 2 years | Yes | Login/logout, MFA events |
| AI agent decision logs | 5 years | Yes | Full reasoning traces |
| Data access logs | 3 years | Yes | Who accessed what data |
| System configuration changes | 7 years | No | Always retained |
| Deleted record snapshots | 3 years | Yes | Archived before erasure |

## 4. Data Residency

### Regional Deployment Options

| Region | Azure Region | Data Center | Primary Use Case |
|---|---|---|---|
| United States | East US (Virginia) | Azure US East | US customers, default region |
| European Union | West Europe (Netherlands) | Azure NL | GDPR-compliant EU customers |
| United Kingdom | UK South (London) | Azure UK | Post-Brexit UK customers |
| Asia-Pacific | Southeast Asia (Singapore) | Azure SG | APAC customers |
| Australia | Australia East (Sydney) | Azure AU | Australian data sovereignty |

### Data Residency Guarantees

When a tenant selects a data residency region, the following data types are guaranteed to remain within that region:

| Data Type | Residency Enforced | Notes |
|---|---|---|
| PostgreSQL database | Yes | Tenant data stored in regional instance |
| Redis cache | Yes | Regional Redis cluster |
| Blob storage | Yes | Regional storage account |
| Backups | Yes | Backups stored in same region (GRS within region pair) |
| Audit logs | Yes | Log Analytics workspace in region |
| AI embeddings (vector DB) | Yes | Regional pgvector instance |
| Application logs | Yes | Application Insights in region |

### Cross-Region Considerations

| Scenario | Handling |
|---|---|
| Multi-national tenant (offices in US + EU) | Separate tenant instances per region, or single region with cross-border DPA |
| AI model inference | Models deployed in regional Azure endpoints; no data leaves region |
| Email notifications | SMTP relay in same region; email content minimized |
| CDN caching | Azure Front Door caches static assets globally; no PII in cached content |
| Support access | Support engineers access via regional bastion hosts with audit logging |

## 5. Encryption Standards

### Encryption at Rest

| Layer | Algorithm | Key Length | Key Management |
|---|---|---|---|
| PostgreSQL (TDE) | AES-256 | 256-bit | Azure-managed or BYOK |
| Azure Blob Storage | AES-256 | 256-bit | Azure Storage Service Encryption |
| Redis Cache | AES-256 | 256-bit | Azure Cache encryption |
| Application-level PII | AES-256-GCM | 256-bit | Azure Key Vault |
| Backups | AES-256 | 256-bit | Azure Backup encryption |
| Vector embeddings | AES-256 | 256-bit | Regional encryption key |

### Encryption in Transit

| Connection | Protocol | Minimum Version | Configuration |
|---|---|---|---|
| Client to Front Door | TLS | 1.3 | Azure Front Door termination |
| Front Door to Container Apps | TLS | 1.2 | Azure internal networking |
| Service to service | mTLS | 1.2 | Service mesh (Istio) |
| Application to PostgreSQL | TLS | 1.2 | `sslmode=require` |
| Application to Redis | TLS | 1.2 | Azure Cache for Redis SSL |
| Application to Kafka | TLS + SASL | 1.2 | SASL_SSL authentication |
| SCIM provisioning | TLS | 1.3 | SCIM 2.0 over HTTPS |

### Key Management Hierarchy

```
Azure Key Vault (FIPS 140-2 Level 2)
    │
    ├── Platform Master Key (RSA-4096)
    │   ├── PII Encryption Key (AES-256-GCM)
    │   ├── JWT Signing Key (HMAC-SHA256)
    │   └── Backup Encryption Key (AES-256)
    │
    ├── Tenant Keys (BYOK -- Premium tenants)
    │   ├── tenant-acme-encryption-key
    │   ├── tenant-globex-encryption-key
    │   └── ...
    │
    └── Certificates
        ├── api.procgenie.io (TLS)
        ├── app.procgenie.io (TLS)
        └── *.procgenie.io (wildcard)
```

### BYOK (Bring Your Own Key)

Premium and regulated tenants can supply their own encryption keys:

1. Customer generates RSA-4096 key in their HSM (e.g., Azure Key Vault, AWS CloudHSM, Thales Luna)
2. Customer wraps the key and provides it to ProcGenie via secure transfer
3. Key is imported into the ProcGenie-managed Key Vault (customer-managed key)
4. All data for that tenant is encrypted using their key
5. Customer retains the ability to revoke the key (which renders their data inaccessible)
6. Key rotation is managed by the customer on their preferred schedule

## 6. CCPA Compliance

| Requirement | Implementation |
|---|---|
| Right to know | Data export endpoint returns all collected personal information |
| Right to delete | Deletion workflow with 45-day processing SLA |
| Right to opt-out of sale | "Do Not Sell My Personal Information" flag; ProcGenie does not sell data |
| Non-discrimination | Full service parity regardless of privacy choices |
| Financial incentive disclosure | No financial incentives tied to data collection |
| Authorized agent support | Authorized agent verification workflow for third-party requests |

## 7. Compliance Monitoring Dashboard

The compliance dashboard (accessible to Auditor and TenantAdmin roles) provides real-time visibility:

| Metric | Target | Alert Threshold |
|---|---|---|
| Open data subject requests | < 10 | > 20 open requests |
| Average DSR response time | < 15 days | > 25 days |
| Consent coverage | 100% of active users | < 95% |
| Encryption at rest coverage | 100% of data stores | < 100% |
| MFA adoption rate | > 95% of users | < 90% |
| Failed authentication rate | < 5% | > 10% |
| SoD violation attempts | 0 per week | > 5 per week |
| Audit log integrity | 100% hash chain valid | Any chain break |
| Data residency compliance | 100% | Any violation |
| Certificate expiry | > 30 days | < 30 days |

## 8. Certification Roadmap

| Certification | Scope | Timeline | Status |
|---|---|---|---|
| SOC 2 Type I | Security, Availability | Month 3--6 | In progress |
| SOC 2 Type II | Security, Availability, Confidentiality | Month 6--12 | Planned |
| ISO 27001 | Information Security Management | Month 6--18 | Planned |
| ISO 42001 | AI Management System | Month 6--12 | Planned |
| GDPR | EU data protection | Ongoing | Active |
| CCPA | California consumer privacy | Ongoing | Active |
| HIPAA | Healthcare data (if applicable) | Month 12--18 | Roadmap |
| FedRAMP Moderate | US federal government | Month 12--24+ | Phase 4 roadmap |
