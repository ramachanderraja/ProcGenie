import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { Supplier } from './entities/supplier.entity';
import { SupplierDocument } from './entities/supplier-document.entity';
import { PerformanceScore } from './entities/performance-score.entity';
import { RiskProfile } from './entities/risk-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, SupplierDocument, PerformanceScore, RiskProfile]),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
