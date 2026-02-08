import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Workflow } from './workflow.entity';

export enum StepType {
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  CONDITION = 'condition',
  PARALLEL = 'parallel',
  ESCALATION = 'escalation',
  AI_REVIEW = 'ai_review',
}

@Entity('workflow_steps')
export class WorkflowStep extends BaseEntity {
  @ApiProperty({ example: 'Manager Approval' })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({ enum: StepType })
  @Column({ type: 'enum', enum: StepType })
  type: StepType;

  @ApiProperty({ example: 1 })
  @Column({ name: 'step_order', type: 'integer' })
  stepOrder: number;

  @ApiProperty({ description: 'Approver user IDs or role names' })
  @Column({ type: 'jsonb', nullable: true })
  approvers?: Record<string, unknown>;

  @ApiProperty({ description: 'Conditions for this step to execute' })
  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, unknown>;

  @ApiProperty({ example: 48, description: 'SLA in hours' })
  @Column({ name: 'sla_hours', type: 'integer', nullable: true })
  slaHours?: number;

  @ApiProperty({ example: true })
  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ name: 'workflow_id', type: 'uuid' })
  workflowId: string;

  @ManyToOne(() => Workflow, (workflow) => workflow.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;
}
