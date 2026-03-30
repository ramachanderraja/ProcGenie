const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Normalize a single API record:
 *  - Convert decimal-string columns ("88.50") to numbers
 *  - Add backward-compat aliases (supplierCode → supplierNumber, overallScore → overallRating)
 *  - Compute synthetic Agent fields (domain, autonomyLevel, averageAccuracy, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRecord(rec: any): any {
  if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return rec;

  // ── Convert string decimals to numbers ───────────────────────────
  const numericFields = [
    'totalAmount', 'subtotal', 'taxAmount', 'totalValue',
    'estimatedTotal', 'estimatedValue', 'overallScore',
    'successRate', 'confidenceThreshold', 'totalPrice',
    'unitPrice', 'estimatedUnitPrice',
  ];
  for (const f of numericFields) {
    if (typeof rec[f] === 'string') {
      rec[f] = parseFloat(rec[f]) || 0;
    }
  }

  // ── Supplier aliases ─────────────────────────────────────────────
  if ('supplierCode' in rec && !rec.supplierNumber) {
    rec.supplierNumber = rec.supplierCode;
  }
  if ('overallScore' in rec && rec.overallRating === undefined) {
    rec.overallRating = rec.overallScore;
  }

  // ── Agent computed fields ────────────────────────────────────────
  // The backend Agent entity has successRate but not the legacy fields
  // the frontend expects (domain, autonomyLevel, averageAccuracy, etc.)
  if ('successRate' in rec && 'totalTasksCompleted' in rec && 'modelId' in rec) {
    // Map type → domain for display
    const typeToDomain: Record<string, string> = {
      intake_analyst: 'Intake Management',
      spend_analyzer: 'Analytics',
      contract_reviewer: 'Contract Management',
      catalog_manager: 'Buying & Execution',
      supplier_risk_assessor: 'Supplier Management',
      invoice_matcher: 'Accounts Payable',
      compliance_monitor: 'Compliance',
      market_intelligence: 'Analytics',
      negotiation_advisor: 'Sourcing',
      demand_forecaster: 'Analytics',
      esg_scorer: 'Sustainability',
      approval_router: 'Workflow',
      exception_handler: 'Platform',
      reporting_agent: 'Analytics',
    };
    if (!rec.domain) {
      rec.domain = typeToDomain[rec.type] || 'Platform';
    }
    if (!rec.autonomyLevel) {
      rec.autonomyLevel = rec.requiresHitl ? 'Level 3 - Supervised' : 'Level 4 - Autonomous';
    }
    if (!rec.hitlThreshold) {
      rec.hitlThreshold = rec.confidenceThreshold
        ? `${rec.confidenceThreshold}%`
        : '80%';
    }
    // averageAccuracy = successRate / 100 (successRate is already a 0-100 number after string conversion)
    if (rec.averageAccuracy === undefined) {
      rec.averageAccuracy = rec.successRate;
    }
    // Compute synthetic savings from task volume (no real savings column in DB)
    if (rec.totalSavingsGenerated === undefined) {
      rec.totalSavingsGenerated = rec.totalTasksCompleted * 50; // $50 avg savings per task
    }
    // humanEscalationRate from failed / completed
    if (rec.humanEscalationRate === undefined) {
      const total = rec.totalTasksCompleted + (rec.totalTasksFailed || 0);
      rec.humanEscalationRate = total > 0
        ? parseFloat(((rec.totalTasksFailed || 0) / total * 100).toFixed(1))
        : 0;
    }
  }

  return rec;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(
      response.status,
      body || `API error: ${response.statusText}`,
    );
  }

  const json = await response.json();
  // The API wraps all responses in { success, data, timestamp } via TransformInterceptor
  // Unwrap the data property so callers get the actual payload
  let payload = json.data !== undefined ? json.data : json;

  // Paginated responses from the API use { data: [...], total, page, limit }
  // but the frontend PaginatedResult<T> expects { items: [...], total, page, limit }.
  // Remap "data" → "items" so all list pages work correctly.
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    Array.isArray(payload.data) &&
    typeof payload.total === 'number'
  ) {
    payload = { ...payload, items: payload.data.map(normalizeRecord) };
    delete payload.data;
  } else if (Array.isArray(payload)) {
    payload = payload.map(normalizeRecord);
  } else if (payload && typeof payload === 'object') {
    payload = normalizeRecord(payload);
  }

  return payload as T;
}

