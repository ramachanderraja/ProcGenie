import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PoStatus } from './entities/purchase-order.entity';
import { LineItem } from './entities/line-item.entity';
import { GoodsReceipt, GoodsReceiptStatus } from './entities/goods-receipt.entity';
import { CatalogItem } from './entities/catalog-item.entity';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CreateGoodsReceiptDto,
} from './dto/buying.dto';

@Injectable()
export class BuyingService {
  private readonly logger = new Logger(BuyingService.name);
  private poCounter = 0;
  private grCounter = 0;

  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(LineItem)
    private readonly lineItemRepository: Repository<LineItem>,
    @InjectRepository(GoodsReceipt)
    private readonly grRepository: Repository<GoodsReceipt>,
    @InjectRepository(CatalogItem)
    private readonly catalogRepository: Repository<CatalogItem>,
  ) {}

  async createPurchaseOrder(
    dto: CreatePurchaseOrderDto,
    userId: string,
    tenantId: string,
  ): Promise<PurchaseOrder> {
    const poNumber = await this.generatePoNumber();

    const lineItems = dto.lineItems.map((item) => {
      const li = new LineItem();
      Object.assign(li, item);
      li.totalPrice = item.unitPrice * item.quantity;
      li.tenantId = tenantId;
      return li;
    });

    const totalAmount = lineItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const po = this.poRepository.create({
      ...dto,
      poNumber,
      buyerId: userId,
      createdBy: userId,
      tenantId,
      totalAmount,
      lineItems,
      status: PoStatus.DRAFT,
    });

    const saved = await this.poRepository.save(po);
    this.logger.log(`PO created: ${saved.poNumber} by user ${userId}`);
    return saved;
  }

  async findAllPurchaseOrders(
    tenantId: string,
    options?: {
      status?: PoStatus;
      supplierId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: PurchaseOrder[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.poRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.lineItems', 'lineItems')
      .where('po.tenant_id = :tenantId', { tenantId });

    if (options?.status) {
      queryBuilder.andWhere('po.status = :status', { status: options.status });
    }

    if (options?.supplierId) {
      queryBuilder.andWhere('po.supplier_id = :supplierId', {
        supplierId: options.supplierId,
      });
    }

    queryBuilder
      .orderBy('po.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findPurchaseOrder(id: string, tenantId: string): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({
      where: { id, tenantId },
      relations: ['lineItems'],
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order ${id} not found`);
    }

    return po;
  }

  async updatePurchaseOrder(
    id: string,
    dto: UpdatePurchaseOrderDto,
    tenantId: string,
  ): Promise<PurchaseOrder> {
    const po = await this.findPurchaseOrder(id, tenantId);

    if (po.status !== PoStatus.DRAFT) {
      throw new BadRequestException(`Cannot update PO in status: ${po.status}`);
    }

    if (dto.lineItems) {
      await this.lineItemRepository.delete({ purchaseOrderId: id });
      po.lineItems = dto.lineItems.map((item) => {
        const li = new LineItem();
        Object.assign(li, item);
        li.totalPrice = item.unitPrice * item.quantity;
        li.purchaseOrderId = id;
        li.tenantId = tenantId;
        return li;
      });
      po.totalAmount = po.lineItems.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0,
      );
    }

    Object.assign(po, { ...dto, lineItems: po.lineItems });
    return this.poRepository.save(po);
  }

  async submitForApproval(id: string, tenantId: string): Promise<PurchaseOrder> {
    const po = await this.findPurchaseOrder(id, tenantId);

    if (po.status !== PoStatus.DRAFT) {
      throw new BadRequestException('Only draft POs can be submitted');
    }

    po.status = PoStatus.PENDING_APPROVAL;
    return this.poRepository.save(po);
  }

  async approvePurchaseOrder(id: string, tenantId: string): Promise<PurchaseOrder> {
    const po = await this.findPurchaseOrder(id, tenantId);
    po.status = PoStatus.APPROVED;
    return this.poRepository.save(po);
  }

  async sendToSupplier(id: string, tenantId: string): Promise<PurchaseOrder> {
    const po = await this.findPurchaseOrder(id, tenantId);

    if (po.status !== PoStatus.APPROVED) {
      throw new BadRequestException('PO must be approved before sending');
    }

    po.status = PoStatus.SENT_TO_SUPPLIER;
    this.logger.log(`PO ${po.poNumber} sent to supplier`);
    return this.poRepository.save(po);
  }

  // Goods Receipt
  async createGoodsReceipt(
    dto: CreateGoodsReceiptDto,
    userId: string,
    tenantId: string,
  ): Promise<GoodsReceipt> {
    const receiptNumber = await this.generateGrNumber();

    const gr = this.grRepository.create({
      ...dto,
      receiptNumber,
      receivedBy: userId,
      createdBy: userId,
      tenantId,
      status: GoodsReceiptStatus.COMPLETE,
    });

    const saved = await this.grRepository.save(gr);
    this.logger.log(`Goods Receipt created: ${saved.receiptNumber}`);
    return saved;
  }

  async getGoodsReceipts(poId: string, tenantId: string): Promise<GoodsReceipt[]> {
    return this.grRepository.find({
      where: { purchaseOrderId: poId, tenantId },
      order: { receivedDate: 'DESC' },
    });
  }

  // Catalog
  async getCatalogItems(
    tenantId: string,
    category?: string,
    search?: string,
  ): Promise<CatalogItem[]> {
    const queryBuilder = this.catalogRepository
      .createQueryBuilder('item')
      .where('item.tenant_id = :tenantId', { tenantId })
      .andWhere('item.is_active = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('item.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere(
        '(item.name ILIKE :search OR item.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.orderBy('item.name', 'ASC').getMany();
  }

  private async generatePoNumber(): Promise<string> {
    this.poCounter++;
    const year = new Date().getFullYear();
    return `PO-${year}-${String(this.poCounter).padStart(6, '0')}`;
  }

  private async generateGrNumber(): Promise<string> {
    this.grCounter++;
    const year = new Date().getFullYear();
    return `GR-${year}-${String(this.grCounter).padStart(6, '0')}`;
  }
}
