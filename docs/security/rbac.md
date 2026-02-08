# RBAC & Access Control

> Role hierarchy, permission matrix, segregation of duties rules, and API authorization patterns for ProcGenie.

## 1. Role Hierarchy

ProcGenie implements a hierarchical Role-Based Access Control (RBAC) system with eight built-in roles. Roles are assigned per tenant, and a user can hold multiple roles within a single tenant.

```
SuperAdmin (Platform-wide)
    │
    └── TenantAdmin (Tenant-scoped)
            │
            ├── ProcurementManager (Department-scoped)
            │       │
            │       ├── Requester (Own data)
            │       └── Approver (Assigned workflows)
            │
            ├── Auditor (Tenant-wide, read-only)
            │
            └── ReadOnly (Limited views)

Supplier (External, own supplier data only)
```

### Role Definitions

| Role | Scope | Description | Typical Users |
|---|---|---|---|
| **SuperAdmin** | All tenants | Platform-wide administration. Can manage tenants, system configuration, and impersonate users. | Platform operations team |
| **TenantAdmin** | Single tenant | Tenant-level administration. Manages users, roles, workflows, integrations, and tenant settings. | IT admin, procurement director |
| **ProcurementManager** | Tenant + department | Manages procurement operations. Creates workflows, manages suppliers, approves high-value requests. | Category managers, procurement leads |
| **Requester** | Own data | Submits and tracks purchase requests. Can view own requests and related workflows. | All employees requesting purchases |
| **Approver** | Assigned workflows | Reviews and approves/rejects requests in assigned approval workflows. | Managers, finance directors, VPs |
| **Supplier** | Own supplier data | External supplier portal access. Can view/update own profile, submit documents, respond to RFQs. | Supplier representatives |
| **Auditor** | Full tenant (read-only) | Read-only access to all data, audit trails, and reports. Cannot modify any records. | Internal auditors, compliance officers |
| **ReadOnly** | Limited views | Basic read access to dashboards and approved reports. Cannot view sensitive data. | Executives with dashboard access |

## 2. Permission Matrix

Permissions follow the pattern `resource:action`. The matrix below shows which roles can perform each action.

### Intake & Requisitions

| Permission | SuperAdmin | TenantAdmin | ProcurementMgr | Requester | Approver | Supplier | Auditor | ReadOnly |
|---|---|---|---|---|---|---|---|---|
| `requisition:create` | Yes | Yes | Yes | Yes | No | No | No | No |
| `requisition:read:own` | Yes | Yes | Yes | Yes | Yes | No | Yes | No |
| `requisition:read:department` | Yes | Yes | Yes | No | Yes | No | Yes | No |
| `requisition:read:all` | Yes | Yes | Yes | No | No | No | Yes | No |
| `requisition:update:own` | Yes | Yes | Yes | Yes | No | No | No | No |
| `requisition:delete:own` | Yes | Yes | Yes | Yes | No | No | No | No |
| `requisition:submit` | Yes | Yes | Yes | Yes | No | No | No | No |
| `requisition:analyze` | Yes | Yes | Yes | Yes | No | No | No | No |

### Workflows & Approvals

| Permission | SuperAdmin | TenantAdmin | ProcurementMgr | Requester | Approver | Supplier | Auditor | ReadOnly |
|---|---|---|---|---|---|---|---|---|
| `workflow:read` | Yes | Yes | Yes | Own | Assigned | No | Yes | No |
| `workflow:approve` | Yes | Yes | Yes | No | Assigned | No | No | No |
| `workflow:reject` | Yes | Yes | Yes | No | Assigned | No | No | No |
| `workflow:delegate` | Yes | Yes | Yes | No | Own | No | No | No |
| `workflow:escalate` | Yes | Yes | Yes | No | No | No | No | No |
| `workflow:template:create` | Yes | Yes | Yes | No | No | No | No | No |
| `workflow:template:update` | Yes | Yes | Yes | No | No | No | No | No |
| `workflow:template:delete` | Yes | Yes | No | No | No | No | No | No |

### Suppliers

| Permission | SuperAdmin | TenantAdmin | ProcurementMgr | Requester | Approver | Supplier | Auditor | ReadOnly |
|---|---|---|---|---|---|---|---|---|
| `supplier:create` | Yes | Yes | Yes | No | No | No | No | No |
| `supplier:read` | Yes | Yes | Yes | Limited | Limited | Own | Yes | No |
| `supplier:update` | Yes | Yes | Yes | No | No | Own | No | No |
| `supplier:delete` | Yes | Yes | No | No | No | No | No | No |
| `supplier:onboard` | Yes | Yes | Yes | No | No | No | No | No |
| `supplier:risk:read` | Yes | Yes | Yes | No | No | No | Yes | No |
| `supplier:performance:read` | Yes | Yes | Yes | No | No | Own | Yes | No |
| `supplier:performance:write` | Yes | Yes | Yes | No | No | No | No | No |
| `supplier:qualification:upload` | Yes | Yes | Yes | No | No | Own | No | No |

