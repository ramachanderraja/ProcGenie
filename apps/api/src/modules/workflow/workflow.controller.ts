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
import { WorkflowEngineService } from './workflow-engine.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ApprovalActionDto,
  TestWorkflowDto,
} from './dto/workflow.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@Public()
@ApiTags('Workflow')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowEngineService: WorkflowEngineService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow definition' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async create(
    @Body() dto: CreateWorkflowDto,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.createWorkflow(dto, (user?.id || 'demo-user'), (user?.tenantId || 'GEP'));
  }

  @Get()
  @ApiOperation({ summary: 'List all workflow definitions' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  async findAll(@CurrentUser() user: User | undefined) {
    return this.workflowService.findAllWorkflows((user?.tenantId || 'GEP'));
  }

  @Get('instances')
  @ApiOperation({ summary: 'List all workflow instances' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiResponse({ status: 200, description: 'List of workflow instances' })
  async listInstances(
    @Query('status') status: string | undefined,
    @Query('entityType') entityType: string | undefined,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.findAllInstances(
      (user?.tenantId || 'GEP'),
      { status, entityType },
    );
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Get workflow instance detail' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Instance detail' })
  @ApiResponse({ status: 404, description: 'Instance not found' })
  async getInstance(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.findInstance(id, (user?.tenantId || 'GEP'));
  }

  @Patch('instances/:id/cancel')
  @ApiOperation({ summary: 'Cancel a running workflow instance' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Instance cancelled' })
  async cancelInstance(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.cancelInstance(id, (user?.tenantId || 'GEP'));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow details by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workflow details' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.findWorkflow(id, (user?.tenantId || 'GEP'));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a workflow definition' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkflowDto,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.updateWorkflow(id, dto, (user?.tenantId || 'GEP'));
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a workflow' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workflow activated' })
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.activateWorkflow(id, (user?.tenantId || 'GEP'));
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a workflow' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workflow archived' })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.archiveWorkflow(id, (user?.tenantId || 'GEP'));
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Dry-run test a workflow with sample entity data' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Test results with step trace' })
  async test(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestWorkflowDto,
    @CurrentUser() user: User | undefined,
  ) {
    const workflow = await this.workflowService.findWorkflow(id, (user?.tenantId || 'GEP'));
    return this.workflowEngineService.testWorkflow(workflow, dto.entityData);
  }

  // Approval endpoints
  @Get('approvals/pending')
  @ApiOperation({ summary: 'Get pending approvals for current user' })
  @ApiResponse({ status: 200, description: 'List of pending approvals' })
  async getPendingApprovals(@CurrentUser() user: User | undefined) {
    return this.workflowService.getPendingApprovals((user?.id || 'demo-user'), (user?.tenantId || 'GEP'));
  }

  @Patch('approvals/:id/action')
  @ApiOperation({ summary: 'Approve, reject, or delegate an approval' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Approval action processed' })
  async processApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApprovalActionDto,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.processApproval(id, dto, (user?.id || 'demo-user'), (user?.tenantId || 'GEP'));
  }

  // SLA endpoints
  @Get('sla/breached')
  @ApiOperation({ summary: 'Get all breached SLAs' })
  @ApiResponse({ status: 200, description: 'List of breached SLAs' })
  async getBreachedSlas(@CurrentUser() user: User | undefined) {
    return this.workflowService.getBreachedSlas((user?.tenantId || 'GEP'));
  }

  @Get('sla/at-risk')
  @ApiOperation({ summary: 'Get all at-risk SLAs' })
  @ApiResponse({ status: 200, description: 'List of at-risk SLAs' })
  async getAtRiskSlas(@CurrentUser() user: User | undefined) {
    return this.workflowService.getAtRiskSlas((user?.tenantId || 'GEP'));
  }

  @Get('sla/:entityType/:entityId')
  @ApiOperation({ summary: 'Get SLA status for a specific entity' })
  @ApiResponse({ status: 200, description: 'SLA status details' })
  async getSlaStatus(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @CurrentUser() user: User | undefined,
  ) {
    return this.workflowService.getSlaStatus(entityType, entityId, (user?.tenantId || 'GEP'));
  }
}
