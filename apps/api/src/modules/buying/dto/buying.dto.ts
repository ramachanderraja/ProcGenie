import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLineItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ example: 'MacBook Pro 16-inch M3 Max' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'EA' })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiProperty({ example: 3000.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 'IT-LAPTOP-001' })
  @IsString()
  @IsOptional()
  catalogItemId?: string;

  @ApiPropertyOptional({ example: '43211500' })
  @IsString()
  @IsOptional()
  commodityCode?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'Laptops for Engineering' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ description: 'Source request ID' })
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiPropertyOptional({ description: 'Linked contract ID' })
  @IsUUID()
  @IsOptional()
  contractId?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiPropertyOptional({ example: '2025-04-15' })
  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'IT Department' })
  @IsString()
  @IsOptional()
  costCenter?: string;

  @ApiProperty({ type: [CreateLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  lineItems: CreateLineItemDto[];
}

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {}

export class CreateGoodsReceiptDto {
  @ApiProperty({ description: 'Purchase Order ID' })
  @IsUUID()
  purchaseOrderId: string;

  @ApiProperty({ example: '2025-04-10' })
  @IsDateString()
  receivedDate: string;

  @ApiProperty({ description: 'Items received with quantities' })
  @IsArray()
  receivedItems: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'DN-12345' })
  @IsString()
  @IsOptional()
  deliveryNoteNumber?: string;
}
