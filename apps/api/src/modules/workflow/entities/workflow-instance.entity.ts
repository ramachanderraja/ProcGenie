import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Workflow } from './workflow.entity';

export enum WorkflowInstanceStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('workflow_instances')
@Index(['entityType', 'entityId'])
@Index(['status', 'tenantId'])
@Index(['workflowDefinitionId'])
export class WorkflowInstance extends BaseEntity {
  @ApiProperty({ description: 'FK to WorkflowDefinition' })
  @Column({ name: 'workflow_definition_id', type: 'uuid' })
  workflowDefinitionId: string;

  @ApiProperty({ description: 'Snapshot of version at trigger time' })
  @Column({ name: 'definition_version', type: 'integer' })
  definitionVersion: number;

  @ApiProperty({ description: 'Entity type: REQUEST, CONTRACT, INVOICE, PURCHASE_ORDER' })
  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @ApiProperty({ description: 'ID of the entity that triggered this workflow' })
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @ApiProperty({ enum: WorkflowInstanceStatus })
  @Column({ type: 'varchar', length: 20, default: WorkflowInstanceStatus.RUNNING })
  status: WorkflowInstanceStatus;

  @ApiProperty({ description: 'Currently active node IDs (supports parallel execution)' })
  @Column({ name: 'current_step_ids', type: 'text', array: true, nullable: true })
  currentStepIds?: string[];

  @ApiProperty({ description: 'Runtime context — entity snapshot + accumulated step outputs' })
  @Column({ type: 'jsonb', nullable: true })
  context?: Record<string, unknown>;

  @ApiProperty({ description: 'Array of history entries for step execution' })
  @Column({ type: 'jsonb', nullable: true })
  history?: Record<string, unknown>[];

  @ApiProperty({ description: 'Error message if status is FAILED' })
  @Column({ type: 'text', nullable: true })
  error?: string;

  @ApiProperty({ description: 'When instance was created' })
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @ApiProperty({ description: 'When instance reached End node or was cancelled' })
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_definition_id' })
  workflowDefinition?: Workflow;
}
