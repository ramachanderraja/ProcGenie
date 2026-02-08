// ---------------------------------------------------------------------------
// Module 2 — Orchestration & Workflow Engine
// Coordinates complex, multi-stakeholder processes with dynamic routing,
// full transparency, and resilient distributed transaction management.
// ---------------------------------------------------------------------------

import type { BaseEntity, UserReference } from './common';

// ---- Workflow Status & Step Enums ----------------------------------------

/** Top-level workflow execution status. */
export enum WorkflowStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  InReviewParallel = 'InReviewParallel',
  PendingApproval = 'PendingApproval',
  Completed = 'Completed',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
  Failed = 'Failed',
  /** Suspended by admin or SLA breach. */
  Suspended = 'Suspended',
  /** Compensating actions are running (Saga pattern). */
  Compensating = 'Compensating',
}

/** Status of an individual approval step within a workflow. */
export enum ApprovalStepStatus {
  Pending = 'pending',
  Current = 'current',
  Approved = 'approved',
  Rejected = 'rejected',
  Skipped = 'skipped',
  Escalated = 'escalated',
  /** Delegated to another user. */
  Delegated = 'delegated',
  /** Timed-out and auto-escalated. */
  TimedOut = 'timed_out',
}

/** The type of node in the visual workflow builder. */
export enum WorkflowNodeType {
  Start = 'start',
  End = 'end',
  Approval = 'approval',
  ParallelBranch = 'parallel_branch',
  ConditionalGate = 'conditional_gate',
  Timer = 'timer',
  AgentTask = 'agent_task',
  Notification = 'notification',
  ExternalSystem = 'external_system',
  HumanTask = 'human_task',
  SubWorkflow = 'sub_workflow',
}

// ---- Workflow Definition (design-time) -----------------------------------

/**
 * A reusable workflow definition created in the no-code visual builder (FR-2.6).
 * Versioned — a new version is created on every publish.
 */
export interface WorkflowDefinition extends BaseEntity {
  name: string;
  description?: string;
  /** Ordered list of step definitions composing the workflow. */
  steps: WorkflowStepDefinition[];
  /** Connections between steps (directed graph edges). */
  edges: WorkflowEdge[];
  /** Top-level SLA configuration for the entire workflow. */
  slaConfig?: SLAConfig;
  /** Global escalation rules applied when step-level rules are absent. */
  escalationRules: EscalationRule[];
  /** Delegation rules for out-of-office scenarios. */
  delegationRules: DelegationRule[];
  /** Status of this definition version. */
  status: 'draft' | 'active' | 'archived';
  /** Monotonically increasing version number. */
  definitionVersion: number;
  /** Category / request types this workflow applies to. */
  triggerCategories: string[];
  /** Conditional trigger expression (JSONLogic). */
  triggerCondition?: Record<string, unknown>;
  publishedAt?: string;
  publishedBy?: string;
}

/**
 * A single step in the workflow definition (design-time template).
 */
export interface WorkflowStepDefinition {
  id: string;
  name: string;
  description?: string;
  type: WorkflowNodeType;
  /** Position in the visual canvas. */
  position: { x: number; y: number };
  /** Step-level SLA overriding the workflow-level default. */
  slaConfig?: SLAConfig;
  /** Configuration specific to the node type. */
  config: WorkflowStepConfig;
}

/** Type-discriminated configuration union for different node types. */
export type WorkflowStepConfig =
  | ApprovalStepConfig
  | ParallelBranchConfig
  | ConditionalGateConfig
  | TimerStepConfig
  | AgentTaskStepConfig
  | NotificationStepConfig
  | ExternalSystemStepConfig
  | HumanTaskStepConfig
  | SubWorkflowStepConfig;

export interface ApprovalStepConfig {
  nodeType: 'approval';
  /** Static user IDs, or a dynamic lookup expression. */
  approverIds?: string[];
  /** Dynamic approver resolution (e.g. "requester.manager", "costCenterOwner"). */
  approverExpression?: string;
  /** Number of approvals required (default 1). */
  requiredApprovals: number;
  /** Whether rejection by one approver immediately terminates the step. */
  rejectOnFirst: boolean;
  /** Allow the approver to delegate to another user. */
  allowDelegation: boolean;
  /** Allow approval via Slack / Teams action buttons. */
  allowExternalApproval: boolean;
}