### Contracts

| Permission | SuperAdmin | TenantAdmin | ProcurementMgr | Requester | Approver | Supplier | Auditor | ReadOnly |
|---|---|---|---|---|---|---|---|---|
| `contract:create` | Yes | Yes | Yes | No | No | No | No | No |
| `contract:read` | Yes | Yes | Yes | No | Assigned | Own | Yes | No |
| `contract:update` | Yes | Yes | Yes | No | No | No | No | No |
| `contract:delete` | Yes | Yes | No | No | No | No | No | No |
| `contract:analyze` | Yes | Yes | Yes | No | No | No | No | No |
| `contract:amend` | Yes | Yes | Yes | No | No | No | No | No |
| `contract:sign` | Yes | Yes | Authorized | No | No | No | No | No |

### Analytics & Reports

| Permission | SuperAdmin | TenantAdmin | ProcurementMgr | Requester | Approver | Supplier | Auditor | ReadOnly |
|---|---|---|---|---|---|---|---|---|
| `analytics:read` | Yes | Yes | Yes | Own dept | Own dept | No | Yes | Dashboard |
| `analytics:export` | Yes | Yes | Yes | No | No | No | Yes | No |
| `dashboard:create` | Yes | Yes | Yes | No | No | No | No | No |
| `dashboard:read` | Yes | Yes | Yes | Shared | Shared | No | Yes | Shared |
| `report:schedule` | Yes | Yes | Yes | No | No | No | Yes | No |

### Administration

| Permission | SuperAdmin | TenantAdmin | ProcurementMgr | Requester | Approver | Supplier | Auditor | ReadOnly |
|---|---|---|---|---|---|---|---|---|
| `user:create` | Yes | Yes | No | No | No | No | No | No |
| `user:read` | Yes | Yes | Dept | No | No | No | Yes | No |
| `user:update` | Yes | Yes | No | Own | No | Own | No | No |
| `user:delete` | Yes | Yes | No | No | No | No | No | No |
| `role:assign` | Yes | Yes | No | No | No | No | No | No |
| `tenant:configure` | Yes | Yes | No | No | No | No | No | No |
| `audit:read` | Yes | Yes | No | No | No | No | Yes | No |
| `integration:manage` | Yes | Yes | No | No | No | No | No | No |
| `agent:configure` | Yes | Yes | Yes | No | No | No | No | No |
| `agent:autonomy:change` | Yes | Yes | No | No | No | No | No | No |

## 3. Segregation of Duties (SoD) Rules

SoD rules prevent a single user from performing conflicting actions that could enable fraud or policy violations.

### SoD Rule Definitions

| Rule ID | Conflicting Permissions | Description | Enforcement |
|---|---|---|---|
| **SoD-001** | `requisition:create` + `workflow:approve` (same request) | A requester cannot approve their own purchase request | Workflow engine blocks self-approval |
| **SoD-002** | `supplier:update` + `invoice:approve` (same supplier) | A user who edits supplier payment details cannot approve invoices from that supplier | RBAC prevents dual permission assignment |
| **SoD-003** | `contract:create` + sole `contract:sign` (same contract) | A contract creator cannot be the sole signatory | Requires minimum 2 signatories |
| **SoD-004** | `purchase-order:create` + `goods-receipt:confirm` (same PO) | A user who creates a PO cannot confirm receipt of goods | Workflow routes to different user |
| **SoD-005** | `budget:own` + `requisition:approve` (own budget) | A budget holder cannot approve requests against their own budget | Routed to peer or manager |
| **SoD-006** | `supplier:onboard` + `supplier:risk:override` (same supplier) | The user who initiates onboarding cannot override risk findings | Requires independent compliance review |
| **SoD-007** | `user:create` + `role:assign` + `audit:delete` | A user manager cannot also delete audit records | Audit records are immutable; no role has `audit:delete` |

### SoD Enforcement Points

SoD rules are enforced at three stages:

**1. Role Assignment (Preventive)**

When an administrator assigns a role to a user, the system checks for SoD conflicts:

```
Admin assigns "ProcurementManager" role to user
  → System checks: Does this user also have "FinanceApprover" role?
  → If conflict detected: Warning displayed with option to proceed or cancel
  → Conflict logged in audit trail regardless of decision
```

**2. Runtime Action (Detective + Blocking)**

When a user attempts an action, SoD rules are evaluated in real-time:

```
User attempts to approve workflow step
  → System checks: Is this user the requester of the associated requisition?
  → If SoD-001 violated: Action blocked, HTTP 422 returned
  → Violation logged in audit trail
```

**3. Quarterly Review (Detective)**

Automated quarterly report identifies existing SoD conflicts:

