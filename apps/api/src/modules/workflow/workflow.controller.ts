import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ApprovalActionDto,
} from './dto/workflow.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Workflow')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @Roles('admin', 'workflow_admin')
  @ApiOperation({ summary: 'Create a new workflow definition' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async create(
    @Body() dto: CreateWorkflowDto,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.createWorkflow(dto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all workflow definitions' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  async findAll(@CurrentUser() user: User) {
    return this.workflowService.findAllWorkflows(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow details by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workflow details' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.findWorkflow(id, user.tenantId);
  }

  @Put(':id')
  @Roles('admin', 'workflow_admin')
  @ApiOperation({ summary: 'Update a workflow definition' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkflowDto,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.updateWorkflow(id, dto, user.tenantId);
  }

  @Patch(':id/activate')
  @Roles('admin', 'workflow_admin')
  @ApiOperation({ summary: 'Activate a workflow' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workflow activated' })
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.activateWorkflow(id, user.tenantId);
  }

  // Approval endpoints
  @Get('approvals/pending')
  @ApiOperation({ summary: 'Get pending approvals for current user' })
  @ApiResponse({ status: 200, description: 'List of pending approvals' })
  async getPendingApprovals(@CurrentUser() user: User) {
    return this.workflowService.getPendingApprovals(user.id, user.tenantId);
  }

  @Patch('approvals/:id/action')
  @ApiOperation({ summary: 'Approve, reject, or delegate an approval' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Approval action processed' })
  async processApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApprovalActionDto,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.processApproval(id, dto, user.id, user.tenantId);
  }

  // SLA endpoints
  @Get('sla/breached')
  @ApiOperation({ summary: 'Get all breached SLAs' })
  @ApiResponse({ status: 200, description: 'List of breached SLAs' })
  async getBreachedSlas(@CurrentUser() user: User) {
    return this.workflowService.getBreachedSlas(user.tenantId);
  }

  @Get('sla/at-risk')
  @ApiOperation({ summary: 'Get all at-risk SLAs' })
  @ApiResponse({ status: 200, description: 'List of at-risk SLAs' })
  async getAtRiskSlas(@CurrentUser() user: User) {
    return this.workflowService.getAtRiskSlas(user.tenantId);
  }

  @Get('sla/:entityType/:entityId')
  @ApiOperation({ summary: 'Get SLA status for a specific entity' })
  @ApiResponse({ status: 200, description: 'SLA status details' })
  async getSlaStatus(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.getSlaStatus(entityType, entityId, user.tenantId);
  }
}
