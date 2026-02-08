import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourcingProject, SourcingStatus } from './entities/sourcing-project.entity';
import { Bid, BidStatus } from './entities/bid.entity';
import { EvaluationCriteria } from './entities/evaluation-criteria.entity';
import {
  CreateSourcingProjectDto,
  UpdateSourcingProjectDto,
  CreateBidDto,
  UpdateBidDto,
  EvaluateBidDto,
  AwardBidDto,
} from './dto/sourcing.dto';

@Injectable()
export class SourcingService {
  private readonly logger = new Logger(SourcingService.name);
  private projectCounter = 0;
  private bidCounter = 0;

  constructor(
    @InjectRepository(SourcingProject)
    private readonly projectRepository: Repository<SourcingProject>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(EvaluationCriteria)
    private readonly criteriaRepository: Repository<EvaluationCriteria>,
  ) {}

  // ── Sourcing Projects ──────────────────────────────────────────────

  async createProject(
    dto: CreateSourcingProjectDto,
    userId: string,
    tenantId: string,
  ): Promise<SourcingProject> {
    const projectNumber = await this.generateProjectNumber();

    const criteria = dto.evaluationCriteria?.map((c) => {
      const criterion = new EvaluationCriteria();
      Object.assign(criterion, c);
      criterion.tenantId = tenantId;
      return criterion;
    });

    const project = this.projectRepository.create({
      ...dto,
      projectNumber,
      ownerId: userId,
      createdBy: userId,
      tenantId,
      status: SourcingStatus.DRAFT,
      evaluationCriteria: criteria || [],
    });

    const saved = await this.projectRepository.save(project);
    this.logger.log(`Sourcing project created: ${saved.projectNumber} by user ${userId}`);
    return saved;
  }

