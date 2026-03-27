import { Injectable, UnauthorizedException, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'ai_platform_secret');
        // 将租户 ID 注入请求上下文，实现多租户隔离
        req.tenantId = decoded.tenantId;
        req.user = decoded;
      } catch (err) {
        // Token 失效或错误
      }
    }
    next();
  }
}
