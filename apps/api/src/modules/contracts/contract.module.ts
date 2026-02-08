import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';
import { Clause } from './entities/clause.entity';
import { Amendment } from './entities/amendment.entity';
import { Obligation } from './entities/obligation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Clause, Amendment, Obligation])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
