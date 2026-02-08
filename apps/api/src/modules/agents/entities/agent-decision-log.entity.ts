import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum DecisionOutcome {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  DEFERRED = 'deferred',
}

@Entity('agent_decision_logs')
@Index(['agentId', 'tenantId'])
@Index(['taskId'])
@Index(['decisionType', 'tenantId'])
export class AgentDecisionLog extends BaseEntity {
  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId?: string;

  @ApiProperty({ example: 'risk_assessment', description: 'Type of decision made' })
  @Column({ name: 'decision_type', type: 'varchar', length: 100 })
  decisionType: string;

  @ApiProperty({ enum: DecisionOutcome })
  @Column({ type: 'enum', enum: DecisionOutcome })
  outcome: DecisionOutcome;

  @ApiProperty({ example: 'Contract flagged for high-risk auto-renewal clause' })
  @Column({ type: 'text' })
  reasoning: string;

  @ApiProperty({ example: 87.5, description: 'Confidence in the decision' })
  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2 })
  confidenceScore: number;

  @Column({ type: 'jsonb', nullable: true })
  context?: Record<string, unknown>;

  @Column({ name: 'alternatives_considered', type: 'jsonb', nullable: true })
  alternativesConsidered?: Record<string, unknown>[];

  @Column({ name: 'entity_type', type: 'varchar', length: 100, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @ApiProperty({ example: false, description: 'Whether a human reviewed this decision' })
  @Column({ name: 'human_reviewed', type: 'boolean', default: false })
  humanReviewed: boolean;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'human_override', type: 'boolean', default: false })
  humanOverride: boolean;

  @Column({ name: 'override_reason', type: 'text', nullable: true })
  overrideReason?: string;

  @Column({ name: 'execution_time_ms', type: 'integer', nullable: true })
  executionTimeMs?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
