import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Contract } from './contract.entity';

export enum AmendmentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  REJECTED = 'rejected',
}

@Entity('contract_amendments')
export class Amendment extends BaseEntity {
  @ApiProperty({ example: 'AMD-001' })
  @Column({ name: 'amendment_number', type: 'varchar', length: 50 })
  amendmentNumber: string;

  @ApiProperty({ example: 'Price Adjustment for Q2 2025' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: AmendmentStatus })
  @Column({ type: 'enum', enum: AmendmentStatus, default: AmendmentStatus.DRAFT })
  status: AmendmentStatus;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @ApiProperty({ description: 'Changes from the amendment' })
  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, unknown>;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.amendments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}
