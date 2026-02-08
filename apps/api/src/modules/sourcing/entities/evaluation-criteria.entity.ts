import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SourcingProject } from './sourcing-project.entity';

export enum CriteriaCategory {
  TECHNICAL = 'technical',
  COMMERCIAL = 'commercial',
  QUALITY = 'quality',
  DELIVERY = 'delivery',
  SUSTAINABILITY = 'sustainability',
  RISK = 'risk',
}

@Entity('evaluation_criteria')
@Index(['sourcingProjectId'])
export class EvaluationCriteria extends BaseEntity {
  @ApiProperty({ example: 'Technical Capability' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: CriteriaCategory })
  @Column({ type: 'enum', enum: CriteriaCategory })
  category: CriteriaCategory;

  @ApiProperty({ example: 30, description: 'Weight as percentage (0-100)' })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @ApiProperty({ example: 100, description: 'Maximum possible score' })
  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2, default: 100 })
  maxScore: number;

  @ApiProperty({ example: true })
  @Column({ name: 'is_mandatory', type: 'boolean', default: false })
  isMandatory: boolean;

  @ApiProperty({ example: 60, description: 'Minimum acceptable score' })
  @Column({ name: 'minimum_threshold', type: 'decimal', precision: 5, scale: 2, nullable: true })
  minimumThreshold?: number;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'sourcing_project_id', type: 'uuid' })
  sourcingProjectId: string;

  @ManyToOne(() => SourcingProject, (project) => project.evaluationCriteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourcing_project_id' })
  sourcingProject: SourcingProject;
}
