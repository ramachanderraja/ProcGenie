# Security Architecture

> Authentication, authorization, encryption, multi-tenant isolation, AI security, and compliance.

## 1. Authentication

### 1.1 SAML 2.0 Single Sign-On (SSO)

ProcGenie supports enterprise SSO via SAML 2.0 with the following identity providers:

| Identity Provider | Protocol | Provisioning |
|---|---|---|
| Microsoft Entra ID (Azure AD) | SAML 2.0 / OIDC | SCIM 2.0 |
| Okta | SAML 2.0 | SCIM 2.0 |
| Ping Identity | SAML 2.0 | SCIM 2.0 |
| OneLogin | SAML 2.0 | SCIM 2.0 |

**SSO Flow:**

```
User ──▶ ProcGenie Login Page ──▶ Redirect to IdP ──▶ IdP Authentication
                                                            │
User ◀── JWT Issued ◀── SAML Assertion Validated ◀──────────┘
```

Configuration:
- Azure AD tenant configured in `AZURE_AD_TENANT_ID`, `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`
- Redirect URI: `https://api.procgenie.io/api/v1/auth/azure/callback`

### 1.2 SCIM 2.0 Automated Provisioning

SCIM 2.0 provides automated user lifecycle management:

- **Create:** New employees automatically provisioned with default role
- **Update:** Role and department changes synced from IdP
- **Deactivate:** Terminated employees automatically deprovisioned
- **Group sync:** IdP groups mapped to ProcGenie roles

### 1.3 Multi-Factor Authentication (MFA)

| User Type | MFA Requirement | Supported Methods |
|---|---|---|
| All users | Recommended (configurable per tenant) | TOTP, SMS, Push notification |
| Admin users | Mandatory | TOTP, FIDO2/WebAuthn |
| Privileged access | Mandatory + step-up | FIDO2/WebAuthn only |
| Supplier portal | Optional | TOTP, Email OTP |

### 1.4 FIDO2 / WebAuthn

Hardware security keys (YubiKey, etc.) are required for:
- SuperAdmin role actions
- Encryption key management
- Tenant configuration changes
- AI agent autonomy level changes

### 1.5 JWT Token Management

```typescript
// JWT configuration
{
  jwt: {
    secret: process.env.JWT_SECRET,           // Access token signing key
    expiresIn: '1h',                          // Short-lived access tokens
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: '7d',                   // Longer-lived refresh tokens
  }
}
```

**Token payload includes:**
- `sub`: User ID
- `tenantId`: Tenant identifier (used for RLS)
- `roles`: Array of role names
- `permissions`: Array of permission strings
- `iat`, `exp`: Issued at and expiration timestamps

**Security headers configured via Helmet:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy`: restrictive policy

## 2. Authorization (RBAC + SoD)

### 2.1 Role-Based Access Control

See [RBAC & Access Control](../security/rbac.md) for the complete permission matrix.

**Eight built-in roles:**

| Role | Description | Scope |
|---|---|---|
| SuperAdmin | Platform-wide administration | All tenants |
| TenantAdmin | Tenant-level administration | Single tenant |
| ProcurementManager | Manages procurement operations | Tenant + department |
| Requester | Submits and tracks purchase requests | Own requests |
| Approver | Approves/rejects requests in workflow | Assigned workflows |
| Supplier | External supplier portal access | Own supplier data |
| Auditor | Read-only access to all data and audit trails | Full tenant (read-only) |
| ReadOnly | Basic read access to dashboards | Limited views |

### 2.2 Segregation of Duties (SoD)

SoD rules prevent conflicts of interest:

| Rule | Conflict | Enforcement |
|---|---|---|
| SoD-001 | Requester cannot approve own request | Workflow engine rejects self-approval |
| SoD-002 | Vendor editor cannot process vendor payments | RBAC prevents dual permission |
| SoD-003 | Contract creator cannot be sole approver | Requires additional approver |
| SoD-004 | PO creator cannot confirm goods receipt | Different user required |
| SoD-005 | Budget holder cannot approve own budget requests | Routed to peer or manager |

SoD conflicts are detected at:
- **Role assignment time:** Warn admin of potential conflicts
- **Runtime:** Block actions that violate SoD rules
- **Quarterly review:** Automated SoD matrix review report

### 2.3 API Authorization Pattern

Every API request is authorized through a guard chain:

```
Request ──▶ JWT Extraction ──▶ Token Validation ──▶ Tenant Context
                                                        │
                                                        ▼
                                                  Role Check
                                                        │
                                                        ▼
                                                Permission Check
                                                        │
                                                        ▼
                                                  SoD Check
                                                        │
                                                        ▼
                                              RLS (Database Level)
