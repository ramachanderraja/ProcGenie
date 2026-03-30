import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow, WorkflowStatus } from './entities/workflow.entity';
import { WorkflowEngineService } from './workflow-engine.service';

interface WorkflowEvent {
  entityType: string;
  entityId: string;
  entity: Record<string, unknown>;
  tenantId: string;
}

interface GraphNode {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface Condition {
  field: string;
  operator: string;
  value: any;
}

@Injectable()
export class WorkflowTriggerService {
  private readonly logger = new Logger(WorkflowTriggerService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    private readonly workflowEngineService: WorkflowEngineService,
  ) {}

  @OnEvent('request.submitted')
  async onRequestSubmitted(event: WorkflowEvent): Promise<void> {
    this.logger.log(`Event received: request.submitted for ${event.entityId}`);
    await this.triggerMatchingWorkflows({ ...event, entityType: 'REQUEST' });
  }

  @OnEvent('request.created')
  async onRequestCreated(event: WorkflowEvent): Promise<void> {
    this.logger.log(`Event received: request.created for ${event.entityId}`);
    await this.triggerMatchingWorkflows({ ...event, entityType: 'REQUEST' });
  }

  @OnEvent('contract.submitted')
  async onContractSubmitted(event: WorkflowEvent): Promise<void> {
    this.logger.log(`Event received: contract.submitted for ${event.entityId}`);
    await this.triggerMatchingWorkflows({ ...event, entityType: 'CONTRACT' });
  }

  @OnEvent('invoice.created')
  async onInvoiceCreated(event: WorkflowEvent): Promise<void> {
    this.logger.log(`Event received: invoice.created for ${event.entityId}`);
    await this.triggerMatchingWorkflows({ ...event, entityType: 'INVOICE' });
  }

  @OnEvent('po.submitted')
  async onPoSubmitted(event: WorkflowEvent): Promise<void> {
    this.logger.log(`Event received: po.submitted for ${event.entityId}`);
    await this.triggerMatchingWorkflows({ ...event, entityType: 'PURCHASE_ORDER' });
  }

  /**
   * Find all ACTIVE workflows matching the entity type, evaluate start conditions,
   * and create instances for matches.
   */
  private async triggerMatchingWorkflows(event: WorkflowEvent): Promise<void> {
    try {
      // Find all active workflows that include this entity type
      const workflows = await this.workflowRepository.find({
        where: {
          status: WorkflowStatus.ACTIVE,
          tenantId: event.tenantId,
        },
      });

      // Filter to workflows that have matching entityTypes
      const matchingWorkflows = workflows.filter((w) => {
        if (!w.entityTypes || w.entityTypes.length === 0) return false;
        return w.entityTypes.includes(event.entityType);
      });

      if (matchingWorkflows.length === 0) {
        this.logger.debug(`No active workflows found for ${event.entityType} in tenant ${event.tenantId}`);
        return;
      }

      this.logger.log(`Found ${matchingWorkflows.length} matching workflow(s) for ${event.entityType}:${event.entityId}`);

      for (const workflow of matchingWorkflows) {
        try {
          // Evaluate start node conditions
          if (this.evaluateStartConditions(workflow, event.entity)) {
            this.logger.log(`Starting workflow "${workflow.name}" for ${event.entityType}:${event.entityId}`);
            await this.workflowEngineService.startWorkflow(
              workflow,
              event.entityType,
              event.entityId,
              event.entity,
              event.tenantId,
            );
          } else {
            this.logger.debug(`Start conditions not met for workflow "${workflow.name}"`);
          }
        } catch (error) {
          this.logger.error(
            `Failed to start workflow "${workflow.name}" for ${event.entityType}:${event.entityId}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in triggerMatchingWorkflows: ${error.message}`);
    }
  }

  /**
   * Evaluate the Start node's conditions against the entity data.
   * If no conditions, the workflow matches automatically.
   */
  private evaluateStartConditions(
    workflow: Workflow,
    entity: Record<string, unknown>,
  ): boolean {
    const graph = workflow.graph as any;
    if (!graph || !graph.nodes) return false;

    const startNode = (graph.nodes as GraphNode[]).find((n) => n.type === 'start');
    if (!startNode) return false;

    const conditions: Condition[] = startNode.data?.conditions;
    if (!conditions || conditions.length === 0) {
      // No conditions means always match
      return true;
    }

    // All conditions must be met (AND logic)
    const context = { entity };
    return conditions.every((cond) =>
      this.workflowEngineService.evaluateCondition(
        context,
        `entity.${cond.field}`,
        cond.operator,
        cond.value,
      ),
    );
  }
}
