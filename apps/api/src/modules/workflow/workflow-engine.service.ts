import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowInstance, WorkflowInstanceStatus } from './entities/workflow-instance.entity';
import { Workflow } from './entities/workflow.entity';
import { WorkflowService } from './workflow.service';
import { EntityStatusService } from './entity-status.service';
import { AiService } from '../../common/services/ai.service';
import { ApprovalEntityType } from './entities/approval.entity';

interface GraphNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position?: { x: number; y: number };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

interface WorkflowGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(WorkflowInstance)
    private readonly instanceRepository: Repository<WorkflowInstance>,
    private readonly workflowService: WorkflowService,
    private readonly entityStatusService: EntityStatusService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Start a new workflow instance from a definition.
   */
  async startWorkflow(
    definition: Workflow,
    entityType: string,
    entityId: string,
    entity: Record<string, unknown>,
    tenantId: string,
  ): Promise<WorkflowInstance> {
    const graph = definition.graph as unknown as WorkflowGraph;
    if (!graph || !graph.nodes || !graph.edges) {
      throw new Error(`Workflow ${definition.id} has no valid graph`);
    }

    const instance = this.instanceRepository.create({
      workflowDefinitionId: definition.id,
      definitionVersion: definition.version,
      entityType,
      entityId,
      status: WorkflowInstanceStatus.RUNNING,
      currentStepIds: [],
      context: {
        entity,
        trigger: {
          event: `${entityType.toLowerCase()}.submitted`,
          timestamp: new Date().toISOString(),
        },
        steps: {},
      },
      history: [],
      startedAt: new Date(),
      tenantId,
    });

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(`Workflow instance ${saved.id} started for ${entityType}:${entityId}`);

    // Find the Start node and begin execution
    const startNode = graph.nodes.find((n) => n.type === 'start');
    if (!startNode) {
      saved.status = WorkflowInstanceStatus.FAILED;
      saved.error = 'No start node found in workflow graph';
      await this.instanceRepository.save(saved);
      return saved;
    }

    try {
      await this.executeStep(saved, startNode.id, definition);
    } catch (error) {
      saved.status = WorkflowInstanceStatus.FAILED;
      saved.error = error.message || 'Unknown execution error';
      await this.instanceRepository.save(saved);
      this.logger.error(`Workflow instance ${saved.id} failed: ${error.message}`);
    }

    return saved;
  }

  /**
   * Recursive step executor — processes a single node and follows edges.
   */
  async executeStep(
    instance: WorkflowInstance,
    nodeId: string,
    definition: Workflow,
  ): Promise<void> {
    const graph = definition.graph as unknown as WorkflowGraph;
    const node = graph.nodes.find((n) => n.id === nodeId);

    if (!node) {
      throw new Error(`Node ${nodeId} not found in workflow graph`);
    }

    // Record step entry in history
    const historyEntry: Record<string, unknown> = {
      stepId: nodeId,
      stepType: node.type,
      action: 'entered',
      timestamp: new Date().toISOString(),
    };
    instance.history = [...(instance.history || []), historyEntry];
    instance.currentStepIds = [nodeId];
    await this.instanceRepository.save(instance);

    this.logger.debug(`Executing step ${nodeId} (${node.type}) for instance ${instance.id}`);

    switch (node.type) {
      case 'start':
        await this.handleStartNode(instance, node, graph);
        break;

      case 'approval':
        await this.handleApprovalNode(instance, node, definition);
        return; // STOP — resumes when approval action is taken

      case 'condition':
        await this.handleConditionNode(instance, node, graph, definition);
        return; // handleConditionNode calls executeStep recursively

      case 'action':
        await this.handleActionNode(instance, node, graph, definition);
        return; // handleActionNode calls executeStep recursively

      case 'ai_review':
        await this.handleAiReviewNode(instance, node, graph, definition);
        return; // handleAiReviewNode calls executeStep recursively

      case 'end':
        await this.handleEndNode(instance, node);
        return;

      default: {
        this.logger.warn(`Unknown node type: ${node.type}, skipping`);
        const nextEdge = this.findOutgoingEdge(graph, nodeId);
        if (nextEdge) {
          await this.executeStep(instance, nextEdge.target, definition);
        }
        return;
      }
    }
  }

  /**
   * Resume workflow execution after an approval decision.
   */
  async resumeFromApproval(
    entityType: string,
    entityId: string,
    approvalResult: 'approved' | 'rejected',
  ): Promise<WorkflowInstance | null> {
    // Find the PAUSED instance for this entity
    const instance = await this.instanceRepository.findOne({
      where: {
        entityType,
        entityId,
        status: WorkflowInstanceStatus.PAUSED,
      },
    });

    if (!instance) {
      this.logger.debug(`No paused workflow instance found for ${entityType}:${entityId}`);
      return null;
    }

    // Load the workflow definition
    const definition = await this.workflowService.findWorkflow(
      instance.workflowDefinitionId,
      instance.tenantId,
    );

    const graph = definition.graph as unknown as WorkflowGraph;
    if (!graph) {
      return null;
    }

    // Get current node (the approval node that paused the workflow)
    const currentNodeId = instance.currentStepIds?.[0];
    if (!currentNodeId) {
      return null;
    }

    // Record approval result in context
    const context = instance.context || {};
    const steps = (context.steps || {}) as Record<string, unknown>;
    steps[currentNodeId] = {
      ...(steps[currentNodeId] as Record<string, unknown> || {}),
      action: approvalResult.toUpperCase(),
      completedAt: new Date().toISOString(),
    };
    context.steps = steps;
    instance.context = context;

    // Record history
    instance.history = [
      ...(instance.history || []),
      {
        stepId: currentNodeId,
        stepType: 'approval',
        action: `approval_${approvalResult}`,
        timestamp: new Date().toISOString(),
      },
    ];

    // Resume execution — follow the approved/rejected edge
    instance.status = WorkflowInstanceStatus.RUNNING;
    await this.instanceRepository.save(instance);

    const nextEdge = this.findOutgoingEdge(graph, currentNodeId, approvalResult);
    if (nextEdge) {
      try {
        await this.executeStep(instance, nextEdge.target, definition);
      } catch (error) {
        instance.status = WorkflowInstanceStatus.FAILED;
        instance.error = error.message || 'Unknown execution error';
        await this.instanceRepository.save(instance);
      }
    } else {
      // No edge for this result — mark instance as completed
      instance.status = WorkflowInstanceStatus.COMPLETED;
      instance.completedAt = new Date();
      await this.instanceRepository.save(instance);
    }

    return instance;
  }

  /**
   * Dry-run test: walk the graph and return a step trace without side effects.
   */
  async testWorkflow(
    definition: Workflow,
    entityData: Record<string, unknown>,
  ): Promise<{ steps: Record<string, unknown>[]; success: boolean }> {
    const graph = definition.graph as unknown as WorkflowGraph;
    if (!graph || !graph.nodes || !graph.edges) {
      return { steps: [], success: false };
    }

    const startNode = graph.nodes.find((n) => n.type === 'start');
    if (!startNode) {
      return { steps: [{ error: 'No start node found' }], success: false };
    }

    const context = { entity: entityData, steps: {} };
    const trace: Record<string, unknown>[] = [];
    let currentNodeId: string | null = startNode.id;
    let maxSteps = 50; // Safety limit

    while (currentNodeId && maxSteps > 0) {
      maxSteps--;
      const node = graph.nodes.find((n) => n.id === currentNodeId);
      if (!node) break;

      const step: Record<string, unknown> = {
        nodeId: node.id,
        nodeType: node.type,
        data: node.data,
      };

      switch (node.type) {
        case 'start': {
          step.result = 'entered';
          const startEdge = this.findOutgoingEdge(graph, node.id);
          currentNodeId = startEdge?.target || null;
          break;
        }

        case 'condition': {
          const condResult = this.evaluateCondition(
            context,
            node.data.field,
            node.data.operator,
            node.data.value,
          );
          step.result = condResult ? 'true' : 'false';
          const condEdge = this.findOutgoingEdge(graph, node.id, condResult ? 'true' : 'false');
          currentNodeId = condEdge?.target || null;
          break;
        }

        case 'approval': {
          step.result = 'would_pause_for_approval';
          step.approvers = node.data.approvers;
          // In test mode, assume approval
          const approvalEdge = this.findOutgoingEdge(graph, node.id, 'approved');
          currentNodeId = approvalEdge?.target || null;
          break;
        }

        case 'action': {
          step.result = `would_execute: ${node.data.actionType}`;
          const actionEdge = this.findOutgoingEdge(graph, node.id);
          currentNodeId = actionEdge?.target || null;
          break;
        }

        case 'ai_review': {
          step.result = 'would_call_ai_review';
          // In test mode, assume above threshold
          const aiEdge = this.findOutgoingEdge(graph, node.id, 'above_threshold');
          currentNodeId = aiEdge?.target || null;
          break;
        }

        case 'end':
          step.result = `final_status: ${node.data.finalStatus || 'completed'}`;
          currentNodeId = null;
          break;

        default: {
          step.result = 'skipped_unknown_type';
          const defEdge = this.findOutgoingEdge(graph, node.id);
          currentNodeId = defEdge?.target || null;
          break;
        }
      }

      trace.push(step);
    }

    return { steps: trace, success: true };
  }

  // ── Private handlers ──────────────────────────────────────────────

  private async handleStartNode(
    instance: WorkflowInstance,
    node: GraphNode,
    graph: WorkflowGraph,
  ): Promise<void> {
    // Entity data already in context from startWorkflow
    const nextEdge = this.findOutgoingEdge(graph, node.id);
    if (nextEdge) {
      // Reload definition for recursive call
      const definition = await this.workflowService.findWorkflow(
        instance.workflowDefinitionId,
        instance.tenantId,
      );
      await this.executeStep(instance, nextEdge.target, definition);
    }
  }

  private async handleApprovalNode(
    instance: WorkflowInstance,
    node: GraphNode,
    definition: Workflow,
  ): Promise<void> {
    const data = node.data;
    const approvers: string[] = data.approvers || [];
    const slaHours = data.slaHours || 48;

    // Map entityType to ApprovalEntityType enum values
    const entityTypeMap: Record<string, ApprovalEntityType> = {
      REQUEST: ApprovalEntityType.REQUEST,
      CONTRACT: ApprovalEntityType.CONTRACT,
      INVOICE: ApprovalEntityType.INVOICE,
      PURCHASE_ORDER: ApprovalEntityType.PURCHASE_ORDER,
    };

    const approvalEntityType = entityTypeMap[instance.entityType] || (instance.entityType.toLowerCase() as any);

    // Create approval records for each approver
    for (let i = 0; i < approvers.length; i++) {
      let approverId = approvers[i];

      // Handle role: and user: prefixes
      if (approverId.startsWith('role:')) {
        // For role-based approvers, keep as-is (stored in approval metadata)
        // In a real system, this would resolve to actual users with that role
      } else if (approverId.startsWith('user:')) {
        approverId = approverId.substring(5);
      }

      await this.workflowService.createApproval(
        approvalEntityType as string,
        instance.entityId,
        approverId,
        instance.tenantId,
        i + 1,
        slaHours,
      );
    }

    // Set instance to PAUSED
    instance.status = WorkflowInstanceStatus.PAUSED;
    instance.currentStepIds = [node.id];

    // Record in context
    const context = instance.context || {};
    const steps = (context.steps || {}) as Record<string, unknown>;
    steps[node.id] = {
      type: 'approval',
      approvers,
      approvalMode: data.approvalMode || 'any',
      createdAt: new Date().toISOString(),
    };
    context.steps = steps;
    instance.context = context;

    instance.history = [
      ...(instance.history || []),
      {
        stepId: node.id,
        stepType: 'approval',
        action: 'paused_for_approval',
        timestamp: new Date().toISOString(),
        data: { approvers, slaHours },
      },
    ];

    await this.instanceRepository.save(instance);
    this.logger.log(`Instance ${instance.id} paused at approval node ${node.id}`);
  }

  private async handleConditionNode(
    instance: WorkflowInstance,
    node: GraphNode,
    graph: WorkflowGraph,
    definition: Workflow,
  ): Promise<void> {
    const { field, operator, value } = node.data;
    const context = instance.context || {};
    const result = this.evaluateCondition(context, field, operator, value);

    // Record condition result
    const steps = (context.steps || {}) as Record<string, unknown>;
    steps[node.id] = {
      type: 'condition',
      field,
      operator,
      value,
      result,
      evaluatedAt: new Date().toISOString(),
    };
    context.steps = steps;
    instance.context = context;

    instance.history = [
      ...(instance.history || []),
      {
        stepId: node.id,
        stepType: 'condition',
        action: `evaluated_${result}`,
        timestamp: new Date().toISOString(),
        data: { field, operator, value, result },
      },
    ];

    await this.instanceRepository.save(instance);

    // Follow the true or false edge
    const handleId = result ? 'true' : 'false';
    const nextEdge = this.findOutgoingEdge(graph, node.id, handleId);

    if (nextEdge) {
      await this.executeStep(instance, nextEdge.target, definition);
    } else {
      this.logger.warn(`No ${handleId} edge found from condition node ${node.id}`);
    }
  }

  private async handleActionNode(
    instance: WorkflowInstance,
    node: GraphNode,
    graph: WorkflowGraph,
    definition: Workflow,
  ): Promise<void> {
    const { actionType, config } = node.data;
    let actionResult: Record<string, unknown> = {};

    try {
      switch (actionType) {
        case 'update_status': {
          const newStatus = config?.status || config?.value;
          if (newStatus) {
            await this.entityStatusService.updateStatus(
              instance.entityType,
              instance.entityId,
              newStatus,
              instance.tenantId,
            );
            actionResult = { statusUpdated: newStatus };
          }
          break;
        }

        case 'three_way_match':
          // Simulated — in production this would trigger actual matching
          actionResult = { matchResult: 'passed', matchType: 'three_way' };
          break;

        case 'send_notification':
          // Simulated — in production this would trigger notification service
          actionResult = { notificationSent: true, recipient: config?.recipient };
          break;

        case 'schedule_payment':
          // Simulated — in production this would trigger payment scheduling
          actionResult = { paymentScheduled: true };
          break;

        case 'auto_approve':
          await this.entityStatusService.updateStatus(
            instance.entityType,
            instance.entityId,
            'approved',
            instance.tenantId,
          );
          actionResult = { autoApproved: true };
          break;

        default:
          actionResult = { executed: true, actionType };
          break;
      }
    } catch (error) {
      this.logger.error(`Action ${actionType} failed: ${error.message}`);
      actionResult = { error: error.message };
    }

    // Record in context
    const context = instance.context || {};
    const steps = (context.steps || {}) as Record<string, unknown>;
    steps[node.id] = {
      type: 'action',
      actionType,
      result: actionResult,
      executedAt: new Date().toISOString(),
    };
    context.steps = steps;
    instance.context = context;

    instance.history = [
      ...(instance.history || []),
      {
        stepId: node.id,
        stepType: 'action',
        action: `executed_${actionType}`,
        timestamp: new Date().toISOString(),
        data: actionResult,
      },
    ];

    await this.instanceRepository.save(instance);

    // Follow the single outgoing edge
    const nextEdge = this.findOutgoingEdge(graph, node.id);
    if (nextEdge) {
      await this.executeStep(instance, nextEdge.target, definition);
    }
  }

  private async handleAiReviewNode(
    instance: WorkflowInstance,
    node: GraphNode,
    graph: WorkflowGraph,
    definition: Workflow,
  ): Promise<void> {
    const { promptTemplate, confidenceThreshold } = node.data;
    const threshold = confidenceThreshold || 70;
    let aiResult: Record<string, unknown> = {};
    let confidence = 0;

    try {
      if (this.aiService.isConfigured) {
        const context = instance.context || {};
        const entity = context.entity || {};

        const systemPrompt = `You are an AI reviewer for a procurement workflow engine.
Analyze the following entity data and provide a review assessment.
Respond with JSON: { "confidence": number (0-100), "analysis": string, "suggestions": string[] }`;

        const userMessage = `${promptTemplate || 'Review the following entity:'}\n\n${JSON.stringify(entity, null, 2)}`;

        const result = await this.aiService.chatCompletionJson<{
          confidence: number;
          analysis: string;
          suggestions: string[];
        }>(systemPrompt, userMessage, { temperature: 0.3 });

        confidence = result.confidence;
        aiResult = result;
      } else {
        // Mock AI response when not configured
        confidence = 85;
        aiResult = {
          confidence: 85,
          analysis: 'Mock AI review — Azure OpenAI not configured',
          suggestions: ['Configure Azure OpenAI for real analysis'],
        };
      }
    } catch (error) {
      this.logger.error(`AI review failed: ${error.message}`);
      confidence = 0;
      aiResult = { error: error.message, confidence: 0 };
    }

    // Record in context
    const context = instance.context || {};
    const steps = (context.steps || {}) as Record<string, unknown>;
    steps[node.id] = {
      type: 'ai_review',
      confidence,
      ...aiResult,
      reviewedAt: new Date().toISOString(),
    };
    context.steps = steps;
    instance.context = context;

    instance.history = [
      ...(instance.history || []),
      {
        stepId: node.id,
        stepType: 'ai_review',
        action: confidence >= threshold ? 'above_threshold' : 'below_threshold',
        timestamp: new Date().toISOString(),
        data: { confidence, threshold },
      },
    ];

    await this.instanceRepository.save(instance);

    // Follow the appropriate edge
    const handleId = confidence >= threshold ? 'above_threshold' : 'below_threshold';
    const nextEdge = this.findOutgoingEdge(graph, node.id, handleId);
    if (nextEdge) {
      await this.executeStep(instance, nextEdge.target, definition);
    }
  }

  private async handleEndNode(
    instance: WorkflowInstance,
    node: GraphNode,
  ): Promise<void> {
    const finalStatus = node.data?.finalStatus;

    if (finalStatus) {
      try {
        await this.entityStatusService.updateStatus(
          instance.entityType,
          instance.entityId,
          finalStatus,
          instance.tenantId,
        );
      } catch (error) {
        this.logger.error(`Failed to set final status: ${error.message}`);
      }
    }

    instance.status = WorkflowInstanceStatus.COMPLETED;
    instance.completedAt = new Date();
    instance.currentStepIds = [];

    instance.history = [
      ...(instance.history || []),
      {
        stepId: node.id,
        stepType: 'end',
        action: 'completed',
        timestamp: new Date().toISOString(),
        data: { finalStatus },
      },
    ];

    await this.instanceRepository.save(instance);
    this.logger.log(`Workflow instance ${instance.id} completed with status: ${finalStatus}`);
  }

  // ── Helpers ───────────────────────────────────────────────────────

  /**
   * Evaluate a condition against the workflow context using dot-notation field paths.
   */
  evaluateCondition(
    context: Record<string, unknown>,
    field: string,
    operator: string,
    value: any,
  ): boolean {
    const fieldValue = this.resolveDotPath(context, field);

    switch (operator) {
      case 'eq':
        return fieldValue == value; // eslint-disable-line eqeqeq
      case 'neq':
        return fieldValue != value; // eslint-disable-line eqeqeq
      case 'gt':
        return Number(fieldValue) > Number(value);
      case 'gte':
        return Number(fieldValue) >= Number(value);
      case 'lt':
        return Number(fieldValue) < Number(value);
      case 'lte':
        return Number(fieldValue) <= Number(value);
      case 'in':
        if (Array.isArray(value)) {
          return value.includes(fieldValue);
        }
        return String(value).split(',').map((s: string) => s.trim()).includes(String(fieldValue));
      case 'contains':
        return String(fieldValue || '').toLowerCase().includes(String(value || '').toLowerCase());
      default:
        this.logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Find the outgoing edge from a node, optionally filtered by sourceHandle.
   */
  findOutgoingEdge(
    graph: WorkflowGraph,
    nodeId: string,
    handleId?: string,
  ): GraphEdge | undefined {
    if (handleId) {
      return graph.edges.find(
        (e) => e.source === nodeId && e.sourceHandle === handleId,
      );
    }
    return graph.edges.find((e) => e.source === nodeId);
  }

  /**
   * Resolve a dot-notation path into a nested object.
   * E.g., "entity.estimatedTotal" resolves context.entity.estimatedTotal
   */
  private resolveDotPath(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: any, key) => {
      if (current == null) return undefined;
      return current[key];
    }, obj);
  }
}
