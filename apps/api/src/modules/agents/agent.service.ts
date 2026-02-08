import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent, AgentStatus, AgentType } from './entities/agent.entity';
import { AgentTask, AgentTaskStatus } from './entities/agent-task.entity';
import { AgentDecisionLog } from './entities/agent-decision-log.entity';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(AgentTask)
    private readonly taskRepository: Repository<AgentTask>,
    @InjectRepository(AgentDecisionLog)
    private readonly decisionLogRepository: Repository<AgentDecisionLog>,
  ) {}

  // ── Agents ─────────────────────────────────────────────────────────

  async getAgents(
    tenantId: string,
    options?: { status?: AgentStatus; type?: AgentType },
  ): Promise<Agent[]> {
    const queryBuilder = this.agentRepository
      .createQueryBuilder('agent')
      .where('agent.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('agent.status = :status', { status: options.status });
    }

    if (options?.type) {
      queryBuilder.andWhere('agent.type = :type', { type: options.type });
    }

    return queryBuilder.orderBy('agent.name', 'ASC').getMany();
  }

  async getAgentById(id: string, tenantId: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { id, tenantId },
      relations: ['tasks'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async getAgentPerformance(
    id: string,
    tenantId: string,
  ): Promise<Record<string, unknown>> {
    const agent = await this.getAgentById(id, tenantId);

    const taskCounts = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.agent_id = :agentId', { agentId: id })
      .andWhere('task.tenant_id = :tenantId', { tenantId })
      .groupBy('task.status')
      .getRawMany();

    const avgExecutionTime = await this.taskRepository
      .createQueryBuilder('task')
      .select('AVG(task.execution_time_ms)', 'avgTime')
      .where('task.agent_id = :agentId', { agentId: id })
      .andWhere('task.tenant_id = :tenantId', { tenantId })
      .andWhere('task.execution_time_ms IS NOT NULL')
      .getRawOne();

    const avgConfidence = await this.taskRepository
      .createQueryBuilder('task')
      .select('AVG(task.confidence_score)', 'avgConfidence')
      .where('task.agent_id = :agentId', { agentId: id })
      .andWhere('task.tenant_id = :tenantId', { tenantId })
      .andWhere('task.confidence_score IS NOT NULL')
      .getRawOne();

    return {
      agentId: agent.id,
      agentName: agent.name,
      agentType: agent.type,
      status: agent.status,
      totalTasksCompleted: agent.totalTasksCompleted,
      totalTasksFailed: agent.totalTasksFailed,
      successRate: agent.successRate,
      avgResponseTimeMs: agent.avgResponseTimeMs,
      taskBreakdown: taskCounts,
      averageExecutionTimeMs: parseFloat(avgExecutionTime?.avgTime) || 0,
      averageConfidenceScore: parseFloat(avgConfidence?.avgConfidence) || 0,
      lastActiveAt: agent.lastActiveAt,
      requiresHitl: agent.requiresHitl,
      confidenceThreshold: agent.confidenceThreshold,
    };
  }

  // ── Agent Tasks ────────────────────────────────────────────────────

  async getAgentTasks(
    tenantId: string,
    options?: {
      agentId?: string;
      status?: AgentTaskStatus;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: AgentTask[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.agent', 'agent')
      .where('task.tenant_id = :tenantId', { tenantId });

    if (options?.agentId) {
      queryBuilder.andWhere('task.agent_id = :agentId', { agentId: options.agentId });
    }

    if (options?.status) {
      queryBuilder.andWhere('task.status = :status', { status: options.status });
    }

    queryBuilder
      .orderBy('task.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async getTaskById(id: string, tenantId: string): Promise<AgentTask> {
    const task = await this.taskRepository.findOne({
      where: { id, tenantId },
      relations: ['agent'],
    });

    if (!task) {
      throw new NotFoundException(`Agent task with ID ${id} not found`);
    }

    return task;
  }

  // ── HITL Checkpoints ───────────────────────────────────────────────

  async getHitlCheckpoints(
    tenantId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ data: AgentTask[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.agent', 'agent')
      .where('task.tenant_id = :tenantId', { tenantId })
      .andWhere('task.status = :status', { status: AgentTaskStatus.AWAITING_APPROVAL });

    queryBuilder
      .orderBy('task.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async approveTask(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<AgentTask> {
    const task = await this.getTaskById(id, tenantId);

    if (task.status !== AgentTaskStatus.AWAITING_APPROVAL) {
      throw new BadRequestException('Task must be in awaiting_approval status to approve');
    }

    task.status = AgentTaskStatus.APPROVED;
    task.approvedBy = userId;
    task.approvedAt = new Date();

    const saved = await this.taskRepository.save(task);
    this.logger.log(`Agent task approved: ${task.title} by user ${userId}`);

    // Update agent stats
    await this.updateAgentStats(task.agentId, tenantId);

    return saved;
  }

  async rejectTask(
    id: string,
    userId: string,
    tenantId: string,
    reason: string,
  ): Promise<AgentTask> {
    const task = await this.getTaskById(id, tenantId);

    if (task.status !== AgentTaskStatus.AWAITING_APPROVAL) {
      throw new BadRequestException('Task must be in awaiting_approval status to reject');
    }

    task.status = AgentTaskStatus.REJECTED;
    task.approvedBy = userId;
    task.approvedAt = new Date();
    task.rejectionReason = reason;

    const saved = await this.taskRepository.save(task);
    this.logger.log(`Agent task rejected: ${task.title} by user ${userId}`);

    return saved;
  }

  // ── Decision Logs ──────────────────────────────────────────────────

  async getDecisionLogs(
    tenantId: string,
    options?: { agentId?: string; decisionType?: string; page?: number; limit?: number },
  ): Promise<{ data: AgentDecisionLog[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.decisionLogRepository
      .createQueryBuilder('log')
      .where('log.tenant_id = :tenantId', { tenantId });

    if (options?.agentId) {
      queryBuilder.andWhere('log.agent_id = :agentId', { agentId: options.agentId });
    }

    if (options?.decisionType) {
      queryBuilder.andWhere('log.decision_type = :decisionType', {
        decisionType: options.decisionType,
      });
    }

    queryBuilder
      .orderBy('log.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  // ── Private Helpers ────────────────────────────────────────────────

  private async updateAgentStats(agentId: string, tenantId: string): Promise<void> {
    try {
      const completedCount = await this.taskRepository.count({
        where: { agentId, tenantId, status: AgentTaskStatus.COMPLETED },
      });

      const approvedCount = await this.taskRepository.count({
        where: { agentId, tenantId, status: AgentTaskStatus.APPROVED },
      });

      const failedCount = await this.taskRepository.count({
        where: { agentId, tenantId, status: AgentTaskStatus.FAILED },
      });

      const total = completedCount + approvedCount + failedCount;
      const successRate = total > 0 ? ((completedCount + approvedCount) / total) * 100 : 0;

      await this.agentRepository.update(
        { id: agentId },
        {
          totalTasksCompleted: completedCount + approvedCount,
          totalTasksFailed: failedCount,
          successRate,
          lastActiveAt: new Date(),
        },
      );
    } catch (error) {
      this.logger.error(`Failed to update agent stats: ${error.message}`);
    }
  }
}
