// ---------------------------------------------------------------------------
// Module 5 — Supplier Management & Portal
// Centralises supplier lifecycle management with self-service capabilities,
// automated compliance, and continuous performance monitoring.
// ---------------------------------------------------------------------------

import type { BaseEntity, Currency, FileAttachment, UserReference } from './common';

// ---- Enums ---------------------------------------------------------------

/**
 * Tiered segmentation based on spend volume, criticality, and performance (FR-5.6).
 * Different workflow rules and engagement models apply per segment.
 */
export enum SupplierSegment {
  /** High-value, high-criticality: executive-sponsored relationship. */
  Strategic = 'Strategic',
  /** Strong performance, significant volume: preferred sourcing lane. */
  Preferred = 'Preferred',
  /** Qualified and vetted: eligible for transactional buying. */
  Approved = 'Approved',
  /** Under review, compliance issues, or pending deactivation. */
  Restricted = 'Restricted',
}

export enum OnboardingStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  PendingVerification = 'PendingVerification',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Suspended = 'Suspended',
  Deactivated = 'Deactivated',
}

export enum ComplianceStatus {
  Compliant = 'Compliant',
  NonCompliant = 'NonCompliant',
  PendingReview = 'PendingReview',
  ConditionallyCompliant = 'ConditionallyCompliant',
  Expired = 'Expired',
}

export enum DiversityClassification {
  MinorityOwned = 'MinorityOwned',
  WomenOwned = 'WomenOwned',
  VeteranOwned = 'VeteranOwned',
  DisabledVeteranOwned = 'DisabledVeteranOwned',
  LGBTQOwned = 'LGBTQOwned',
  SmallBusiness = 'SmallBusiness',
  SmallDisadvantagedBusiness = 'SmallDisadvantagedBusiness',
  HUBZone = 'HUBZone',
  DisabilityOwned = 'DisabilityOwned',
  IndigenousOwned = 'IndigenousOwned',
  SocialEnterprise = 'SocialEnterprise',
  None = 'None',
}

// ---- Supplier / Vendor Golden Record -------------------------------------

/**
 * The Supplier Golden Record — single source of truth aggregating data
 * across contracts, POs, invoices, risk assessments, and performance (FR-5.3).
 *
 * This is the canonical representation used throughout the platform.
 * "Vendor" and "Supplier" are used interchangeably in the domain.
 */
export interface Supplier extends BaseEntity {
  // ---- Identity & Classification ----
  /** Human-readable supplier number (e.g. SUP-00042). */
  supplierNumber: string;
  name: string;
  /** Doing-business-as name if different. */
  dbaName?: string;
  legalEntityName?: string;
  description?: string;
  category: string;
  subcategories?: string[];
  website?: string;
  /** DUNS number (Dun & Bradstreet). */
  dunsNumber?: string;
  taxId?: string;
  /** Country of incorporation (ISO 3166-1 alpha-2). */
  countryOfIncorporation?: string;

  // ---- Segmentation & Preference ----
  segmentation: SupplierSegment;
  isPreferred: boolean;
  /** Computed trust / reliability score (0-100). */
  trustScore: number;

  // ---- Primary Contact ----
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactTitle?: string;

  // ---- Additional Contacts ----
  contacts?: SupplierContact[];

  // ---- Addresses ----
  headquartersAddress?: SupplierAddress;
  addresses?: SupplierAddress[];

  // ---- Financial ----
  /** Total spend in the last 12 months. */
  spendLast12M: Currency;
  /** Total spend year-to-date. */
  spendYTD?: Currency;
  /** Total lifetime spend. */
  spendLifetime?: Currency;
  /** Annual revenue reported by the supplier. */
  annualRevenue?: Currency;
  /** Number of employees. */
  employeeCount?: number;
  /** Preferred payment terms (e.g. "Net 30"). */
  paymentTerms?: string;
  /** Banking / remittance details (encrypted at rest). */
  bankingInfo?: SupplierBankingInfo;

  // ---- Performance ----
  /** Weighted performance rating (0-100). */
  performanceRating: number;
  /** Most recent scorecard snapshot. */
  latestScorecard?: SupplierScorecard;

  // ---- Lifecycle & Compliance ----
  onboardingStatus: OnboardingStatus;
  complianceStatus: ComplianceStatus;
  /** Last compliance check timestamp. */
  lastComplianceCheckAt?: string;
  /** Sanctions / risk screening result. */
  riskScan?: SupplierRiskScan;
  /** Full risk profile. */
  riskProfile?: RiskProfile;

