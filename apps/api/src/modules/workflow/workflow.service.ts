import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow, WorkflowStatus } from './entities/workflow.entity';
import { WorkflowStep } from './entities/workflow-step.entity';
import { Approval, ApprovalStatus } from './entities/approval.entity';
import { SLA, SlaStatus } from './entities/sla.entity';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ApprovalActionDto,
} from './dto/workflow.dto';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowStep)
    private readonly stepRepository: Repository<WorkflowStep>,
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    @InjectRepository(SLA)
    private readonly slaRepository: Repository<SLA>,
  ) {}

  async createWorkflow(
    dto: CreateWorkflowDto,
    userId: string,
    tenantId: string,
  ): Promise<Workflow> {
    const workflow = this.workflowRepository.create({
      ...dto,
      createdBy: userId,
      tenantId,
      steps: dto.steps.map((step) => {
        const s = new WorkflowStep();
        Object.assign(s, step);
        s.tenantId = tenantId;
        return s;
      }),
    });

    const saved = await this.workflowRepository.save(workflow);
    this.logger.log(`Workflow created: ${saved.name} (${saved.id})`);
    return saved;
  }

  async findAllWorkflows(tenantId: string): Promise<Workflow[]> {
    return this.workflowRepository.find({
      where: { tenantId },
      relations: ['steps'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWorkflow(id: string, tenantId: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id, tenantId },
      relations: ['steps'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    return workflow;
  }

  async updateWorkflow(
    id: string,
    dto: UpdateWorkflowDto,
    tenantId: string,
  ): Promise<Workflow> {
    const workflow = await this.findWorkflow(id, tenantId);

    if (workflow.status === WorkflowStatus.ACTIVE) {
      // Create new version instead of modifying active workflow
      workflow.version += 1;
    }

    Object.assign(workflow, dto);

    if (dto.steps) {
      await this.stepRepository.delete({ workflowId: id });
      workflow.steps = dto.steps.map((step) => {
        const s = new WorkflowStep();
        Object.assign(s, step);
        s.workflowId = id;
        s.tenantId = tenantId;
        return s;
      });
    }

    return this.workflowRepository.save(workflow);
  }

  async activateWorkflow(id: string, tenantId: string): Promise<Workflow> {
    const workflow = await this.findWorkflow(id, tenantId);
    workflow.status = WorkflowStatus.ACTIVE;
    return this.workflowRepository.save(workflow);
  }

  // Approval management
  async getPendingApprovals(
    userId: string,
    tenantId: string,
  ): Promise<Approval[]> {
    return this.approvalRepository.find({
      where: {
        approverId: userId,
        tenantId,
        status: ApprovalStatus.PENDING,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async processApproval(
    approvalId: string,
    dto: ApprovalActionDto,
    userId: string,
    tenantId: string,
  ): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId, tenantId },
    });

    if (!approval) {
      throw new NotFoundException(`Approval ${approvalId} not found`);
    }

    if (approval.approverId !== userId) {
      throw new BadRequestException('You are not authorized to act on this approval');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(`Approval already processed: ${approval.status}`);
    }

    approval.status = dto.action;
    approval.comments = dto.comments;
    approval.decidedAt = new Date();

    if (dto.action === ApprovalStatus.DELEGATED && dto.delegateTo) {
      approval.delegatedTo = dto.delegateTo;
    }

    const saved = await this.approvalRepository.save(approval);

    this.logger.log(
      `Approval ${approvalId} ${dto.action} by user ${userId}`,
    );

    return saved;
  }

  async createApproval(
    entityType: string,
    entityId: string,
    approverId: string,
    tenantId: string,
    level = 1,
    slaHours = 48,
  ): Promise<Approval> {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + slaHours);

    const approval = this.approvalRepository.create({
      entityType: entityType as any,
      entityId,
      approverId,
      tenantId,
      approvalLevel: level,
      dueDate,
    });

    const saved = await this.approvalRepository.save(approval);

    // Create SLA tracking
    await this.createSla(
      `Approval SLA - Level ${level}`,
      'approval',
      saved.id,
      slaHours,
      tenantId,
    );

    return saved;
  }

  // SLA management
  async getSlaStatus(
    entityType: string,
    entityId: string,
    tenantId: string,
  ): Promise<SLA[]> {
    return this.slaRepository.find({
      where: { entityType, entityId, tenantId },
      order: { startedAt: 'DESC' },
    });
  }

  async getBreachedSlas(tenantId: string): Promise<SLA[]> {
    return this.slaRepository.find({
      where: { tenantId, status: SlaStatus.BREACHED },
      order: { dueDate: 'ASC' },
    });
  }

  async getAtRiskSlas(tenantId: string): Promise<SLA[]> {
    return this.slaRepository.find({
      where: { tenantId, status: SlaStatus.AT_RISK },
      order: { dueDate: 'ASC' },
    });
  }

  private async createSla(
    name: string,
    entityType: string,
    entityId: string,
    targetHours: number,
    tenantId: string,
  ): Promise<SLA> {
    const now = new Date();
    const dueDate = new Date(now.getTime() + targetHours * 3600000);

    const sla = this.slaRepository.create({
      name,
      entityType,
      entityId,
      targetHours,
      startedAt: now,
      dueDate,
      tenantId,
      status: SlaStatus.ON_TRACK,
    });

    return this.slaRepository.save(sla);
  }
}
