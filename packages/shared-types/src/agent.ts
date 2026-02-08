// ---------------------------------------------------------------------------
// Module 4 — Agentic AI & Autonomous Operations
// 15 specialised AI agents operating across the S2P lifecycle with
// progressive autonomy, human-in-the-loop oversight, and measurable ROI.
// ---------------------------------------------------------------------------

import type { BaseEntity, UserReference } from './common';

// ---- Agent Type Enums (all 15 agents) ------------------------------------

/**
 * Enumeration of all 15 specialised agents in the ProcGenie multi-agent system.
 * Each agent follows the ReAct (Reasoning + Acting) pattern.
 */
export enum AgentType {
  /** A1 — Classifies incoming requests: category, channel, urgency. */
  IntakeClassifier = 'IntakeClassifier',
  /** A2 — OCR + LLM extraction from uploaded documents. */
  DocumentExtraction = 'DocumentExtraction',
  /** A3 — Determines optimal workflow routing and task assignment. */
  RoutingAssignment = 'RoutingAssignment',
  /** A4 — Autonomous negotiation for tail-spend renewals < $5K. */
  TailSpendNegotiation = 'TailSpendNegotiation',
  /** A5 — Drafts RFPs, recommends suppliers, designs evaluation criteria. */
  StrategicSourcing = 'StrategicSourcing',
  /** A6 — Discovers new suppliers matching category/diversity needs. */
  SupplierDiscovery = 'SupplierDiscovery',
  /** A7 — Continuous monitoring of supplier risk signals. */
  RiskMonitoring = 'RiskMonitoring',
  /** A8 — Extracts key terms and identifies non-standard clauses. */
  ContractAnalysis = 'ContractAnalysis',
  /** A9 — Generates counter-proposals and negotiation strategies. */
  ContractNegotiation = 'ContractNegotiation',
  /** A10 — Automated PO-GR-Invoice three-way matching. */
  InvoiceMatching = 'InvoiceMatching',
  /** A11 — Analyses spend patterns, maverick spend, savings opportunities. */
  SpendAnalytics = 'SpendAnalytics',
  /** A12 — Real-time policy and regulatory compliance checking. */
  ComplianceChecker = 'ComplianceChecker',
  /** A13 — Scores suppliers on ESG criteria using multi-source data. */
  ESGScoring = 'ESGScoring',
  /** A14 — Answers procurement FAQ and process guidance queries. */
  HelpdeskFAQ = 'HelpdeskFAQ',
  /** A15 — Meta-agent coordinating multi-agent collaboration. */
  AgentOrchestrator = 'AgentOrchestrator',
}

/**
 * Progressive autonomy levels governing agent authority (FR-4.10).
 * Agents graduate from lower to higher levels based on accuracy metrics.
 */
export enum AutonomyLevel {
  /** Agent recommends, human decides and executes. */
  HumanAssisted = 'HumanAssisted',
  /** Agent executes within guardrails but pauses at HITL checkpoints. */
  SupervisedAutonomy = 'SupervisedAutonomy',
  /** Agent executes end-to-end; only alerts on anomalies. */
  FullAutonomy = 'FullAutonomy',
}

/** Status of an individual agent task execution. */
export enum AgentTaskStatus {
  Queued = 'Queued',
  Running = 'Running',
  WaitingForHuman = 'WaitingForHuman',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  /** Paused at HITL checkpoint awaiting human confirmation. */
  PausedAtCheckpoint = 'PausedAtCheckpoint',
  /** Timed out waiting for external data or human response. */
  TimedOut = 'TimedOut',
}