  // ---- Documents & Contracts ----
  documents: SupplierDocument[];
  /** Active contract IDs linked to this supplier. */
  contracts: string[];

  // ---- Diversity & ESG ----
  diversityClassifications: DiversityClassification[];
  /** External diversity certifications with expiry. */
  diversityCertifications?: DiversityCertification[];
  /** ESG score from Module 8 (Sustainability). */
  esgScore?: number;

  // ---- Portal ----
  /** Whether the supplier has activated their self-service portal account. */
  portalActivated: boolean;
  portalLastLoginAt?: string;
  portalUserId?: string;

  // ---- ERP Sync ----
  erpVendorId?: string;
  erpSyncStatus?: 'synced' | 'pending' | 'error' | 'not_applicable';
  erpSyncedAt?: string;

  // ---- Metadata ----
  tags?: string[];
  /** Internal owner / relationship manager. */
  ownerId?: string;
  ownerName?: string;
}

/** Type alias: "Vendor" is used interchangeably with "Supplier". */
export type Vendor = Supplier;

// ---- Supporting Interfaces -----------------------------------------------

export interface SupplierContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  isPrimary: boolean;
  roles: ('sales' | 'billing' | 'technical' | 'compliance' | 'executive')[];
}

export interface SupplierAddress {
  id: string;
  label: string; // "Headquarters", "Billing", "Shipping"
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface SupplierBankingInfo {
  bankName: string;
  accountHolderName: string;
  /** Encrypted at rest; masked in API responses. */
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swiftBic?: string;
  currency: string;
  /** Whether banking info has been verified. */
  verified: boolean;
  verifiedAt?: string;
}

export interface SupplierRiskScan {
  /** Overall scan result. */
  status: 'clear' | 'match' | 'potential_match' | 'error' | 'pending';
  /** Sanctions lists checked. */
  listsChecked: string[];
  /** Any matches found. */
  matches: SanctionsMatch[];
  scannedAt: string;
  nextScanDue: string;
}

export interface SanctionsMatch {
  listName: string;
  matchedEntityName: string;
  matchScore: number;
  /** Whether this has been reviewed and cleared as a false positive. */
  clearedAsFalsePositive: boolean;
  clearedBy?: string;
  clearedAt?: string;
}

export interface DiversityCertification {
  classification: DiversityClassification;
  certifyingBody: string;
  certificateNumber?: string;
  issuedDate: string;
  expiryDate: string;
  documentId?: string;
  verified: boolean;
}

// ---- Supplier Onboarding -------------------------------------------------

/**
 * Tracks the supplier onboarding journey from invitation to approval (FR-5.1).
 * The self-service portal drives suppliers through a guided wizard.
 */
export interface SupplierOnboarding extends BaseEntity {
  supplierId: string;
  supplierName: string;
  status: OnboardingStatus;
  /** Email address the invitation was sent to. */
  invitedEmail: string;
  invitedBy: UserReference;
  invitedAt: string;
  /** Steps in the onboarding wizard. */
  steps: OnboardingStep[];
  /** Overall completion percentage (0-100). */
  completionPercentage: number;
  /** Documents uploaded during onboarding. */
  documents: SupplierDocument[];
  /** Verification results (tax ID, banking, sanctions). */
  verifications: VerificationResult[];
  /** Approval workflow instance ID. */
  approvalWorkflowId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  /** Target SLA for completion (e.g. 24-48 hours). */
  targetCompletionHours: number;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'blocked';
  requiredDocuments: string[];
  completedAt?: string;
}

export interface VerificationResult {
  type: 'tax_id' | 'bank_account' | 'business_registration' | 'sanctions' | 'insurance' | 'duns';
  status: 'pending' | 'verified' | 'failed' | 'expired';
  provider?: string;
  checkedAt: string;
  details?: string;
  expiresAt?: string;
}

// ---- Supplier Scorecard --------------------------------------------------

/**
 * Weighted performance scorecard across multiple dimensions (FR-5.4).
 * Configurable by category with historical trending and peer benchmarking.
 */
export interface SupplierScorecard extends BaseEntity {
  supplierId: string;
  supplierName: string;
  /** Reporting period for this scorecard. */
  periodStart: string;
  periodEnd: string;
  /** Weighted overall score (0-100). */
  overallScore: number;
  /** Previous period's overall score for trending. */
  previousPeriodScore?: number;
  /** Peer benchmark: average score for suppliers in same category. */
  categoryBenchmark?: number;
  /** Per-dimension scores. */
  dimensions: ScorecardDimension[];
  /** Individual metric breakdowns. */
  metrics: PerformanceMetric[];
  /** AI-generated insights and recommendations. */
  insights?: string[];
  /** Trend direction compared to previous periods. */
  trend: 'improving' | 'stable' | 'declining';
  /** Generated by Agent A6 (Supplier Performance Scoring). */
  generatedByAgent: boolean;
}

export interface ScorecardDimension {
  name: 'delivery' | 'quality' | 'responsiveness' | 'compliance' | 'innovation' | 'cost';
  /** Weight in overall score calculation (0-1, all weights sum to 1). */
  weight: number;
  /** Score for this dimension (0-100). */
  score: number;
  /** Previous period score. */
  previousScore?: number;
}

/**
 * A single measurable performance metric contributing to the scorecard.
 */
export interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  dimension: string;
  /** Current period value. */
  value: number;
  /** Target / acceptable value. */
  target: number;
  /** Unit of measure (e.g. "percent", "days", "count"). */
  unit: string;
  /** Whether the metric is on target. */
  onTarget: boolean;
  /** Historical values for trending. */
  history: MetricDataPoint[];
}

