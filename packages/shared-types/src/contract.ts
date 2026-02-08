// ---------------------------------------------------------------------------
// Module 6 — Contract Lifecycle Management
// AI-augmented contract creation, analysis, negotiation support,
// and obligation management.
// ---------------------------------------------------------------------------

import type { BaseEntity, Currency, FileAttachment, UserReference } from './common';

// ---- Contract Status -----------------------------------------------------

/**
 * Full lifecycle status of a contract from drafting through expiration.
 */
export enum ContractStatus {
  /** Initial creation, not yet sent for review. */
  Draft = 'Draft',
  /** Under review by legal / compliance / stakeholders. */
  InReview = 'InReview',
  /** Negotiation in progress with counterparty. */
  InNegotiation = 'InNegotiation',
  /** Pending final signatures. */
  PendingSignature = 'PendingSignature',
  /** Fully executed and in effect. */
  Active = 'Active',
  /** Approaching renewal date — action required. */
  RenewalDue = 'RenewalDue',
  /** Past expiration date without renewal. */
  Expired = 'Expired',
  /** Terminated prior to natural expiration. */
  Terminated = 'Terminated',
  /** Modified via a formal amendment. */
  Amended = 'Amended',
  /** On hold pending resolution of a dispute or issue. */
  OnHold = 'OnHold',
}

/** Classification of contracts by commercial type. */
export enum ContractType {
  MasterServiceAgreement = 'MSA',
  StatementOfWork = 'SOW',
  OrderForm = 'OrderForm',
  NDA = 'NDA',
  SaaS = 'SaaS',
  License = 'License',
  Lease = 'Lease',
  Amendment = 'Amendment',
  BlanketPurchaseOrder = 'BlanketPO',
  ProfessionalServices = 'ProfessionalServices',
  Consulting = 'Consulting',
  Maintenance = 'Maintenance',
  Subscription = 'Subscription',
  Other = 'Other',
}

// ---- Core Contract -------------------------------------------------------

/**
 * The canonical contract entity representing a binding agreement
 * between the buyer organisation and a supplier.
 */
export interface Contract extends BaseEntity {
  /** Human-readable contract number (e.g. CTR-2026-00789). */
  contractNumber: string;
  title: string;
  description?: string;
  status: ContractStatus;
  contractType: ContractType;

  // Parties
  /** Internal entity / business unit. */
  buyerEntity: string;
  supplierId: string;
  supplierName: string;

  // Ownership
  contractOwner: UserReference;
  /** Additional stakeholders notified on changes. */
  stakeholders?: UserReference[];

  // Dates
  effectiveDate: string;
  expirationDate: string;
  /** Original execution / signature date. */
  executedDate?: string;
  /** Last renewal date if auto-renewed. */
  lastRenewalDate?: string;
  /** Next renewal action date (30/60/90 day alerts). */
  renewalActionDate?: string;
  /** Notice period required before expiration (days). */
  noticePeriodDays?: number;
  terminatedDate?: string;
  terminationReason?: string;

  // Financial
  totalValue: Currency;
  /** Annualised contract value (for multi-year contracts). */
  annualValue?: Currency;
  /** Remaining uncommitted value. */
  remainingValue?: Currency;
  paymentTerms?: string;

  // Auto-renewal
  autoRenew: boolean;
  renewalTermMonths?: number;
  /** Number of times this contract has been renewed. */
  renewalCount?: number;

  // Hierarchy
  /** Parent contract ID (e.g. SOW under an MSA). */
  parentContractId?: string;
  /** Child contract IDs (amendments, SOWs). */
  childContractIds?: string[];

  // Linked entities
  /** Procurement request that originated this contract. */
  requestId?: string;
  /** Purchase orders issued under this contract. */
  purchaseOrderIds?: string[];

  // Documents
  /** Primary contract document. */
  primaryDocument?: FileAttachment;
  /** All versions and supporting documents. */
  documents: FileAttachment[];
  /** Current version of the contract document. */
  currentVersion: number;
  versions: ContractVersion[];

  // AI Analysis
  aiAnalysis?: ContractAnalysis;

  // Clauses & Obligations
  /** Extracted / tagged clauses. */
  clauses: ContractClause[];
  /** Tracked obligations from the contract. */
  obligations: Obligation[];

  // Amendments
  amendments: Amendment[];

  // Tags & metadata
  tags?: string[];
  category?: string;
  /** Risk level assigned by AI or manually. */
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';

  // ERP integration
  erpContractId?: string;
  erpSyncStatus?: 'synced' | 'pending' | 'error' | 'not_applicable';
}

// ---- Contract Version Control (FR-6.8) -----------------------------------