/** Build a query-string from an object, skipping undefined values */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function qs(params: Record<string, any>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

// ═══════════════════════════════════════════════════════════════════════
// Common Interfaces
// ═══════════════════════════════════════════════════════════════════════

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════════════
// Intake / Requests
// ═══════════════════════════════════════════════════════════════════════

export interface IntakeRequest {
  id: string;
  requestNumber: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  currency: string;
  estimatedTotal: number;
  costCenter?: string;
  glAccount?: string;
  neededByDate?: string;
  requesterId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  items?: IntakeRequestItem[];
  aiAnalysis?: IntakeAnalysisResult;
}

export interface IntakeRequestItem {
  id: string;
  description: string;
  quantity: number;
  unitOfMeasure?: string;
  estimatedUnitPrice?: number;
  totalPrice?: number;
  catalogItemId?: string;
  commodityCode?: string;
}

export interface IntakeAnalysisResult {
  suggestedCategory: string;
  suggestedSuppliers: string[];
  estimatedCost: number;
  riskAssessment: string;
  recommendations: string[];
  confidenceScore: number;
  similarRequests: {
    requestNumber: string;
    title: string;
    totalCost: number;
    supplier: string;
  }[];
}

export interface CreateRequestDto {
  title: string;
  description?: string;
  category: string;
  priority?: string;
  currency?: string;
  costCenter?: string;
  glAccount?: string;
  neededByDate?: string;
  items?: {
    description: string;
    quantity: number;
    unitOfMeasure?: string;
    estimatedUnitPrice?: number;
    catalogItemId?: string;
    commodityCode?: string;
    specifications?: string;
  }[];
}

export interface ListRequestsParams extends PaginationParams {
  status?: string;
  category?: string;
  search?: string;
}

export async function createRequest(data: CreateRequestDto): Promise<IntakeRequest> {
  return request<IntakeRequest>('intake/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listRequests(params: ListRequestsParams = {}): Promise<PaginatedResult<IntakeRequest>> {
  return request<PaginatedResult<IntakeRequest>>(`intake/requests${qs(params)}`);
}

export async function getRequest(id: string): Promise<IntakeRequest> {
  return request<IntakeRequest>(`intake/requests/${id}`);
}

export async function updateRequest(id: string, data: Partial<CreateRequestDto>): Promise<IntakeRequest> {
  return request<IntakeRequest>(`intake/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function submitRequest(id: string): Promise<IntakeRequest> {
  return request<IntakeRequest>(`intake/requests/${id}/submit`, {
    method: 'PATCH',
  });
}

export async function cancelRequest(id: string): Promise<IntakeRequest> {
  return request<IntakeRequest>(`intake/requests/${id}/cancel`, {
    method: 'PATCH',
  });
}

export async function deleteRequest(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`intake/requests/${id}`, {
    method: 'DELETE',
  });
}

export async function analyzeIntake(data: {
  description: string;
  estimatedBudget?: number;
  departmentContext?: string;
}): Promise<IntakeAnalysisResult> {
  return request<IntakeAnalysisResult>('intake/requests/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTemplates(): Promise<unknown[]> {
  return request<unknown[]>('intake/requests/templates/list');
}

export async function saveDraft(data: {
  formData: Record<string, unknown>;
  step: number;
}): Promise<unknown> {
  return request<unknown>('intake/requests/drafts/save', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Buying / Purchase Orders
// ═══════════════════════════════════════════════════════════════════════

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  title: string;
  status: string;
  supplierId: string;
  supplierName?: string;
  requestId?: string;
  contractId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms?: string;
  shippingAddress?: string;
  expectedDeliveryDate?: string;
  costCenter?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  lineItems?: POLineItem[];
}

export interface POLineItem {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasure?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface GoodsReceipt {
  id: string;
  purchaseOrderId: string;
  receivedDate: string;
  notes?: string;
  deliveryNoteNumber?: string;
  receivedItems: unknown[];
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  unitOfMeasure: string;
  supplierId?: string;
  supplierName?: string;
  isActive: boolean;
}

export interface CreatePurchaseOrderDto {
  title: string;
  supplierId: string;
  requestId?: string;
  contractId?: string;
  currency?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  expectedDeliveryDate?: string;
  costCenter?: string;
  lineItems: {
    lineNumber: number;
    description: string;
    quantity: number;
    unitOfMeasure?: string;
    unitPrice: number;
    catalogItemId?: string;
    commodityCode?: string;
  }[];
}

export interface ListPOsParams extends PaginationParams {
  status?: string;
  supplierId?: string;
}

export async function listPurchaseOrders(params: ListPOsParams = {}): Promise<PaginatedResult<PurchaseOrder>> {
  return request<PaginatedResult<PurchaseOrder>>(`buying/purchase-orders${qs(params)}`);
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  return request<PurchaseOrder>(`buying/purchase-orders/${id}`);
}

export async function createPurchaseOrder(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
  return request<PurchaseOrder>('buying/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePurchaseOrder(id: string, data: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> {
  return request<PurchaseOrder>(`buying/purchase-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function submitPO(id: string): Promise<PurchaseOrder> {
  return request<PurchaseOrder>(`buying/purchase-orders/${id}/submit`, {
    method: 'PATCH',
  });
}

export async function approvePO(id: string): Promise<PurchaseOrder> {
  return request<PurchaseOrder>(`buying/purchase-orders/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function sendPO(id: string): Promise<PurchaseOrder> {
  return request<PurchaseOrder>(`buying/purchase-orders/${id}/send`, {
    method: 'PATCH',
  });
}

export async function createGoodsReceipt(data: {
  purchaseOrderId: string;
  receivedDate: string;
  receivedItems: { lineItemId: string; quantityReceived: number; condition?: string }[];
  notes?: string;
  deliveryNoteNumber?: string;
}): Promise<GoodsReceipt> {
  return request<GoodsReceipt>('buying/goods-receipts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getGoodsReceipts(poId: string): Promise<GoodsReceipt[]> {
  return request<GoodsReceipt[]>(`buying/goods-receipts/${poId}`);
}

export async function getCatalog(params: { category?: string; search?: string } = {}): Promise<CatalogItem[]> {
  return request<CatalogItem[]>(`buying/catalog${qs(params)}`);
}

// ═══════════════════════════════════════════════════════════════════════
// Contracts
// ═══════════════════════════════════════════════════════════════════════

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  supplierId: string;
  supplierName?: string;
  totalValue?: number;
  currency: string;
  startDate: string;
  endDate: string;
  noticePeriodDays?: number;
  autoRenew: boolean;
  paymentTerms?: string;
  governingLaw?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  obligations?: ContractObligation[];
  aiAnalysis?: ContractAnalysisResult;
}

export interface ContractObligation {
  id: string;
  title: string;
  description?: string;
  type: string;
  dueDate: string;
  responsibleParty: string;
  status: string;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface ContractAnalysisResult {
  riskScore: number;
  keyTerms: { term: string; value: string; section: string }[];
  riskyClauses: { clause: string; risk: string; recommendation: string }[];
  missingClauses: string[];
  recommendations: string[];
  obligations: { party: string; obligation: string; frequency: string }[];
  summary: string;
}

export interface CreateContractDto {
  title: string;
  description?: string;
  type: string;
  supplierId: string;
  totalValue?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  noticePeriodDays?: number;
  autoRenew?: boolean;
  paymentTerms?: string;
  governingLaw?: string;
  obligations?: {
    title: string;
    description?: string;
    type: string;
    dueDate: string;
    responsibleParty: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
  }[];
}

export interface ListContractsParams extends PaginationParams {
  status?: string;
  supplierId?: string;
  search?: string;
}

export async function listContracts(params: ListContractsParams = {}): Promise<PaginatedResult<Contract>> {
  return request<PaginatedResult<Contract>>(`contracts${qs(params)}`);
}

export async function getContract(id: string): Promise<Contract> {
  return request<Contract>(`contracts/${id}`);
}

export async function createContract(data: CreateContractDto): Promise<Contract> {
  return request<Contract>('contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateContract(id: string, data: Partial<CreateContractDto>): Promise<Contract> {
  return request<Contract>(`contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function submitContractReview(id: string): Promise<Contract> {
  return request<Contract>(`contracts/${id}/submit-review`, {
    method: 'PATCH',
  });
}

export async function approveContract(id: string): Promise<Contract> {
  return request<Contract>(`contracts/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function executeContract(id: string): Promise<Contract> {
  return request<Contract>(`contracts/${id}/execute`, {
    method: 'PATCH',
  });
}

export async function terminateContract(id: string, reason?: string): Promise<Contract> {
  return request<Contract>(`contracts/${id}/terminate`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function analyzeContract(data: {
  contractText: string;
  focusAreas?: string[];
}): Promise<ContractAnalysisResult> {
  return request<ContractAnalysisResult>('contracts/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getObligations(contractId: string): Promise<ContractObligation[]> {
  return request<ContractObligation[]>(`contracts/${contractId}/obligations`);
}

export async function getExpiringContracts(daysAhead?: number): Promise<Contract[]> {
  return request<Contract[]>(`contracts/expiring${qs({ daysAhead })}`);
}

// ═══════════════════════════════════════════════════════════════════════
// Suppliers
// ═══════════════════════════════════════════════════════════════════════

export interface Supplier {
  id: string;
  supplierCode: string;
  /** Alias kept for backward compat – pages should use supplierCode */
  supplierNumber?: string;
  companyName: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  description?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  status: string;
  tier?: string;
  paymentTerms?: string;
  categories: string[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  overallScore?: number;
  /** Alias kept for backward compat – pages should use overallScore */
  overallRating?: number;
  riskProfile?: SupplierRiskProfile;
  esgScore?: EsgScore;
}

export interface SupplierRiskProfile {
  id: string;
  overallRiskScore: number;
  financialRisk: number;
  operationalRisk: number;
  complianceRisk: number;
  reputationalRisk: number;
  geopoliticalRisk: number;
  lastAssessmentDate: string;
  riskFactors: string[];
  mitigationActions: string[];
}

export interface SupplierPerformance {
  supplierId: string;
  overallRating: number;
  qualityScore: number;
  deliveryScore: number;
  responseScore: number;
  costScore: number;
  history: { period: string; score: number }[];
}

export interface CreateSupplierDto {
  companyName: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  description?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  paymentTerms?: string;
  categories?: string[];
  tier?: string;
}

export interface ListSuppliersParams extends PaginationParams {
  status?: string;
  tier?: string;
  search?: string;
}

export async function listSuppliers(params: ListSuppliersParams = {}): Promise<PaginatedResult<Supplier>> {
  return request<PaginatedResult<Supplier>>(`suppliers${qs(params)}`);
}

export async function getSupplier(id: string): Promise<Supplier> {
  return request<Supplier>(`suppliers/${id}`);
}

export async function createSupplier(data: CreateSupplierDto): Promise<Supplier> {
  return request<Supplier>('suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSupplier(id: string, data: Partial<CreateSupplierDto>): Promise<Supplier> {
  return request<Supplier>(`suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function initiateOnboarding(id: string): Promise<Supplier> {
  return request<Supplier>(`suppliers/${id}/onboard`, {
    method: 'PATCH',
  });
}

export async function completeOnboarding(id: string): Promise<Supplier> {
  return request<Supplier>(`suppliers/${id}/onboard/complete`, {
    method: 'PATCH',
  });
}

export async function performRiskScan(id: string, deepScan?: boolean): Promise<SupplierRiskProfile> {
  return request<SupplierRiskProfile>(`suppliers/${id}/risk-scan`, {
    method: 'POST',
    body: JSON.stringify({ deepScan }),
  });
}

export async function getSupplierPerformance(id: string): Promise<SupplierPerformance> {
  return request<SupplierPerformance>(`suppliers/${id}/performance`);
}

export async function getSupplierRiskProfile(id: string): Promise<SupplierRiskProfile> {
  return request<SupplierRiskProfile>(`suppliers/${id}/risk-profile`);
}

// ═══════════════════════════════════════════════════════════════════════
// Invoices
// ═══════════════════════════════════════════════════════════════════════

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNumber?: string;
  type: string;
  status: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  contractId?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  costCenter?: string;
  glAccount?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  matchResults?: ThreeWayMatch[];
}

export interface ThreeWayMatch {
  id: string;
  invoiceId: string;
  purchaseOrderId?: string;
  goodsReceiptId?: string;
  matchStatus: string;
  poAmountMatch: boolean;
  grQuantityMatch: boolean;
  invoiceAmountMatch: boolean;
  variancePercentage?: number;
  exceptionDetails?: string;
}

export interface CreateInvoiceDto {
  supplierInvoiceNumber?: string;
  type?: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  contractId?: string;
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  costCenter?: string;
  glAccount?: string;
  lineItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  documentUrl?: string;
}

export interface ListInvoicesParams extends PaginationParams {
  status?: string;
  supplierId?: string;
  search?: string;
}

export async function listInvoices(params: ListInvoicesParams = {}): Promise<PaginatedResult<Invoice>> {
  return request<PaginatedResult<Invoice>>(`invoices${qs(params)}`);
}

export async function getInvoice(id: string): Promise<Invoice> {
  return request<Invoice>(`invoices/${id}`);
}

export async function createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
  return request<Invoice>('invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInvoice(id: string, data: Partial<CreateInvoiceDto>): Promise<Invoice> {
  return request<Invoice>(`invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function performThreeWayMatch(id: string): Promise<ThreeWayMatch> {
  return request<ThreeWayMatch>(`invoices/${id}/match`, {
    method: 'POST',
  });
}

export async function approveInvoice(id: string): Promise<Invoice> {
  return request<Invoice>(`invoices/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectInvoice(id: string, reason: string): Promise<Invoice> {
  return request<Invoice>(`invoices/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function schedulePayment(id: string): Promise<Invoice> {
  return request<Invoice>(`invoices/${id}/schedule-payment`, {
    method: 'PATCH',
  });
}

export async function markPaid(id: string, paymentDate?: string): Promise<Invoice> {
  return request<Invoice>(`invoices/${id}/mark-paid`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentDate }),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Sourcing
// ═══════════════════════════════════════════════════════════════════════

export interface SourcingProject {
  id: string;
  projectNumber: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  category?: string;
  estimatedValue?: number;
  currency: string;
  bidStartDate?: string;
  bidEndDate?: string;
  isSealed: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  bids?: SourcingBid[];
}

export interface SourcingBid {
  id: string;
  sourcingProjectId: string;
  supplierId: string;
  supplierName: string;
  status: string;
  totalPrice: number;
  currency: string;
  deliveryTimeline?: string;
  technicalScore?: number;
  commercialScore?: number;
  overallScore?: number;
  submittedAt?: string;
}

export interface CreateSourcingProjectDto {
  title: string;
  description?: string;
  type: string;
  requestId?: string;
  category?: string;
  estimatedValue?: number;
  currency?: string;
  bidStartDate?: string;
  bidEndDate?: string;
  invitedSuppliers?: string[];
  isSealed?: boolean;
  evaluationCriteria?: {
    name: string;
    description?: string;
    category: string;
    weight: number;
    maxScore?: number;
    isMandatory?: boolean;
  }[];
}

export interface ListSourcingParams extends PaginationParams {
  status?: string;
  search?: string;
}

export async function listSourcingProjects(params: ListSourcingParams = {}): Promise<PaginatedResult<SourcingProject>> {
  return request<PaginatedResult<SourcingProject>>(`sourcing/projects${qs(params)}`);
}

export async function getSourcingProject(id: string): Promise<SourcingProject> {
  return request<SourcingProject>(`sourcing/projects/${id}`);
}

export async function createSourcingProject(data: CreateSourcingProjectDto): Promise<SourcingProject> {
  return request<SourcingProject>('sourcing/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSourcingProject(id: string, data: Partial<CreateSourcingProjectDto>): Promise<SourcingProject> {
  return request<SourcingProject>(`sourcing/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function publishProject(id: string): Promise<SourcingProject> {
  return request<SourcingProject>(`sourcing/projects/${id}/publish`, {
    method: 'PATCH',
  });
}

export async function openBidding(id: string): Promise<SourcingProject> {
  return request<SourcingProject>(`sourcing/projects/${id}/open-bidding`, {
    method: 'PATCH',
  });
}

export async function closeBidding(id: string): Promise<SourcingProject> {
  return request<SourcingProject>(`sourcing/projects/${id}/close-bidding`, {
    method: 'PATCH',
  });
}

export async function awardProject(id: string, data: { bidId: string; awardJustification?: string }): Promise<SourcingProject> {
  return request<SourcingProject>(`sourcing/projects/${id}/award`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Agents
// ═══════════════════════════════════════════════════════════════════════

export interface Agent {
  id: string;
  name: string;
  type: string;
  domain?: string;
  description?: string;
  status: string;
  autonomyLevel?: string;
  hitlThreshold?: string;
  capabilities?: string[] | null;
  configuration?: Record<string, unknown>;
  modelId?: string;
  version?: string;
  successRate: number;
  avgResponseTimeMs?: number;
  totalTasksCompleted: number;
  totalTasksFailed?: number;
  totalSavingsGenerated: number;
  averageAccuracy: number;
  humanEscalationRate: number;
  requiresHitl?: boolean;
  confidenceThreshold?: number;
  maxConcurrentTasks?: number;
  lastActiveAt?: string;
  tenantId: string;
  createdAt: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  taskType: string;
  status: string;
  priority: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  confidenceScore?: number;
  requiresHitl: boolean;
  hitlStatus?: string;
  hitlReason?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AgentDecisionLog {
  id: string;
  agentId: string;
  taskId?: string;
  decisionType: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidenceScore: number;
  reasoning: string;
  humanOverridden: boolean;
  createdAt: string;
}

export async function listAgents(params: { status?: string; type?: string } = {}): Promise<Agent[]> {
  return request<Agent[]>(`agents${qs(params)}`);
}

export async function getAgent(id: string): Promise<Agent> {
  return request<Agent>(`agents/${id}`);
}

export async function getAgentPerformance(id: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`agents/${id}/performance`);
}

export async function listAgentTasks(params: { agentId?: string; status?: string } & PaginationParams = {}): Promise<PaginatedResult<AgentTask>> {
  return request<PaginatedResult<AgentTask>>(`agents/tasks/list${qs(params)}`);
}

export async function getAgentTask(id: string): Promise<AgentTask> {
  return request<AgentTask>(`agents/tasks/${id}`);
}

export async function getHitlCheckpoints(params: PaginationParams = {}): Promise<PaginatedResult<AgentTask>> {
  return request<PaginatedResult<AgentTask>>(`agents/hitl/checkpoints${qs(params)}`);
}

export async function approveHitl(id: string): Promise<AgentTask> {
  return request<AgentTask>(`agents/hitl/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectHitl(id: string, reason: string): Promise<AgentTask> {
  return request<AgentTask>(`agents/hitl/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function getDecisionLogs(params: { agentId?: string; decisionType?: string } & PaginationParams = {}): Promise<PaginatedResult<AgentDecisionLog>> {
  return request<PaginatedResult<AgentDecisionLog>>(`agents/decision-logs/list${qs(params)}`);
}

// ═══════════════════════════════════════════════════════════════════════
// Workflow / Approvals
// ═══════════════════════════════════════════════════════════════════════

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  approverUserId: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlaStatus {
  id: string;
  entityType: string;
  entityId: string;
  slaHours: number;
  elapsedHours: number;
  status: string;
  breachedAt?: string;
}

export async function getPendingApprovals(): Promise<Approval[]> {
  return request<Approval[]>('workflows/approvals/pending');
}

export async function processApproval(id: string, data: {
  action: 'APPROVED' | 'REJECTED' | 'DELEGATED';
  comments?: string;
  delegateTo?: string;
}): Promise<Approval> {
  return request<Approval>(`workflows/approvals/${id}/action`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getBreachedSlas(): Promise<SlaStatus[]> {
  return request<SlaStatus[]>('workflows/sla/breached');
}

export async function getAtRiskSlas(): Promise<SlaStatus[]> {
  return request<SlaStatus[]>('workflows/sla/at-risk');
}

// ═══════════════════════════════════════════════════════════════════════
// Sustainability
// ═══════════════════════════════════════════════════════════════════════

export interface EsgScore {
  id: string;
  supplierId: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
  category?: string;
  assessmentDate: string;
  validUntil?: string;
}

export interface CarbonFootprint {
  id: string;
  supplierId?: string;
  scope: string;
  emissionsTonsCo2: number;
  period: string;
  dataSource?: string;
  createdAt: string;
}

export interface RegulatoryAlert {
  id: string;
  title: string;
  description: string;
  regulation: string;
  severity: string;
  status: string;
  affectedSuppliers: string[];
  dueDate?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export async function getEsgScores(params: { supplierId?: string; category?: string } & PaginationParams = {}): Promise<PaginatedResult<EsgScore>> {
  return request<PaginatedResult<EsgScore>>(`sustainability/esg-scores${qs(params)}`);
}

export async function getCarbonFootprints(params: { supplierId?: string; scope?: string; period?: string } = {}): Promise<CarbonFootprint[]> {
  return request<CarbonFootprint[]>(`sustainability/carbon-footprints${qs(params)}`);
}

export async function getCarbonSummary(): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>('sustainability/carbon-summary');
}

export async function getRegulatoryAlerts(params: { severity?: string; status?: string } & PaginationParams = {}): Promise<PaginatedResult<RegulatoryAlert>> {
  return request<PaginatedResult<RegulatoryAlert>>(`sustainability/regulatory-alerts${qs(params)}`);
}

export async function acknowledgeAlert(id: string): Promise<RegulatoryAlert> {
  return request<RegulatoryAlert>(`sustainability/regulatory-alerts/${id}/acknowledge`, {
    method: 'PATCH',
  });
}

export async function resolveAlert(id: string, resolution?: string): Promise<RegulatoryAlert> {
  return request<RegulatoryAlert>(`sustainability/regulatory-alerts/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ resolution }),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Integrations
// ═══════════════════════════════════════════════════════════════════════

export interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  direction: string;
  configuration: Record<string, unknown>;
  lastSyncAt?: string;
  syncHealth: number;
  totalRecordsSynced: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncJob {
  id: string;
  integrationId: string;
  entityType: string;
  direction: string;
  status: string;
  recordsProcessed: number;
  recordsFailed: number;
  startedAt?: string;
  completedAt?: string;
}

export async function listIntegrations(params: { status?: string; type?: string } = {}): Promise<Integration[]> {
  return request<Integration[]>(`integrations${qs(params)}`);
}

export async function getIntegration(id: string): Promise<Integration> {
  return request<Integration>(`integrations/${id}`);
}

export async function createIntegration(data: Partial<Integration>): Promise<Integration> {
  return request<Integration>('integrations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIntegration(id: string, data: Partial<Integration>): Promise<Integration> {
  return request<Integration>(`integrations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function activateIntegration(id: string): Promise<Integration> {
  return request<Integration>(`integrations/${id}/activate`, {
    method: 'PATCH',
  });
}

export async function deactivateIntegration(id: string): Promise<Integration> {
  return request<Integration>(`integrations/${id}/deactivate`, {
    method: 'PATCH',
  });
}

export async function testConnection(id: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
  return request<{ success: boolean; message: string; latencyMs: number }>(`integrations/${id}/test`, {
    method: 'POST',
  });
}

export async function deleteIntegration(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`integrations/${id}`, {
    method: 'DELETE',
  });
}

export async function triggerSync(id: string, data: { entityType: string; direction: string }): Promise<SyncJob> {
  return request<SyncJob>(`integrations/${id}/sync`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Chat
// ═══════════════════════════════════════════════════════════════════════

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export async function sendChatMessage(
  message: string,
  history?: { role: string; content: string }[],
): Promise<ChatResponse> {
  return request<ChatResponse>('chat/message', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Analytics
// ═══════════════════════════════════════════════════════════════════════

export interface SpendDashboardData {
  totalSpend: number;
  totalSavings: number;
  savingsPercentage: number;
  contractCompliance: number;
  activePOs: number;
  pendingInvoices: number;
  spendByCategory: { category: string; amount: number; percentage: number }[];
  spendBySupplier: { supplier: string; amount: number; poCount: number }[];
  spendTrend: { month: string; spend: number; budget: number }[];
  topSuppliers: {
    name: string;
    spend: number;
    contracts: number;
    rating: number;
  }[];
}

export async function getSpendDashboard(params: {
  startDate?: string;
  endDate?: string;
  category?: string;
} = {}): Promise<SpendDashboardData> {
  return request<SpendDashboardData>(`analytics/spend-dashboard${qs(params)}`);
}

export interface NLQueryResult {
  query: string;
  interpretation: string;
  data: Record<string, unknown>;
  visualization: string;
  confidence: number;
}

export async function naturalLanguageQuery(
  query: string,
): Promise<NLQueryResult> {
  return request<NLQueryResult>('analytics/nl-query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export interface SavingsWaterfallData {
  totalSavings: number;
  categories: { name: string; amount: number; percentage: number }[];
}

export async function getSavingsWaterfall(year?: number): Promise<SavingsWaterfallData> {
  return request<SavingsWaterfallData>(`analytics/savings-waterfall${qs({ year })}`);
}

export interface SpendTrendData {
  period: string;
  spend: number;
  budget: number;
  savings: number;
  poCount: number;
}

export async function getSpendTrends(params: { period?: string; months?: number } = {}): Promise<SpendTrendData[]> {
  return request<SpendTrendData[]>(`analytics/spend-trends${qs(params)}`);
}

export async function getCycleTimeMetrics(): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>('analytics/cycle-times');
}

// ═══════════════════════════════════════════════════════════════════════
// Health
// ═══════════════════════════════════════════════════════════════════════

export async function healthCheck(): Promise<{
  status: string;
  service: string;
  timestamp: string;
}> {
  return request('health');
}

// ═══════════════════════════════════════════════════════════════════════
// Workflow Designer
// ═══════════════════════════════════════════════════════════════════════

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  version: number;
  entityTypes?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph?: { nodes: any[]; edges: any[] };
  triggerConditions?: Record<string, unknown>;
  escalationRules?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps?: any[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  definitionVersion: number;
  entityType: string;
  entityId: string;
  status: string;
  currentStepIds?: string[];
  context?: Record<string, unknown>;
  history?: Record<string, unknown>[];
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export async function listWorkflows(): Promise<WorkflowDefinition[]> {
  return request<WorkflowDefinition[]>('/workflows');
}

export async function getWorkflow(id: string): Promise<WorkflowDefinition> {
  return request<WorkflowDefinition>(`/workflows/${id}`);
}

export async function createWorkflow(data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
  return request<WorkflowDefinition>('/workflows', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateWorkflow(id: string, data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
  return request<WorkflowDefinition>(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function activateWorkflow(id: string): Promise<WorkflowDefinition> {
  return request<WorkflowDefinition>(`/workflows/${id}/activate`, { method: 'PATCH' });
}

export async function archiveWorkflow(id: string): Promise<WorkflowDefinition> {
  return request<WorkflowDefinition>(`/workflows/${id}/archive`, { method: 'PATCH' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function testWorkflow(id: string, entityData: Record<string, unknown>): Promise<{ steps: any[]; success: boolean }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return request<{ steps: any[]; success: boolean }>(`/workflows/${id}/test`, { method: 'POST', body: JSON.stringify({ entityData }) });
}

export async function listWorkflowInstances(): Promise<WorkflowInstance[]> {
  return request<WorkflowInstance[]>('/workflows/instances');
}
