import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SustainabilityController } from './sustainability.controller';
import { SustainabilityService } from './sustainability.service';
import { EsgScore } from './entities/esg-score.entity';
import { CarbonFootprint } from './entities/carbon-footprint.entity';
import { RegulatoryAlert } from './entities/regulatory-alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EsgScore, CarbonFootprint, RegulatoryAlert])],
  controllers: [SustainabilityController],
  providers: [SustainabilityService],
  exports: [SustainabilityService],
})
export class SustainabilityModule {}
