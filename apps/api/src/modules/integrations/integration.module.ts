import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { Integration } from './entities/integration.entity';
import { SyncJob } from './entities/sync-job.entity';
import { Connector } from './entities/connector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration, SyncJob, Connector])],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
