// ---------------------------------------------------------------------------
// Module 3 — Buying & Execution
// Facilitates seamless transactional execution across catalog,
// contract-based, and spot-buy channels.
// ---------------------------------------------------------------------------

import type { BaseEntity, Currency, CustomFieldValue, FileAttachment, Tag, UserReference } from './common';

// ---- Purchase Order Status -----------------------------------------------

/**
 * Full lifecycle status of a Purchase Order from creation through payment.
 * Transitions follow the standard P2P flow with ERP synchronisation.
 */
export enum PurchaseOrderStatus {
  /** PO created but not yet sent to supplier. */
  Draft = 'Draft',
  /** PO transmitted to supplier (email, cXML, API). */
  Sent = 'Sent',
  /** Supplier has acknowledged receipt of the PO. */
  Acknowledged = 'Acknowledged',
  /** Some line items received / fulfilled; others outstanding. */
  PartiallyFulfilled = 'PartiallyFulfilled',
  /** All line items received and accepted. */
  Fulfilled = 'Fulfilled',
  /** Invoice received and matched against PO. */
  Invoiced = 'Invoiced',
  /** Payment executed for this PO. */
  Paid = 'Paid',
  /** PO cancelled before fulfilment. */
  Cancelled = 'Cancelled',
  /** PO closed — fully reconciled, no further activity expected. */
  Closed = 'Closed',
  /** PO is on hold pending resolution (budget, compliance, dispute). */
  OnHold = 'OnHold',
  /** PO change order pending supplier acknowledgement. */
  ChangeOrderPending = 'ChangeOrderPending',
}

// ---- Purchase Order ------------------------------------------------------

/**
 * The core Purchase Order entity representing a commitment to buy
 * goods or services from a supplier.
 */
export interface PurchaseOrder extends BaseEntity {
  /** Human-readable PO number (e.g. PO-2026-00123). */
  poNumber: string;
  /** Source procurement request that triggered this PO. */
  requestId?: string;
  /** Source contract (for contract-based buying). */
  contractId?: string;
  /** Source quick quote (for tail-spend buying). */
  quickQuoteId?: string;

  status: PurchaseOrderStatus;

  // Supplier
  supplierId: string;
  supplierName: string;
  supplierContactEmail?: string;

  // Requester / buyer
  requestedBy: UserReference;
  buyerAssignee?: UserReference;

  // Dates
  orderDate: string;       // ISO-8601
  needByDate?: string;
  acknowledgedAt?: string;
  fulfilledAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // Line items
  lineItems: LineItem[];

  // Financial summary
  subtotal: Currency;
  taxAmount: Currency;
  shippingAmount?: Currency;
  totalAmount: Currency;
  /** Budget allocation this PO is charged against. */
  budgetId?: string;
  budgetLineItem?: string;

  // Shipping / delivery
  shipToAddress?: Address;
  billToAddress?: Address;
  shippingMethod?: string;
  trackingNumbers?: string[];
  carrierName?: string;

  // Payment
  paymentTerms?: string; // e.g. "Net 30"
  paymentMethod?: 'invoice' | 'p_card' | 'wire' | 'ach' | 'check';

  // Matching & receipts
  goodsReceipts: GoodsReceipt[];
  threeWayMatch?: ThreeWayMatch;

  // ERP sync
  erpPoId?: string;
  erpSyncStatus?: 'pending' | 'synced' | 'error' | 'not_applicable';
  erpSyncedAt?: string;
  erpSyncError?: string;

  // Change orders
  changeOrders: ChangeOrder[];

  // Extensibility
  attachments: FileAttachment[];
  tags: Tag[];
  customFields: CustomFieldValue[];

  /** Internal notes visible only to the buying team. */
  internalNotes?: string;
}

// ---- Line Items ----------------------------------------------------------

export interface LineItem {
  id: string;
  lineNumber: number;
  description: string;
  /** UNSPSC commodity code. */
  commodityCode?: string;
  category?: string;
  /** Supplier SKU or part number. */
  sku?: string;
  /** Catalog item ID if sourced from internal catalog. */
  catalogItemId?: string;

  quantity: number;
  unitOfMeasure: string;
  unitPrice: Currency;
  /** Extended amount (quantity * unitPrice). */
  extendedAmount: Currency;
  /** Applicable tax rate as a percentage. */
  taxRate?: number;
  taxAmount?: Currency;
  /** Discount percentage applied. */
  discountPercent?: number;
  discountAmount?: Currency;

  /** Requested delivery date for this specific line. */
  needByDate?: string;
  /** Quantity received so far. */
  quantityReceived: number;
  /** Quantity invoiced so far. */
  quantityInvoiced: number;
  /** Quantity accepted after quality check. */
  quantityAccepted: number;

  /** GL account code. */
  glCode?: string;
  costCenter?: string;
  project?: string;

  /** Line-level status. */
  status: LineItemStatus;
}

export enum LineItemStatus {
  Open = 'Open',
  PartiallyReceived = 'PartiallyReceived',
  Received = 'Received',
  Invoiced = 'Invoiced',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
  Returned = 'Returned',
}

// ---- Address -------------------------------------------------------------

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2
  attentionTo?: string;
}

// ---- Budget Validation ---------------------------------------------------

/**
 * Real-time budget validation result (FR-3.4).
 * Checked before PO creation and at submission.
 */