export interface ParallelBranchConfig {
  nodeType: 'parallel_branch';
  /** Child branches (each is a sub-graph of step IDs). */
  branches: ParallelBranch[];
  /** Join semantics: all must complete, or first-to-complete wins. */
  joinCondition: 'all' | 'any';
}

export interface ConditionalGateConfig {
  nodeType: 'conditional_gate';
  /** Conditions evaluated in order; first match wins. */
  conditions: ConditionalGate[];
  /** Step ID to route to when no condition matches. */
  defaultTargetStepId: string;
}

export interface TimerStepConfig {
  nodeType: 'timer';
  /** ISO-8601 duration (e.g. "PT48H" = 48 hours). */
  duration: string;
  /** Action when timer fires. */
  onExpiry: 'proceed' | 'escalate' | 'cancel';
}

export interface AgentTaskStepConfig {
  nodeType: 'agent_task';
  agentType: string;
  /** Input parameters passed to the agent. */
  inputMapping: Record<string, string>;
  /** Confidence threshold below which a HITL checkpoint triggers. */
  hitlThreshold: number;
}

export interface NotificationStepConfig {
  nodeType: 'notification';
  recipientExpression: string;
  templateId: string;
  channels: string[];
}

export interface ExternalSystemStepConfig {
  nodeType: 'external_system';
  integrationId: string;
  operationType: string;
  fieldMappings: Record<string, string>;
  /** Saga compensation action to run on rollback. */
  compensationAction?: string;
}

export interface HumanTaskStepConfig {
  nodeType: 'human_task';
  assigneeExpression: string;
  taskFormId?: string;
  instructions?: string;
}

export interface SubWorkflowStepConfig {
  nodeType: 'sub_workflow';
  subWorkflowDefinitionId: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
}

/** Directed edge connecting two steps in the workflow graph. */
export interface WorkflowEdge {
  id: string;
  sourceStepId: string;
  targetStepId: string;
  /** Optional label for the edge (e.g. "Approved", "Rejected", "Default"). */
  label?: string;
  /** Condition expression that must evaluate to true for this edge to fire. */
  condition?: Record<string, unknown>;
}

// ---- Workflow Instance (run-time) ----------------------------------------

/**
 * A running instance of a workflow tied to a specific request or entity.
 */
export interface Workflow extends BaseEntity {
  /** Reference to the definition that spawned this instance. */
  definitionId: string;
  definitionVersion: number;
  /** The domain entity this workflow operates on (e.g. ProcurementRequest ID). */
  entityId: string;
  entityType: string;
  status: WorkflowStatus;
  /** Run-time step instances. */
  steps: WorkflowStep[];
  /** Overall start / end timestamps. */
  startedAt: string;
  completedAt?: string;
  /** Total elapsed wall-clock time in milliseconds. */
  elapsedMs?: number;
  /** ID of the user or system that initiated this workflow. */
  initiatedBy: string;
  /** Collected variables / context bag mutated by steps. */
  context: Record<string, unknown>;
  /** Compensation log for Saga pattern rollbacks. */
  compensationLog?: CompensationEntry[];
}

/**
 * Run-time state of a single step within a workflow instance.
 */
export interface WorkflowStep {
  id: string;
  /** Reference to the design-time step definition. */
  definitionStepId: string;
  name: string;
  type: WorkflowNodeType;
  status: ApprovalStepStatus;
  assignee?: UserReference;
  /** All approvers assigned (for multi-approval steps). */
  approvers?: ApprovalRecord[];
  startedAt?: string;
  completedAt?: string;
  /** SLA deadline for this step instance. */
  slaDeadline?: string;
  slaBreached: boolean;
  /** Number of escalation levels triggered. */
  escalationLevel: number;
  /** Output / result data produced by this step. */
  result?: Record<string, unknown>;
  /** Comments attached to this step. */
  comments: Comment[];
}

export interface ApprovalRecord {
  userId: string;
  displayName: string;
  decision?: 'approved' | 'rejected';
  decidedAt?: string;
  comments?: string;
  /** If this approval was delegated, the original assignee. */
  delegatedFrom?: string;
}

/** Saga pattern compensation entry for distributed rollback. */
export interface CompensationEntry {
  stepId: string;
  action: string;
  executedAt: string;
  success: boolean;
  error?: string;
}

// ---- SLA, Escalation, Delegation -----------------------------------------

/**
 * SLA configuration applied at workflow or step level (FR-2.3).
 * Drives the automated nudge and escalation engine.
 */
