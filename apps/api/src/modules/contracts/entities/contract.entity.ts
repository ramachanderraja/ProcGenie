import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Clause } from './clause.entity';
import { Amendment } from './amendment.entity';
import { Obligation } from './obligation.entity';

export enum ContractStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  AI_ANALYZING = 'ai_analyzing',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  ACTIVE = 'active',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

export enum ContractType {
  MASTER_SERVICE_AGREEMENT = 'msa',
  PURCHASE_AGREEMENT = 'purchase_agreement',
  NDA = 'nda',
  SOW = 'sow',
  SLA = 'sla',
  FRAMEWORK = 'framework',
  LICENSE = 'license',
  LEASE = 'lease',
  AMENDMENT = 'amendment',
}

@Entity('contracts')
@Index(['status', 'tenantId'])
@Index(['supplierId', 'tenantId'])
@Index(['endDate'])
export class Contract extends BaseEntity {
  @ApiProperty({ example: 'CON-2025-001234' })
  @Column({ name: 'contract_number', type: 'varchar', length: 50, unique: true })
  contractNumber: string;

  @ApiProperty({ example: 'Master Service Agreement - Dell Technologies' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @ApiProperty({ example: 'MSA covering IT hardware procurement and support services' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: ContractType })
  @Column({ type: 'enum', enum: ContractType })
  type: ContractType;

  @ApiProperty({ enum: ContractStatus })
  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
  status: ContractStatus;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ApiProperty({ example: 500000.0 })
  @Column({ name: 'total_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalValue?: number;

  @ApiProperty({ example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'notice_period_days', type: 'integer', nullable: true })
  noticePeriodDays?: number;

  @ApiProperty({ example: true })
  @Column({ name: 'auto_renew', type: 'boolean', default: false })
  autoRenew: boolean;

  @Column({ name: 'renewal_term_months', type: 'integer', nullable: true })
  renewalTermMonths?: number;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;

  @Column({ name: 'ai_analysis', type: 'jsonb', nullable: true })
  aiAnalysis?: Record<string, unknown>;

  @ApiProperty({ example: 85.0, description: 'AI risk score 0-100' })
  @Column({ name: 'ai_risk_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiRiskScore?: number;

  @Column({ name: 'payment_terms', type: 'varchar', length: 100, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'governing_law', type: 'varchar', length: 200, nullable: true })
  governingLaw?: string;

  @ApiProperty({ type: () => [Clause] })
  @OneToMany(() => Clause, (clause) => clause.contract, { cascade: true })
  clauses: Clause[];

  @ApiProperty({ type: () => [Amendment] })
  @OneToMany(() => Amendment, (amendment) => amendment.contract)
  amendments: Amendment[];

  @ApiProperty({ type: () => [Obligation] })
  @OneToMany(() => Obligation, (obligation) => obligation.contract, { cascade: true })
  obligations: Obligation[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
