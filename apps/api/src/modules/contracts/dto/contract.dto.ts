import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDateString,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType } from '../entities/contract.entity';
import { ObligationType } from '../entities/obligation.entity';

export class CreateObligationDto {
  @ApiProperty({ example: 'Quarterly performance report submission' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ObligationType })
  @IsEnum(ObligationType)
  type: ObligationType;

  @ApiProperty({ example: '2025-06-30' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 'buyer' })
  @IsString()
  responsibleParty: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: 'quarterly' })
  @IsString()
  @IsOptional()
  recurrencePattern?: string;
}

export class CreateContractDto {
  @ApiProperty({ example: 'Master Service Agreement - Dell Technologies' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ContractType })
  @IsEnum(ContractType)
  type: ContractType;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @IsOptional()
  totalValue?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-12-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @IsOptional()
  noticePeriodDays?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'State of Delaware, USA' })
  @IsString()
  @IsOptional()
  governingLaw?: string;

  @ApiPropertyOptional({ type: [CreateObligationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObligationDto)
  @IsOptional()
  obligations?: CreateObligationDto[];
}

export class UpdateContractDto extends PartialType(CreateContractDto) {}

export class AnalyzeContractDto {
  @ApiProperty({ description: 'Contract text to analyze' })
  @IsString()
  @IsNotEmpty()
  contractText: string;

  @ApiPropertyOptional({ description: 'Focus areas for analysis' })
  @IsArray()
  @IsOptional()
  focusAreas?: string[];
}

export class ContractAnalysisResponseDto {
  @ApiProperty()
  riskScore: number;

  @ApiProperty()
  keyTerms: Record<string, unknown>[];

  @ApiProperty()
  riskyClauses: Record<string, unknown>[];

  @ApiProperty()
  missingClauses: string[];

  @ApiProperty()
  recommendations: string[];

  @ApiProperty()
  obligations: Record<string, unknown>[];

  @ApiProperty()
  summary: string;
}
