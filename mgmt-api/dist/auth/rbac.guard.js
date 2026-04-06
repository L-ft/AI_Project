"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacGuard = void 0;
const common_1 = require("@nestjs/common");
const rbac_service_1 = require("../modules/rbac.service");
let RbacGuard = class RbacGuard {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            return false;
        const currentPath = request.route?.path || request.path || request.url;
        const whiteList = ['my-menus', 'profile', 'login', 'register'];
        if (whiteList.some(item => currentPath.includes(item))) {
            return true;
        }
        const isInvalid = await this.rbacService.isTokenInvalid(user.uid, user.iat);
        if (isInvalid) {
            throw new common_1.ForbiddenException('AUTH_SESSION_EXPIRED:您的账号信息已被修改，请重新登录');
        }
        if (user.role === 'ADMIN')
            return true;
        const allowedPaths = await this.rbacService.getRolePermissions(user.role);
        const hasPermission = allowedPaths.some(pattern => {
            const regex = new RegExp(pattern);
            return regex.test(currentPath);
        });
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`AUTH_PERMISSION_DENIED:您的角色 [${user.role}] 无法访问接口 [${currentPath}]`);
        }
        return true;
    }
};
exports.RbacGuard = RbacGuard;
exports.RbacGuard = RbacGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rbac_service_1.RbacService])
], RbacGuard);
//# sourceMappingURL=rbac.guard.js.map