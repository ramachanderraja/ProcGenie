import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsDateString,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';
import { InvoiceType } from '../entities/invoice.entity';

export class CreateInvoiceDto {
  @ApiPropertyOptional({ example: 'SINV-2025-00456' })
  @IsString()
  @IsOptional()
  supplierInvoiceNumber?: string;

  @ApiPropertyOptional({ enum: InvoiceType })
  @IsEnum(InvoiceType)
  @IsOptional()
  type?: InvoiceType;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ example: 'Dell Technologies' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  supplierName: string;

  @ApiPropertyOptional({ description: 'Purchase order ID to match against' })
  @IsUUID()
  @IsOptional()
  purchaseOrderId?: string;

  @ApiPropertyOptional({ description: 'Contract ID' })
  @IsUUID()
  @IsOptional()
  contractId?: string;

  @ApiProperty({ example: 42500.0 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: 3400.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ example: 45900.0 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2025-03-01' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ example: '2025-03-31' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'IT Department' })
  @IsString()
  @IsOptional()
  costCenter?: string;

  @ApiPropertyOptional({ example: '5100' })
  @IsString()
  @IsOptional()
  glAccount?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  lineItems?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documentUrl?: string;
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}

export class OverrideMatchDto {
  @ApiProperty({ description: 'Reason for overriding the match exception' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class InvoiceMatchResultDto {
  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  purchaseOrderId: string;

  @ApiProperty()
  goodsReceiptId?: string;

  @ApiProperty()
  matchStatus: string;

  @ApiProperty()
  poAmountMatch: boolean;

  @ApiProperty()
  grQuantityMatch: boolean;

  @ApiProperty()
  invoiceAmountMatch: boolean;

  @ApiProperty()
  variancePercentage?: number;

  @ApiProperty()
  exceptionDetails?: Record<string, unknown>;
}