export interface BudgetValidation {
  budgetId: string;
  budgetName: string;
  /** Fiscal period this validation applies to. */
  fiscalPeriod: string;
  /** Total budget allocation for the period. */
  totalBudget: Currency;
  /** Already committed (approved POs not yet paid). */
  committedSpend: Currency;
  /** Already spent (paid POs). */
  actualSpend: Currency;
  /** Remaining available = totalBudget - committedSpend - actualSpend. */
  availableBudget: Currency;
  /** The amount this PO would consume. */
  requestedAmount: Currency;
  /** Whether there is sufficient budget. */
  withinBudget: boolean;
  /** If over budget: the overage amount. */
  overageAmount?: Currency;
  /** Projected impact on period-end budget utilisation. */
  projectedUtilisation: number; // 0-1
  /** Whether an exception approval route is available. */
  exceptionApprovalAvailable: boolean;
  validatedAt: string;
}

// ---- Three-Way Match -----------------------------------------------------

/**
 * Automated PO-GoodsReceipt-Invoice matching with configurable tolerance (FR-3.5).
 * Drives the Invoice Matching Agent (A10).
 */
export interface ThreeWayMatch {
  purchaseOrderId: string;
  goodsReceiptId?: string;
  invoiceId?: string;
  /** Current state of the matching process. */
  status: ThreeWayMatchStatus;
  /** Per-line matching results. */
  lineMatches: LineMatchResult[];
  /** Overall price variance percentage. */
  priceVariancePercent: number;
  /** Overall quantity variance percentage. */
  quantityVariancePercent: number;
  /** Configured tolerance threshold percentage. */
  tolerancePercent: number;
  /** Whether the match is within tolerance. */
  withinTolerance: boolean;
  /** Exception details if out of tolerance. */
  exceptions: MatchException[];
  /** Whether auto-approved by the matching agent. */
  autoApproved: boolean;
  matchedAt?: string;
  matchedBy?: string; // user ID or "agent:invoice_matching"
}

export enum ThreeWayMatchStatus {
  PendingReceipt = 'PendingReceipt',
  PendingInvoice = 'PendingInvoice',
  MatchInProgress = 'MatchInProgress',
  Matched = 'Matched',
  ExceptionReview = 'ExceptionReview',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}

export interface LineMatchResult {
  lineItemId: string;
  poQuantity: number;
  receivedQuantity: number;
  invoicedQuantity: number;
  poUnitPrice: number;
  invoiceUnitPrice: number;
  quantityVariance: number;
  priceVariance: number;
  matched: boolean;
  exceptionReason?: string;
}

export interface MatchException {
  type: 'price_variance' | 'quantity_variance' | 'missing_receipt' | 'duplicate_invoice' | 'po_not_found';
  description: string;
  severity: 'warning' | 'error';
  lineItemId?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

// ---- Goods Receipt -------------------------------------------------------

/**
 * Goods receipt confirming delivery of PO line items (FR-3.6).
 * Supports mobile barcode scanning and quality verification.
 */
export interface GoodsReceipt extends BaseEntity {
  purchaseOrderId: string;
  /** Human-readable receipt number. */
  receiptNumber: string;
  receivedBy: UserReference;
  receivedAt: string;
  /** Per-line receipt details. */
  lines: GoodsReceiptLine[];
  /** Overall receipt status. */
  status: 'draft' | 'confirmed' | 'partial' | 'rejected';
  /** Delivery note / packing slip reference from supplier. */
  deliveryNoteReference?: string;
  /** Location where goods were received. */
  receivingLocation?: string;
  /** Photos / evidence of receipt. */
  attachments: FileAttachment[];
  notes?: string;
}

export interface GoodsReceiptLine {
  lineItemId: string;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  rejectionReason?: string;
  /** Quality rating (1-5). */
  qualityRating?: number;
  qualityNotes?: string;
  /** Barcode / serial numbers scanned. */
  serialNumbers?: string[];
  /** Storage location for received goods. */
  storageLocation?: string;
}

// ---- Punchout Cart -------------------------------------------------------

/**
 * Shopping cart returned from a punchout session (cXML/OCI) (FR-3.8).
 * Round-trip cart transfer with line-item mapping back to the platform.
 */
export interface PunchoutCart {
  id: string;
  tenantId: string;
  /** Punchout supplier ID. */
  supplierId: string;
  supplierName: string;
  /** Protocol used for the punchout session. */
  protocol: 'cxml' | 'oci';
  /** Cart items returned from the supplier storefront. */
  items: PunchoutCartItem[];
  /** Total cart value. */
  totalAmount: Currency;
  /** Raw cXML/OCI payload for audit purposes. */
  rawPayload?: string;
  /** Session ID from the punchout flow. */
  sessionId: string;
  /** Whether this cart has been converted to a requisition. */
  converted: boolean;
  convertedRequestId?: string;
  createdAt: string;
  expiresAt: string;
}

export interface PunchoutCartItem {
  supplierPartId: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: Currency;
  /** Supplier's classification code. */
  classificationCode?: string;
  /** Mapped internal commodity code. */
  commodityCode?: string;
  /** Manufacturer name. */
  manufacturer?: string;
  /** Manufacturer part number. */
  manufacturerPartId?: string;
  leadTimeDays?: number;
  imageUrl?: string;
}

// ---- Change Orders -------------------------------------------------------

/** A change order modifying an existing PO after issuance. */
export interface ChangeOrder {
  id: string;
  changeOrderNumber: string;
  purchaseOrderId: string;
  reason: string;
  /** Snapshot of changes: added, modified, or removed line items. */
  changes: ChangeOrderLine[];
  /** Net impact on PO total. */
  amountDelta: Currency;
  status: 'pending_approval' | 'approved' | 'rejected' | 'applied';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  appliedAt?: string;
}

export interface ChangeOrderLine {
  action: 'add' | 'modify' | 'remove';
  lineItemId?: string;
  /** Field-level changes for "modify" action. */
  fieldChanges?: FieldChange[];
  /** New line item data for "add" action. */
  newLineData?: Partial<LineItem>;
}

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
