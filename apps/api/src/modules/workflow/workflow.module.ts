import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { Workflow } from './entities/workflow.entity';
import { WorkflowStep } from './entities/workflow-step.entity';
import { Approval } from './entities/approval.entity';
import { SLA } from './entities/sla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowStep, Approval, SLA])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
