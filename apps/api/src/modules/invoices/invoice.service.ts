import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { ThreeWayMatch, MatchStatus, MatchType } from './entities/three-way-match.entity';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  OverrideMatchDto,
} from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private invoiceCounter = 0;

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(ThreeWayMatch)
    private readonly matchRepository: Repository<ThreeWayMatch>,
  ) {}

  async create(
    dto: CreateInvoiceDto,
    userId: string,
    tenantId: string,
  ): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = this.invoiceRepository.create({
      ...dto,
      invoiceNumber,
      status: InvoiceStatus.RECEIVED,
      receivedDate: new Date(),
      createdBy: userId,
      tenantId,
    });

    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice created: ${saved.invoiceNumber} by user ${userId}`);
    return saved;
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: InvoiceStatus;
      supplierId?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('invoice.status = :status', { status: options.status });
    }

    if (options?.supplierId) {
      queryBuilder.andWhere('invoice.supplier_id = :supplierId', {
        supplierId: options.supplierId,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(invoice.invoice_number ILIKE :search OR invoice.supplier_name ILIKE :search OR invoice.supplier_invoice_number ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    queryBuilder
      .orderBy('invoice.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
      relations: ['matchResults'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async update(
    id: string,
    dto: UpdateInvoiceDto,
    userId: string,
    tenantId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);

    const editableStatuses = [
      InvoiceStatus.RECEIVED,
      InvoiceStatus.PENDING_VALIDATION,
      InvoiceStatus.EXCEPTION,
    ];

    if (!editableStatuses.includes(invoice.status)) {
      throw new BadRequestException(
        `Cannot update invoice in status: ${invoice.status}`,
      );
    }

    Object.assign(invoice, dto);
    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice updated: ${saved.invoiceNumber} by user ${userId}`);
    return saved;
  }

  async performThreeWayMatch(
    id: string,
    tenantId: string,
  ): Promise<ThreeWayMatch> {
    const invoice = await this.findOne(id, tenantId);

    if (!invoice.purchaseOrderId) {
      throw new BadRequestException('Invoice must have a linked purchase order for matching');
    }

    invoice.status = InvoiceStatus.MATCHING;
    await this.invoiceRepository.save(invoice);

    // Simulated three-way match logic
    // In production, this would compare PO, GR, and Invoice amounts
    const poAmount = Number(invoice.totalAmount);
    const invoiceAmount = Number(invoice.totalAmount);
    const variancePercentage = Math.abs(((invoiceAmount - poAmount) / poAmount) * 100);
    const tolerancePercentage = 5.0;

    const isMatch = variancePercentage <= tolerancePercentage;

    const match = this.matchRepository.create({
      invoiceId: invoice.id,
      purchaseOrderId: invoice.purchaseOrderId,
      matchType: MatchType.THREE_WAY,
      matchStatus: isMatch ? MatchStatus.MATCHED : MatchStatus.EXCEPTION,
      poAmountMatch: true,
      grQuantityMatch: isMatch,
      invoiceAmountMatch: isMatch,
      poAmount,
      invoiceAmount,
      variancePercentage,
      tolerancePercentage,
      matchedAt: isMatch ? new Date() : undefined,
      tenantId,
      exceptionDetails: !isMatch
        ? { reason: 'Amount variance exceeds tolerance', variance: variancePercentage }
        : undefined,
    });

    const savedMatch = await this.matchRepository.save(match);

    // Update invoice status based on match result
    invoice.status = isMatch ? InvoiceStatus.MATCHED : InvoiceStatus.EXCEPTION;
    if (!isMatch) {
      invoice.exceptionReason = `Three-way match failed: ${variancePercentage.toFixed(2)}% variance exceeds ${tolerancePercentage}% tolerance`;
    }
    await this.invoiceRepository.save(invoice);

    this.logger.log(
      `Three-way match for ${invoice.invoiceNumber}: ${savedMatch.matchStatus}`,
    );

    return savedMatch;
  }

  async approveInvoice(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);

    const approvableStatuses = [
      InvoiceStatus.MATCHED,
      InvoiceStatus.PENDING_APPROVAL,
    ];

    if (!approvableStatuses.includes(invoice.status)) {
      throw new BadRequestException(
        `Cannot approve invoice in status: ${invoice.status}`,
      );
    }

    invoice.status = InvoiceStatus.APPROVED;
    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice approved: ${saved.invoiceNumber} by user ${userId}`);
    return saved;
  }

  async schedulePayment(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);

    if (invoice.status !== InvoiceStatus.APPROVED) {
      throw new BadRequestException('Invoice must be approved before scheduling payment');
    }

    invoice.status = InvoiceStatus.SCHEDULED_FOR_PAYMENT;
    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice scheduled for payment: ${saved.invoiceNumber}`);
    return saved;
  }

  async markPaid(
    id: string,
    userId: string,
    tenantId: string,
    paymentDate?: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);

    if (invoice.status !== InvoiceStatus.SCHEDULED_FOR_PAYMENT) {
      throw new BadRequestException('Invoice must be scheduled for payment before marking as paid');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice marked as paid: ${saved.invoiceNumber}`);
    return saved;
  }

  async rejectInvoice(
    id: string,
    userId: string,
    tenantId: string,
    reason: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);

    invoice.status = InvoiceStatus.REJECTED;
    invoice.exceptionReason = reason;
    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice rejected: ${saved.invoiceNumber} by user ${userId}`);
    return saved;
  }

  async overrideMatchException(
    matchId: string,
    dto: OverrideMatchDto,
    userId: string,
    tenantId: string,
  ): Promise<ThreeWayMatch> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId, tenantId },
    });

    if (!match) {
      throw new NotFoundException(`Match result with ID ${matchId} not found`);
    }

    if (match.matchStatus !== MatchStatus.EXCEPTION) {
      throw new BadRequestException('Only exception matches can be overridden');
    }

    match.matchStatus = MatchStatus.OVERRIDE;
    match.overrideBy = userId;
    match.overrideReason = dto.reason;
    match.matchedAt = new Date();

    const saved = await this.matchRepository.save(match);

    // Update invoice status
    const invoice = await this.invoiceRepository.findOne({
      where: { id: match.invoiceId, tenantId },
    });
    if (invoice) {
      invoice.status = InvoiceStatus.PENDING_APPROVAL;
      invoice.exceptionReason = null;
      await this.invoiceRepository.save(invoice);
    }

    this.logger.log(`Match exception overridden for match ${matchId} by user ${userId}`);
    return saved;
  }

  async getMatchResults(
    invoiceId: string,
    tenantId: string,
  ): Promise<ThreeWayMatch[]> {
    return this.matchRepository.find({
      where: { invoiceId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  private async generateInvoiceNumber(): Promise<string> {
    this.invoiceCounter++;
    const year = new Date().getFullYear();
    return `INV-${year}-${String(this.invoiceCounter).padStart(6, '0')}`;
  }
}
