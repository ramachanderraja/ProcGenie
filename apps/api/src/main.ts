import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet.default());
  app.use(compression());

  // CORS
  const corsOrigins = configService.get<string>('app.corsOrigins', 'http://localhost:3001');
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Request-Id'],
  });

  // API Prefix & Versioning
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: configService.get<string>('app.nodeEnv') === 'production',
    }),
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // WebSocket Adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger Documentation
  if (configService.get<string>('app.nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ProcGenie S2P Platform API')
      .setDescription(
        'Enterprise Source-to-Pay Orchestration Platform powered by AI Agents. ' +
          'This API provides comprehensive procurement lifecycle management including ' +
          'intake, sourcing, contracts, purchasing, invoicing, supplier management, and analytics.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication and authorization')
      .addTag('Intake', 'Purchase request intake and AI analysis')
      .addTag('Workflow', 'Workflow engine and approval management')
      .addTag('Buying', 'Purchase orders and goods receipts')
      .addTag('Suppliers', 'Supplier lifecycle management')
      .addTag('Contracts', 'Contract management and AI clause analysis')
      .addTag('Sourcing', 'Strategic sourcing and bid management')
      .addTag('Invoices', 'Invoice processing and three-way matching')
      .addTag('Analytics', 'Spend analytics and dashboards')
      .addTag('Sustainability', 'ESG scoring and carbon footprint')
      .addTag('Integrations', 'ERP and third-party integrations')
      .addTag('Agents', 'AI agent orchestration and monitoring')
      .addTag('Notifications', 'Real-time notifications')
      .addServer('http://localhost:3000', 'Local Development')
      .addServer('https://api.procgenie.io', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: 'ProcGenie API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    logger.log('Swagger documentation available at /docs');
  }

  // Start Server
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  logger.log(`ProcGenie API running on http://localhost:${port}`);
  logger.log(`Environment: ${configService.get<string>('app.nodeEnv')}`);
  logger.log(`API Prefix: /${apiPrefix}`);
}

bootstrap();
