import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsArray,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { SupplierTier } from '../entities/supplier.entity';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  companyName: string;

  @ApiPropertyOptional({ example: 'Acme Corporation Inc.' })
  @IsString()
  @IsOptional()
  legalName?: string;

  @ApiPropertyOptional({ example: '12-3456789' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({ example: 'john@acme.com' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({ enum: SupplierTier })
  @IsEnum(SupplierTier)
  @IsOptional()
  tier?: SupplierTier;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}

export class OnboardSupplierDto {
  @ApiProperty({ description: 'Supplier ID to onboard' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ description: 'Skip certain verification steps' })
  @IsArray()
  @IsOptional()
  skipSteps?: string[];
}

export class RiskScanDto {
  @ApiProperty({ description: 'Supplier ID to scan' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  deepScan?: boolean;
}