  async findAllProjects(
    tenantId: string,
    options?: {
      status?: SourcingStatus;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: SourcingProject[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.evaluationCriteria', 'criteria')
      .where('project.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('project.status = :status', { status: options.status });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(project.title ILIKE :search OR project.project_number ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    queryBuilder
      .orderBy('project.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOneProject(id: string, tenantId: string): Promise<SourcingProject> {
    const project = await this.projectRepository.findOne({
      where: { id, tenantId },
      relations: ['bids', 'evaluationCriteria'],
    });

    if (!project) {
      throw new NotFoundException(`Sourcing project with ID ${id} not found`);
    }

    return project;
  }

  async updateProject(
    id: string,
    dto: UpdateSourcingProjectDto,
    userId: string,
    tenantId: string,
  ): Promise<SourcingProject> {
    const project = await this.findOneProject(id, tenantId);

    if (project.status !== SourcingStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update sourcing project in status: ${project.status}`,
      );
    }

    Object.assign(project, dto);
    const saved = await this.projectRepository.save(project);
    this.logger.log(`Sourcing project updated: ${saved.projectNumber} by user ${userId}`);
    return saved;
  }

  async publishProject(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<SourcingProject> {
    const project = await this.findOneProject(id, tenantId);

    if (project.status !== SourcingStatus.DRAFT) {
      throw new BadRequestException('Only draft projects can be published');
    }

    if (!project.evaluationCriteria || project.evaluationCriteria.length === 0) {
      throw new BadRequestException('Project must have at least one evaluation criterion');
    }

    project.status = SourcingStatus.PUBLISHED;
    const saved = await this.projectRepository.save(project);
    this.logger.log(`Sourcing project published: ${saved.projectNumber}`);
    return saved;
  }

  async openBidding(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<SourcingProject> {
    const project = await this.findOneProject(id, tenantId);

    if (project.status !== SourcingStatus.PUBLISHED) {
      throw new BadRequestException('Project must be published before opening bidding');
    }

    project.status = SourcingStatus.BIDDING_OPEN;
    project.bidStartDate = new Date();
    const saved = await this.projectRepository.save(project);
    this.logger.log(`Bidding opened for: ${saved.projectNumber}`);
    return saved;
  }

  async closeBidding(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<SourcingProject> {
    const project = await this.findOneProject(id, tenantId);

    if (project.status !== SourcingStatus.BIDDING_OPEN) {
      throw new BadRequestException('Bidding must be open to close it');
    }

    project.status = SourcingStatus.BIDDING_CLOSED;
    project.bidEndDate = new Date();
    const saved = await this.projectRepository.save(project);
    this.logger.log(`Bidding closed for: ${saved.projectNumber}`);
    return saved;
  }

  async awardProject(
    id: string,
    dto: AwardBidDto,
    userId: string,
    tenantId: string,
  ): Promise<SourcingProject> {
    const project = await this.findOneProject(id, tenantId);

    if (
      project.status !== SourcingStatus.BIDDING_CLOSED &&
      project.status !== SourcingStatus.EVALUATION
    ) {
      throw new BadRequestException('Project must be in evaluation or bidding closed status to award');
    }

    const bid = await this.bidRepository.findOne({
      where: { id: dto.bidId, sourcingProjectId: id, tenantId },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${dto.bidId} not found in this project`);
    }

    // Award the winning bid
    bid.status = BidStatus.AWARDED;
    await this.bidRepository.save(bid);

    // Reject all other bids
    await this.bidRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ status: BidStatus.REJECTED })
      .where('sourcing_project_id = :projectId', { projectId: id })
      .andWhere('id != :bidId', { bidId: dto.bidId })
      .andWhere('status != :withdrawn', { withdrawn: BidStatus.WITHDRAWN })
      .execute();

    project.status = SourcingStatus.AWARDED;
    if (dto.awardJustification) {
      project.metadata = { ...project.metadata, awardJustification: dto.awardJustification };
    }

    const saved = await this.projectRepository.save(project);
    this.logger.log(`Sourcing project awarded: ${saved.projectNumber}, winning bid: ${bid.bidNumber}`);
    return saved;
  }

  async deleteProject(id: string, tenantId: string): Promise<void> {
    const project = await this.findOneProject(id, tenantId);

    if (project.status !== SourcingStatus.DRAFT) {
      throw new BadRequestException('Only draft projects can be deleted');
    }

    await this.projectRepository.softDelete(id);
    this.logger.log(`Sourcing project soft-deleted: ${project.projectNumber}`);
  }

  // ── Bids ───────────────────────────────────────────────────────────

  async createBid(
    dto: CreateBidDto,
    userId: string,
    tenantId: string,
  ): Promise<Bid> {
    const project = await this.findOneProject(dto.sourcingProjectId, tenantId);

    if (project.status !== SourcingStatus.BIDDING_OPEN) {
      throw new BadRequestException('Bidding is not open for this project');
    }

    const bidNumber = await this.generateBidNumber();

    const bid = this.bidRepository.create({
      ...dto,
      bidNumber,
      status: BidStatus.DRAFT,
      createdBy: userId,
      tenantId,
    });

    const saved = await this.bidRepository.save(bid);
    this.logger.log(`Bid created: ${saved.bidNumber} for project ${project.projectNumber}`);
    return saved;
  }

  async submitBid(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id, tenantId },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    if (bid.status !== BidStatus.DRAFT) {
      throw new BadRequestException('Only draft bids can be submitted');
    }

    bid.status = BidStatus.SUBMITTED;
    bid.submittedAt = new Date();
    const saved = await this.bidRepository.save(bid);
    this.logger.log(`Bid submitted: ${saved.bidNumber}`);
    return saved;
  }

  async evaluateBid(
    id: string,
    dto: EvaluateBidDto,
    userId: string,
    tenantId: string,
  ): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id, tenantId },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    if (bid.status !== BidStatus.SUBMITTED && bid.status !== BidStatus.UNDER_EVALUATION) {
      throw new BadRequestException('Bid must be submitted or under evaluation to score');
    }

    bid.technicalScore = dto.technicalScore;
    bid.commercialScore = dto.commercialScore;
    bid.overallScore = (dto.technicalScore * 0.6) + (dto.commercialScore * 0.4);
    bid.status = BidStatus.UNDER_EVALUATION;

    if (dto.comments) {
      const comment = {
        evaluatorId: userId,
        comments: dto.comments,
        evaluatedAt: new Date().toISOString(),
      };
      bid.evaluatorComments = [...(bid.evaluatorComments || []), comment];
    }

    const saved = await this.bidRepository.save(bid);
    this.logger.log(`Bid evaluated: ${saved.bidNumber}, overall score: ${saved.overallScore}`);
    return saved;
  }

  async getBidsForProject(
    projectId: string,
    tenantId: string,
  ): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { sourcingProjectId: projectId, tenantId },
      order: { overallScore: 'DESC' },
    });
  }

  // ── Private Helpers ────────────────────────────────────────────────

  private async generateProjectNumber(): Promise<string> {
    this.projectCounter++;
    const year = new Date().getFullYear();
    return `SRC-${year}-${String(this.projectCounter).padStart(6, '0')}`;
  }

  private async generateBidNumber(): Promise<string> {
    this.bidCounter++;
    const year = new Date().getFullYear();
    return `BID-${year}-${String(this.bidCounter).padStart(6, '0')}`;
  }
}
