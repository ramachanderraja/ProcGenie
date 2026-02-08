import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RequestItem } from './request-item.entity';

export enum RequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  AI_ANALYZING = 'ai_analyzing',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_SOURCING = 'in_sourcing',
  PO_CREATED = 'po_created',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RequestCategory {
  GOODS = 'goods',
  SERVICES = 'services',
  SOFTWARE = 'software',
  CAPEX = 'capex',
  MRO = 'mro',
  TRAVEL = 'travel',
  CONTINGENT_LABOR = 'contingent_labor',
  OTHER = 'other',
}

@Entity('requests')
@Index(['status', 'tenantId'])
@Index(['requesterId', 'tenantId'])
export class Request extends BaseEntity {
  @ApiProperty({ example: 'REQ-2025-001234' })
  @Column({ name: 'request_number', type: 'varchar', length: 50, unique: true })
  requestNumber: string;

  @ApiProperty({ example: 'New office laptops for engineering team' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @ApiProperty({ example: 'Need 15 high-performance laptops for new engineering hires starting Q2' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: RequestStatus })
  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.DRAFT })
  status: RequestStatus;

  @ApiProperty({ enum: RequestPriority })
  @Column({ type: 'enum', enum: RequestPriority, default: RequestPriority.MEDIUM })
  priority: RequestPriority;

  @ApiProperty({ enum: RequestCategory })
  @Column({ type: 'enum', enum: RequestCategory })
  category: RequestCategory;

  @ApiProperty({ example: 45000.0 })
  @Column({ name: 'estimated_total', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedTotal: number;

  @ApiProperty({ example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({ example: 'IT Department' })
  @Column({ name: 'cost_center', type: 'varchar', length: 100, nullable: true })
  costCenter?: string;

  @ApiProperty({ example: '5100' })
  @Column({ name: 'gl_account', type: 'varchar', length: 50, nullable: true })
  glAccount?: string;

  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  @ApiProperty({ example: '2025-03-15' })
  @Column({ name: 'needed_by_date', type: 'date', nullable: true })
  neededByDate?: Date;

  @ApiProperty({ description: 'AI-generated analysis and recommendations', nullable: true })
  @Column({ name: 'ai_analysis', type: 'jsonb', nullable: true })
  aiAnalysis?: Record<string, unknown>;

  @ApiProperty({ description: 'AI confidence score (0-100)', example: 85 })
  @Column({ name: 'ai_confidence_score', type: 'integer', nullable: true })
  aiConfidenceScore?: number;

  @ApiProperty({ description: 'AI-suggested category', nullable: true })
  @Column({ name: 'ai_suggested_category', type: 'varchar', length: 100, nullable: true })
  aiSuggestedCategory?: string;

  @ApiProperty({ description: 'AI-suggested suppliers as JSON array', nullable: true })
  @Column({ name: 'ai_suggested_suppliers', type: 'jsonb', nullable: true })
  aiSuggestedSuppliers?: Record<string, unknown>[];

  @ApiProperty({ type: () => [RequestItem] })
  @OneToMany(() => RequestItem, (item) => item.request, {
    cascade: true,
    eager: true,
  })
  items: RequestItem[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
  attachments?: string[];
}
