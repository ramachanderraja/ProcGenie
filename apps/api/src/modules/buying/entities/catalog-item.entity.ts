import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('catalog_items')
@Index(['sku', 'tenantId'])
@Index(['category', 'tenantId'])
export class CatalogItem extends BaseEntity {
  @ApiProperty({ example: 'IT-LAPTOP-001' })
  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @ApiProperty({ example: 'MacBook Pro 16-inch M3 Max' })
  @Column({ type: 'varchar', length: 500 })
  name: string;

  @ApiProperty({ example: 'High-performance laptop for development work' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: 'IT Equipment' })
  @Column({ type: 'varchar', length: 200 })
  category: string;

  @ApiProperty({ example: 3000.0 })
  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @ApiProperty({ example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({ example: 'EA' })
  @Column({ name: 'unit_of_measure', type: 'varchar', length: 20, default: 'EA' })
  unitOfMeasure: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId?: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId?: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications?: Record<string, unknown>;

  @ApiProperty({ example: 5, description: 'Lead time in business days' })
  @Column({ name: 'lead_time_days', type: 'integer', nullable: true })
  leadTimeDays?: number;
}
