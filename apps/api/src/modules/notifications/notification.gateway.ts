import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { NotificationType, NotificationPriority } from './entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private readonly connectedUsers = new Map<string, Set<string>>();

  constructor(private readonly notificationService: NotificationService) {}

  afterInit(): void {
    this.logger.log('Notification WebSocket Gateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from all user rooms
    for (const [userId, socketIds] of this.connectedUsers.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; tenantId: string },
  ): void {
    const room = `user:${data.userId}`;
    client.join(room);
    client.join(`tenant:${data.tenantId}`);

    if (!this.connectedUsers.has(data.userId)) {
      this.connectedUsers.set(data.userId, new Set());
    }
    this.connectedUsers.get(data.userId).add(client.id);

    this.logger.log(`User ${data.userId} joined room ${room}`);

    // Send unread count on join
    this.notificationService
      .getUnreadCount(data.userId, data.tenantId)
      .then((count) => {
        client.emit('unread_count', { count });
      })
      .catch((err) => {
        this.logger.error(`Failed to send unread count: ${err.message}`);
      });
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; tenantId: string },
  ): void {
    const room = `user:${data.userId}`;
    client.leave(room);
    client.leave(`tenant:${data.tenantId}`);

    this.connectedUsers.get(data.userId)?.delete(client.id);
    this.logger.log(`User ${data.userId} left room ${room}`);
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string; userId: string; tenantId: string },
  ): Promise<void> {
    try {
      await this.notificationService.markAsRead(
        data.notificationId,
        data.userId,
        data.tenantId,
      );

      const unreadCount = await this.notificationService.getUnreadCount(
        data.userId,
        data.tenantId,
      );

      this.server
        .to(`user:${data.userId}`)
        .emit('notification_read', { notificationId: data.notificationId });
      this.server
        .to(`user:${data.userId}`)
        .emit('unread_count', { count: unreadCount });
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('mark_all_read')
  async handleMarkAllRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; tenantId: string },
  ): Promise<void> {
    try {
      await this.notificationService.markAllAsRead(data.userId, data.tenantId);
      this.server
        .to(`user:${data.userId}`)
        .emit('all_notifications_read', {});
      this.server
        .to(`user:${data.userId}`)
        .emit('unread_count', { count: 0 });
    } catch (error) {
      this.logger.error(`Failed to mark all as read: ${error.message}`);
      client.emit('error', { message: 'Failed to mark all notifications as read' });
    }
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; tenantId: string },
  ): Promise<void> {
    try {
      const count = await this.notificationService.getUnreadCount(
        data.userId,
        data.tenantId,
      );
      client.emit('unread_count', { count });
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
    }
  }

  // ── Server-side Emission Methods (called by other services) ────────

  sendToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToTenant(tenantId: string, event: string, data: unknown): void {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  async sendNotification(
    recipientId: string,
    tenantId: string,
    data: {
      title: string;
      message: string;
      type: NotificationType;
      priority?: NotificationPriority;
      senderId?: string;
      entityType?: string;
      entityId?: string;
      actionUrl?: string;
      actionLabel?: string;
    },
  ): Promise<void> {
    const notification = await this.notificationService.createNotification(
      { ...data, recipientId },
      tenantId,
    );

    this.sendToUser(recipientId, 'new_notification', notification);

    const unreadCount = await this.notificationService.getUnreadCount(
      recipientId,
      tenantId,
    );
    this.sendToUser(recipientId, 'unread_count', { count: unreadCount });
  }
}
