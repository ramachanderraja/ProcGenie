import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';
import { Request } from './entities/request.entity';
import { RequestItem } from './entities/request-item.entity';
import { Draft } from './entities/draft.entity';
import { Template } from './entities/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Request, RequestItem, Draft, Template])],
  controllers: [IntakeController],
  providers: [IntakeService],
  exports: [IntakeService],
})
export class IntakeModule {}
