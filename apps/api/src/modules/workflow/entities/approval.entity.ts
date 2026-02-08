import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELEGATED = 'delegated',
  ESCALATED = 'escalated',
  EXPIRED = 'expired',
}

export enum ApprovalEntityType {
  REQUEST = 'request',
  PURCHASE_ORDER = 'purchase_order',
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  SUPPLIER = 'supplier',
  CHANGE_ORDER = 'change_order',
}

@Entity('approvals')
@Index(['entityType', 'entityId', 'tenantId'])
@Index(['approverId', 'status'])
export class Approval extends BaseEntity {
  @ApiProperty({ enum: ApprovalEntityType })
  @Column({ name: 'entity_type', type: 'enum', enum: ApprovalEntityType })
  entityType: ApprovalEntityType;

  @ApiProperty({ description: 'ID of the entity being approved' })
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @ApiProperty({ description: 'Workflow step that triggered this approval' })
  @Column({ name: 'workflow_step_id', type: 'uuid', nullable: true })
  workflowStepId?: string;

  @ApiProperty({ description: 'User ID of the approver' })
  @Column({ name: 'approver_id', type: 'uuid' })
  approverId: string;

  @ApiProperty({ enum: ApprovalStatus })
  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @ApiProperty({ example: 'Approved - within budget and preferred supplier' })
  @Column({ type: 'text', nullable: true })
  comments?: string;

  @ApiProperty({ description: 'User ID if approval was delegated' })
  @Column({ name: 'delegated_to', type: 'uuid', nullable: true })
  delegatedTo?: string;

  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
  decidedAt?: Date;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @ApiProperty({ example: 1 })
  @Column({ name: 'approval_level', type: 'integer', default: 1 })
  approvalLevel: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
