import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, SupplierStatus } from './entities/supplier.entity';
import { SupplierDocument } from './entities/supplier-document.entity';
import { PerformanceScore } from './entities/performance-score.entity';
import { RiskProfile, RiskLevel } from './entities/risk-profile.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);
  private supplierCounter = 0;

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(SupplierDocument)
    private readonly documentRepository: Repository<SupplierDocument>,
    @InjectRepository(PerformanceScore)
    private readonly performanceRepository: Repository<PerformanceScore>,
    @InjectRepository(RiskProfile)
    private readonly riskRepository: Repository<RiskProfile>,
  ) {}

  async create(
    dto: CreateSupplierDto,
    userId: string,
    tenantId: string,
  ): Promise<Supplier> {
    this.supplierCounter++;
    const supplierCode = `SUP-${String(this.supplierCounter).padStart(6, '0')}`;

    const supplier = this.supplierRepository.create({
      ...dto,
      supplierCode,
      createdBy: userId,
      tenantId,
      status: SupplierStatus.PROSPECT,
    });

    const saved = await this.supplierRepository.save(supplier);
    this.logger.log(`Supplier created: ${saved.companyName} (${saved.supplierCode})`);
    return saved;
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: SupplierStatus;
      tier?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Supplier[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('supplier.status = :status', { status: options.status });
    }

    if (options?.tier) {
      queryBuilder.andWhere('supplier.tier = :tier', { tier: options.tier });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(supplier.company_name ILIKE :search OR supplier.supplier_code ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    queryBuilder
      .orderBy('supplier.company_name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string, tenantId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, tenantId },
      relations: ['documents', 'performanceScores'],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier ${id} not found`);
    }

    return supplier;
  }

  async update(
    id: string,
    dto: UpdateSupplierDto,
    tenantId: string,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id, tenantId);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async initiateOnboarding(
    supplierId: string,
    tenantId: string,
  ): Promise<Supplier> {
    const supplier = await this.findOne(supplierId, tenantId);

    if (supplier.status !== SupplierStatus.PROSPECT) {
      throw new BadRequestException(
        `Cannot onboard supplier in status: ${supplier.status}`,
      );
    }

    supplier.status = SupplierStatus.ONBOARDING;
    const saved = await this.supplierRepository.save(supplier);

    this.logger.log(`Supplier onboarding initiated: ${supplier.companyName}`);
    return saved;
  }

  async completeOnboarding(
    supplierId: string,
    tenantId: string,
  ): Promise<Supplier> {
    const supplier = await this.findOne(supplierId, tenantId);

    if (supplier.status !== SupplierStatus.ONBOARDING) {
      throw new BadRequestException('Supplier is not in onboarding status');
    }

    supplier.status = SupplierStatus.ACTIVE;
    supplier.onboardingCompletedAt = new Date();
    return this.supplierRepository.save(supplier);
  }

  async performRiskScan(
    supplierId: string,
    tenantId: string,
    deepScan = false,
  ): Promise<RiskProfile> {
    await this.findOne(supplierId, tenantId);

    this.logger.log(`Risk scan initiated for supplier ${supplierId} (deep: ${deepScan})`);

    // In production, this would call external risk assessment APIs and AI
    const riskProfile = this.riskRepository.create({
      supplierId,
      tenantId,
      overallRiskLevel: RiskLevel.LOW,
      riskScore: 22.5,
      financialHealthScore: 85.0,
      complianceScore: 92.0,
      geopoliticalScore: 75.0,
      cyberSecurityScore: 88.0,
      esgScore: 90.0,
      riskFactors: [
        { factor: 'Single source dependency', severity: 'medium', category: 'supply_chain' },
        { factor: 'Currency exposure (EUR/USD)', severity: 'low', category: 'financial' },
      ],
      mitigationActions: [
        { action: 'Identify backup supplier', priority: 'medium', dueDate: '2025-06-30' },
        { action: 'Set up currency hedging', priority: 'low', dueDate: '2025-09-30' },
      ],
      lastScanDate: new Date(),
    });

    return this.riskRepository.save(riskProfile);
  }

  async getPerformanceHistory(
    supplierId: string,
    tenantId: string,
  ): Promise<PerformanceScore[]> {
    return this.performanceRepository.find({
      where: { supplierId, tenantId },
      order: { period: 'DESC' },
    });
  }

  async getRiskProfile(
    supplierId: string,
    tenantId: string,
  ): Promise<RiskProfile> {
    const profile = await this.riskRepository.findOne({
      where: { supplierId, tenantId },
      order: { lastScanDate: 'DESC' },
    });

    if (!profile) {
      throw new NotFoundException(`No risk profile found for supplier ${supplierId}`);
    }

    return profile;
  }
}