/** Classification of an individual action taken by an agent within a task. */
export enum AgentActionType {
  /** Agent queried an external API or database. */
  DataRetrieval = 'DataRetrieval',
  /** Agent produced a classification or recommendation. */
  Classification = 'Classification',
  /** Agent generated content (email, RFP, summary). */
  ContentGeneration = 'ContentGeneration',
  /** Agent compared or evaluated options. */
  Evaluation = 'Evaluation',
  /** Agent executed a transactional operation (create PO, send email). */
  Execution = 'Execution',
  /** Agent paused to request human input. */
  HumanEscalation = 'HumanEscalation',
  /** Agent triggered a workflow or sub-task. */
  WorkflowTrigger = 'WorkflowTrigger',
  /** Agent performed a negotiation round. */
  Negotiation = 'Negotiation',
  /** Agent ran a validation / compliance check. */
  Validation = 'Validation',
  /** Agent produced an analysis or insight. */
  Analysis = 'Analysis',
}

// ---- Core Agent Interfaces -----------------------------------------------

/**
 * Definition and runtime state of a platform agent.
 * Combines configuration with current operational metrics.
 */
export interface Agent extends BaseEntity {
  type: AgentType;
  name: string;
  description: string;
  /** Current autonomy level (can be promoted/demoted by admin). */
  autonomyLevel: AutonomyLevel;
  /** Whether this agent is enabled for the tenant. */
  isEnabled: boolean;
  /** Agent-specific configuration. */
  config: AgentConfig;
  /** Aggregate performance metrics (updated periodically). */
  performanceMetrics: AgentPerformanceMetrics;
  /** Current operational state. */
  operationalStatus: 'active' | 'degraded' | 'offline' | 'maintenance';
  /** When the agent last processed a task. */
  lastActiveAt?: string;
  /** Model / version powering this agent. */
  modelId: string;
  modelVersion: string;
}

/**
 * Tenant-configurable parameters for an agent instance.
 */
export interface AgentConfig {
  /** Confidence threshold below which HITL checkpoint triggers (0-1). */
  hitlConfidenceThreshold: number;
  /**
   * Maximum monetary value the agent can approve/execute autonomously.
   * Amounts above this require human confirmation.
   */
  maxAutonomousValue?: number;
  /** Currency for the maxAutonomousValue. */
  maxAutonomousValueCurrency?: string;
  /** Maximum number of concurrent tasks. */
  maxConcurrency: number;
  /** Task timeout in milliseconds. */
  taskTimeoutMs: number;
  /** Retry configuration for transient failures. */
  retryPolicy: RetryPolicy;
  /** Categories / domains this agent is authorised to operate on. */
  allowedCategories?: string[];
  /** Supplier segments this agent can interact with. */
  allowedSupplierSegments?: string[];
  /** Custom guardrails expressed as policy rules. */
  guardrails: AgentGuardrail[];
  /** MCP tool integrations available to this agent. */
  mcpTools?: MCPToolConfig[];
  /** Temperature / creativity setting for generative actions. */
  temperature?: number;
  /** Maximum reasoning steps before the agent must conclude. */
  maxReasoningSteps: number;
}

export interface RetryPolicy {
  maxRetries: number;
  /** Initial backoff delay in milliseconds. */
  initialDelayMs: number;
  /** Backoff multiplier. */
  backoffMultiplier: number;
  /** Maximum delay cap in milliseconds. */
  maxDelayMs: number;
  /** HTTP status codes or error types that are retryable. */
  retryableErrors: string[];
}

/**
 * A guardrail constraining agent behaviour.
 * Evaluated before every agent action execution.
 */
export interface AgentGuardrail {
  id: string;
  name: string;
  description: string;
  /** JSONLogic condition that must be true for the action to proceed. */
  condition: Record<string, unknown>;
  /** What to do when the guardrail is violated. */
  onViolation: 'block' | 'escalate' | 'warn_and_proceed';
  isActive: boolean;
}

export interface MCPToolConfig {
  toolId: string;
  name: string;
  /** MCP server endpoint. */
  serverUrl: string;
  /** Authentication method for the MCP server. */
  authMethod: 'api_key' | 'oauth2' | 'mtls';
  /** Whether this tool is enabled for the agent. */
  isEnabled: boolean;
}

