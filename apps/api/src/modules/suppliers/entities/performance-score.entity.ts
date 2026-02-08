import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Supplier } from './supplier.entity';

@Entity('supplier_performance_scores')
@Index(['supplierId', 'period'])
export class PerformanceScore extends BaseEntity {
  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.performanceScores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ApiProperty({ example: '2025-Q1' })
  @Column({ type: 'varchar', length: 20 })
  period: string;

  @ApiProperty({ example: 92.5 })
  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2 })
  qualityScore: number;

  @ApiProperty({ example: 88.0 })
  @Column({ name: 'delivery_score', type: 'decimal', precision: 5, scale: 2 })
  deliveryScore: number;

  @ApiProperty({ example: 90.0 })
  @Column({ name: 'responsiveness_score', type: 'decimal', precision: 5, scale: 2 })
  responsivenessScore: number;

  @ApiProperty({ example: 85.0 })
  @Column({ name: 'cost_score', type: 'decimal', precision: 5, scale: 2 })
  costScore: number;

  @ApiProperty({ example: 78.0 })
  @Column({ name: 'innovation_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  innovationScore?: number;

  @ApiProperty({ example: 88.5 })
  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'evaluated_by', type: 'uuid', nullable: true })
  evaluatedBy?: string;
}