/**
 * A version snapshot of the contract document supporting
 * redline tracking and side-by-side comparison.
 */
export interface ContractVersion {
  versionNumber: number;
  documentId: string;
  /** Who created this version. */
  createdBy: UserReference;
  createdAt: string;
  /** Change summary / commit message. */
  changeNotes: string;
  /** Source: internal edit, supplier redline, amendment. */
  source: 'internal' | 'counterparty' | 'amendment' | 'system';
  /** SHA-256 of the document for integrity checking. */
  documentHash: string;
}

// ---- Contract Clauses ----------------------------------------------------

export enum ClauseType {
  Indemnification = 'Indemnification',
  LimitationOfLiability = 'LimitationOfLiability',
  Confidentiality = 'Confidentiality',
  IntellectualProperty = 'IntellectualProperty',
  Termination = 'Termination',
  TerminationForConvenience = 'TerminationForConvenience',
  PaymentTerms = 'PaymentTerms',
  Warranty = 'Warranty',
  NonSolicitation = 'NonSolicitation',
  NonCompete = 'NonCompete',
  DataProtection = 'DataProtection',
  ForceMAjeure = 'ForceMajeure',
  GoverningLaw = 'GoverningLaw',
  DisputeResolution = 'DisputeResolution',
  Insurance = 'Insurance',
  Compliance = 'Compliance',
  AutoRenewal = 'AutoRenewal',
  AssignmentChange = 'AssignmentChange',
  SLAPerformance = 'SLAPerformance',
  PriceEscalation = 'PriceEscalation',
  AuditRights = 'AuditRights',
  Other = 'Other',
}

/**
 * An individual clause extracted or tagged within a contract (FR-6.2).
 */
export interface ContractClause {
  id: string;
  contractId: string;
  clauseType: ClauseType;
  /** Section / article reference in the document. */
  sectionReference: string;
  title: string;
  /** Full text of the clause. */
  text: string;
  /** AI-assessed risk level for this clause. */
  riskLevel: 'standard' | 'non_standard' | 'high_risk' | 'dealbreaker';
  /** Whether this clause deviates from the company's standard playbook. */
  isNonStandard: boolean;
  /** AI-generated explanation of deviation / risk. */
  aiNotes?: string;
  /** Suggested redline replacement from the AI agent. */
  suggestedRedline?: string;
  /** Reference to the clause library item it maps to. */
  clauseLibraryItemId?: string;
  /** Page / character offset in the source document. */
  sourceLocation?: {
    page?: number;
    startOffset: number;
    endOffset: number;
  };
}

/**
 * Pre-approved clause template in the centralised clause library (FR-6.2).
 */
export interface ClauseLibraryItem extends BaseEntity {
  clauseType: ClauseType;
  name: string;
  description: string;
  /** Standard clause text (the "playbook" version). */
  standardText: string;
  /** Fallback / alternative text for negotiation. */
  fallbackText?: string;
  /** Contract types this clause is applicable to. */
  applicableContractTypes: ContractType[];
  /** Risk categories where this clause is recommended. */
  riskCategories?: string[];
  /** Whether this is a mandatory clause. */
  isMandatory: boolean;
  /** Jurisdiction / governing law context. */
  jurisdiction?: string;
  /** Usage count across contracts. */
  usageCount: number;
  /** Version of this library entry. */
  clauseVersion: number;
  status: 'active' | 'draft' | 'deprecated';
}

// ---- Contract AI Analysis (FR-6.3, Agent A8) -----------------------------

/**
 * AI-generated analysis of a contract produced by the
 * Contract Analysis Agent (A8). Covers key terms extraction,
 * risk identification, and obligation detection.
 */
export interface ContractAnalysis {
  /** Natural-language executive summary of the contract. */
  summary: string;
  /** Extracted key terms with risk assessment. */
  keyTerms: KeyTerm[];
  /** Whether an indemnification clause was found. */
  indemnificationClause: ClausePresence;
  /** Whether a confidentiality clause was found. */
  confidentialityClause: ClausePresence;
  /** Identified governing law / jurisdiction. */
  governingLaw: string | null;
  /** Identified termination provisions. */
  terminationClause: ClausePresence;
  /** Identified renewal date and terms. */
  renewalDate: string | null;
  /** Auto-renewal detected. */
  autoRenewalDetected: boolean;
  /** Liability cap details. */
  liabilityCap?: LiabilityCapInfo;
  /** Payment terms extracted. */
  paymentTerms?: string;
  /** Data protection / GDPR provisions. */
  dataProtectionClause: ClausePresence;
  /** Overall contract risk score (0-100). */
  overallRiskScore: number;
  /** Non-standard clauses requiring human review. */
  nonStandardClauses: ContractClause[];
  /** Potential dealbreaker clauses. */
  dealbreakers: ContractClause[];
  /** Agent confidence in the analysis (0-1). */
  confidence: number;
  /** Model version that produced the analysis. */
  modelVersion: string;
  analysedAt: string;
}

