import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LineItem } from './line-item.entity';

export enum PoStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_TO_SUPPLIER = 'sent_to_supplier',
  ACKNOWLEDGED = 'acknowledged',
  PARTIALLY_RECEIVED = 'partially_received',
  FULLY_RECEIVED = 'fully_received',
  INVOICED = 'invoiced',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
@Index(['poNumber'], { unique: true })
@Index(['status', 'tenantId'])
@Index(['supplierId', 'tenantId'])
export class PurchaseOrder extends BaseEntity {
  @ApiProperty({ example: 'PO-2025-001234' })
  @Column({ name: 'po_number', type: 'varchar', length: 50, unique: true })
  poNumber: string;

  @ApiProperty({ example: 'Laptops for Engineering' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @ApiProperty({ enum: PoStatus })
  @Column({ type: 'enum', enum: PoStatus, default: PoStatus.DRAFT })
  status: PoStatus;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId?: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId?: string;

  @ApiProperty({ example: 45000.0 })
  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty({ example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({ example: 'Net 30' })
  @Column({ name: 'payment_terms', type: 'varchar', length: 100, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'shipping_address', type: 'text', nullable: true })
  shippingAddress?: string;

  @Column({ name: 'billing_address', type: 'text', nullable: true })
  billingAddress?: string;

  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'cost_center', type: 'varchar', length: 100, nullable: true })
  costCenter?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'erp_sync_id', type: 'varchar', length: 200, nullable: true })
  erpSyncId?: string;

  @ApiProperty({ type: () => [LineItem] })
  @OneToMany(() => LineItem, (item) => item.purchaseOrder, { cascade: true, eager: true })
  lineItems: LineItem[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
