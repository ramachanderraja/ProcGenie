import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Contract } from './contract.entity';

export enum ClauseRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('contract_clauses')
@Index(['contractId'])
@Index(['clauseType'])
export class Clause extends BaseEntity {
  @ApiProperty({ example: 'Limitation of Liability' })
  @Column({ name: 'clause_type', type: 'varchar', length: 200 })
  clauseType: string;

  @ApiProperty({ example: 'Section 8.1 - Limitation of Liability' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @ApiProperty({ description: 'Full text of the clause' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: 8 })
  @Column({ name: 'section_number', type: 'varchar', length: 20, nullable: true })
  sectionNumber?: string;

  @ApiProperty({ enum: ClauseRiskLevel })
  @Column({ name: 'risk_level', type: 'enum', enum: ClauseRiskLevel, default: ClauseRiskLevel.LOW })
  riskLevel: ClauseRiskLevel;

  @ApiProperty({ description: 'AI-generated analysis of this clause' })
  @Column({ name: 'ai_analysis', type: 'jsonb', nullable: true })
  aiAnalysis?: Record<string, unknown>;

  @ApiProperty({ description: 'AI-recommended modifications' })
  @Column({ name: 'ai_recommendations', type: 'text', nullable: true })
  aiRecommendations?: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_standard', type: 'boolean', default: false })
  isStandard: boolean;

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.clauses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}
