// ---------------------------------------------------------------------------
// Module 9 — Integration & Connectivity
// Robust, bidirectional integration with all major enterprise systems
// through a resilient, standards-based integration framework.
// ---------------------------------------------------------------------------

import type { BaseEntity, DateRange } from './common';

// ---- Integration / Connector Enums ---------------------------------------

export enum IntegrationStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Error = 'Error',
  Configuring = 'Configuring',
  Suspended = 'Suspended',
  /** Pending initial activation. */
  PendingActivation = 'PendingActivation',
}

export enum ConnectorType {
  // ERP connectors (FR-9.1)
  SAPS4HANA = 'SAP_S4HANA',
  SAPAriba = 'SAP_Ariba',
  OracleFusion = 'Oracle_Fusion',
  NetSuite = 'NetSuite',
  Workday = 'Workday',
  Dynamics365 = 'Dynamics365',
  // CLM connectors (FR-9.2)
  Ironclad = 'Ironclad',
  DocuSignCLM = 'DocuSign_CLM',
  Icertis = 'Icertis',
  Agiloft = 'Agiloft',
  // ITSM / GRC connectors (FR-9.3)
  ServiceNow = 'ServiceNow',
  OneTrust = 'OneTrust',
  Archer = 'Archer',
  // Identity Providers (FR-9.4)
  MicrosoftEntraID = 'Microsoft_Entra_ID',
  Okta = 'Okta',
  PingIdentity = 'Ping_Identity',
  OneLogin = 'OneLogin',
  // iPaaS (FR-9.7)
  MuleSoft = 'MuleSoft',
  Boomi = 'Boomi',
  Workato = 'Workato',
  // Generic
  RestAPI = 'REST_API',
  Webhook = 'Webhook',
  SFTP = 'SFTP',
  Custom = 'Custom',
}

export enum SyncDirection {
  Inbound = 'Inbound',
  Outbound = 'Outbound',
  Bidirectional = 'Bidirectional',
}

// ---- Integration ---------------------------------------------------------

/**
 * Top-level integration configuration linking the platform
 * to an external system via a connector.
 */
export interface Integration extends BaseEntity {
  name: string;
  description?: string;
  connectorType: ConnectorType;
  status: IntegrationStatus;
  direction: SyncDirection;
  /** Connector instance configuration. */
  connector: Connector;
  /** Data entities synced by this integration. */
  syncedEntities: SyncedEntityConfig[];
  /** ERP-specific configuration. */
  erpConfig?: ERPConfig;
  /** Webhook configuration for event-driven integrations. */
  webhookConfig?: WebhookConfig;
  /** Rate limiting configuration (FR-9.8). */
  rateLimitConfig?: RateLimitConfig;
  /** Health check results. */
  healthStatus: IntegrationHealthStatus;
  /** Last successful connection test timestamp. */
  lastConnectionTestAt?: string;
  /** Error details if status is Error. */
  lastError?: IntegrationError;
  /** Owner responsible for this integration. */
  ownerId?: string;
}

// ---- Connector -----------------------------------------------------------

/**
 * Connection-level configuration for reaching an external system.
 */
export interface Connector {
  id: string;
  type: ConnectorType;
  /** Base URL for API-based connectors. */
  baseUrl: string;
  /** Authentication configuration (credentials stored encrypted in vault). */
  auth: ConnectorAuth;
  /** Protocol-level settings. */
  protocol: ConnectorProtocol;
  /** Custom HTTP headers to include in requests. */
  customHeaders?: Record<string, string>;
  /** Connection timeout in milliseconds. */
  connectionTimeoutMs: number;
  /** Read timeout in milliseconds. */
  readTimeoutMs: number;
  /** Whether TLS certificate verification is enforced. */
  verifySsl: boolean;
  /** Proxy configuration if required. */
  proxy?: ProxyConfig;
}

