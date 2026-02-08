import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationStatus } from './entities/integration.entity';
import { SyncJob, SyncJobStatus, SyncDirection } from './entities/sync-job.entity';
import { Connector } from './entities/connector.entity';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
    @InjectRepository(SyncJob)
    private readonly syncJobRepository: Repository<SyncJob>,
    @InjectRepository(Connector)
    private readonly connectorRepository: Repository<Connector>,
  ) {}

  // ── Integrations ───────────────────────────────────────────────────

  async getIntegrations(
    tenantId: string,
    options?: { status?: IntegrationStatus; type?: string },
  ): Promise<Integration[]> {
    const queryBuilder = this.integrationRepository
      .createQueryBuilder('integration')
      .where('integration.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('integration.status = :status', { status: options.status });
    }

    if (options?.type) {
      queryBuilder.andWhere('integration.type = :type', { type: options.type });
    }

    return queryBuilder.orderBy('integration.name', 'ASC').getMany();
  }

  async getIntegrationById(
    id: string,
    tenantId: string,
  ): Promise<Integration> {
    const integration = await this.integrationRepository.findOne({
      where: { id, tenantId },
      relations: ['syncJobs'],
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    return integration;
  }

  async createIntegration(
    data: Partial<Integration>,
    userId: string,
    tenantId: string,
  ): Promise<Integration> {
    const integration = this.integrationRepository.create({
      ...data,
      status: IntegrationStatus.CONFIGURING,
      createdBy: userId,
      tenantId,
    });

    const saved = await this.integrationRepository.save(integration);
    this.logger.log(`Integration created: ${saved.name}`);
    return saved;
  }

  async updateIntegration(
    id: string,
    data: Partial<Integration>,
    tenantId: string,
  ): Promise<Integration> {
    const integration = await this.getIntegrationById(id, tenantId);
    Object.assign(integration, data);
    const saved = await this.integrationRepository.save(integration);
    this.logger.log(`Integration updated: ${saved.name}`);
    return saved;
  }

  async activateIntegration(
    id: string,
    tenantId: string,
  ): Promise<Integration> {
    const integration = await this.getIntegrationById(id, tenantId);

    if (integration.status === IntegrationStatus.ACTIVE) {
      throw new BadRequestException('Integration is already active');
    }

    integration.status = IntegrationStatus.ACTIVE;
    const saved = await this.integrationRepository.save(integration);
    this.logger.log(`Integration activated: ${saved.name}`);
    return saved;
  }

  async deactivateIntegration(
    id: string,
    tenantId: string,
  ): Promise<Integration> {
    const integration = await this.getIntegrationById(id, tenantId);
    integration.status = IntegrationStatus.INACTIVE;
    const saved = await this.integrationRepository.save(integration);
    this.logger.log(`Integration deactivated: ${saved.name}`);
    return saved;
  }

  async testConnection(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const integration = await this.getIntegrationById(id, tenantId);

    this.logger.log(`Testing connection for integration: ${integration.name}`);

    // Simulated connection test
    const latencyMs = Math.floor(50 + Math.random() * 200);

    return {
      success: true,
      message: `Connection to ${integration.name} successful`,
      latencyMs,
    };
  }

  async deleteIntegration(id: string, tenantId: string): Promise<void> {
    const integration = await this.getIntegrationById(id, tenantId);

    if (integration.status === IntegrationStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active integration. Deactivate it first.');
    }

    await this.integrationRepository.softDelete(id);
    this.logger.log(`Integration soft-deleted: ${integration.name}`);
  }

  // ── Sync Jobs ──────────────────────────────────────────────────────

  async triggerSync(
    integrationId: string,
    entityType: string,
    direction: SyncDirection,
    userId: string,
    tenantId: string,
  ): Promise<SyncJob> {
    const integration = await this.getIntegrationById(integrationId, tenantId);

    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new BadRequestException('Integration must be active to trigger sync');
    }

    const syncJob = this.syncJobRepository.create({
      integrationId,
      status: SyncJobStatus.QUEUED,
      direction,
      entityType,
      triggerType: 'manual',
      triggeredBy: userId,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.syncJobRepository.save(syncJob);
    this.logger.log(`Sync job queued for ${integration.name}: ${entityType} (${direction})`);

    // Simulate job processing (in production, this would be handled by Bull queue)
    this.simulateSyncExecution(saved.id, tenantId);

    return saved;
  }

  async getSyncJobs(
    integrationId: string,
    tenantId: string,
    options?: { status?: SyncJobStatus; page?: number; limit?: number },
  ): Promise<{ data: SyncJob[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.syncJobRepository
      .createQueryBuilder('job')
      .where('job.integration_id = :integrationId', { integrationId })
      .andWhere('job.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('job.status = :status', { status: options.status });
    }

    queryBuilder
      .orderBy('job.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async cancelSyncJob(
    jobId: string,
    tenantId: string,
  ): Promise<SyncJob> {
    const job = await this.syncJobRepository.findOne({
      where: { id: jobId, tenantId },
    });

    if (!job) {
      throw new NotFoundException(`Sync job with ID ${jobId} not found`);
    }

    if (job.status !== SyncJobStatus.QUEUED && job.status !== SyncJobStatus.RUNNING) {
      throw new BadRequestException('Only queued or running jobs can be cancelled');
    }

    job.status = SyncJobStatus.CANCELLED;
    job.completedAt = new Date();
    const saved = await this.syncJobRepository.save(job);
    this.logger.log(`Sync job cancelled: ${jobId}`);
    return saved;
  }

  // ── Connectors ─────────────────────────────────────────────────────

  async getAvailableConnectors(): Promise<Connector[]> {
    return this.connectorRepository.find({
      where: { isAvailable: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  // ── Private Helpers ────────────────────────────────────────────────

  private async simulateSyncExecution(
    jobId: string,
    tenantId: string,
  ): Promise<void> {
    // In production, this would be a Bull queue processor
    try {
      const job = await this.syncJobRepository.findOne({
        where: { id: jobId, tenantId },
      });

      if (!job || job.status === SyncJobStatus.CANCELLED) return;

      job.status = SyncJobStatus.RUNNING;
      job.startedAt = new Date();
      await this.syncJobRepository.save(job);

      // Simulate processing
      const totalRecords = Math.floor(50 + Math.random() * 200);
      const failedRecords = Math.floor(Math.random() * 5);

      job.status = failedRecords > 0 ? SyncJobStatus.PARTIAL : SyncJobStatus.COMPLETED;
      job.completedAt = new Date();
      job.totalRecords = totalRecords;
      job.processedRecords = totalRecords - failedRecords;
      job.failedRecords = failedRecords;

      await this.syncJobRepository.save(job);
      this.logger.log(`Sync job completed: ${jobId}, ${job.processedRecords}/${totalRecords} records`);
    } catch (error) {
      this.logger.error(`Sync job ${jobId} failed: ${error.message}`, error.stack);
    }
  }
}
