import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare const CHECK_PERMISSION_KEY = "required_role";
export declare const CheckPermission: (role: string) => import("@nestjs/common").CustomDecorator<string>;
export declare class PermissionGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
