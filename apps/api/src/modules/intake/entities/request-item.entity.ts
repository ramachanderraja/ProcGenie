import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Request } from './request.entity';

@Entity('request_items')
export class RequestItem extends BaseEntity {
  @ApiProperty({ example: 'MacBook Pro 16-inch M3 Max' })
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @ApiProperty({ example: 15 })
  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @ApiProperty({ example: 'EA' })
  @Column({ name: 'unit_of_measure', type: 'varchar', length: 20, default: 'EA' })
  unitOfMeasure: string;

  @ApiProperty({ example: 3000.0 })
  @Column({ name: 'estimated_unit_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedUnitPrice?: number;

  @ApiProperty({ example: 45000.0 })
  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalPrice?: number;

  @ApiProperty({ example: 'IT-LAPTOP-001' })
  @Column({ name: 'catalog_item_id', type: 'varchar', length: 100, nullable: true })
  catalogItemId?: string;

  @ApiProperty({ example: 'IT Equipment > Laptops' })
  @Column({ name: 'commodity_code', type: 'varchar', length: 100, nullable: true })
  commodityCode?: string;

  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;

  @ManyToOne(() => Request, (request) => request.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @Column({ type: 'jsonb', nullable: true })
  specifications?: Record<string, unknown>;
}