export interface MetricDataPoint {
  period: string;
  value: number;
}

// ---- Risk Profile --------------------------------------------------------

/**
 * Multi-dimensional risk view for a supplier (FR-5.5).
 * Aggregates financial, geopolitical, ESG, cyber, and concentration risk.
 */
export interface RiskProfile extends BaseEntity {
  supplierId: string;
  /** Overall risk level. */
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Overall risk score (0-100, higher = riskier). */
  overallRiskScore: number;
  /** Per-dimension risk assessments. */
  dimensions: RiskDimension[];
  /** Predictive risk indicators for early warning. */
  predictiveIndicators: PredictiveRiskIndicator[];
  /** Active risk alerts. */
  activeAlerts: RiskAlert[];
  /** Last assessment timestamp. */
  assessedAt: string;
  /** Next scheduled assessment. */
  nextAssessmentDue: string;
  /** Whether this profile was generated/updated by Risk Monitoring Agent (A7). */
  agentGenerated: boolean;
}

export interface RiskDimension {
  name: 'financial' | 'geopolitical' | 'esg' | 'cyber' | 'concentration' | 'operational' | 'regulatory';
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  /** Key risk factors in this dimension. */
  factors: string[];
  /** Data sources used for assessment. */
  dataSources: string[];
  lastUpdated: string;
}

export interface PredictiveRiskIndicator {
  indicator: string;
  /** Predicted probability of risk event (0-1). */
  probability: number;
  /** Estimated impact if the risk materialises. */
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Recommended mitigation action. */
  mitigation?: string;
  /** Confidence in the prediction (0-1). */
  confidence: number;
}

export interface RiskAlert {
  id: string;
  type: 'sanctions_match' | 'financial_distress' | 'cyber_breach' | 'regulatory_action'
    | 'esg_violation' | 'concentration_warning' | 'geopolitical_event';
  severity: 'info' | 'warning' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  detectedAt: string;
  /** Whether this alert has been acknowledged / resolved. */
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolution?: string;
}

// ---- Supplier Documents --------------------------------------------------

export enum SupplierDocumentType {
  W9 = 'W9',
  W8BEN = 'W8BEN',
  InsuranceCertificate = 'InsuranceCertificate',
  SOC2Report = 'SOC2Report',
  ISO27001 = 'ISO27001',
  BankLetter = 'BankLetter',
  BusinessLicense = 'BusinessLicense',
  DiversityCertificate = 'DiversityCertificate',
  NDA = 'NDA',
  MSA = 'MSA',
  CodeOfConduct = 'CodeOfConduct',
  ESGReport = 'ESGReport',
  FinancialStatement = 'FinancialStatement',
  Other = 'Other',
}

/**
 * A document uploaded or collected during supplier lifecycle management.
 */
export interface SupplierDocument {
  id: string;
  supplierId: string;
  type: SupplierDocumentType;
  name: string;
  description?: string;
  file: FileAttachment;
  /** Expiry date for time-limited documents (insurance, certifications). */
  expiryDate?: string;
  /** Whether the document has been reviewed and approved. */
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewedBy?: string;
  reviewedAt?: string;
  /** Auto-renewal reminder days before expiry. */
  renewalReminderDays?: number;
  uploadedAt: string;
}
