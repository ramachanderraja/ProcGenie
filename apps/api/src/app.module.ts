import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { redisStore } from 'cache-manager-redis-yet';

import configuration from './config/configuration';
import { typeOrmAsyncConfig } from './config/database.config';
import { AiModule } from './common/services/ai.module';
import { HealthController } from './health.controller';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { IntakeModule } from './modules/intake/intake.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { BuyingModule } from './modules/buying/buying.module';
import { SupplierModule } from './modules/suppliers/supplier.module';
import { ContractModule } from './modules/contracts/contract.module';
import { SourcingModule } from './modules/sourcing/sourcing.module';
import { InvoiceModule } from './modules/invoices/invoice.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SustainabilityModule } from './modules/sustainability/sustainability.module';
import { IntegrationModule } from './modules/integrations/integration.module';
import { AgentModule } from './modules/agents/agent.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    // ── Global Configuration ─────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // ── Database (PostgreSQL via TypeORM) ─────────────────────────────
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),

    // ── Cache (Redis) ────────────────────────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
            tls: configService.get<number>('redis.port') === 6380,
          },
          password: configService.get<string>('redis.password'),
          database: configService.get<number>('redis.db'),
          ttl: configService.get<number>('redis.ttl'),
        }),
      }),
    }),

    // ── Bull Queue (Redis) ───────────────────────────────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.db'),
          tls: configService.get<number>('redis.port') === 6380 ? {} : undefined,
        },
        prefix: configService.get<string>('bull.prefix'),
        defaultJobOptions: {
          attempts: configService.get<number>('bull.defaultAttempts'),
          backoff: {
            type: 'exponential',
            delay: configService.get<number>('bull.defaultBackoff'),
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),

    // ── Rate Limiting ────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300,
      },
    ]),

    // ── Event Emitter (Global) ────────────────────────────────────────
    EventEmitterModule.forRoot(),

    // ── AI Service (Global) ───────────────────────────────────────────
    AiModule,

    // ── Feature Modules ──────────────────────────────────────────────
    AuthModule,
    IntakeModule,
    WorkflowModule,
    BuyingModule,
    SupplierModule,
    ContractModule,
    SourcingModule,
    InvoiceModule,
    AnalyticsModule,
    SustainabilityModule,
    IntegrationModule,
    AgentModule,
    NotificationModule,
    ChatModule,
  ],
  controllers: [HealthController],
  providers: [
    // ── Global Throttle Guard ────────────────────────────────────────
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
