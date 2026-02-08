// ---------------------------------------------------------------------------
// Common / Shared Types — used across all ProcGenie modules
// ---------------------------------------------------------------------------

/** ISO-4217 currency code. */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BRL' | string;

/** Monetary amount with currency context. */
export interface Currency {
  /** Numeric amount (use string for arbitrary-precision serialisation). */
  amount: number;
  /** ISO-4217 currency code. */
  code: CurrencyCode;
  /** Exchange rate to tenant base currency at time of capture. */
  exchangeRate?: number;
  /** Converted amount in tenant base currency. */
  baseAmount?: number;
}

/** Generic date range filter used throughout the platform. */
export interface DateRange {
  from: string; // ISO-8601
  to: string;   // ISO-8601
}

// ---- Pagination & Query Helpers ------------------------------------------

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'between'
  | 'isNull'
  | 'isNotNull';

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: unknown;
  /** Optional second value for "between" operator. */
  valueTo?: unknown;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sort?: SortConfig[];
  filters?: FilterConfig[];
  search?: string;
}

// ---- API Envelope --------------------------------------------------------

/**
 * Standard API response wrapper used by all platform endpoints.
 * @typeParam T - The payload type carried in `data`.
 */
export interface APIResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  meta?: Record<string, unknown>;
  /** ISO-8601 timestamp of response generation. */
  timestamp: string;
  /** Correlation ID for distributed tracing. */
  requestId: string;
}

/** Structured API error payload returned on failure. */
export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    /** Machine-readable error type for client-side handling. */
    type: APIErrorType;
    /** Optional field-level validation errors. */
    details?: FieldError[];
    /** Correlation ID for support investigations. */
    requestId: string;
    /** ISO-8601 timestamp. */
    timestamp: string;
  };
}

export type APIErrorType =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'INTEGRATION_ERROR'
  | 'POLICY_VIOLATION';

export interface FieldError {
  field: string;
  message: string;
  code: string;
}

// ---- File Attachments ----------------------------------------------------

export type FileCategory =
  | 'quote'
  | 'invoice'
  | 'contract'
  | 'receipt'
  | 'certificate'
  | 'insurance'
  | 'tax_form'
  | 'sow'
  | 'rfp'
  | 'general';

export interface FileAttachment {
  id: string;
  fileName: string;
  /** MIME type (e.g. application/pdf). */
  mimeType: string;
  /** File size in bytes. */
  sizeBytes: number;
  /** Cloud storage key / URI. */
  storageKey: string;
  /** Publicly-accessible download URL (time-limited signed URL). */
  downloadUrl?: string;
  category: FileCategory;
  uploadedBy: string;
  uploadedAt: string; // ISO-8601
  /** SHA-256 hash for integrity verification. */
  checksum?: string;
  /** Virus scan status. */
  scanStatus?: 'pending' | 'clean' | 'infected' | 'error';
  metadata?: Record<string, unknown>;
}

// ---- Notifications -------------------------------------------------------

export enum NotificationChannel {
  InApp = 'in_app',
  Email = 'email',
  Slack = 'slack',
  MsTeams = 'ms_teams',
  SMS = 'sms',
  Push = 'push',
  Webhook = 'webhook',
}

export enum NotificationType {
  ApprovalRequired = 'approval_required',
  ApprovalCompleted = 'approval_completed',
  RequestStatusChange = 'request_status_change',
  SLAWarning = 'sla_warning',
  SLABreach = 'sla_breach',
  AgentAction = 'agent_action',
  AgentEscalation = 'agent_escalation',
  ContractExpiring = 'contract_expiring',
  SupplierRiskAlert = 'supplier_risk_alert',
  BudgetThreshold = 'budget_threshold',
  SystemAlert = 'system_alert',
  MentionedInComment = 'mentioned_in_comment',
  TaskAssigned = 'task_assigned',
  ReportReady = 'report_ready',
  IntegrationError = 'integration_error',
}

export enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

export interface Notification {
  id: string;
  tenantId: string;
  recipientId: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  title: string;
  body: string;
  /** Deep-link into the platform UI. */
  actionUrl?: string;
  /** Structured payload for client rendering. */
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreference {
  userId: string;
  tenantId: string;
  /** Per-type channel overrides. If omitted the tenant default applies. */
  preferences: NotificationRuleOverride[];
  /** Global quiet hours (UTC). */
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string;   // HH:mm
  /** Digest mode: receive batched notifications instead of real-time. */
  digestEnabled: boolean;
  digestFrequency?: 'hourly' | 'daily' | 'weekly';
}

export interface NotificationRuleOverride {
  type: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
  /** Minimum priority to send — anything below is suppressed. */
  minimumPriority?: NotificationPriority;
}

// ---- Misc Shared Primitives ----------------------------------------------

/** Base fields present on every persisted entity. */
export interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: string;   // ISO-8601
  updatedAt: string;   // ISO-8601
  createdBy: string;   // user ID
  updatedBy: string;   // user ID
  /** Optimistic-concurrency version counter. */
  version: number;
}

/** Lightweight reference to a user, embedded in many domain objects. */
export interface UserReference {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

/** Tag / label that can be applied to most domain objects. */
export interface Tag {
  key: string;
  value: string;
}

/** Custom-field value bag for tenant-specific extensions. */
export interface CustomFieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select' | 'user' | 'currency';
  value: unknown;
}