export interface SLAConfig {
  /** ISO-8601 duration for the warning threshold (e.g. "PT48H"). */
  warningThreshold: string;
  /** ISO-8601 duration for the breach threshold (e.g. "PT72H"). */
  breachThreshold: string;
  /** Whether to count only business hours. */
  businessHoursOnly: boolean;
  /** Timezone for business-hours calculation. */
  timezone?: string;
  /** Business hours definition (24h format). */
  businessHoursStart?: string; // "09:00"
  businessHoursEnd?: string;   // "17:00"
  /** Days of week considered working days (0=Sun, 6=Sat). */
  workingDays?: number[];
}

/**
 * Rule defining what happens when an SLA is breached (FR-2.3).
 */
export interface EscalationRule {
  id: string;
  name: string;
  /** Escalation level (1 = first escalation, 2 = next, etc.). */
  level: number;
  /** Time after breach before this level fires (ISO-8601 duration). */
  delayAfterBreach: string;
  /** How to find the escalation target. */
  targetExpression: string; // e.g. "assignee.manager", "role:procurement_director"
  /** Notification channels for the escalation. */
  notificationChannels: string[];
  /** Optional: auto-reassign the task to the escalation target. */
  autoReassign: boolean;
}

/**
 * Delegation rule for out-of-office and authority transfer (FR-2.7).
 */
export interface DelegationRule {
  id: string;
  /** User setting the delegation. */
  delegatorId: string;
  /** User receiving delegated authority. */
  delegateId: string;
  /** Effective date range. */
  startDate: string;
  endDate: string;
  /** Scope restriction: only delegate specific categories or value thresholds. */
  scope?: DelegationScope;
  isActive: boolean;
  createdAt: string;
}

export interface DelegationScope {
  categories?: string[];
  maxValue?: number;
  workflowDefinitionIds?: string[];
}

// ---- Parallel Branching & Conditional Gates ------------------------------

/**
 * A single branch within a parallel execution node.
 */
export interface ParallelBranch {
  id: string;
  name: string;
  /** Ordered step IDs forming this branch. */
  stepIds: string[];
  /** Run-time status of this branch (when used in instance context). */
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

/**
 * A condition within a conditional gate node.
 * Evaluated in order; first match determines the routing target.
 */
export interface ConditionalGate {
  id: string;
  name: string;
  /** JSONLogic expression evaluated against the workflow context. */
  expression: Record<string, unknown>;
  /** Target step ID when this condition is true. */
  targetStepId: string;
}

// ---- Collaboration -------------------------------------------------------

/**
 * Threaded comment attached to a workflow step or request (FR-2.5).
 */
export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  body: string;
  /** User IDs mentioned with @. */
  mentions: string[];
  attachments: string[]; // FileAttachment IDs
  /** Parent comment ID for threading. */
  parentCommentId?: string;
  /** Source system if synced from Slack/Teams. */
  externalSource?: 'slack' | 'ms_teams';
  externalMessageId?: string;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isEdited: boolean;
}

// ---- Workflow Analytics --------------------------------------------------

/**
 * Aggregated analytics for a workflow definition (FR-2.10).
 */
export interface WorkflowAnalytics {
  definitionId: string;
  definitionName: string;
  /** Reporting period. */
  periodStart: string;
  periodEnd: string;
  /** Total instances completed in period. */
  totalCompleted: number;
  /** Total instances currently in-flight. */
  totalInFlight: number;
  /** Average end-to-end cycle time in hours. */
  averageCycleTimeHours: number;
  /** Median cycle time in hours. */
  medianCycleTimeHours: number;
  /** Percentage of instances completed within SLA. */
  slaComplianceRate: number;
  /** Approval rate (approved / total decided). */
  approvalRate: number;
  /** Per-step analytics for bottleneck identification. */
  stepAnalytics: StepAnalytics[];
  /** Steps ranked by average time (descending) — bottleneck indicator. */
  bottlenecks: BottleneckInfo[];
}

export interface StepAnalytics {
  stepDefinitionId: string;
  stepName: string;
  averageTimeHours: number;
  medianTimeHours: number;
  slaBreachCount: number;
  escalationCount: number;
  /** Number of times this step was the final rejection point. */
  rejectionCount: number;
}

export interface BottleneckInfo {
  stepDefinitionId: string;
  stepName: string;
  averageTimeHours: number;
  /** How much above the target SLA this step averages. */
  slaOverageHours: number;
  /** Suggested optimisation from the AI analytics agent. */
  recommendation?: string;
}
