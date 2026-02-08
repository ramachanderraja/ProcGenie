import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Invoice } from './invoice.entity';

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  PARTIAL_MATCH = 'partial_match',
  EXCEPTION = 'exception',
  OVERRIDE = 'override',
}

export enum MatchType {
  TWO_WAY = 'two_way',
  THREE_WAY = 'three_way',
}

@Entity('three_way_matches')
@Index(['invoiceId'])
@Index(['matchStatus', 'tenantId'])
export class ThreeWayMatch extends BaseEntity {
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId: string;

  @Column({ name: 'goods_receipt_id', type: 'uuid', nullable: true })
  goodsReceiptId?: string;

  @ApiProperty({ enum: MatchType })
  @Column({ name: 'match_type', type: 'enum', enum: MatchType, default: MatchType.THREE_WAY })
  matchType: MatchType;

  @ApiProperty({ enum: MatchStatus })
  @Column({ name: 'match_status', type: 'enum', enum: MatchStatus, default: MatchStatus.PENDING })
  matchStatus: MatchStatus;

  @ApiProperty({ example: true, description: 'Whether PO amount matches invoice' })
  @Column({ name: 'po_amount_match', type: 'boolean', default: false })
  poAmountMatch: boolean;

  @ApiProperty({ example: true, description: 'Whether GR quantity matches invoice' })
  @Column({ name: 'gr_quantity_match', type: 'boolean', default: false })
  grQuantityMatch: boolean;

  @ApiProperty({ example: true, description: 'Whether invoice amount matches PO' })
  @Column({ name: 'invoice_amount_match', type: 'boolean', default: false })
  invoiceAmountMatch: boolean;

  @Column({ name: 'po_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  poAmount?: number;

  @Column({ name: 'gr_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  grAmount?: number;

  @Column({ name: 'invoice_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  invoiceAmount?: number;

  @ApiProperty({ example: 2.5, description: 'Variance percentage' })
  @Column({ name: 'variance_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  variancePercentage?: number;

  @ApiProperty({ example: 5.0, description: 'Configured tolerance percentage' })
  @Column({ name: 'tolerance_percentage', type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  tolerancePercentage: number;

  @Column({ name: 'exception_details', type: 'jsonb', nullable: true })
  exceptionDetails?: Record<string, unknown>;

  @Column({ name: 'override_by', type: 'uuid', nullable: true })
  overrideBy?: string;

  @Column({ name: 'override_reason', type: 'text', nullable: true })
  overrideReason?: string;

  @Column({ name: 'matched_at', type: 'timestamptz', nullable: true })
  matchedAt?: Date;

  @ManyToOne(() => Invoice, (invoice) => invoice.matchResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
