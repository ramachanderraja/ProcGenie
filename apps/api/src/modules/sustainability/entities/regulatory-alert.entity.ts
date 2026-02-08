import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('regulatory_alerts')
@Index(['severity', 'status', 'tenantId'])
@Index(['supplierId', 'tenantId'])
export class RegulatoryAlert extends BaseEntity {
  @ApiProperty({ example: 'CSRD Compliance Deadline Approaching' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: AlertSeverity })
  @Column({ type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @ApiProperty({ enum: AlertStatus })
  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.NEW })
  status: AlertStatus;

  @ApiProperty({ example: 'CSRD', description: 'Regulation identifier' })
  @Column({ name: 'regulation_name', type: 'varchar', length: 200 })
  regulationName: string;

  @Column({ name: 'regulation_body', type: 'varchar', length: 200, nullable: true })
  regulationBody?: string;

  @Column({ name: 'jurisdiction', type: 'varchar', length: 200, nullable: true })
  jurisdiction?: string;

  @Column({ name: 'compliance_deadline', type: 'date', nullable: true })
  complianceDeadline?: Date;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId?: string;

  @Column({ name: 'supplier_name', type: 'varchar', length: 300, nullable: true })
  supplierName?: string;

  @Column({ name: 'affected_categories', type: 'text', array: true, nullable: true })
  affectedCategories?: string[];

  @Column({ name: 'required_actions', type: 'jsonb', nullable: true })
  requiredActions?: Record<string, unknown>[];

  @Column({ name: 'impact_assessment', type: 'text', nullable: true })
  impactAssessment?: string;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo?: string;

  @Column({ name: 'acknowledged_at', type: 'timestamptz', nullable: true })
  acknowledgedAt?: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
