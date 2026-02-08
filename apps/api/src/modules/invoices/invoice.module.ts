import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { Invoice } from './entities/invoice.entity';
import { ThreeWayMatch } from './entities/three-way-match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, ThreeWayMatch])],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
