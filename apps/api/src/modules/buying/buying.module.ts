import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderController } from './buying.controller';
import { BuyingService } from './buying.service';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { LineItem } from './entities/line-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { CatalogItem } from './entities/catalog-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, LineItem, GoodsReceipt, CatalogItem]),
  ],
  controllers: [PurchaseOrderController],
  providers: [BuyingService],
  exports: [BuyingService],
})
export class BuyingModule {}
