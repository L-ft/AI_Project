// Step 2: Node.js (NestJS) Auth & Permissions
import { Injectable, CanActivate, ExecutionContext, SetMetadata, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// 权限装饰器
export const CHECK_PERMISSION_KEY = 'required_role';
export const CheckPermission = (role: string) => SetMetadata(CHECK_PERMISSION_KEY, role);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.get<string>(CHECK_PERMISSION_KEY, context.getHandler());
    if (!requiredRole) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // 由 JwtStrategy 注入

    if (!user) throw new ForbiddenException('User identity not found');

    // 角色等级检查: ADMIN(1) > DEV(2) > TESTER(3)
    const roleHierarchy: Record<string, number> = { 'ADMIN': 1, 'DEV': 2, 'TESTER': 3 };
    const userRoleLevel = roleHierarchy[user.role] || 99;
    const requiredLevel = roleHierarchy[requiredRole] || 99;

    if (userRoleLevel <= requiredLevel) {
      return true;
    }

    throw new ForbiddenException(`Access denied. Required role: ${requiredRole}`);
  }
}