export interface KeyTerm {
  term: string;
  value: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Explanation of the risk. */
  riskExplanation?: string;
  /** Section in the contract document. */
  sectionReference?: string;
}

export interface ClausePresence {
  found: boolean;
  /** The clause text if found. */
  text?: string;
  sectionReference?: string;
  riskLevel?: 'standard' | 'non_standard' | 'high_risk';
  notes?: string;
}

export interface LiabilityCapInfo {
  capped: boolean;
  capAmount?: Currency;
  capDescription?: string;
  exceptions?: string[];
}

/**
 * Full extraction response returned by the Document Extraction Agent
 * when processing a third-party contract document (FR-6.3).
 */
export interface ContractExtractionResponse {
  /** Structured metadata extracted from the document. */
  metadata: ExtractedContractMetadata;
  /** Clause-level extraction results. */
  clauses: ContractClause[];
  /** Extracted obligations. */
  obligations: Obligation[];
  /** Full AI analysis. */
  analysis: ContractAnalysis;
  /** Per-field confidence scores. */
  fieldConfidences: Record<string, number>;
  /** Fields where confidence was below threshold. */
  lowConfidenceFields: string[];
  /** Processing time in milliseconds. */
  processingTimeMs: number;
  /** Number of pages processed. */
  pagesProcessed: number;
}

export interface ExtractedContractMetadata {
  title?: string;
  parties: string[];
  effectiveDate?: string;
  expirationDate?: string;
  totalValue?: Currency;
  governingLaw?: string;
  contractType?: ContractType;
}

// ---- Amendments (FR-6.4) -------------------------------------------------

/**
 * A formal amendment modifying terms of an existing contract.
 */
export interface Amendment extends BaseEntity {
  contractId: string;
  /** Human-readable amendment number. */
  amendmentNumber: string;
  title: string;
  description: string;
  /** Effective date of the amendment. */
  effectiveDate: string;
  /** Changes made by this amendment. */
  changes: AmendmentChange[];
  /** Impact on contract value. */
  valueDelta?: Currency;
  /** New expiration date if extended. */
  newExpirationDate?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'executed' | 'rejected';
  /** Amendment document. */
  document?: FileAttachment;
  approvedBy?: UserReference;
  approvedAt?: string;
}

export interface AmendmentChange {
  /** Clause or section being amended. */
  section: string;
  changeType: 'addition' | 'modification' | 'deletion';
  originalText?: string;
  amendedText?: string;
  rationale: string;
}

// ---- Obligations (FR-6.5) ------------------------------------------------

/**
 * A contractual obligation extracted and tracked for compliance (FR-6.5).
 * Automated reminders fire before due dates.
 */
export interface Obligation extends BaseEntity {
  contractId: string;
  /** Which party is obligated. */
  obligatedParty: 'buyer' | 'supplier' | 'both';
  title: string;
  description: string;
  type: ObligationType;
  /** Due date for the obligation. */
  dueDate?: string;
  /** Recurrence pattern for periodic obligations. */
  recurrence?: 'one_time' | 'monthly' | 'quarterly' | 'annually';
  /** Current fulfilment status. */
  status: 'upcoming' | 'in_progress' | 'fulfilled' | 'overdue' | 'waived';
  /** Assignee responsible for fulfilment. */
  assigneeId?: string;
  /** Clause reference in the contract. */
  clauseReference?: string;
  /** Days before due date to send reminder. */
  reminderDays: number[];
  /** Whether this was auto-extracted by AI. */
  aiExtracted: boolean;
  /** Confidence of AI extraction (0-1). */
  aiConfidence?: number;
  fulfilledAt?: string;
  fulfilledBy?: string;
  /** Evidence of fulfilment. */
  fulfilmentNotes?: string;
  attachments?: FileAttachment[];
}

export enum ObligationType {
  Payment = 'Payment',
  Delivery = 'Delivery',
  Reporting = 'Reporting',
  Compliance = 'Compliance',
  RenewalNotice = 'RenewalNotice',
  InsuranceMaintenance = 'InsuranceMaintenance',
  PerformanceReview = 'PerformanceReview',
  Audit = 'Audit',
  DataProtection = 'DataProtection',
  Certification = 'Certification',
  Other = 'Other',
}
