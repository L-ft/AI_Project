import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RbacService } from '../modules/rbac.service';
export declare class RbacGuard implements CanActivate {
    private rbacService;
    constructor(rbacService: RbacService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