```
Quarterly SoD Review Report
  → Scans all user-role assignments for potential conflicts
  → Identifies users with conflicting permissions
  → Generates remediation recommendations
  → Sent to TenantAdmin and Auditor roles
```

## 4. API Authorization Patterns

### Guard Chain

Every API request passes through a multi-layer authorization pipeline:

```
HTTP Request
    │
    ▼
┌─────────────────────────┐
│  1. JWT Extraction       │  Extract token from Authorization header
│     (JwtAuthGuard)       │  Returns 401 if missing or malformed
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  2. Token Validation     │  Verify signature, expiration, issuer
│     (JwtStrategy)        │  Returns 401 if invalid or expired
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  3. Tenant Context       │  Set tenant_id from JWT claims
│     (TenantGuard)        │  Set PostgreSQL session variable for RLS
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  4. Role Check           │  Verify user has required role
│     (@Roles decorator)   │  Returns 403 if insufficient role
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  5. Permission Check     │  Verify user has specific permission
│     (@Permissions)       │  Returns 403 if insufficient permission
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  6. SoD Check            │  Evaluate SoD rules for the action
│     (SoDGuard)           │  Returns 422 if SoD violation detected
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  7. RLS Enforcement      │  PostgreSQL Row-Level Security
│     (Database layer)     │  Filters data to current tenant only
└───────────┬─────────────┘
            ▼
        Controller
```

### NestJS Decorator Usage

```typescript
@Controller('suppliers')
export class SupplierController {

  @Post()
  @Roles(Role.SuperAdmin, Role.TenantAdmin, Role.ProcurementManager)
  @Permissions('supplier:create')
  async createSupplier(@Body() dto: CreateSupplierDto) {
    // Only users with the correct role AND permission reach here
    // Tenant context is automatically set by TenantGuard
  }

  @Get(':id/risk')
  @Roles(Role.SuperAdmin, Role.TenantAdmin, Role.ProcurementManager, Role.Auditor)
  @Permissions('supplier:risk:read')
  async getRiskProfile(@Param('id') id: string) {
    // Risk data is automatically filtered by tenant via RLS
  }

  @Post(':id/qualifications')
  @Roles(Role.SuperAdmin, Role.TenantAdmin, Role.ProcurementManager, Role.Supplier)
  @Permissions('supplier:qualification:upload')
  @SoDCheck(SoDRule.SOD_006) // Onboarder cannot override risk
  async uploadQualification(@Param('id') id: string) {
    // SoD rule evaluated before execution
  }
}
```

### Token Payload Structure

```json
{
  "sub": "usr_jane_smith",
  "tenantId": "tenant_acme_corp",
  "email": "jane.smith@acme.com",
  "roles": ["ProcurementManager", "Approver"],
  "permissions": [
    "requisition:create",
    "requisition:read:all",
    "supplier:create",
    "supplier:read",
    "workflow:approve",
    "contract:read"
  ],
  "department": "Procurement",
  "iat": 1707400200,
  "exp": 1707403800,
  "iss": "procgenie"
}
```

## 5. Custom Roles

TenantAdmin users can create custom roles by composing permissions:

```http
POST /api/v1/admin/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "CategoryManager",
  "description": "Manages suppliers and contracts within assigned categories",
  "permissions": [
    "supplier:create",
    "supplier:read",
    "supplier:update",
    "supplier:risk:read",
    "supplier:performance:write",
    "contract:create",
    "contract:read",
    "contract:update",
    "contract:analyze",
    "analytics:read"
  ],
  "scope": "department",
  "inheritsFrom": null
}
```

Custom roles are subject to the same SoD rules as built-in roles. The system will warn if a custom role definition creates inherent SoD conflicts.

## 6. Session Management

| Setting | Value | Description |
|---|---|---|
| Access token lifetime | 1 hour | Short-lived for security |
| Refresh token lifetime | 7 days | Used to obtain new access tokens |
| Maximum concurrent sessions | 5 per user | Oldest session terminated on 6th login |
| Session inactivity timeout | 30 minutes | Configurable per tenant |
| Forced re-authentication | On role change | User must re-login after role modification |

## 7. Audit Trail for Access Events

All authorization decisions are logged:

```json
{
  "eventType": "authorization.decision",
  "userId": "usr_jane_smith",
  "tenantId": "tenant_acme_corp",
  "resource": "supplier:sup_01H7G4R2K9M3N5P8",
  "action": "supplier:update",
  "decision": "allowed",
  "roles": ["ProcurementManager"],
  "sodChecks": [
    { "rule": "SoD-002", "result": "pass" },
    { "rule": "SoD-006", "result": "pass" }
  ],
  "ipAddress": "10.0.1.45",
  "timestamp": "2026-02-08T14:30:00.000Z"
}
```

Failed authorization attempts generate security alerts for the Auditor role and are flagged for review.