```

## 3. Encryption

### 3.1 Data at Rest

| Layer | Algorithm | Key Management |
|---|---|---|
| Database (PostgreSQL) | AES-256 (Transparent Data Encryption) | Azure-managed keys |
| Blob Storage | AES-256 | Azure Storage Service Encryption |
| Application-level PII | AES-256-GCM | Azure Key Vault |
| Backups | AES-256 | Azure Backup encryption |
| Redis cache | AES-256 | Azure Cache for Redis encryption |

### 3.2 Data in Transit

| Connection | Protocol | Configuration |
|---|---|---|
| Client to API | TLS 1.3 | Azure Front Door termination |
| Service to service | mTLS | Istio service mesh |
| API to database | TLS 1.2+ | PostgreSQL SSL mode |
| API to Redis | TLS 1.2+ | Azure Redis SSL |
| API to Kafka | TLS 1.2+ | SASL_SSL authentication |

### 3.3 Key Management Service (KMS)

Azure Key Vault manages all encryption keys and secrets:

```
┌─────────────────────────────────────────────────────┐
│                  Azure Key Vault                      │
│                                                      │
│  ├── Secrets                                         │
│  │   ├── JWT_SECRET                                  │
│  │   ├── JWT_REFRESH_SECRET                          │
│  │   ├── ANTHROPIC_API_KEY                           │
│  │   ├── DB_PASSWORD                                 │
│  │   └── SMTP_PASSWORD                               │
│  │                                                   │
│  ├── Keys                                            │
│  │   ├── platform-master-key (RSA 4096)              │
│  │   ├── pii-encryption-key (AES-256)                │
│  │   └── tenant-{id}-key (BYOK tenants)              │
│  │                                                   │
│  └── Certificates                                    │
│      ├── api.procgenie.io (TLS)                      │
│      └── *.procgenie.io (wildcard)                   │
└─────────────────────────────────────────────────────┘
```

### 3.4 Bring Your Own Key (BYOK)

Premium/Regulated tenants can provide their own encryption keys:

1. Customer generates RSA 4096-bit key in their HSM
2. Customer wraps key and uploads to ProcGenie-managed Key Vault
3. ProcGenie uses customer key for all data encryption for that tenant
4. Customer retains key revocation capability
5. Key rotation managed by customer on their schedule

## 4. Multi-Tenant Isolation

| Layer | Shared (SMB) | Schema-Isolated (Enterprise) | Dedicated (Premium) |
|---|---|---|---|
| Network | Shared VNet | Shared VNet | Dedicated VNet / NSG |
| Compute | Shared containers | Shared containers | Dedicated container group |
| Database | RLS policies | Separate schemas | Separate database instance |
| Storage | Shared with prefix | Separate containers | Separate storage account |
| Encryption | Platform keys | Platform keys | Customer BYOK |
| AI / LLM | Shared, filtered | Dedicated RAG namespace | Dedicated model instance |
| Redis | Shared, key prefix | Separate Redis DB | Dedicated Redis instance |
| Kafka | Shared topics, filtered | Separate consumer groups | Dedicated topics |

## 5. AI-Specific Security

### 5.1 Prompt Injection Prevention

- Input scanning with NeMo Guardrails pattern matching
- Adversarial prompt classifier (fine-tuned model)
- System prompt hardening with instruction anchoring
- Output validation against expected schemas

### 5.2 Data Leakage Prevention

- Tenant data NEVER mixed in LLM context windows
- RAG queries ALWAYS filtered by `tenant_id`
- Citation verification ensures references belong to requesting tenant
- Agent tool calls automatically scoped to tenant
- Semantic cache partitioned by tenant

### 5.3 AI Governance Dashboard

| Metric | Description | Alert Threshold |
|---|---|---|
| Agent accuracy rate | % of correct decisions | < 95% |
| Human override rate | % of agent decisions overridden by humans | > 15% |
| Hallucination rate | % of outputs failing factual grounding | > 2% |
| PII leakage events | Count of PII detected in agent outputs | > 0 |
| Token consumption | Monthly token usage per tenant | Budget threshold |
| Bias indicators | Statistical disparity in supplier recommendations | Significant deviation |

## 6. Audit Trail (Event Sourcing)

Every state change, approval, agent action, and data modification is captured as an immutable event in the audit log.

### Event Structure

```json
{
  "eventId": "evt_01H5K3M7N8P9Q2R4",
  "tenantId": "tenant_acme_corp",
  "eventType": "requisition.approved",
  "aggregateType": "Requisition",
  "aggregateId": "req_01H5K3M7N8P9Q2R4",
  "userId": "usr_jane_smith",
  "timestamp": "2026-02-08T14:30:00.000Z",
  "version": 3,
  "payload": {
    "status": "approved",
    "previousStatus": "pending_approval",
    "approvedBy": "usr_john_manager",
    "approvalComment": "Approved. Within Q1 budget."
  },
  "metadata": {
    "ipAddress": "10.0.1.45",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "sess_abc123",
    "correlationId": "corr_xyz789"
  }
}
```

### Audit Capabilities

| Capability | Description |
|---|---|
| Immutability | Events are append-only; no updates or deletes |
| Time-travel query | Reconstruct any entity's state at any point in history |
| Tamper detection | Cryptographic hash chain ensures integrity |
| Retention | Configurable per tenant (default: 7 years for compliance) |
| Export | Bulk export for external audit tools (JSON, CSV) |
| Real-time streaming | Kafka topic for real-time audit event consumption |
| Agent decision trail | Every AI agent reasoning step and tool call logged |

## 7. Compliance

### 7.1 SOC 2 Type II

Architecture and operational controls satisfy all five Trust Services Criteria:

| Criteria | Controls |
|---|---|
| **Security** | RBAC, encryption, MFA, network segmentation, vulnerability scanning |
| **Availability** | Multi-AZ deployment, auto-scaling, disaster recovery, 99.99% SLA |
| **Processing Integrity** | Input validation, event sourcing, three-way matching, reconciliation |
| **Confidentiality** | Encryption at rest/transit, tenant isolation, access controls |
| **Privacy** | GDPR/CCPA compliance, consent management, data subject rights |

### 7.2 ISO 27001

93 controls across four domains:

- **Organizational controls (37):** Policies, roles, threat intelligence, asset management
- **People controls (8):** Screening, awareness, disciplinary, termination
- **Physical controls (14):** Perimeters, secure areas, equipment protection
- **Technological controls (34):** Access control, cryptography, operations security, network security

### 7.3 GDPR Compliance

| Right | Implementation |
|---|---|
| Right to access | API endpoint to export all personal data |
| Right to rectification | Self-service profile editing + admin tools |
| Right to erasure | Anonymization pipeline (soft delete + scheduled purge) |
| Right to portability | JSON/CSV data export in machine-readable format |
| Right to restrict processing | Consent flags per data processing purpose |
| Breach notification | Automated 72-hour notification workflow |
| Data Protection Officer | DPO contact published in privacy policy |

### 7.4 CCPA Compliance

| Requirement | Implementation |
|---|---|
| Right to know | Personal information disclosure via API |
| Right to delete | Deletion request workflow with 45-day SLA |
| Right to opt-out | "Do Not Sell" flag on user records |
| Non-discrimination | Service parity regardless of privacy choices |

### 7.5 Data Residency

| Region | Data Center | Use Case |
|---|---|---|
| EU | Azure West Europe (Netherlands) | GDPR-compliant EU customers |
| US | Azure East US | US customers |
| APAC | Azure Southeast Asia | APAC customers |

Tenant-level configuration ensures all data (database, storage, backups, logs) remains within the designated region.

### 7.6 Certification Roadmap

| Certification | Timeline | Status |
|---|---|---|
| SOC 2 Type II | 3-12 months | In progress |
| ISO 27001 | 6-18 months | Planned |
| ISO 42001 (AI) | 6-12 months | Planned |
| GDPR | Ongoing | Active |
| CCPA | Ongoing | Active |
| FedRAMP Moderate | 12-24+ months | Phase 4 roadmap |
