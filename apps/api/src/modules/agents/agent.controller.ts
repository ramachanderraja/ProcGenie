import {
  Controller,
  Get,
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
import { AgentService } from './agent.service';
import { Agent, AgentStatus, AgentType } from './entities/agent.entity';
import { AgentTask, AgentTaskStatus } from './entities/agent-task.entity';
import { AgentDecisionLog } from './entities/agent-decision-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../auth/entities/user.entity';

@Public()
@ApiTags('Agents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  // ── Agents ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all AI agents' })
  @ApiQuery({ name: 'status', required: false, enum: AgentStatus })
  @ApiQuery({ name: 'type', required: false, enum: AgentType })
  @ApiResponse({ status: 200, description: 'List of AI agents' })
  async getAgents(
    @CurrentUser() user: User | undefined,
    @Query('status') status?: AgentStatus,
    @Query('type') type?: AgentType,
  ): Promise<Agent[]> {
    return this.agentService.getAgents((user?.tenantId || 'GEP'), { status, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Agent details', type: Agent })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<Agent> {
    return this.agentService.getAgentById(id, (user?.tenantId || 'GEP'));
  }

  @Get(':id/performance')
  @ApiOperation({
    summary: 'Get agent performance metrics',
    description: 'Returns detailed performance data including task counts, success rate, avg execution time, and confidence scores',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Agent performance metrics' })
  async getAgentPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<Record<string, unknown>> {
    return this.agentService.getAgentPerformance(id, (user?.tenantId || 'GEP'));
  }

  // ── Agent Tasks ────────────────────────────────────────────────────

  @Get('tasks/list')
  @ApiOperation({ summary: 'List all agent tasks' })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AgentTaskStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of agent tasks' })
  async getAgentTasks(
    @CurrentUser() user: User | undefined,
    @Query('agentId') agentId?: string,
    @Query('status') status?: AgentTaskStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.agentService.getAgentTasks((user?.tenantId || 'GEP'), {
      agentId,
      status,
      page,
      limit,
    });
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get agent task details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Agent task details', type: AgentTask })
  @ApiResponse({ status: 404, description: 'Agent task not found' })
  async getTaskById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<AgentTask> {
    return this.agentService.getTaskById(id, (user?.tenantId || 'GEP'));
  }

  // ── HITL Checkpoints ───────────────────────────────────────────────

  @Get('hitl/checkpoints')
  @ApiOperation({
    summary: 'Get pending Human-in-the-Loop checkpoints',
    description: 'Returns agent tasks awaiting human approval before proceeding',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Pending HITL checkpoints' })
  async getHitlCheckpoints(
    @CurrentUser() user: User | undefined,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.agentService.getHitlCheckpoints((user?.tenantId || 'GEP'), { page, limit });
  }

  @Patch('hitl/:id/approve')
  @ApiOperation({ summary: 'Approve an agent HITL checkpoint' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task approved', type: AgentTask })
  async approveTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<AgentTask> {
    return this.agentService.approveTask(id, (user?.id || 'demo-user'), (user?.tenantId || 'GEP'));
  }

  @Patch('hitl/:id/reject')
  @ApiOperation({ summary: 'Reject an agent HITL checkpoint' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task rejected', type: AgentTask })
  async rejectTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
    @Body() body: { reason: string },
  ): Promise<AgentTask> {
    return this.agentService.rejectTask(id, (user?.id || 'demo-user'), (user?.tenantId || 'GEP'), body.reason);
  }

  // ── Decision Logs ──────────────────────────────────────────────────

  @Get('decision-logs/list')
  @ApiOperation({
    summary: 'Get agent decision audit logs',
    description: 'Returns an immutable audit trail of all AI agent decisions for transparency and compliance',
  })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'decisionType', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of decision logs' })
  async getDecisionLogs(
    @CurrentUser() user: User | undefined,
    @Query('agentId') agentId?: string,
    @Query('decisionType') decisionType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.agentService.getDecisionLogs((user?.tenantId || 'GEP'), {
      agentId,
      decisionType,
      page,
      limit,
    });
  }
}
