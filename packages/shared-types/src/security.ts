// ---------------------------------------------------------------------------
// Module 10 — Security, Compliance & Administration
// Fortune 500 security requirements: comprehensive access control,
// audit capabilities, and regulatory compliance.
// ---------------------------------------------------------------------------

import type { BaseEntity } from './common';

// ---- User ----------------------------------------------------------------

/**
 * Platform user provisioned via SCIM 2.0 or manual creation.
 */
export interface User extends BaseEntity {
  /** Unique login identifier. */
  username: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  /** External identity provider subject ID. */
  idpSubjectId?: string;
  /** Identity provider name (e.g. "okta", "entra_id"). */
  idpProvider?: string;

  // Organisation context
  department: string;
  title?: string;
  costCenter?: string;
  location?: string;
  /** Manager user ID (for org-chart lookups). */
  managerId?: string;
  /** Direct report user IDs. */
  directReports?: string[];

  // Roles & permissions
  roles: string[]; // Role IDs
  /** Effective permissions (union of all role permissions). */
  effectivePermissions?: string[];

  // Status
  status: 'active' | 'inactive' | 'suspended' | 'pending_activation';
  lastLoginAt?: string;
  passwordChangedAt?: string;
  mfaEnabled: boolean;
  mfaMethods?: ('totp' | 'webauthn' | 'sms' | 'email')[];

  // Preferences
  timezone: string;
  locale: string;
  /** Preferred notification channels. */
  notificationPreferences?: string; // NotificationPreference ID

  // Authority
  /** Maximum approval authority in tenant base currency. */
  approvalLimit?: number;
  /** Categories the user is authorised to approve. */
  approvalCategories?: string[];

  // Provisioning
  provisionedVia: 'scim' | 'manual' | 'sso_jit';
  provisionedAt: string;
}

// ---- Roles & Permissions (FR-10.1) --------------------------------------

/**
 * A role grouping a set of permissions.
 * Supports hierarchical role inheritance.
 */
export interface Role extends BaseEntity {
  name: string;
  displayName: string;
  description: string;
  /** Permissions granted by this role. */
  permissions: Permission[];
  /** Parent role ID for inheritance. */
  parentRoleId?: string;
  /** Whether this is a system-defined role (cannot be deleted). */
  isSystem: boolean;
  /** Whether this role is active. */
  isActive: boolean;
  /** Number of users currently assigned this role. */
  userCount: number;
}

/**
 * A granular permission defining access to a specific resource and action.
 */
export interface Permission {
  id: string;
  /** Resource the permission applies to (e.g. "procurement_request", "contract"). */
  resource: string;
  /** Action permitted (e.g. "create", "read", "update", "delete", "approve"). */
  action: PermissionAction;
  /** Optional scope constraint (e.g. "own_department", "all"). */
  scope?: PermissionScope;
  /** Additional conditions (JSONLogic). */
  conditions?: Record<string, unknown>;
  description: string;
}

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'assign'
  | 'export'
  | 'configure'
  | 'execute'
  | 'admin';

export type PermissionScope =
  | 'own'          // Only own records
  | 'department'   // Same department
  | 'cost_center'  // Same cost center
  | 'region'       // Same region
  | 'tenant'       // Full tenant access
  | 'global';      // Cross-tenant (super admin)

/**
 * RBAC policy combining roles, users, and contextual constraints.
 */
export interface RBACPolicy extends BaseEntity {
  name: string;
  description: string;
  /** Roles this policy applies to. */
  roleIds: string[];
  /** Specific user IDs (for user-level overrides). */
  userIds?: string[];
  /** Resource-level permissions. */
  permissions: Permission[];
  /** Priority for conflict resolution (higher = takes precedence). */
  priority: number;
  /** Effective date range. */
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  /** Audit trail of policy changes. */
  changeHistory: PolicyChangeRecord[];
}

export interface PolicyChangeRecord {
  changedAt: string;
  changedBy: string;
  changeType: 'created' | 'modified' | 'activated' | 'deactivated';
  changeSummary: string;
  previousState?: Record<string, unknown>;
}

// ---- Audit Log (FR-10.2) ------------------------------------------------