export type ConnectorAuth =
  | { method: 'api_key'; apiKeyHeader: string; apiKeyValue: string }
  | { method: 'oauth2'; tokenUrl: string; clientId: string; clientSecret: string; scopes: string[] }
  | { method: 'basic'; username: string; password: string }
  | { method: 'saml'; idpMetadataUrl: string; entityId: string }
  | { method: 'mtls'; certThumbprint: string }
  | { method: 'none' };

export type ConnectorProtocol =
  | { type: 'rest'; version?: string }
  | { type: 'odata'; version: 'v2' | 'v4' }
  | { type: 'soap'; wsdlUrl: string }
  | { type: 'cxml'; deploymentMode: 'production' | 'test' }
  | { type: 'graphql' }
  | { type: 'sftp'; path: string };

export interface ProxyConfig {
  host: string;
  port: number;
  auth?: { username: string; password: string };
}

// ---- Sync Job ------------------------------------------------------------

export enum SyncStatus {
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  CompletedWithErrors = 'CompletedWithErrors',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  /** Waiting for external system callback. */
  WaitingForCallback = 'WaitingForCallback',
}

/**
 * An individual data synchronisation job between the platform
 * and an external system.
 */
export interface SyncJob extends BaseEntity {
  integrationId: string;
  /** Type of sync operation. */
  syncType: 'full' | 'incremental' | 'delta' | 'on_demand';
  direction: SyncDirection;
  status: SyncStatus;
  /** Entity type being synced (e.g. "purchase_order", "supplier"). */
  entityType: string;
  /** Number of records processed. */
  totalRecords: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  /** Per-record error details (capped at 100). */
  errors: SyncError[];
  /** Watermark / cursor for incremental sync. */
  syncCursor?: string;
  /** Sync window for time-based deltas. */
  syncWindow?: DateRange;
  startedAt: string;
  completedAt?: string;
  /** Duration in milliseconds. */
  durationMs?: number;
  /** Trigger source. */
  triggeredBy: 'schedule' | 'webhook' | 'manual' | 'event';
  /** Next scheduled sync. */
  nextScheduledAt?: string;
}

export interface SyncError {
  recordId: string;
  entityType: string;
  errorCode: string;
  message: string;
  /** Whether this error is retryable. */
  retryable: boolean;
  /** Payload that caused the error (redacted of PII). */
  payload?: Record<string, unknown>;
  timestamp: string;
}

// ---- Field Mapping -------------------------------------------------------

/**
 * Mapping between platform fields and external system fields.
 * Supports transformation expressions for data normalization.
 */
export interface FieldMapping {
  id: string;
  integrationId: string;
  entityType: string;
  direction: SyncDirection;
  /** Platform field path (dot-notation). */
  sourceField: string;
  /** External system field path. */
  targetField: string;
  /** Transformation to apply during mapping. */
  transformation?: FieldTransformation;
  /** Whether this mapping is required for sync to succeed. */
  required: boolean;
  /** Default value if source field is null. */
  defaultValue?: unknown;
  /** Whether this mapping is active. */
  isActive: boolean;
}

export interface FieldTransformation {
  type: 'direct' | 'lookup' | 'format' | 'expression' | 'concatenate' | 'split';
  /** Lookup table ID for "lookup" type. */
  lookupTableId?: string;
  /** Format string for "format" type (e.g. date format). */
  formatString?: string;
  /** JavaScript/JSONata expression for "expression" type. */
  expression?: string;
  /** Fields to concatenate for "concatenate" type. */
  concatenateFields?: string[];
  /** Separator for concatenate / split. */
  separator?: string;
}

// ---- ERP Configuration ---------------------------------------------------

/**
 * ERP-specific configuration for deep integration (FR-9.1).
 */
export interface ERPConfig {
  /** ERP system identifier. */
  systemId: string;
  /** ERP company code / business unit. */
  companyCode: string;
  /** Purchasing organisation. */
  purchasingOrg?: string;
  /** Plant / location code. */
  plant?: string;
  /** Default currency in the ERP. */
  defaultCurrency: string;
  /** Fiscal year variant. */
  fiscalYearVariant?: string;
  /** Number range configuration for POs, etc. */
  numberRanges?: ERPNumberRange[];
  /** Change Data Capture configuration. */
  cdcConfig?: CDCConfig;
  /** Entities enabled for bidirectional sync. */
  syncEntities: SyncedEntityConfig[];
}

