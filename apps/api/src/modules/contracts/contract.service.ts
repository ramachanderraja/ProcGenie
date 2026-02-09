import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Contract, ContractStatus } from './entities/contract.entity';
import { Clause } from './entities/clause.entity';
import { Amendment, AmendmentStatus } from './entities/amendment.entity';
import { Obligation } from './entities/obligation.entity';
import {
  CreateContractDto,
  UpdateContractDto,
  AnalyzeContractDto,
  ContractAnalysisResponseDto,
} from './dto/contract.dto';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);
  private contractCounter = 0;

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Clause)
    private readonly clauseRepository: Repository<Clause>,
    @InjectRepository(Amendment)
    private readonly amendmentRepository: Repository<Amendment>,
    @InjectRepository(Obligation)
    private readonly obligationRepository: Repository<Obligation>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateContractDto,
    userId: string,
    tenantId: string,
  ): Promise<Contract> {
    const contractNumber = await this.generateContractNumber();

    const obligations = dto.obligations?.map((ob) => {
      const obligation = new Obligation();
      Object.assign(obligation, ob);
      obligation.tenantId = tenantId;
      obligation.createdBy = userId;
      return obligation;
    });

    const contract = this.contractRepository.create({
      ...dto,
      contractNumber,
      ownerId: userId,
      createdBy: userId,
      tenantId,
      status: ContractStatus.DRAFT,
      obligations: obligations || [],
    });

    const saved = await this.contractRepository.save(contract);
    this.logger.log(`Contract created: ${saved.contractNumber} by user ${userId}`);
    return saved;
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: ContractStatus;
      supplierId?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Contract[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.clauses', 'clauses')
      .leftJoinAndSelect('contract.obligations', 'obligations')
      .where('contract.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('contract.status = :status', {
        status: options.status,
      });
    }

    if (options?.supplierId) {
      queryBuilder.andWhere('contract.supplier_id = :supplierId', {
        supplierId: options.supplierId,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(contract.title ILIKE :search OR contract.contract_number ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    queryBuilder
      .orderBy('contract.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id, tenantId },
      relations: ['clauses', 'amendments', 'obligations'],
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    userId: string,
    tenantId: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    if (
      contract.status !== ContractStatus.DRAFT &&
      contract.status !== ContractStatus.IN_REVIEW
    ) {
      throw new BadRequestException(
        `Cannot update contract in status: ${contract.status}`,
      );
    }

    Object.assign(contract, dto);
    const saved = await this.contractRepository.save(contract);
    this.logger.log(`Contract updated: ${saved.contractNumber} by user ${userId}`);
    return saved;
  }

  async submitForReview(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be submitted for review');
    }

    contract.status = ContractStatus.IN_REVIEW;
    const saved = await this.contractRepository.save(contract);
    this.logger.log(`Contract submitted for review: ${saved.contractNumber}`);
    return saved;
  }

  async approve(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    if (contract.status !== ContractStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Contract must be in pending approval status');
    }

    contract.status = ContractStatus.APPROVED;
    const saved = await this.contractRepository.save(contract);
    this.logger.log(`Contract approved: ${saved.contractNumber} by user ${userId}`);
    return saved;
  }

  async execute(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    if (contract.status !== ContractStatus.APPROVED) {
      throw new BadRequestException('Contract must be approved before execution');
    }

    contract.status = ContractStatus.EXECUTED;
    const saved = await this.contractRepository.save(contract);
    this.logger.log(`Contract executed: ${saved.contractNumber}`);
    return saved;
  }

  async terminate(
    id: string,
    userId: string,
    tenantId: string,
    reason?: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    const terminableStatuses = [
      ContractStatus.ACTIVE,
      ContractStatus.EXECUTED,
      ContractStatus.EXPIRING_SOON,
    ];

    if (!terminableStatuses.includes(contract.status)) {
      throw new BadRequestException(
        `Cannot terminate contract in status: ${contract.status}`,
      );
    }

    contract.status = ContractStatus.TERMINATED;
    if (reason) {
      contract.metadata = { ...contract.metadata, terminationReason: reason };
    }

    const saved = await this.contractRepository.save(contract);
    this.logger.log(`Contract terminated: ${saved.contractNumber} by user ${userId}`);
    return saved;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const contract = await this.findOne(id, tenantId);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be deleted');
    }

    await this.contractRepository.softDelete(id);
    this.logger.log(`Contract soft-deleted: ${contract.contractNumber}`);
  }

  async analyzeContract(
    dto: AnalyzeContractDto,
  ): Promise<ContractAnalysisResponseDto> {
    this.logger.log('Running AI contract analysis');

    try {
      const apiKey = this.configService.get<string>('ai.azureOpenAiApiKey');

      if (apiKey && apiKey.length > 0) {
        return await this.performAiAnalysis(dto);
      }

      return this.mockAnalysis(dto);
    } catch (error) {
      this.logger.error(`AI contract analysis failed: ${error.message}`, error.stack);
      return this.mockAnalysis(dto);
    }
  }

  async getExpiringContracts(
    tenantId: string,
    daysAhead: number = 90,
  ): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.tenant_id = :tenantId', { tenantId })
      .andWhere('contract.status IN (:...statuses)', {
        statuses: [ContractStatus.ACTIVE, ContractStatus.EXECUTED],
      })
      .andWhere('contract.end_date <= :futureDate', { futureDate })
      .andWhere('contract.end_date >= :now', { now: new Date() })
      .orderBy('contract.end_date', 'ASC')
      .getMany();
  }

  async getObligations(
    contractId: string,
    tenantId: string,
  ): Promise<Obligation[]> {
    const contract = await this.findOne(contractId, tenantId);
    return contract.obligations;
  }

  private async performAiAnalysis(
    dto: AnalyzeContractDto,
  ): Promise<ContractAnalysisResponseDto> {
    // Placeholder for actual Azure OpenAI SDK call
    return this.mockAnalysis(dto);
  }

  private mockAnalysis(dto: AnalyzeContractDto): ContractAnalysisResponseDto {
    return {
      riskScore: 72,
      keyTerms: [
        { term: 'Payment Terms', value: 'Net 30', section: '5.1' },
        { term: 'Liability Cap', value: '$1,000,000', section: '8.2' },
        { term: 'Termination Notice', value: '90 days', section: '12.1' },
      ],
      riskyClauses: [
        {
          clause: 'Auto-renewal with 180-day notice period',
          risk: 'high',
          recommendation: 'Reduce notice period to 90 days',
        },
        {
          clause: 'Unlimited liability for IP infringement',
          risk: 'critical',
          recommendation: 'Cap IP liability at 2x contract value',
        },
      ],
      missingClauses: [
        'Data protection / GDPR compliance clause',
        'Force majeure clause',
        'Dispute resolution mechanism',
      ],
      recommendations: [
        'Add data processing agreement as an addendum',
        'Include a force majeure clause covering pandemic scenarios',
        'Negotiate a mutual termination for convenience clause',
        'Add SLA penalties for service delivery failures',
      ],
      obligations: [
        {
          party: 'Supplier',
          obligation: 'Quarterly performance reports',
          frequency: 'Quarterly',
        },
        {
          party: 'Buyer',
          obligation: 'Payment within 30 days of invoice',
          frequency: 'Per invoice',
        },
      ],
      summary:
        'This contract carries moderate risk (72/100). Key concerns include an aggressive auto-renewal clause and unlimited IP liability. The agreement lacks standard data protection and force majeure provisions. Recommend negotiating these terms before execution.',
    };
  }

  private async generateContractNumber(): Promise<string> {
    this.contractCounter++;
    const year = new Date().getFullYear();
    return `CON-${year}-${String(this.contractCounter).padStart(6, '0')}`;
  }
}
