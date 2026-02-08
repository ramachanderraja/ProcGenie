import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SourcingProject } from './sourcing-project.entity';

export enum BidStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_EVALUATION = 'under_evaluation',
  SHORTLISTED = 'shortlisted',
  AWARDED = 'awarded',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('bids')
@Index(['sourcingProjectId', 'supplierId'])
@Index(['status', 'tenantId'])
export class Bid extends BaseEntity {
  @ApiProperty({ example: 'BID-2025-001234' })
  @Column({ name: 'bid_number', type: 'varchar', length: 50, unique: true })
  bidNumber: string;

  @Column({ name: 'sourcing_project_id', type: 'uuid' })
  sourcingProjectId: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ApiProperty({ example: 'Dell Technologies' })
  @Column({ name: 'supplier_name', type: 'varchar', length: 300 })
  supplierName: string;

  @ApiProperty({ enum: BidStatus })
  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.DRAFT })
  status: BidStatus;

  @ApiProperty({ example: 425000.0 })
  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @ApiProperty({ example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'technical_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  technicalScore?: number;

  @Column({ name: 'commercial_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  commercialScore?: number;

  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore?: number;

  @Column({ name: 'delivery_timeline', type: 'varchar', length: 200, nullable: true })
  deliveryTimeline?: string;

  @Column({ name: 'payment_terms', type: 'varchar', length: 200, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'warranty_terms', type: 'varchar', length: 500, nullable: true })
  warrantyTerms?: string;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'line_items', type: 'jsonb', nullable: true })
  lineItems?: Record<string, unknown>[];

  @Column({ name: 'documents', type: 'text', array: true, nullable: true })
  documents?: string[];

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'evaluator_comments', type: 'jsonb', nullable: true })
  evaluatorComments?: Record<string, unknown>[];

  @ManyToOne(() => SourcingProject, (project) => project.bids, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourcing_project_id' })
  sourcingProject: SourcingProject;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
