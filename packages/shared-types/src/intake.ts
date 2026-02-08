// ---------------------------------------------------------------------------
// Module 1 — Intelligent Intake Management
// Captures 100% of spend intent through a dynamic, AI-powered "Single Front
// Door" that abstracts backend complexity.
// ---------------------------------------------------------------------------

import type {
  BaseEntity,
  Currency,
  CustomFieldValue,
  FileAttachment,
  Tag,
  UserReference,
} from './common';

// ---- Enums & Constants ---------------------------------------------------

/** Lifecycle status of a procurement request from intake to fulfilment. */
export enum RequestStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  ProcurementReview = 'ProcurementReview',
  OrderPlaced = 'OrderPlaced',
  Received = 'Received',
  Cancelled = 'Cancelled',
}

/** Urgency classification driving SLA escalation rules. */
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

/**
 * Buying channel determined by the Intake Classifier Agent.
 * Each channel triggers a different downstream workflow.
 */
export enum BuyingChannel {
  /** Pre-approved internal marketplace item — few-click checkout. */
  Catalog = 'Catalog',
  /** Procurement against an existing master contract / blanket PO. */
  Contract = 'Contract',
  /** Non-catalog tail spend: automated 3-supplier RFQ. */
  QuickQuote = 'QuickQuote',
  /** Statement-of-Work-based professional services engagement. */
  SOW = 'SOW',
  /** Punchout to an external supplier storefront (cXML/OCI). */
  Punchout = 'Punchout',
  /** Spot-buy: one-time, low-value purchase. */
  SpotBuy = 'SpotBuy',
}

/** Channel through which the request was originally submitted. */
export enum IntakeChannel {
  WebPortal = 'WebPortal',
  Slack = 'Slack',
  MsTeams = 'MsTeams',
  Email = 'Email',
  Mobile = 'Mobile',
  API = 'API',
}

/** UNSPSC-based top-level category classification. */
export type CommodityCode = string; // UNSPSC code e.g. "43211500"

// ---- Core Intake Interfaces ----------------------------------------------

/**
 * The central procurement request entity — the "Single Front Door" record.
 * Every spend request regardless of channel begins as a ProcurementRequest.
 */
export interface ProcurementRequest extends BaseEntity {
  /** Human-readable sequential request number (e.g. REQ-2026-00042). */
  requestNumber: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;

  // Requester context
  requester: UserReference;
  department: string;
  costCenter: string;
  glCode?: string;
  project?: string;

  // Classification (filled by AI or user)
  category: string;
  subcategory?: string;
  commodityCode?: CommodityCode;
  buyingChannel: BuyingChannel;
  intakeChannel: IntakeChannel;

  // Financial
  estimatedValue: Currency;
  budgetId?: string;
  budgetLineItem?: string;

  // Supplier (optional at intake)
  preferredSupplierId?: string;
  preferredSupplierName?: string;

  // Dates
  needByDate?: string;          // ISO-8601
  submittedAt?: string;         // ISO-8601
  approvedAt?: string;          // ISO-8601
  completedAt?: string;         // ISO-8601
  cancelledAt?: string;         // ISO-8601
  cancellationReason?: string;

  // Workflow
  currentWorkflowId?: string;
  currentStepId?: string;
  currentAssigneeId?: string;

  // Linked artefacts
  purchaseOrderId?: string;
  contractId?: string;
  sourceDocumentIds?: string[];

  // Extensibility
  attachments: FileAttachment[];
  tags: Tag[];
  customFields: CustomFieldValue[];

  // AI enrichment
  aiAnalysis?: AIAnalysis;
  /** Percentage of form fields auto-filled by AI (0-100). */
  autoFillRate?: number;
  /** Matches detected by duplicate detection. */
  duplicateMatches?: DuplicateDetection[];
  /** Policy gate results evaluated at submission. */
  policyValidations?: PolicyValidation[];

  /** Completion percentage for draft state (0-100). */
  completionPercentage?: number;
  /** User IDs this draft has been shared with for collaboration. */
  collaborators?: string[];
}

// ---- Intake Form ---------------------------------------------------------

