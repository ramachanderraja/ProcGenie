import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
