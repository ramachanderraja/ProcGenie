import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('supplier_risk_profiles')
@Index(['supplierId', 'tenantId'])
export class RiskProfile extends BaseEntity {
  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ApiProperty({ enum: RiskLevel })
  @Column({ name: 'overall_risk_level', type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  overallRiskLevel: RiskLevel;

  @ApiProperty({ example: 25.0, description: 'Risk score 0-100' })
  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2 })
  riskScore: number;

  @ApiProperty({ example: 85.0 })
  @Column({ name: 'financial_health_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  financialHealthScore?: number;

  @ApiProperty({ example: 90.0 })
  @Column({ name: 'compliance_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore?: number;

  @ApiProperty({ example: 70.0 })
  @Column({ name: 'geopolitical_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  geopoliticalScore?: number;

  @ApiProperty({ example: 80.0 })
  @Column({ name: 'cyber_security_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  cyberSecurityScore?: number;

  @ApiProperty({ example: 95.0 })
  @Column({ name: 'esg_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  esgScore?: number;

  @ApiProperty({ description: 'Identified risk factors' })
  @Column({ name: 'risk_factors', type: 'jsonb', nullable: true })
  riskFactors?: Record<string, unknown>[];

  @ApiProperty({ description: 'Recommended mitigation actions' })
  @Column({ name: 'mitigation_actions', type: 'jsonb', nullable: true })
  mitigationActions?: Record<string, unknown>[];

  @Column({ name: 'last_scan_date', type: 'timestamptz', nullable: true })
  lastScanDate?: Date;

  @Column({ name: 'next_review_date', type: 'date', nullable: true })
  nextReviewDate?: Date;

  @Column({ name: 'ai_analysis', type: 'jsonb', nullable: true })
  aiAnalysis?: Record<string, unknown>;
}