/** Field type options available in the dynamic form builder. */
export type IntakeFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multi_select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'user_picker'
  | 'supplier_picker'
  | 'address';

/**
 * A single field definition within a dynamic intake form.
 * Supports conditional visibility via `visibilityRule`.
 */
export interface IntakeFormField {
  id: string;
  name: string;
  label: string;
  type: IntakeFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  /** Ordered position within the form section. */
  order: number;
  /** Default value (type matches field type). */
  defaultValue?: unknown;
  /** For select/multi-select: the list of allowed options. */
  options?: IntakeFieldOption[];
  /** JSONLogic or simple condition controlling when this field is visible. */
  visibilityRule?: IntakeFieldVisibilityRule;
  /** Regex or custom validation constraints. */
  validation?: IntakeFieldValidation;
}

export interface IntakeFieldOption {
  value: string;
  label: string;
  icon?: string;
}

export interface IntakeFieldVisibilityRule {
  /** Field ID whose value is evaluated. */
  dependsOn: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt' | 'isNotEmpty';
  value: unknown;
}

export interface IntakeFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: string; // JSONLogic expression
}

/**
 * A fully-configured intake form definition that adapts by category.
 * Built by "Builder Blake" in the no-code form builder.
 */
export interface IntakeForm extends BaseEntity {
  name: string;
  description?: string;
  /** The category this form targets (null = default / catch-all). */
  category?: string;
  sections: IntakeFormSection[];
  /** Active / Draft / Archived lifecycle. */
  status: 'active' | 'draft' | 'archived';
  /** Version number supporting rollback. */
  formVersion: number;
  publishedAt?: string;
}

export interface IntakeFormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: IntakeFormField[];
  /** Collapse by default in the UI. */
  collapsible?: boolean;
}

// ---- Catalog & Quick Quote -----------------------------------------------