/**
 * Immutable event-sourced audit log entry capturing every state change,
 * approval, agent action, and data modification.
 * Supports time-travel query capability.
 */
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  /** Monotonically increasing sequence number for ordering. */
  sequenceNumber: number;
  /** ISO-8601 timestamp with microsecond precision. */
  timestamp: string;

  // Actor
  /** User or system that performed the action. */
  actorId: string;
  actorType: 'user' | 'agent' | 'system' | 'integration' | 'scheduler';
  actorName: string;
  /** IP address of the actor. */
  ipAddress?: string;
  /** User agent string. */
  userAgent?: string;
  /** Session ID for correlation. */
  sessionId?: string;

  // Action
  action: AuditAction;
  /** Human-readable description of what happened. */
  description: string;

  // Target
  /** Entity type affected. */
  resourceType: string;
  /** Entity ID affected. */
  resourceId: string;
  /** Human-readable label for the resource. */
  resourceLabel?: string;

  // Change detail
  /** Snapshot of changed fields (before/after). */
  changes?: AuditFieldChange[];
  /** Full entity snapshot before the change (for time-travel). */
  previousState?: Record<string, unknown>;
  /** Full entity snapshot after the change. */
  newState?: Record<string, unknown>;

  // Context
  /** Related workflow instance ID. */
  workflowId?: string;
  /** Related request ID. */
  requestId?: string;
  /** Agent task ID if this was an agent action. */
  agentTaskId?: string;
  /** Correlation ID for distributed tracing. */
  correlationId: string;
  /** Source module. */
  module: string;

  // Classification
  /** Sensitivity level of this audit entry. */
  sensitivity: 'normal' | 'sensitive' | 'critical';
  /** Whether this entry is related to a compliance-relevant action. */
  complianceRelevant: boolean;
  /** Applicable compliance frameworks. */
  complianceFrameworks?: ('sox' | 'soc2' | 'gdpr' | 'ccpa' | 'hipaa')[];

  // Integrity
  /** SHA-256 hash of the entry for tamper detection. */
  entryHash: string;
  /** Hash of the previous entry for chain integrity. */
  previousEntryHash: string;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'cancel'
  | 'escalate'
  | 'delegate'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'configure'
  | 'agent_decision'
  | 'agent_action'
  | 'human_override'
  | 'policy_violation'
  | 'access_denied'
  | 'data_access'
  | 'integration_sync'
  | 'system_event';

export interface AuditFieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  /** Whether this field contains sensitive data (value may be masked). */
  sensitive: boolean;
}

// ---- Segregation of Duties (FR-10.1) ------------------------------------

/**
 * A detected Segregation of Duties conflict.
 * Prevents requisitioner from self-approving, vendor editor
 * from processing payments, etc.
 */
export interface SoDConflict {
  id: string;
  tenantId: string;
  /** User exhibiting the conflict. */
  userId: string;
  userName: string;
  /** The two conflicting permissions / roles. */
  conflictingRoleA: string;
  conflictingRoleB: string;
  conflictingPermissionA: string;
  conflictingPermissionB: string;
  /** Description of the SoD risk. */
  riskDescription: string;
  /** Severity of the conflict. */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Current resolution status. */
  status: 'detected' | 'acknowledged' | 'mitigated' | 'accepted' | 'resolved';
  /** Mitigation applied (e.g. compensating control). */
  mitigation?: string;
  /** User who reviewed and accepted the risk. */
  acceptedBy?: string;
  acceptedAt?: string;
  acceptanceJustification?: string;
  detectedAt: string;
  /** SoD rule that detected this conflict. */
  ruleId: string;
}

