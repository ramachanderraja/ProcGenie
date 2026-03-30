import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowTriggerService } from './workflow-trigger.service';
import { EntityStatusService } from './entity-status.service';
import { Workflow } from './entities/workflow.entity';
import { WorkflowStep } from './entities/workflow-step.entity';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { Approval } from './entities/approval.entity';
import { SLA } from './entities/sla.entity';

// Entity imports for EntityStatusService
import { Request } from '../intake/entities/request.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { PurchaseOrder } from '../buying/entities/purchase-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workflow,
      WorkflowStep,
      WorkflowInstance,
      Approval,
      SLA,
      // Entities needed by EntityStatusService
      Request,
      Contract,
      Invoice,
      PurchaseOrder,
    ]),
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowEngineService,
    WorkflowTriggerService,
    EntityStatusService,
  ],
  exports: [WorkflowService, WorkflowEngineService],
})
export class WorkflowModule implements OnModuleInit {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowEngineService: WorkflowEngineService,
  ) {}

  onModuleInit() {
    // Wire up the circular dependency between WorkflowService and WorkflowEngineService
    this.workflowService.setEngineService(this.workflowEngineService);
  }
}
