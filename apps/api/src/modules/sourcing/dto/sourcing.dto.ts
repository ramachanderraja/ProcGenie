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
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SourcingType } from '../entities/sourcing-project.entity';
import { CriteriaCategory } from '../entities/evaluation-criteria.entity';

export class CreateEvaluationCriteriaDto {
  @ApiProperty({ example: 'Technical Capability' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CriteriaCategory })
  @IsEnum(CriteriaCategory)
  category: CriteriaCategory;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @IsOptional()
  minimumThreshold?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateSourcingProjectDto {
  @ApiProperty({ example: 'IT Hardware Sourcing - Q2 2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: SourcingType })
  @IsEnum(SourcingType)
  type: SourcingType;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiPropertyOptional({ example: 'IT Equipment' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  bidStartDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  bidEndDate?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  invitedSuppliers?: string[];

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isSealed?: boolean;

  @ApiPropertyOptional({ type: [CreateEvaluationCriteriaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvaluationCriteriaDto)
  @IsOptional()
  evaluationCriteria?: CreateEvaluationCriteriaDto[];
}

export class UpdateSourcingProjectDto extends PartialType(CreateSourcingProjectDto) {}

export class CreateBidDto {
  @ApiProperty({ description: 'Sourcing project ID' })
  @IsUUID()
  sourcingProjectId: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ example: 'Dell Technologies' })
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @ApiProperty({ example: 425000 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: '4-6 weeks' })
  @IsString()
  @IsOptional()
  deliveryTimeline?: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: '3-year manufacturer warranty' })
  @IsString()
  @IsOptional()
  warrantyTerms?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  lineItems?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBidDto extends PartialType(CreateBidDto) {}

export class EvaluateBidDto {
  @ApiProperty({ example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  technicalScore: number;

  @ApiProperty({ example: 90 })
  @IsNumber()
  @Min(0)
  @Max(100)
  commercialScore: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comments?: string;
}

export class AwardBidDto {
  @ApiProperty({ description: 'Bid ID to award' })
  @IsUUID()
  bidId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  awardJustification?: string;
}
