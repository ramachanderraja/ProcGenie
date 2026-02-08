import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
