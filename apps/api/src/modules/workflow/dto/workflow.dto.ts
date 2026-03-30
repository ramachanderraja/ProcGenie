import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowType } from '../entities/workflow.entity';
import { StepType } from '../entities/workflow-step.entity';
import { ApprovalStatus } from '../entities/approval.entity';

export class CreateWorkflowStepDto {
  @ApiProperty({ example: 'Manager Approval' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: StepType })
  @IsEnum(StepType)
  type: StepType;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  stepOrder: number;

  @ApiPropertyOptional()
  @IsOptional()
  approvers?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  conditions?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 48 })
  @IsNumber()
  @IsOptional()
  slaHours?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Standard PO Approval Workflow' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiPropertyOptional({ example: 'Multi-level approval workflow' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: WorkflowType })
  @IsEnum(WorkflowType)
  type: WorkflowType;

  @ApiPropertyOptional()
  @IsOptional()
  triggerConditions?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  escalationRules?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [CreateWorkflowStepDto], description: 'Legacy step-based workflow definition' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkflowStepDto)
  @IsOptional()
  steps?: CreateWorkflowStepDto[];

  @ApiPropertyOptional({ description: 'Entity types this workflow applies to', example: ['REQUEST', 'CONTRACT'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  entityTypes?: string[];

  @ApiPropertyOptional({ description: 'React Flow graph JSON with nodes and edges' })
  @IsObject()
  @IsOptional()
  graph?: Record<string, unknown>;
}

export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {}

export class ApprovalActionDto {
  @ApiProperty({ enum: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED, ApprovalStatus.DELEGATED] })
  @IsEnum(ApprovalStatus)
  action: ApprovalStatus;

  @ApiPropertyOptional({ example: 'Approved - within budget allocation' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ description: 'User ID to delegate to' })
  @IsUUID()
  @IsOptional()
  delegateTo?: string;
}

export class TestWorkflowDto {
  @ApiProperty({ description: 'Sample entity data for dry-run test' })
  @IsObject()
  @IsNotEmpty()
  entityData: Record<string, unknown>;
}
