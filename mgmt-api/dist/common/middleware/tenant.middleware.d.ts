import { NestMiddleware } from '@nestjs/common';
export declare class TenantMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): void;
}
