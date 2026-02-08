import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum GoodsReceiptStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETE = 'complete',
  REJECTED = 'rejected',
}

@Entity('goods_receipts')
@Index(['purchaseOrderId', 'tenantId'])
export class GoodsReceipt extends BaseEntity {
  @ApiProperty({ example: 'GR-2025-001234' })
  @Column({ name: 'receipt_number', type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId: string;

  @ApiProperty({ enum: GoodsReceiptStatus })
  @Column({ type: 'enum', enum: GoodsReceiptStatus, default: GoodsReceiptStatus.PENDING })
  status: GoodsReceiptStatus;

  @Column({ name: 'received_date', type: 'date' })
  receivedDate: Date;

  @Column({ name: 'received_by', type: 'uuid' })
  receivedBy: string;

  @ApiProperty({ description: 'Line items received with quantities' })
  @Column({ name: 'received_items', type: 'jsonb' })
  receivedItems: Record<string, unknown>[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'delivery_note_number', type: 'varchar', length: 100, nullable: true })
  deliveryNoteNumber?: string;

  @Column({ name: 'quality_check_passed', type: 'boolean', default: true })
  qualityCheckPassed: boolean;
}