export interface ERPNumberRange {
  entityType: string;
  prefix: string;
  currentNumber: number;
  maxNumber: number;
}

export interface CDCConfig {
  /** CDC method. */
  method: 'polling' | 'trigger' | 'log_based' | 'event_stream';
  /** Polling interval in seconds (for polling method). */
  pollingIntervalSec?: number;
  /** Kafka topic for event-stream method. */
  kafkaTopic?: string;
  /** Last processed CDC position. */
  lastPosition?: string;
}

export interface SyncedEntityConfig {
  entityType: string;
  direction: SyncDirection;
  /** Cron schedule for periodic sync. */
  schedule?: string;
  /** Whether real-time sync via CDC is enabled. */
  realTimeEnabled: boolean;
  /** Conflict resolution strategy. */
  conflictResolution: 'platform_wins' | 'erp_wins' | 'latest_wins' | 'manual';
  /** Field mappings for this entity. */
  fieldMappings: FieldMapping[];
}

// ---- Webhook Configuration (FR-9.5) -------------------------------------

/**
 * Outbound webhook configuration for event-driven integration.
 */
export interface WebhookConfig {
  id: string;
  integrationId: string;
  /** Target URL to POST events to. */
  targetUrl: string;
  /** Events that trigger this webhook. */
  subscribedEvents: string[];
  /** Secret for HMAC signature verification. */
  signingSecret: string;
  /** HTTP headers to include. */
  headers?: Record<string, string>;
  /** Whether the webhook is active. */
  isActive: boolean;
  /** Retry configuration for failed deliveries. */
  retryPolicy: WebhookRetryPolicy;
  /** Last delivery status. */
  lastDeliveryStatus?: 'success' | 'failed';
  lastDeliveryAt?: string;
  /** Consecutive failure count. */
  consecutiveFailures: number;
  /** Whether the webhook is currently circuit-broken. */
  circuitBroken: boolean;
}

export interface WebhookRetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

// ---- Rate Limit Configuration (FR-9.8) -----------------------------------

/**
 * Distributed rate limiter configuration (Redis-backed) to respect
 * ERP API concurrency limits and prevent 429 errors.
 */
export interface RateLimitConfig {
  /** Maximum requests per window. */
  maxRequestsPerWindow: number;
  /** Window size in seconds. */
  windowSizeSeconds: number;
  /** Maximum concurrent requests. */
  maxConcurrentRequests: number;
  /** Strategy when limit is reached. */
  strategy: 'queue' | 'reject' | 'throttle';
  /** Queue maximum depth (for "queue" strategy). */
  maxQueueDepth?: number;
  /** Queue timeout in milliseconds. */
  queueTimeoutMs?: number;
  /** Per-endpoint overrides. */
  endpointOverrides?: EndpointRateLimit[];
}

export interface EndpointRateLimit {
  /** URL pattern or endpoint name. */
  endpoint: string;
  maxRequestsPerWindow: number;
  windowSizeSeconds: number;
}

// ---- Health & Errors -----------------------------------------------------

export interface IntegrationHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  /** Uptime percentage over the last 30 days. */
  uptimePercent: number;
  /** Average response time in milliseconds. */
  avgResponseTimeMs: number;
  /** Error rate over the last 24 hours (0-1). */
  errorRate24h: number;
  lastCheckedAt: string;
}

export interface IntegrationError {
  code: string;
  message: string;
  /** HTTP status code if applicable. */
  httpStatus?: number;
  /** External system error reference. */
  externalErrorCode?: string;
  occurredAt: string;
  /** Number of consecutive occurrences. */
  occurrenceCount: number;
  /** Whether this error was auto-resolved. */
  autoResolved: boolean;
}
