import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestPriority, RequestCategory } from '../entities/request.entity';

export class CreateRequestItemDto {
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

  @ApiPropertyOptional({ example: 3000.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedUnitPrice?: number;

  @ApiPropertyOptional({ example: 'IT-LAPTOP-001' })
  @IsString()
  @IsOptional()
  catalogItemId?: string;

  @ApiPropertyOptional({ example: 'IT Equipment > Laptops' })
  @IsString()
  @IsOptional()
  commodityCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  specifications?: Record<string, unknown>;
}

export class CreateRequestDto {
  @ApiProperty({ example: 'New office laptops for engineering team' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ example: 'Need 15 high-performance laptops for new engineering hires starting Q2' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: RequestCategory, example: RequestCategory.GOODS })
  @IsEnum(RequestCategory)
  category: RequestCategory;

  @ApiPropertyOptional({ enum: RequestPriority, example: RequestPriority.MEDIUM })
  @IsEnum(RequestPriority)
  @IsOptional()
  priority?: RequestPriority;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'IT Department' })
  @IsString()
  @IsOptional()
  costCenter?: string;

  @ApiPropertyOptional({ example: '5100' })
  @IsString()
  @IsOptional()
  glAccount?: string;

  @ApiPropertyOptional({ example: '2025-03-15' })
  @IsDateString()
  @IsOptional()
  neededByDate?: string;

  @ApiProperty({ type: [CreateRequestItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestItemDto)
  items: CreateRequestItemDto[];
}

export class UpdateRequestDto extends PartialType(CreateRequestDto) {}

export class AnalyzeIntakeDto {
  @ApiProperty({ example: 'We need 15 new laptops for the engineering department' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 45000 })
  @IsNumber()
  @IsOptional()
  estimatedBudget?: number;

  @ApiPropertyOptional({ example: 'IT Equipment' })
  @IsString()
  @IsOptional()
  departmentContext?: string;

  @ApiPropertyOptional()
  @IsOptional()
  historicalData?: Record<string, unknown>;
}

export class IntakeAnalysisResponseDto {
  @ApiProperty()
  suggestedCategory: string;

  @ApiProperty()
  suggestedSuppliers: string[];

  @ApiProperty()
  estimatedCost: number;

  @ApiProperty()
  riskAssessment: string;

  @ApiProperty()
  recommendations: string[];

  @ApiProperty()
  confidenceScore: number;

  @ApiProperty()
  similarRequests: Record<string, unknown>[];
}
