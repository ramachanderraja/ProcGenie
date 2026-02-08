import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SupplierDocument } from './supplier-document.entity';
import { PerformanceScore } from './performance-score.entity';

export enum SupplierStatus {
  PROSPECT = 'prospect',
  ONBOARDING = 'onboarding',
  ACTIVE = 'active',
  UNDER_REVIEW = 'under_review',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  INACTIVE = 'inactive',
}

export enum SupplierTier {
  STRATEGIC = 'strategic',
  PREFERRED = 'preferred',
  APPROVED = 'approved',
  CONDITIONAL = 'conditional',
  PROBATIONARY = 'probationary',
}

@Entity('suppliers')
@Index(['status', 'tenantId'])
@Index(['tier', 'tenantId'])
export class Supplier extends BaseEntity {
  @ApiProperty({ example: 'SUP-001234' })
  @Column({ name: 'supplier_code', type: 'varchar', length: 50, unique: true })
  supplierCode: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @Column({ name: 'company_name', type: 'varchar', length: 300 })
  companyName: string;

  @ApiProperty({ example: 'Dell Technologies' })
  @Column({ name: 'legal_name', type: 'varchar', length: 300, nullable: true })
  legalName?: string;

  @ApiProperty({ example: '12-3456789' })
  @Column({ name: 'tax_id', type: 'varchar', length: 50, nullable: true })
  taxId?: string;

  @ApiProperty({ example: 'US-1234567' })
  @Column({ name: 'duns_number', type: 'varchar', length: 20, nullable: true })
  dunsNumber?: string;

  @ApiProperty({ enum: SupplierStatus })
  @Column({ type: 'enum', enum: SupplierStatus, default: SupplierStatus.PROSPECT })
  status: SupplierStatus;

  @ApiProperty({ enum: SupplierTier })
  @Column({ type: 'enum', enum: SupplierTier, default: SupplierTier.APPROVED })
  tier: SupplierTier;

  @Column({ type: 'varchar', length: 200, nullable: true })
  industry?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website?: string;

  // Primary Contact
  @Column({ name: 'contact_name', type: 'varchar', length: 200, nullable: true })
  contactName?: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail?: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true })
  contactPhone?: string;

  // Address
  @Column({ name: 'address_line1', type: 'varchar', length: 300, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', type: 'varchar', length: 300, nullable: true })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  // Financial
  @Column({ name: 'payment_terms', type: 'varchar', length: 100, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'bank_account', type: 'jsonb', nullable: true })
  bankAccount?: Record<string, unknown>;

  // Categories
  @Column({ type: 'text', array: true, nullable: true })
  categories?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  certifications?: string[];

  @ApiProperty({ example: 85.5 })
  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore?: number;

  @Column({ name: 'onboarding_completed_at', type: 'timestamptz', nullable: true })
  onboardingCompletedAt?: Date;

  @Column({ name: 'last_assessment_date', type: 'date', nullable: true })
  lastAssessmentDate?: Date;

  @ApiProperty({ type: () => [SupplierDocument] })
  @OneToMany(() => SupplierDocument, (doc) => doc.supplier)
  documents: SupplierDocument[];

  @ApiProperty({ type: () => [PerformanceScore] })
  @OneToMany(() => PerformanceScore, (score) => score.supplier)
  performanceScores: PerformanceScore[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
