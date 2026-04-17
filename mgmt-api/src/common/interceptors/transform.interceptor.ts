import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';

export interface Response<T> {
  code: number;
  msg: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const path = (req.url || '').split('?')[0];
    // 透传 exec-engine 原始 JSON（与 OpenAPI 一致），避免包一层 { code, msg, data }
    if (path.startsWith('/v1/data-builder')) {
      return next.handle() as Observable<Response<T>>;
    }
    return next.handle().pipe(
      map((data) => ({
        code: context.switchToHttp().getResponse().statusCode,
        msg: '操作成功',
        data: data || null,
      })),
    );
  }
}
