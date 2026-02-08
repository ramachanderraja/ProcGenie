import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EsgScore, EsgCategory } from './entities/esg-score.entity';
import { CarbonFootprint, EmissionScope } from './entities/carbon-footprint.entity';
import { RegulatoryAlert, AlertStatus, AlertSeverity } from './entities/regulatory-alert.entity';

@Injectable()
export class SustainabilityService {
  private readonly logger = new Logger(SustainabilityService.name);

  constructor(
    @InjectRepository(EsgScore)
    private readonly esgRepository: Repository<EsgScore>,
    @InjectRepository(CarbonFootprint)
    private readonly carbonRepository: Repository<CarbonFootprint>,
    @InjectRepository(RegulatoryAlert)
    private readonly alertRepository: Repository<RegulatoryAlert>,
  ) {}

  // ── ESG Scores ─────────────────────────────────────────────────────

  async getEsgScores(
    tenantId: string,
    options?: { supplierId?: string; category?: EsgCategory; page?: number; limit?: number },
  ): Promise<{ data: EsgScore[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.esgRepository
      .createQueryBuilder('esg')
      .where('esg.tenant_id = :tenantId', { tenantId });

    if (options?.supplierId) {
      queryBuilder.andWhere('esg.supplier_id = :supplierId', { supplierId: options.supplierId });
    }

    if (options?.category) {
      queryBuilder.andWhere('esg.category = :category', { category: options.category });
    }

    queryBuilder
      .orderBy('esg.overall_score', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async getEsgScoreById(id: string, tenantId: string): Promise<EsgScore> {
    const score = await this.esgRepository.findOne({
      where: { id, tenantId },
    });

    if (!score) {
      throw new NotFoundException(`ESG score with ID ${id} not found`);
    }

    return score;
  }

  async createEsgScore(
    data: Partial<EsgScore>,
    userId: string,
    tenantId: string,
  ): Promise<EsgScore> {
    const score = this.esgRepository.create({
      ...data,
      createdBy: userId,
      tenantId,
    });

    const saved = await this.esgRepository.save(score);
    this.logger.log(`ESG score created for supplier ${data.supplierName}`);
    return saved;
  }

  // ── Carbon Footprint ───────────────────────────────────────────────

  async getCarbonFootprints(
    tenantId: string,
    options?: { supplierId?: string; scope?: EmissionScope; period?: string },
  ): Promise<CarbonFootprint[]> {
    const queryBuilder = this.carbonRepository
      .createQueryBuilder('carbon')
      .where('carbon.tenant_id = :tenantId', { tenantId });

    if (options?.supplierId) {
      queryBuilder.andWhere('carbon.supplier_id = :supplierId', { supplierId: options.supplierId });
    }

    if (options?.scope) {
      queryBuilder.andWhere('carbon.emission_scope = :scope', { scope: options.scope });
    }

    if (options?.period) {
      queryBuilder.andWhere('carbon.reporting_period = :period', { period: options.period });
    }

    return queryBuilder.orderBy('carbon.start_date', 'DESC').getMany();
  }

  async createCarbonFootprint(
    data: Partial<CarbonFootprint>,
    userId: string,
    tenantId: string,
  ): Promise<CarbonFootprint> {
    const footprint = this.carbonRepository.create({
      ...data,
      createdBy: userId,
      tenantId,
    });

    const saved = await this.carbonRepository.save(footprint);
    this.logger.log(`Carbon footprint entry created for ${data.entityName}`);
    return saved;
  }

  async getCarbonSummary(
    tenantId: string,
  ): Promise<Record<string, unknown>> {
    this.logger.log(`Generating carbon summary for tenant ${tenantId}`);

    return {
      totalEmissions: 45_230,
      scope1: 12_500,
      scope2: 18_200,
      scope3: 14_530,
      yoyChange: -8.5,
      renewableEnergyAdoption: 42.3,
      topEmitters: [
        { supplier: 'Heavy Manufacturing Co', emissions: 8_200, scope: 'scope_3' },
        { supplier: 'Global Logistics Inc', emissions: 5_400, scope: 'scope_3' },
        { supplier: 'Data Center Services', emissions: 3_800, scope: 'scope_2' },
      ],
      reductionTargets: {
        target2025: 40_000,
        target2030: 25_000,
        targetNetZero: 2050,
      },
    };
  }

  // ── Regulatory Alerts ──────────────────────────────────────────────

  async getRegulatoryAlerts(
    tenantId: string,
    options?: { severity?: AlertSeverity; status?: AlertStatus; page?: number; limit?: number },
  ): Promise<{ data: RegulatoryAlert[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.alertRepository
      .createQueryBuilder('alert')
      .where('alert.tenant_id = :tenantId', { tenantId });

    if (options?.severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity: options.severity });
    }

    if (options?.status) {
      queryBuilder.andWhere('alert.status = :status', { status: options.status });
    }

    queryBuilder
      .orderBy('alert.severity', 'DESC')
      .addOrderBy('alert.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async acknowledgeAlert(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<RegulatoryAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id, tenantId },
    });

    if (!alert) {
      throw new NotFoundException(`Regulatory alert with ID ${id} not found`);
    }

    if (alert.status !== AlertStatus.NEW) {
      throw new BadRequestException('Only new alerts can be acknowledged');
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.assignedTo = userId;

    const saved = await this.alertRepository.save(alert);
    this.logger.log(`Regulatory alert acknowledged: ${alert.title}`);
    return saved;
  }

  async resolveAlert(
    id: string,
    userId: string,
    tenantId: string,
    resolution?: string,
  ): Promise<RegulatoryAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id, tenantId },
    });

    if (!alert) {
      throw new NotFoundException(`Regulatory alert with ID ${id} not found`);
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    if (resolution) {
      alert.metadata = { ...alert.metadata, resolution };
    }

    const saved = await this.alertRepository.save(alert);
    this.logger.log(`Regulatory alert resolved: ${alert.title}`);
    return saved;
  }
}
