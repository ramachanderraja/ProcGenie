import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Bid } from './bid.entity';
import { EvaluationCriteria } from './evaluation-criteria.entity';

export enum SourcingStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  BIDDING_OPEN = 'bidding_open',
  BIDDING_CLOSED = 'bidding_closed',
  EVALUATION = 'evaluation',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum SourcingType {
  RFP = 'rfp',
  RFQ = 'rfq',
  RFI = 'rfi',
  REVERSE_AUCTION = 'reverse_auction',
  SEALED_BID = 'sealed_bid',
  MULTI_ROUND = 'multi_round',
}

@Entity('sourcing_projects')
@Index(['status', 'tenantId'])
@Index(['projectNumber'], { unique: true })
export class SourcingProject extends BaseEntity {
  @ApiProperty({ example: 'SRC-2025-001234' })
  @Column({ name: 'project_number', type: 'varchar', length: 50, unique: true })
  projectNumber: string;

  @ApiProperty({ example: 'IT Hardware Sourcing - Q2 2025' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @ApiProperty({ example: 'Strategic sourcing event for enterprise laptop fleet renewal' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: SourcingType })
  @Column({ type: 'enum', enum: SourcingType })
  type: SourcingType;

  @ApiProperty({ enum: SourcingStatus })
  @Column({ type: 'enum', enum: SourcingStatus, default: SourcingStatus.DRAFT })
  status: SourcingStatus;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId?: string;

  @Column({ name: 'category', type: 'varchar', length: 200, nullable: true })
  category?: string;

  @ApiProperty({ example: 500000.0 })
  @Column({ name: 'estimated_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedValue?: number;

  @ApiProperty({ example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'bid_start_date', type: 'timestamptz', nullable: true })
  bidStartDate?: Date;

  @Column({ name: 'bid_end_date', type: 'timestamptz', nullable: true })
  bidEndDate?: Date;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'invited_suppliers', type: 'jsonb', nullable: true })
  invitedSuppliers?: string[];

  @ApiProperty({ example: true })
  @Column({ name: 'is_sealed', type: 'boolean', default: false })
  isSealed: boolean;

  @Column({ name: 'award_criteria', type: 'jsonb', nullable: true })
  awardCriteria?: Record<string, unknown>;

  @ApiProperty({ type: () => [Bid] })
  @OneToMany(() => Bid, (bid) => bid.sourcingProject, { cascade: true })
  bids: Bid[];

  @ApiProperty({ type: () => [EvaluationCriteria] })
  @OneToMany(() => EvaluationCriteria, (criteria) => criteria.sourcingProject, { cascade: true })
  evaluationCriteria: EvaluationCriteria[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
