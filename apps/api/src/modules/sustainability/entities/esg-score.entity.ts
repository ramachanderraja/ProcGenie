import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum EsgCategory {
  ENVIRONMENTAL = 'environmental',
  SOCIAL = 'social',
  GOVERNANCE = 'governance',
}

@Entity('esg_scores')
@Index(['supplierId', 'tenantId'])
@Index(['category', 'tenantId'])
export class EsgScore extends BaseEntity {
  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ApiProperty({ example: 'Dell Technologies' })
  @Column({ name: 'supplier_name', type: 'varchar', length: 300 })
  supplierName: string;

  @ApiProperty({ enum: EsgCategory })
  @Column({ type: 'enum', enum: EsgCategory })
  category: EsgCategory;

  @ApiProperty({ example: 85.5, description: 'Overall ESG score (0-100)' })
  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @ApiProperty({ example: 82.0 })
  @Column({ name: 'environmental_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  environmentalScore?: number;

  @ApiProperty({ example: 88.0 })
  @Column({ name: 'social_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  socialScore?: number;

  @ApiProperty({ example: 90.0 })
  @Column({ name: 'governance_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  governanceScore?: number;

  @Column({ name: 'assessment_date', type: 'date' })
  assessmentDate: Date;

  @Column({ name: 'next_assessment_date', type: 'date', nullable: true })
  nextAssessmentDate?: Date;

  @ApiProperty({ example: 'A', description: 'ESG rating grade (A+ to F)' })
  @Column({ name: 'rating_grade', type: 'varchar', length: 5, nullable: true })
  ratingGrade?: string;

  @Column({ name: 'certifications', type: 'text', array: true, nullable: true })
  certifications?: string[];

  @Column({ name: 'risk_factors', type: 'jsonb', nullable: true })
  riskFactors?: Record<string, unknown>[];

  @Column({ name: 'improvement_areas', type: 'jsonb', nullable: true })
  improvementAreas?: Record<string, unknown>[];

  @Column({ name: 'data_source', type: 'varchar', length: 200, nullable: true })
  dataSource?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
