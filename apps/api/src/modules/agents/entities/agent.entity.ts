import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AgentTask } from './agent-task.entity';

export enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  BUSY = 'busy',
  ERROR = 'error',
  DISABLED = 'disabled',
  MAINTENANCE = 'maintenance',
}

export enum AgentType {
  INTAKE_ANALYST = 'intake_analyst',
  SOURCING_STRATEGIST = 'sourcing_strategist',
  CONTRACT_REVIEWER = 'contract_reviewer',
  SPEND_ANALYZER = 'spend_analyzer',
  SUPPLIER_RISK_ASSESSOR = 'supplier_risk_assessor',
  INVOICE_MATCHER = 'invoice_matcher',
  COMPLIANCE_MONITOR = 'compliance_monitor',
  MARKET_INTELLIGENCE = 'market_intelligence',
  NEGOTIATION_ADVISOR = 'negotiation_advisor',
  DEMAND_FORECASTER = 'demand_forecaster',
  ESG_SCORER = 'esg_scorer',
  CATALOG_MANAGER = 'catalog_manager',
  APPROVAL_ROUTER = 'approval_router',
  EXCEPTION_HANDLER = 'exception_handler',
  REPORTING_AGENT = 'reporting_agent',
}

@Entity('agents')
@Index(['type', 'tenantId'])
@Index(['status', 'tenantId'])
export class Agent extends BaseEntity {
  @ApiProperty({ example: 'Contract Review Agent' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ example: 'AI agent that analyzes contracts for risks, missing clauses, and compliance issues' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: AgentType })
  @Column({ type: 'enum', enum: AgentType })
  type: AgentType;

  @ApiProperty({ enum: AgentStatus })
  @Column({ type: 'enum', enum: AgentStatus, default: AgentStatus.IDLE })
  status: AgentStatus;

  @ApiProperty({ example: 'gpt-4o' })
  @Column({ name: 'model_id', type: 'varchar', length: 100, nullable: true })
  modelId?: string;

  @ApiProperty({ example: '1.0.0' })
  @Column({ type: 'varchar', length: 50, default: '1.0.0' })
  version: string;

  @Column({ name: 'system_prompt', type: 'text', nullable: true })
  systemPrompt?: string;

  @Column({ type: 'jsonb', nullable: true })
  capabilities?: string[];

  @Column({ type: 'jsonb', nullable: true })
  tools?: Record<string, unknown>[];

  @ApiProperty({ example: 95.2, description: 'Success rate percentage' })
  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  successRate?: number;

  @ApiProperty({ example: 1250, description: 'Average response time in milliseconds' })
  @Column({ name: 'avg_response_time_ms', type: 'integer', nullable: true })
  avgResponseTimeMs?: number;

  @Column({ name: 'total_tasks_completed', type: 'integer', default: 0 })
  totalTasksCompleted: number;

  @Column({ name: 'total_tasks_failed', type: 'integer', default: 0 })
  totalTasksFailed: number;

  @ApiProperty({ example: true, description: 'Whether this agent requires human approval for decisions' })
  @Column({ name: 'requires_hitl', type: 'boolean', default: false })
  requiresHitl: boolean;

  @Column({ name: 'confidence_threshold', type: 'decimal', precision: 5, scale: 2, default: 80.0 })
  confidenceThreshold: number;

  @Column({ name: 'max_concurrent_tasks', type: 'integer', default: 5 })
  maxConcurrentTasks: number;

  @Column({ name: 'last_active_at', type: 'timestamptz', nullable: true })
  lastActiveAt?: Date;

  @ApiProperty({ type: () => [AgentTask] })
  @OneToMany(() => AgentTask, (task) => task.agent)
  tasks: AgentTask[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
