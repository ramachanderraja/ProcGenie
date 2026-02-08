import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { WorkflowStep } from './workflow-step.entity';

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export enum WorkflowType {
  APPROVAL = 'approval',
  REVIEW = 'review',
  SOURCING = 'sourcing',
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  SUPPLIER_ONBOARDING = 'supplier_onboarding',
  CHANGE_ORDER = 'change_order',
}

@Entity('workflows')
@Index(['type', 'status', 'tenantId'])
export class Workflow extends BaseEntity {
  @ApiProperty({ example: 'Standard PO Approval Workflow' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ example: 'Multi-level approval workflow for purchase orders above $10,000' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: WorkflowType })
  @Column({ type: 'enum', enum: WorkflowType })
  type: WorkflowType;

  @ApiProperty({ enum: WorkflowStatus })
  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.DRAFT })
  status: WorkflowStatus;

  @ApiProperty({ example: 1 })
  @Column({ type: 'integer', default: 1 })
  version: number;

  @ApiProperty({ description: 'Conditions that trigger this workflow' })
  @Column({ name: 'trigger_conditions', type: 'jsonb', nullable: true })
  triggerConditions?: Record<string, unknown>;

  @ApiProperty({ description: 'Escalation rules configuration' })
  @Column({ name: 'escalation_rules', type: 'jsonb', nullable: true })
  escalationRules?: Record<string, unknown>;

  @ApiProperty({ type: () => [WorkflowStep] })
  @OneToMany(() => WorkflowStep, (step) => step.workflow, { cascade: true, eager: true })
  steps: WorkflowStep[];
}
