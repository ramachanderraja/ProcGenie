import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SlaStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  BREACHED = 'breached',
  COMPLETED = 'completed',
}

@Entity('slas')
@Index(['entityType', 'entityId'])
@Index(['status', 'dueDate'])
export class SLA extends BaseEntity {
  @ApiProperty({ example: 'Approval SLA' })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({ example: 'request' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @ApiProperty({ example: 48 })
  @Column({ name: 'target_hours', type: 'integer' })
  targetHours: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @ApiProperty({ enum: SlaStatus })
  @Column({ type: 'enum', enum: SlaStatus, default: SlaStatus.ON_TRACK })
  status: SlaStatus;

  @ApiProperty({ example: 75.5, description: 'Percentage of SLA time elapsed' })
  @Column({ name: 'elapsed_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  elapsedPercentage: number;

  @Column({ name: 'escalation_sent', type: 'boolean', default: false })
  escalationSent: boolean;
}
