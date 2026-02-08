// ---------------------------------------------------------------------------
// Module 8 — Sustainability & ESG
// Embeds sustainability into every procurement decision with carbon tracking,
// ESG scoring, and regulatory compliance.
// ---------------------------------------------------------------------------

import type { BaseEntity, Currency, DateRange } from './common';

// ---- ESG Score -----------------------------------------------------------

/**
 * Multi-dimensional ESG (Environmental, Social, Governance) score
 * integrating third-party data, supplier self-assessments,
 * and AI-analysed public data (FR-8.1).
 */
export interface ESGScore {
  /** Overall composite ESG score (0-100). */
  overall: number;
  /** Environmental pillar score (0-100). */
  environmental: number;
  /** Social pillar score (0-100). */
  social: number;
  /** Governance pillar score (0-100). */
  governance: number;
  /** Per-pillar breakdowns. */
  dimensions: ESGDimension[];
  /** Data sources used in scoring. */
  dataSources: ESGDataSource[];
  /** Confidence in the score (0-1). */
  confidence: number;
  /** Industry benchmark percentile (0-100). */
  industryPercentile?: number;
  assessedAt: string;
  /** Next scheduled assessment. */
  nextAssessmentDue?: string;
  /** Whether this score was produced by ESG Scoring Agent (A13). */
  agentGenerated: boolean;
  modelVersion?: string;
}

export interface ESGDimension {
  pillar: 'environmental' | 'social' | 'governance';
  name: string;
  score: number;
  weight: number;
  /** Key indicators used. */
  indicators: ESGIndicator[];
}

export interface ESGIndicator {
  name: string;
  value: number | string;
  unit?: string;
  source: string;
  assessedAt: string;
  benchmark?: number | string;
}

export interface ESGDataSource {
  provider: 'ecovadis' | 'cdp' | 'sustainalytics' | 'self_assessment' | 'public_data' | 'ai_analysis';
  lastUpdated: string;
  score?: number;
  reliability: 'high' | 'medium' | 'low';
}

// ---- Carbon Footprint (FR-8.2) ------------------------------------------

/**
 * Estimated carbon footprint for a purchase order or procurement activity.
 * Calculates Scope 3 emissions using supplier data, category factors,
 * and transportation estimates.
 */
export interface CarbonFootprint {
  /** Entity this footprint is calculated for. */
  entityId: string;
  entityType: 'purchase_order' | 'contract' | 'supplier' | 'category' | 'organization';
  /** Total CO2 equivalent in metric tonnes. */
  totalCO2eTonnes: number;
  /** Breakdown by emission scope. */
  scope1?: number;
  scope2?: number;
  scope3: number;
  /** Breakdown by emission category. */
  categories: EmissionCategory[];
  /** Methodology used for calculation. */
  methodology: CarbonMethodology;
  /** Data quality indicator (0-1). */
  dataQuality: number;
  /** Comparison against baseline or previous period. */
  baselineComparison?: BaselineComparison;
  calculatedAt: string;
  /** Whether the supplier provided actual (vs. estimated) data. */
  supplierReportedData: boolean;
}

export interface EmissionCategory {
  /** GHG Protocol category name. */
  category: string;
  /** CO2e in metric tonnes. */
  co2eTonnes: number;
  /** Percentage of total. */
  percentOfTotal: number;
  /** Emission factor used. */
  emissionFactor?: number;
  /** Source of the emission factor. */
  factorSource?: string;
}

export interface CarbonMethodology {
  standard: 'ghg_protocol' | 'iso_14064' | 'pef';
  version: string;
  /** Spend-based, activity-based, or supplier-specific. */
  approach: 'spend_based' | 'activity_based' | 'supplier_specific' | 'hybrid';
  description: string;
}

export interface BaselineComparison {
  baselineYear: number;
  baselineCO2eTonnes: number;
  changePercent: number;
  onTrackForTarget: boolean;
}

// ---- Scope 3 Emission Tracking -------------------------------------------

/**
 * Detailed Scope 3 emission record for supply chain carbon accounting.
 */
export interface Scope3Emission extends BaseEntity {
  /** GHG Protocol Scope 3 category (1-15). */
  ghgCategory: number;
  /** Category name (e.g. "Purchased Goods and Services"). */
  categoryName: string;
  /** Source entity. */
  supplierId?: string;
  supplierName?: string;
  purchaseOrderId?: string;
  /** CO2e in metric tonnes. */
  co2eTonnes: number;
  /** Reporting period. */
  reportingPeriod: string;
  /** Data source and quality. */
  dataSource: 'supplier_reported' | 'spend_based_estimate' | 'activity_based' | 'industry_average';
  dataQuality: 'measured' | 'calculated' | 'estimated';
  /** Verification status. */
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  /** Notes on calculation methodology. */
  notes?: string;
}

// ---- Sustainability Dashboard (FR-8.3) -----------------------------------

/**
 * Executive view of procurement sustainability performance.
 */
