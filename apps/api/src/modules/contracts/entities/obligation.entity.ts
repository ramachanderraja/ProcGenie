import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Contract } from './contract.entity';

export enum ObligationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  WAIVED = 'waived',
}

export enum ObligationType {
  PAYMENT = 'payment',
  DELIVERY = 'delivery',
  REPORTING = 'reporting',
  COMPLIANCE = 'compliance',
  RENEWAL = 'renewal',
  NOTICE = 'notice',
  OTHER = 'other',
}

@Entity('contract_obligations')
@Index(['contractId', 'status'])
@Index(['dueDate', 'status'])
export class Obligation extends BaseEntity {
  @ApiProperty({ example: 'Quarterly performance report submission' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: ObligationType })
  @Column({ type: 'enum', enum: ObligationType })
  type: ObligationType;

  @ApiProperty({ enum: ObligationStatus })
  @Column({ type: 'enum', enum: ObligationStatus, default: ObligationStatus.PENDING })
  status: ObligationStatus;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate?: Date;

  @ApiProperty({ example: 'buyer', description: 'Which party owns this obligation' })
  @Column({ name: 'responsible_party', type: 'varchar', length: 50 })
  responsibleParty: string;

  @Column({ name: 'assignee_id', type: 'uuid', nullable: true })
  assigneeId?: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_pattern', type: 'varchar', length: 100, nullable: true })
  recurrencePattern?: string;

  @Column({ name: 'reminder_days_before', type: 'integer', nullable: true })
  reminderDaysBefore?: number;

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.obligations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}
