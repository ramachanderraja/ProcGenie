import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Supplier } from './supplier.entity';

export enum DocumentType {
  CERTIFICATE = 'certificate',
  INSURANCE = 'insurance',
  FINANCIAL_STATEMENT = 'financial_statement',
  TAX_DOCUMENT = 'tax_document',
  COMPLIANCE = 'compliance',
  NDA = 'nda',
  CONTRACT = 'contract',
  OTHER = 'other',
}

@Entity('supplier_documents')
export class SupplierDocument extends BaseEntity {
  @ApiProperty({ example: 'ISO 9001 Certificate' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ enum: DocumentType })
  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'integer', nullable: true })
  fileSize?: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType?: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;
}