/** Pre-approved item available in the internal marketplace. */
export interface CatalogItem {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  commodityCode?: CommodityCode;
  supplierId: string;
  supplierName: string;
  /** Contracted unit price. */
  unitPrice: Currency;
  /** Unit of measure (e.g. "each", "license/month"). */
  unitOfMeasure: string;
  /** Supplier SKU / part number. */
  sku?: string;
  imageUrl?: string;
  /** Whether this catalog item is currently orderable. */
  isActive: boolean;
  /** Lead time in business days. */
  leadTimeDays?: number;
  /** Source contract ID that provides the pricing. */
  contractId?: string;
  /** Minimum order quantity. */
  minOrderQty?: number;
  /** Maximum order quantity. */
  maxOrderQty?: number;
  /** Tags for search / filtering. */
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Quick Quote flow for non-catalog tail spend.
 * Agent A4 (Tail Spend Negotiation) drives this process.
 */
export interface QuickQuote extends BaseEntity {
  requestId: string;
  status: QuickQuoteStatus;
  /** Suppliers invited to quote. */
  invitedSuppliers: QuickQuoteSupplier[];
  /** Deadline for supplier responses. */
  responseDeadline: string; // ISO-8601
  itemDescription: string;
  quantity: number;
  unitOfMeasure: string;
  needByDate: string;
  /** AI-recommended best option after evaluation. */
  recommendedSupplierId?: string;
  /** Walk-away price set by category manager / policy. */
  walkAwayPrice?: Currency;
  /** Whether the negotiation agent handled this autonomously. */
  agentNegotiated: boolean;
  awardedSupplierId?: string;
  awardedAt?: string;
}

export enum QuickQuoteStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  ResponsesPending = 'ResponsesPending',
  EvaluationReady = 'EvaluationReady',
  Awarded = 'Awarded',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

export interface QuickQuoteSupplier {
  supplierId: string;
  supplierName: string;
  contactEmail: string;
  /** Supplier's quoted unit price (null until they respond). */
  quotedPrice?: Currency;
  /** Total cost of ownership computed by agent. */
  tcoEstimate?: Currency;
  deliveryDays?: number;
  respondedAt?: string;
  status: 'invited' | 'responded' | 'declined' | 'no_response';
  /** Agent-computed score (0-100). */
  evaluationScore?: number;
  notes?: string;
}

// ---- Drafts & Templates --------------------------------------------------

/**
 * Persisted draft request supporting auto-save and collaboration.
 * Drafts are promoted to full ProcurementRequest upon submission.
 */
export interface DraftRequest {
  id: string;
  tenantId: string;
  createdBy: string;
  /** Partial form data keyed by field name. */
  formData: Record<string, unknown>;
  /** ID of the IntakeForm definition being filled. */
  intakeFormId: string;
  completionPercentage: number;
  /** User IDs allowed to edit this draft. */
  collaborators: string[];
  lastEditedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pre-configured template for common request types
 * (e.g. SaaS renewal, marketing agency, hardware).
 */
export interface RequestTemplate {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  /** Pre-filled field values. */
  defaultValues: Record<string, unknown>;
  /** Buying channel this template maps to. */
  buyingChannel: BuyingChannel;
  /** Popularity counter for smart ordering. */
  usageCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Duplicate Detection -------------------------------------------------

/**
 * Result from the AI-powered duplicate / overlap detection engine (FR-1.7).
 * Warns the requester before submission.
 */
export interface DuplicateDetection {
  /** Type of overlap found. */
  matchType: 'duplicate_request' | 'existing_contract' | 'active_po' | 'similar_request';
  /** ID of the matched entity. */
  matchedEntityId: string;
  /** Human-readable label of the matched entity. */
  matchedEntityLabel: string;
  /** Similarity confidence (0-1). */
  confidence: number;
  /** Brief explanation of why this was flagged. */
  reason: string;
  /** Deep-link to the matched entity. */
  url?: string;
}

// ---- Policy Validation ---------------------------------------------------

export type PolicyValidationSeverity = 'info' | 'warning' | 'error' | 'block';

/**
 * Result of a single policy compliance check executed at submission (FR-1.8).
 */
export interface PolicyValidation {
  /** Machine-readable rule identifier. */
  ruleId: string;
  ruleName: string;
  description: string;
  severity: PolicyValidationSeverity;
  passed: boolean;
  /** Contextual detail when the check fails. */
  failureReason?: string;
  /** Whether the user can override this violation (with justification). */
  overridable: boolean;
  overriddenBy?: string;
  overrideJustification?: string;
}

// ---- AI Analysis ---------------------------------------------------------

/**
 * AI enrichment payload generated by the Intake Classifier Agent (A1)
 * and Document Extraction Agent (A2). Attached to every ProcurementRequest.
 */
export interface AIAnalysis {
  /** Overall risk score (0-100, higher = riskier). */
  riskScore: number;
  /** Specific risk factors identified by the agent. */
  riskFactors: RiskFactor[];
  /** Natural-language summary of the request for reviewers. */
  summary: string;
  /** UNSPSC or internal category recommendation. */
  recommendedCategory: string;
  /** Recommended subcategory. */
  recommendedSubcategory?: string;
  /** Policy compliance pre-check results. */
  policyCheck: PolicyCheckResult;
  /** Regulatory or internal compliance notes. */
  complianceNotes: string[];
  /** Suggested buying channel. */
  suggestedChannel: BuyingChannel;
  /** Documents in the contract / supplier repository impacted by this request. */
  impactedDocuments: ImpactedDocument[];
  /** Agent confidence in the overall analysis (0-1). */
  confidence: number;
  /** Data classification suggestion (public, internal, confidential, restricted). */
  dataClassification?: DataClassification;
  /** Estimated total cost of ownership if different from stated amount. */
  tcoEstimate?: Currency;
  /** Suggested GL code. */
  suggestedGlCode?: string;
  /** Suggested cost center. */
  suggestedCostCenter?: string;
  /** Timestamp of analysis. */
  analyzedAt: string;
  /** Model / agent version that produced this analysis. */
  modelVersion: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface PolicyCheckResult {
  overallPass: boolean;
  /** Per-rule results. */
  rules: PolicyValidation[];
}

export interface ImpactedDocument {
  documentId: string;
  documentType: 'contract' | 'po' | 'sow' | 'policy';
  title: string;
  relevance: number; // 0-1
}

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
