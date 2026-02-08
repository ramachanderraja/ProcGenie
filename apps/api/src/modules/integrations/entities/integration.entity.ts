import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SyncJob } from './sync-job.entity';

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CONFIGURING = 'configuring',
  SUSPENDED = 'suspended',
}

export enum IntegrationType {
  ERP = 'erp',
  CRM = 'crm',
  ACCOUNTING = 'accounting',
  HR = 'hr',
  SUPPLIER_NETWORK = 'supplier_network',
  PAYMENT = 'payment',
  DOCUMENT_MANAGEMENT = 'document_management',
  E_SIGNATURE = 'e_signature',
  ANALYTICS = 'analytics',
  CUSTOM = 'custom',
}

@Entity('integrations')
@Index(['status', 'tenantId'])
@Index(['type', 'tenantId'])
export class Integration extends BaseEntity {
  @ApiProperty({ example: 'SAP S/4HANA' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ example: 'ERP integration for PO and invoice sync' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: IntegrationType })
  @Column({ type: 'enum', enum: IntegrationType })
  type: IntegrationType;

  @ApiProperty({ enum: IntegrationStatus })
  @Column({ type: 'enum', enum: IntegrationStatus, default: IntegrationStatus.CONFIGURING })
  status: IntegrationStatus;

  @ApiProperty({ example: 'sap_s4hana' })
  @Column({ name: 'connector_id', type: 'varchar', length: 100 })
  connectorId: string;

  @Column({ name: 'api_endpoint', type: 'varchar', length: 500, nullable: true })
  apiEndpoint?: string;

  @Column({ name: 'auth_config', type: 'jsonb', nullable: true })
  authConfig?: Record<string, unknown>;

  @Column({ name: 'field_mappings', type: 'jsonb', nullable: true })
  fieldMappings?: Record<string, unknown>;

  @Column({ name: 'sync_frequency', type: 'varchar', length: 50, nullable: true })
  syncFrequency?: string;

  @Column({ name: 'last_sync_at', type: 'timestamptz', nullable: true })
  lastSyncAt?: Date;

  @Column({ name: 'last_sync_status', type: 'varchar', length: 50, nullable: true })
  lastSyncStatus?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'records_synced', type: 'integer', default: 0 })
  recordsSynced: number;

  @Column({ name: 'webhook_url', type: 'varchar', length: 500, nullable: true })
  webhookUrl?: string;

  @Column({ name: 'webhook_secret', type: 'varchar', length: 255, nullable: true })
  webhookSecret?: string;

  @ApiProperty({ type: () => [SyncJob] })
  @OneToMany(() => SyncJob, (job) => job.integration)
  syncJobs: SyncJob[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