/** A rule defining incompatible permission combinations. */
export interface SoDRule {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  /** First permission set (any of these). */
  permissionSetA: { resource: string; action: PermissionAction }[];
  /** Second incompatible permission set (any of these). */
  permissionSetB: { resource: string; action: PermissionAction }[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Whether violations are hard-blocked or just warned. */
  enforcement: 'block' | 'warn' | 'audit_only';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Tenant Configuration (FR-10.5, FR-10.8) ----------------------------

/**
 * Per-tenant administrative configuration covering
 * multi-tenancy, data residency, and feature flags.
 */
export interface TenantConfig extends BaseEntity {
  /** Tenant display name. */
  name: string;
  /** Tenant slug used in URLs and API routing. */
  slug: string;
  /** Subscription tier affecting isolation level. */
  tier: TenantTier;
  /** Primary region for data residency. */
  primaryRegion: string;
  /** Data residency configuration. */
  dataResidency: DataResidencyConfig;
  /** Encryption configuration. */
  encryption: EncryptionConfig;
  /** Whether the tenant is active. */
  isActive: boolean;
  /** SSO / identity provider configuration. */
  ssoConfig?: TenantSSOConfig;
  /** Feature flags enabled for this tenant. */
  featureFlags: Record<string, boolean>;
  /** Branding / white-label configuration. */
  branding?: TenantBranding;
  /** Tenant-level default settings. */
  defaults: TenantDefaults;
  /** Maximum number of users allowed. */
  maxUsers?: number;
  /** Storage quota in bytes. */
  storageQuotaBytes?: number;
  /** Current storage usage in bytes. */
  storageUsedBytes?: number;
}

export enum TenantTier {
  /** Shared database with Row-Level Security. */
  SMB = 'SMB',
  /** Dedicated schema. */
  Enterprise = 'Enterprise',
  /** Dedicated database with BYOK. */
  Premium = 'Premium',
  /** Dedicated database with BYOK and dedicated compute. */
  Regulated = 'Regulated',
}

/**
 * Data residency configuration ensuring tenant data stays
 * within required jurisdictional boundaries (FR-10.5).
 */
export interface DataResidencyConfig {
  /** Primary storage region (e.g. "us-east-1", "eu-west-1"). */
  primaryRegion: string;
  /** Allowed regions for data replication. */
  allowedRegions: string[];
  /** Regions explicitly forbidden. */
  blockedRegions?: string[];
  /** Whether cross-region failover is permitted. */
  crossRegionFailover: boolean;
  /** Data retention policy in days. */
  retentionPolicyDays: number;
  /** Applicable regulatory frameworks. */
  regulatoryFrameworks: ('gdpr' | 'ccpa' | 'hipaa' | 'sox' | 'itar' | 'fedramp')[];
  /** Whether AI processing must stay within the primary region. */
  aiProcessingRestricted: boolean;
}

/**
 * Encryption configuration (FR-10.6).
 * AES-256 at rest, TLS 1.3 in transit, application-level for PII.
 */
export interface EncryptionConfig {
  /** Encryption at rest standard. */
  atRestAlgorithm: 'AES-256-GCM' | 'AES-256-CBC';
  /** TLS version for in-transit encryption. */
  inTransitMinVersion: 'TLS1.2' | 'TLS1.3';
  /** Whether application-level field encryption is enabled for PII. */
  fieldLevelEncryption: boolean;
  /** Fields that are encrypted at the application level. */
  encryptedFields?: string[];
  /** Key management configuration. */
  kmsProvider: 'platform' | 'aws_kms' | 'azure_key_vault' | 'gcp_kms' | 'hashicorp_vault';
  /** KMS key ARN / identifier. */
  kmsKeyId?: string;
  /** Whether the tenant provides their own key (BYOK). */
  byokEnabled: boolean;
  /** Key rotation interval in days. */
  keyRotationDays: number;
  /** Last key rotation timestamp. */
  lastKeyRotation?: string;
}

export interface TenantSSOConfig {
  protocol: 'saml2' | 'oidc';
  idpEntityId: string;
  idpMetadataUrl?: string;
  /** Attribute mappings from IdP claims to platform user fields. */
  attributeMappings: Record<string, string>;
  /** Whether Just-In-Time user provisioning is enabled. */
  jitProvisioningEnabled: boolean;
  /** Default role IDs assigned to JIT-provisioned users. */
  jitDefaultRoles: string[];
  /** SCIM 2.0 provisioning endpoint enabled. */
  scimEnabled: boolean;
  scimBearerToken?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
  /** Custom domain for the tenant portal. */
  customDomain?: string;
}

export interface TenantDefaults {
  currency: string;
  timezone: string;
  locale: string;
  dateFormat: string;
  /** Default approval routing. */
  defaultApprovalWorkflowId?: string;
  /** Default SLA configuration. */
  defaultSlaWarningHours: number;
  defaultSlaBreachHours: number;
  /** Default procurement policies. */
  preferredSupplierEnforcement: 'strict' | 'warn' | 'none';
  budgetCheckEnforcement: 'strict' | 'warn' | 'none';
}
