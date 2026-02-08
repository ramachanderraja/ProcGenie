import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const correlationId = request.headers['x-request-id'] || 'N/A';
    const now = Date.now();

    this.logger.log(
      `[${correlationId}] ${method} ${url} - ${ip} - ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.logger.log(
            `[${correlationId}] ${method} ${url} ${statusCode} - ${duration}ms`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[${correlationId}] ${method} ${url} - ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
