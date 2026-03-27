import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RbacService } from '../modules/rbac.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private rbacService: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 由 JwtStrategy 解析得出

    if (!user) return false;

    // 0. 基础接口白名单 (无需权限校验，只要登录即可访问)
    const currentPath = request.route?.path || request.path || request.url;
    const whiteList = ['my-menus', 'profile', 'login', 'register'];
    
    // 使用 some + includes 确保只要路径包含关键词即可放行 (解决前缀匹配问题)
    if (whiteList.some(item => currentPath.includes(item))) {
      return true;
    }

    // 1. 检查 Token 签发时间是否早于管理员最后一次修改该用户的时间
    const isInvalid = await this.rbacService.isTokenInvalid(user.uid, user.iat);
    if (isInvalid) {
      throw new ForbiddenException('AUTH_SESSION_EXPIRED:您的账号信息已被修改，请重新登录');
    }

    // 1. 超级管理员绕过 (ADMIN 角色拥有上帝视角)
    if (user.role === 'ADMIN') return true;

    // 2. 获取当前角色拥有的权限路径列表
    const allowedPaths = await this.rbacService.getRolePermissions(user.role);

    // 4. 正则匹配检查
    const hasPermission = allowedPaths.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(currentPath);
    });

    if (!hasPermission) {
      throw new ForbiddenException(`AUTH_PERMISSION_DENIED:您的角色 [${user.role}] 无法访问接口 [${currentPath}]`);
    }

    return true;
  }
}