// ---- Agent Task ----------------------------------------------------------

/**
 * A discrete unit of work assigned to an agent.
 * Follows the ReAct loop: plan -> act -> observe -> iterate.
 */
export interface AgentTask extends BaseEntity {
  agentType: AgentType;
  agentId: string;
  status: AgentTaskStatus;
  /** The domain entity this task operates on. */
  entityId: string;
  entityType: string;
  /** Human-readable description of the task goal. */
  goal: string;
  /** Input parameters / context provided to the agent. */
  input: Record<string, unknown>;
  /** Final output produced by the agent. */
  output?: Record<string, unknown>;
  /** Ordered list of actions (ReAct steps) taken during execution. */
  actions: AgentAction[];
  /** Checkpoints where human intervention was required. */
  checkpoints: HITLCheckpoint[];
  /** Overall confidence in the task result (0-1). */
  confidence?: ConfidenceScore;

  // Timing
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  /** Total execution duration in milliseconds. */
  durationMs?: number;

  // Execution metadata
  /** Number of ReAct reasoning steps consumed. */
  reasoningStepsUsed: number;
  /** Number of retries due to transient errors. */
  retriesUsed: number;
  /** Token usage for LLM calls within this task. */
  tokenUsage?: TokenUsage;
  /** Error details if the task failed. */
  error?: AgentTaskError;

  /** User who triggered this task (null if system/scheduled). */
  triggeredBy?: string;
  /** Parent task ID if this is a sub-task. */
  parentTaskId?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** Estimated cost in USD. */
  estimatedCostUsd: number;
}

export interface AgentTaskError {
  code: string;
  message: string;
  /** Full stack trace (internal use). */
  stack?: string;
  /** Whether this error is retryable. */
  retryable: boolean;
}

// ---- Agent Action --------------------------------------------------------

/**
 * A single step in the agent's ReAct reasoning chain.
 * Provides full explainability of agent decision-making (FR-4.8).
 */
export interface AgentAction {
  id: string;
  taskId: string;
  /** Sequence number within the task (1-based). */
  stepNumber: number;
  type: AgentActionType;
  /** Natural-language description of the agent's reasoning for this step. */
  reasoning: string;
  /** The tool / API / function the agent invoked. */
  toolName?: string;
  /** Input passed to the tool. */
  toolInput?: Record<string, unknown>;
  /** Output received from the tool. */
  toolOutput?: Record<string, unknown>;
  /** Observation / interpretation the agent derived from the output. */
  observation?: string;
  /** Confidence in this individual step (0-1). */
  confidence: number;
  /** Duration of this step in milliseconds. */
  durationMs: number;
  /** Token usage for this step's LLM call. */
  tokenUsage?: TokenUsage;
  timestamp: string;
}

// ---- HITL Checkpoint -----------------------------------------------------

/**
 * Human-in-the-loop checkpoint where agent execution pauses
 * for human review and confirmation (FR-4.8, FR-4.10).
 */
