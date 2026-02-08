import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum NotificationType {
  APPROVAL_REQUIRED = 'approval_required',
  APPROVAL_COMPLETED = 'approval_completed',
  REQUEST_SUBMITTED = 'request_submitted',
  PO_CREATED = 'po_created',
  INVOICE_RECEIVED = 'invoice_received',
  INVOICE_EXCEPTION = 'invoice_exception',
  CONTRACT_EXPIRING = 'contract_expiring',
  CONTRACT_EXECUTED = 'contract_executed',
  BID_RECEIVED = 'bid_received',
  SOURCING_AWARDED = 'sourcing_awarded',
  AGENT_HITL = 'agent_hitl',
  AGENT_COMPLETED = 'agent_completed',
  SUPPLIER_RISK_ALERT = 'supplier_risk_alert',
  ESG_ALERT = 'esg_alert',
  REGULATORY_ALERT = 'regulatory_alert',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  TEAMS = 'teams',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
}

@Entity('notifications')
@Index(['recipientId', 'isRead', 'tenantId'])
@Index(['type', 'tenantId'])
export class Notification extends BaseEntity {
  @ApiProperty({ example: 'Purchase Order Approved' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @ApiProperty({ example: 'PO-2025-001234 has been approved by John Doe' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ enum: NotificationType })
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: NotificationPriority })
  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Column({ name: 'channels', type: 'text', array: true, default: '{in_app}' })
  channels: string[];

  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId: string;

  @Column({ name: 'sender_id', type: 'uuid', nullable: true })
  senderId?: string;

  @ApiProperty({ example: false })
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date;

  @ApiProperty({ example: 'purchase_order', description: 'Type of related entity' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @ApiProperty({ example: '/buying/purchase-orders/abc-123', description: 'Frontend route to navigate to' })
  @Column({ name: 'action_url', type: 'varchar', length: 500, nullable: true })
  actionUrl?: string;

  @Column({ name: 'action_label', type: 'varchar', length: 100, nullable: true })
  actionLabel?: string;

  @Column({ name: 'email_sent', type: 'boolean', default: false })
  emailSent: boolean;

  @Column({ name: 'email_sent_at', type: 'timestamptz', nullable: true })
  emailSentAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
