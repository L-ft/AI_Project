import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    // 假设已建立日志实体
    // @InjectRepository(OperationLog) private logRepo: Repository<OperationLog>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { user, method, url, body } = req;

    return next.handle().pipe(
      tap(() => {
        if (method !== 'GET') {
          console.log(`[审计日志] 用户: ${user?.username}, 操作: ${url}, 参数: ${JSON.stringify(body)}`);
          // 实际应写入 MySQL sys_operation_logs
        }
      }),
    );
  }
}