export interface HITLCheckpoint {
  id: string;
  taskId: string;
  /** Why the checkpoint was triggered. */
  reason: HITLReason;
  /** Natural-language explanation for the human reviewer. */
  explanation: string;
  /** The agent's proposed action pending human approval. */
  proposedAction: Record<string, unknown>;
  /** Alternative actions the agent considered. */
  alternatives?: Record<string, unknown>[];
  /** Confidence score that triggered this checkpoint. */
  confidenceAtCheckpoint: number;
  /** User assigned to review. */
  assignedTo?: UserReference;
  /** Human decision. */
  decision?: 'approve' | 'reject' | 'modify';
  /** If modified, the human's amended action. */
  modifiedAction?: Record<string, unknown>;
  /** Human's rationale for the decision. */
  humanFeedback?: string;
  /** Whether this checkpoint is still awaiting human input. */
  isPending: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type HITLReason =
  | 'low_confidence'
  | 'high_value'
  | 'non_standard_route'
  | 'policy_violation'
  | 'new_supplier'
  | 'critical_risk'
  | 'counter_proposal'
  | 'all_rfp_drafts'
  | 'multi_agent_conflict'
  | 'manual_request';

// ---- Agent Decision Log --------------------------------------------------

/**
 * Immutable audit record of an agent decision for compliance
 * and explainability requirements (FR-4.8).
 */
export interface AgentDecisionLog {
  id: string;
  tenantId: string;
  agentType: AgentType;
  agentId: string;
  taskId: string;
  /** The decision that was made. */
  decision: string;
  /** Full reasoning chain leading to the decision. */
  reasoningChain: string[];
  /** Data inputs that influenced the decision. */
  inputSummary: Record<string, unknown>;
  /** Confidence at the time of decision. */
  confidence: ConfidenceScore;
  /** Whether a human overrode this decision. */
  humanOverridden: boolean;
  humanOverrideReason?: string;
  overriddenBy?: string;
  /** Guardrails that were evaluated. */
  guardrailsEvaluated: GuardrailEvaluation[];
  /** Timestamp of the decision. */
  decidedAt: string;
  /** Model version used. */
  modelVersion: string;
}

export interface GuardrailEvaluation {
  guardrailId: string;
  guardrailName: string;
  passed: boolean;
  details?: string;
}

// ---- Confidence Score ----------------------------------------------------

/**
 * Multi-dimensional confidence assessment for agent outputs.
 */
export interface ConfidenceScore {
  /** Overall confidence (0-1). */
  overall: number;
  /** Confidence in data completeness (0-1). */
  dataCompleteness: number;
  /** Confidence in classification accuracy (0-1). */
  classificationAccuracy: number;
  /** Confidence in value extraction accuracy (0-1). */
  extractionAccuracy?: number;
  /** Confidence in recommendation quality (0-1). */
  recommendationQuality?: number;
  /** Factors that lowered confidence. */
  lowConfidenceFactors: string[];
  /** Whether the overall score is above the HITL threshold. */
  aboveThreshold: boolean;
  /** The applicable HITL threshold for context. */
  threshold: number;
}

// ---- Agent Performance Metrics -------------------------------------------

/**
 * Aggregate performance metrics for an agent, powering the
 * Agent Performance Dashboard (FR-4.9).
 */
export interface AgentPerformanceMetrics {
  agentType: AgentType;
  /** Reporting period. */
  periodStart: string;
  periodEnd: string;

  // Volume
  tasksCompleted: number;
  tasksInProgress: number;
  tasksFailed: number;
  tasksCancelled: number;

  // Accuracy
  /** Percentage of tasks completed without human correction (0-100). */
  accuracyRate: number;
  /** Percentage of tasks escalated to human (0-100). */
  humanEscalationRate: number;
  /** Percentage of human overrides on agent decisions (0-100). */
  humanOverrideRate: number;
  /** Average confidence score across all tasks (0-1). */
  averageConfidence: number;

  // Efficiency
  /** Average task duration in seconds. */
  averageTaskDurationSec: number;
  /** Median task duration in seconds. */
  medianTaskDurationSec: number;
  /** Estimated person-hours saved in the period. */
  estimatedHoursSaved: number;

  // Cost
  /** Total token usage in the period. */
  totalTokensUsed: number;
  /** Estimated LLM cost in USD. */
  estimatedLlmCostUsd: number;
  /** Estimated monetary savings generated by the agent. */
  estimatedSavingsUsd: number;

  // Quality (compared to human baseline)
  /** Error rate: tasks that produced incorrect results (0-100). */
  errorRate: number;
  /** Percentage improvement over human baseline processing time. */
  speedImprovementPercent: number;

  // Autonomy progression
  currentAutonomyLevel: AutonomyLevel;
  /** Whether the agent qualifies for autonomy promotion. */
  promotionEligible: boolean;
  /** Reason if not eligible. */
  promotionBlocker?: string;
}
