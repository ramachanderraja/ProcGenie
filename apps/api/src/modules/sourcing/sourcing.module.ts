import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingController } from './sourcing.controller';
import { SourcingService } from './sourcing.service';
import { SourcingProject } from './entities/sourcing-project.entity';
import { Bid } from './entities/bid.entity';
import { EvaluationCriteria } from './entities/evaluation-criteria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingProject, Bid, EvaluationCriteria])],
  controllers: [SourcingController],
  providers: [SourcingService],
  exports: [SourcingService],
})
export class SourcingModule {}
