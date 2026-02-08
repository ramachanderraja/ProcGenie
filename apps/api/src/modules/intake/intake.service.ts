import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Request, RequestStatus } from './entities/request.entity';
import { RequestItem } from './entities/request-item.entity';
import { Draft } from './entities/draft.entity';
import { Template } from './entities/template.entity';
import {
  CreateRequestDto,
  UpdateRequestDto,
  AnalyzeIntakeDto,
  IntakeAnalysisResponseDto,
} from './dto/intake.dto';

@Injectable()
export class IntakeService {
  private readonly logger = new Logger(IntakeService.name);
  private requestCounter = 0;

  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(RequestItem)
    private readonly requestItemRepository: Repository<RequestItem>,
    @InjectRepository(Draft)
    private readonly draftRepository: Repository<Draft>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    private readonly configService: ConfigService,
  ) {}

  async createRequest(
    dto: CreateRequestDto,
    userId: string,
    tenantId: string,
  ): Promise<Request> {
    const requestNumber = await this.generateRequestNumber();

    const request = this.requestRepository.create({
      ...dto,
      requestNumber,
      requesterId: userId,
      createdBy: userId,
      tenantId,
      status: RequestStatus.DRAFT,
      estimatedTotal: this.calculateTotal(dto.items),
      items: dto.items.map((item) => {
        const requestItem = new RequestItem();
        Object.assign(requestItem, item);
        requestItem.totalPrice =
          (item.estimatedUnitPrice || 0) * item.quantity;
        requestItem.tenantId = tenantId;
        return requestItem;
      }),
    });

    const saved = await this.requestRepository.save(request);
    this.logger.log(`Request created: ${saved.requestNumber} by user ${userId}`);
    return saved;
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: RequestStatus;
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Request[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.items', 'items')
      .where('request.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('request.status = :status', {
        status: options.status,
      });
    }

    if (options?.category) {
      queryBuilder.andWhere('request.category = :category', {
        category: options.category,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(request.title ILIKE :search OR request.request_number ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    queryBuilder
      .orderBy('request.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id, tenantId },
      relations: ['items'],
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async update(
    id: string,
    dto: UpdateRequestDto,
    userId: string,
    tenantId: string,
  ): Promise<Request> {
    const request = await this.findOne(id, tenantId);

    if (
      request.status !== RequestStatus.DRAFT &&
      request.status !== RequestStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Cannot update request in status: ${request.status}`,
      );
    }

    if (dto.items) {
      await this.requestItemRepository.delete({ requestId: id });
      request.items = dto.items.map((item) => {
        const requestItem = new RequestItem();
        Object.assign(requestItem, item);
        requestItem.totalPrice =
          (item.estimatedUnitPrice || 0) * item.quantity;
        requestItem.requestId = id;
        requestItem.tenantId = tenantId;
        return requestItem;
      });
      request.estimatedTotal = this.calculateTotal(dto.items);
    }

    Object.assign(request, {
      ...dto,
      items: request.items,
    });

    const saved = await this.requestRepository.save(request);
    this.logger.log(`Request updated: ${saved.requestNumber} by user ${userId}`);
    return saved;
  }

  async submit(id: string, userId: string, tenantId: string): Promise<Request> {
    const request = await this.findOne(id, tenantId);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be submitted');
    }

    if (!request.items || request.items.length === 0) {
      throw new BadRequestException('Request must have at least one item');
    }

    request.status = RequestStatus.SUBMITTED;
    const saved = await this.requestRepository.save(request);

    this.logger.log(`Request submitted: ${saved.requestNumber} by user ${userId}`);
    return saved;
  }

  async cancel(id: string, userId: string, tenantId: string): Promise<Request> {
    const request = await this.findOne(id, tenantId);

    const cancellableStatuses = [
      RequestStatus.DRAFT,
      RequestStatus.SUBMITTED,
      RequestStatus.PENDING_APPROVAL,
    ];

    if (!cancellableStatuses.includes(request.status)) {
      throw new BadRequestException(
        `Cannot cancel request in status: ${request.status}`,
      );
    }

    request.status = RequestStatus.CANCELLED;
    const saved = await this.requestRepository.save(request);

    this.logger.log(`Request cancelled: ${saved.requestNumber} by user ${userId}`);
    return saved;
  }

  async analyzeIntake(
    dto: AnalyzeIntakeDto,
  ): Promise<IntakeAnalysisResponseDto> {
    this.logger.log('Running AI intake analysis');

    try {
      // In production, this would call the Anthropic API
      const apiKey = this.configService.get<string>('ai.anthropicApiKey');

      if (apiKey && apiKey !== 'sk-ant-your-api-key-here') {
        return await this.performAiAnalysis(dto);
      }

      // Fallback mock analysis for development
      return this.mockAnalysis(dto);
    } catch (error) {
      this.logger.error(`AI analysis failed: ${error.message}`, error.stack);
      return this.mockAnalysis(dto);
    }
  }

  async getTemplates(tenantId: string): Promise<Template[]> {
    return this.templateRepository.find({
      where: { tenantId, isActive: true },
      order: { usageCount: 'DESC' },
    });
  }

  async saveDraft(
    userId: string,
    tenantId: string,
    formData: Record<string, unknown>,
    step: number,
  ): Promise<Draft> {
    let draft = await this.draftRepository.findOne({
      where: { userId, tenantId },
      order: { updatedAt: 'DESC' },
    });

    if (draft) {
      draft.formData = formData;
      draft.currentStep = step;
    } else {
      draft = this.draftRepository.create({
        userId,
        tenantId,
        formData,
        currentStep: step,
        isAutoSaved: true,
      });
    }

    return this.draftRepository.save(draft);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const request = await this.findOne(id, tenantId);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be deleted');
    }

    await this.requestRepository.softDelete(id);
    this.logger.log(`Request soft-deleted: ${request.requestNumber}`);
  }

  private async performAiAnalysis(
    dto: AnalyzeIntakeDto,
  ): Promise<IntakeAnalysisResponseDto> {
    // Placeholder for actual Anthropic SDK call
    // const anthropic = new Anthropic({ apiKey: this.configService.get('ai.anthropicApiKey') });
    // const response = await anthropic.messages.create({...});
    return this.mockAnalysis(dto);
  }

  private mockAnalysis(dto: AnalyzeIntakeDto): IntakeAnalysisResponseDto {
    return {
      suggestedCategory: 'goods',
      suggestedSuppliers: ['Dell Technologies', 'Apple Inc.', 'Lenovo Group'],
      estimatedCost: dto.estimatedBudget || 45000,
      riskAssessment: 'Low risk - standard procurement with multiple available suppliers',
      recommendations: [
        'Consider bulk purchasing for volume discount',
        'Check existing contract with Dell for preferred pricing',
        'Evaluate refurbished options for 15-20% cost savings',
        'Ensure IT security compliance requirements are met',
      ],
      confidenceScore: 87,
      similarRequests: [
        {
          requestNumber: 'REQ-2024-008912',
          title: 'Engineering laptops Q3 2024',
          totalCost: 42000,
          supplier: 'Dell Technologies',
        },
      ],
    };
  }

  private calculateTotal(items: { estimatedUnitPrice?: number; quantity: number }[]): number {
    return items.reduce(
      (sum, item) => sum + (item.estimatedUnitPrice || 0) * item.quantity,
      0,
    );
  }

  private async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    this.requestCounter++;
    const sequence = String(this.requestCounter).padStart(6, '0');
    return `REQ-${year}-${sequence}`;
  }
}
