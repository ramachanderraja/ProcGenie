import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Agent } from './agent.entity';

export enum AgentTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  AWAITING_APPROVAL = 'awaiting_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum AgentTaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('agent_tasks')
@Index(['agentId', 'status'])
@Index(['status', 'tenantId'])
@Index(['entityType', 'entityId'])
export class AgentTask extends BaseEntity {
  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ApiProperty({ example: 'Analyze contract for risk clauses' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: AgentTaskStatus })
  @Column({ type: 'enum', enum: AgentTaskStatus, default: AgentTaskStatus.PENDING })
  status: AgentTaskStatus;

  @ApiProperty({ enum: AgentTaskPriority })
  @Column({ type: 'enum', enum: AgentTaskPriority, default: AgentTaskPriority.MEDIUM })
  priority: AgentTaskPriority;

  @ApiProperty({ example: 'contract', description: 'Type of entity this task operates on' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  input?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  output?: Record<string, unknown>;

  @ApiProperty({ example: 92.5, description: 'AI confidence score for this task result' })
  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore?: number;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ name: 'execution_time_ms', type: 'integer', nullable: true })
  executionTimeMs?: number;

  @Column({ name: 'tokens_used', type: 'integer', nullable: true })
  tokensUsed?: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'integer', default: 3 })
  maxRetries: number;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @ManyToOne(() => Agent, (agent) => agent.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
