import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Integration } from './integration.entity';

export enum SyncJobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export enum SyncDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  BIDIRECTIONAL = 'bidirectional',
}

@Entity('sync_jobs')
@Index(['integrationId', 'status'])
@Index(['status', 'tenantId'])
export class SyncJob extends BaseEntity {
  @Column({ name: 'integration_id', type: 'uuid' })
  integrationId: string;

  @ApiProperty({ enum: SyncJobStatus })
  @Column({ type: 'enum', enum: SyncJobStatus, default: SyncJobStatus.QUEUED })
  status: SyncJobStatus;

  @ApiProperty({ enum: SyncDirection })
  @Column({ type: 'enum', enum: SyncDirection })
  direction: SyncDirection;

  @ApiProperty({ example: 'purchase_orders', description: 'Entity type being synced' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType: string;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @ApiProperty({ example: 150 })
  @Column({ name: 'total_records', type: 'integer', default: 0 })
  totalRecords: number;

  @ApiProperty({ example: 148 })
  @Column({ name: 'processed_records', type: 'integer', default: 0 })
  processedRecords: number;

  @ApiProperty({ example: 2 })
  @Column({ name: 'failed_records', type: 'integer', default: 0 })
  failedRecords: number;

  @Column({ name: 'error_log', type: 'jsonb', nullable: true })
  errorLog?: Record<string, unknown>[];

  @Column({ name: 'trigger_type', type: 'varchar', length: 50, nullable: true })
  triggerType?: string;

  @Column({ name: 'triggered_by', type: 'uuid', nullable: true })
  triggeredBy?: string;

  @ManyToOne(() => Integration, (integration) => integration.syncJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integration_id' })
  integration: Integration;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