export interface SustainabilityDashboard {
  period: DateRange;
  /** Total procurement carbon footprint. */
  totalCarbonFootprint: CarbonFootprint;
  /** ESG score trends. */
  esgScoreTrend: ESGScoreTrend[];
  /** Diversity spend breakdown. */
  diversitySpend: DiversitySpendBreakdown;
  /** Circular economy metrics. */
  circularEconomyMetrics?: CircularEconomyMetrics;
  /** Progress against sustainability targets. */
  targetProgress: SustainabilityTargetProgress[];
  /** Top suppliers by ESG performance. */
  topESGSuppliers: SupplierESGSummary[];
  /** Suppliers below ESG threshold (action required). */
  belowThresholdSuppliers: SupplierESGSummary[];
  /** Regulatory compliance status. */
  regulatoryComplianceRate: number;
  /** Active regulatory alerts. */
  activeAlerts: RegulatoryAlert[];
  generatedAt: string;
}

export interface ESGScoreTrend {
  period: string;
  overallScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
}

export interface DiversitySpendBreakdown {
  totalDiversitySpend: Currency;
  diversitySpendPercent: number;
  byClassification: {
    classification: string;
    amount: Currency;
    percent: number;
    supplierCount: number;
  }[];
  target?: number;
  onTrack: boolean;
}

export interface CircularEconomyMetrics {
  recycledContentPercent: number;
  wasteReductionPercent: number;
  circularProcurementPercent: number;
  targetRecycledContent?: number;
}

export interface SupplierESGSummary {
  supplierId: string;
  supplierName: string;
  esgScore: number;
  previousScore?: number;
  trend: 'improving' | 'stable' | 'declining';
  topRisk?: string;
}

// ---- Regulatory Alerts (FR-8.5) ------------------------------------------

/**
 * Alert for new or changed ESG regulations impacting the supplier base
 * or procurement practices. Monitors 2,500+ global regulations.
 */
export interface RegulatoryAlert extends BaseEntity {
  title: string;
  description: string;
  /** Regulation identifier. */
  regulationId?: string;
  regulationName: string;
  /** Jurisdiction (country / region code). */
  jurisdiction: string;
  /** Type of regulatory change. */
  changeType: 'new_regulation' | 'amendment' | 'enforcement_action' | 'deadline' | 'guidance';
  /** Effective date of the regulation / change. */
  effectiveDate: string;
  /** Severity of impact. */
  severity: 'info' | 'warning' | 'high' | 'critical';
  /** Categories affected. */
  affectedCategories: string[];
  /** Number of suppliers potentially impacted. */
  affectedSupplierCount: number;
  /** Recommended actions. */
  recommendations: string[];
  /** Compliance deadline. */
  complianceDeadline?: string;
  /** Current response status. */
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  assignedTo?: string;
  /** Source URL / reference. */
  sourceUrl?: string;
}

// ---- Supplier ESG Profile ------------------------------------------------

/**
 * ESG-specific profile for a supplier, extending the golden record
 * with sustainability data.
 */
export interface SupplierESGProfile extends BaseEntity {
  supplierId: string;
  supplierName: string;
  /** Current ESG score. */
  esgScore: ESGScore;
  /** Carbon footprint attributed to this supplier. */
  carbonFootprint?: CarbonFootprint;
  /** Scope 3 emissions from this supplier. */
  scope3Emissions: Scope3Emission[];
  /** Self-assessment responses. */
  selfAssessment?: ESGSelfAssessment;
  /** External certifications (e.g. B-Corp, ISO 14001). */
  certifications: ESGCertification[];
  /** Sustainability commitments declared by the supplier. */
  commitments: string[];
  /** History of ESG scores over time. */
  scoreHistory: ESGScoreTrend[];
  /** Risk flags from ESG perspective. */
  riskFlags: string[];
  /** Recommended alternative suppliers with better ESG. */
  suggestedAlternatives?: SupplierESGSummary[];
  lastUpdated: string;
}

export interface ESGSelfAssessment {
  submittedAt: string;
  completionPercent: number;
  responses: Record<string, unknown>;
  verifiedFields: string[];
  unverifiedFields: string[];
}

export interface ESGCertification {
  name: string;
  issuingBody: string;
  certificateNumber?: string;
  issuedDate: string;
  expiryDate: string;
  documentId?: string;
  verified: boolean;
}

// ---- Sustainability Targets (FR-8.3) ------------------------------------

/**
 * A defined sustainability target with progress tracking.
 */
export interface SustainabilityTarget extends BaseEntity {
  name: string;
  description: string;
  /** Target category. */
  category: 'carbon_reduction' | 'diversity_spend' | 'esg_score' | 'renewable_energy'
    | 'waste_reduction' | 'circular_economy' | 'custom';
  /** Target value. */
  targetValue: number;
  /** Current progress value. */
  currentValue: number;
  /** Unit of measure. */
  unit: string;
  /** Target achievement deadline. */
  targetDate: string;
  /** Baseline value for comparison. */
  baselineValue: number;
  /** Baseline date. */
  baselineDate: string;
  /** Progress percentage (0-100). */
  progressPercent: number;
  /** Whether the target is on track to be met. */
  onTrack: boolean;
  /** Owner responsible for this target. */
  ownerId: string;
  status: 'active' | 'achieved' | 'at_risk' | 'missed' | 'draft';
  /** Monthly / quarterly milestones. */
  milestones?: SustainabilityMilestone[];
}

export interface SustainabilityMilestone {
  date: string;
  targetValue: number;
  actualValue?: number;
  met: boolean;
}

export interface SustainabilityTargetProgress {
  targetId: string;
  targetName: string;
  category: string;
  progressPercent: number;
  onTrack: boolean;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
}
