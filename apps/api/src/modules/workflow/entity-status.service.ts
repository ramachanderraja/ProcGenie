import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '../intake/entities/request.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { PurchaseOrder } from '../buying/entities/purchase-order.entity';

@Injectable()
export class EntityStatusService {
  private readonly logger = new Logger(EntityStatusService.name);

  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
  ) {}

  /**
   * Generic cross-module status updater.
   * Switches on entityType to call the appropriate repository.
   */
  async updateStatus(
    entityType: string,
    entityId: string,
    status: string,
    tenantId: string,
  ): Promise<void> {
    this.logger.log(`Updating ${entityType}:${entityId} status to "${status}"`);

    switch (entityType.toUpperCase()) {
      case 'REQUEST':
        await this.requestRepository.update(
          { id: entityId, tenantId },
          { status: status as any },
        );
        break;

      case 'CONTRACT':
        await this.contractRepository.update(
          { id: entityId, tenantId },
          { status: status as any },
        );
        break;

      case 'INVOICE':
        await this.invoiceRepository.update(
          { id: entityId, tenantId },
          { status: status as any },
        );
        break;

      case 'PURCHASE_ORDER':
        await this.poRepository.update(
          { id: entityId, tenantId },
          { status: status as any },
        );
        break;

      default:
        this.logger.warn(`Unknown entity type: ${entityType}`);
        break;
    }
  }
}
