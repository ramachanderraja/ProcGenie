import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ThreeWayMatch } from './three-way-match.entity';

export enum InvoiceStatus {
  RECEIVED = 'received',
  OCR_PROCESSING = 'ocr_processing',
  PENDING_VALIDATION = 'pending_validation',
  MATCHING = 'matching',
  MATCHED = 'matched',
  EXCEPTION = 'exception',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SCHEDULED_FOR_PAYMENT = 'scheduled_for_payment',
  PAID = 'paid',
  REJECTED = 'rejected',
  VOIDED = 'voided',
}

export enum InvoiceType {
  STANDARD = 'standard',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  PROFORMA = 'proforma',
  RECURRING = 'recurring',
}

@Entity('invoices')
@Index(['invoiceNumber', 'tenantId'])
@Index(['status', 'tenantId'])
@Index(['supplierId', 'tenantId'])
@Index(['purchaseOrderId'])
export class Invoice extends BaseEntity {
  @ApiProperty({ example: 'INV-2025-001234' })
  @Column({ name: 'invoice_number', type: 'varchar', length: 100 })
  invoiceNumber: string;

  @ApiProperty({ example: 'SINV-2025-00456' })
  @Column({ name: 'supplier_invoice_number', type: 'varchar', length: 100, nullable: true })
  supplierInvoiceNumber?: string;

  @ApiProperty({ enum: InvoiceType })
  @Column({ type: 'enum', enum: InvoiceType, default: InvoiceType.STANDARD })
  type: InvoiceType;

  @ApiProperty({ enum: InvoiceStatus })
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.RECEIVED })
  status: InvoiceStatus;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ApiProperty({ example: 'Dell Technologies' })
  @Column({ name: 'supplier_name', type: 'varchar', length: 300 })
  supplierName: string;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId?: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId?: string;

  @ApiProperty({ example: 42500.0 })
  @Column({ name: 'subtotal', type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @ApiProperty({ example: 3400.0 })
  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @ApiProperty({ example: 45900.0 })
  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @ApiProperty({ example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'received_date', type: 'timestamptz', nullable: true })
  receivedDate?: Date;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate?: Date;

  @ApiProperty({ example: 'Net 30' })
  @Column({ name: 'payment_terms', type: 'varchar', length: 100, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'cost_center', type: 'varchar', length: 100, nullable: true })
  costCenter?: string;

  @Column({ name: 'gl_account', type: 'varchar', length: 50, nullable: true })
  glAccount?: string;

  @Column({ name: 'line_items', type: 'jsonb', nullable: true })
  lineItems?: Record<string, unknown>[];

  @Column({ name: 'ocr_data', type: 'jsonb', nullable: true })
  ocrData?: Record<string, unknown>;

  @Column({ name: 'ocr_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  ocrConfidence?: number;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;

  @Column({ name: 'exception_reason', type: 'text', nullable: true })
  exceptionReason?: string;

  @Column({ name: 'erp_sync_id', type: 'varchar', length: 200, nullable: true })
  erpSyncId?: string;

  @ApiProperty({ type: () => [ThreeWayMatch] })
  @OneToMany(() => ThreeWayMatch, (match) => match.invoice)
  matchResults: ThreeWayMatch[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
