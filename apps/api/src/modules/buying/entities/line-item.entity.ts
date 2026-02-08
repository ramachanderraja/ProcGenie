import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('po_line_items')
export class LineItem extends BaseEntity {
  @ApiProperty({ example: 1 })
  @Column({ name: 'line_number', type: 'integer' })
  lineNumber: number;

  @ApiProperty({ example: 'MacBook Pro 16-inch M3 Max' })
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @ApiProperty({ example: 15 })
  @Column({ type: 'integer' })
  quantity: number;

  @ApiProperty({ example: 'EA' })
  @Column({ name: 'unit_of_measure', type: 'varchar', length: 20, default: 'EA' })
  unitOfMeasure: string;

  @ApiProperty({ example: 3000.0 })
  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @ApiProperty({ example: 45000.0 })
  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @ApiProperty({ example: 0 })
  @Column({ name: 'received_quantity', type: 'integer', default: 0 })
  receivedQuantity: number;

  @ApiProperty({ example: 'IT-LAPTOP-001' })
  @Column({ name: 'catalog_item_id', type: 'varchar', length: 100, nullable: true })
  catalogItemId?: string;

  @ApiProperty({ example: '43211500' })
  @Column({ name: 'commodity_code', type: 'varchar', length: 100, nullable: true })
  commodityCode?: string;

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;
}
