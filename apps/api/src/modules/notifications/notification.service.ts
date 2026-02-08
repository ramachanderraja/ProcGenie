import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    data: {
      title: string;
      message: string;
      type: NotificationType;
      priority?: NotificationPriority;
      recipientId: string;
      senderId?: string;
      entityType?: string;
      entityId?: string;
      actionUrl?: string;
      actionLabel?: string;
      channels?: string[];
    },
    tenantId: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...data,
      priority: data.priority || NotificationPriority.MEDIUM,
      channels: data.channels || ['in_app'],
      tenantId,
    });

    const saved = await this.notificationRepository.save(notification);
    this.logger.log(
      `Notification created: "${saved.title}" for user ${data.recipientId}`,
    );
    return saved;
  }

  async getUserNotifications(
    userId: string,
    tenantId: string,
    options?: {
      isRead?: boolean;
      type?: NotificationType;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.recipient_id = :userId', { userId })
      .andWhere('notification.tenant_id = :tenantId', { tenantId });

    if (options?.isRead !== undefined) {
      queryBuilder.andWhere('notification.is_read = :isRead', {
        isRead: options.isRead,
      });
    }

    if (options?.type) {
      queryBuilder.andWhere('notification.type = :type', { type: options.type });
    }

    queryBuilder
      .orderBy('notification.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const unreadCount = await this.notificationRepository.count({
      where: { recipientId: userId, tenantId, isRead: false },
    });

    return { data, total, unreadCount };
  }

  async markAsRead(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipientId: userId, tenantId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(
    userId: string,
    tenantId: string,
  ): Promise<{ count: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('recipient_id = :userId', { userId })
      .andWhere('tenant_id = :tenantId', { tenantId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();

    this.logger.log(`Marked ${result.affected} notifications as read for user ${userId}`);
    return { count: result.affected || 0 };
  }

  async deleteNotification(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipientId: userId, tenantId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.notificationRepository.softDelete(id);
    this.logger.log(`Notification ${id} soft-deleted for user ${userId}`);
  }

  async getUnreadCount(
    userId: string,
    tenantId: string,
  ): Promise<number> {
    return this.notificationRepository.count({
      where: { recipientId: userId, tenantId, isRead: false },
    });
  }
}
