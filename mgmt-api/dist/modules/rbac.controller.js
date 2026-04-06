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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const rbac_guard_1 = require("../auth/rbac.guard");
const rbac_admin_service_1 = require("./rbac-admin.service");
let RbacController = class RbacController {
    constructor(rbacAdminService) {
        this.rbacAdminService = rbacAdminService;
    }
    async getRoles() {
        return this.rbacAdminService.getRoles();
    }
    async createRole(data) {
        return this.rbacAdminService.createRole(data);
    }
    async deleteRole(roleCode) {
        return this.rbacAdminService.deleteRole(roleCode);
    }
    async updateRole(roleCode, data) {
        return this.rbacAdminService.updateRole(roleCode, data);
    }
    async getUsers() {
        return this.rbacAdminService.getUsers();
    }
    async createUser(body) {
        return this.rbacAdminService.createUser(body);
    }
    async updateUser(userCode, data) {
        return this.rbacAdminService.updateUser(userCode, data);
    }
    async deleteUser(userCode) {
        return this.rbacAdminService.deleteUser(userCode);
    }
    async updateUserRole(userCode, data) {
        return this.rbacAdminService.updateUserRole(userCode, data.roleCode ?? data.roleId ?? null);
    }
    async updateUserStatus(userCode, data) {
        return this.rbacAdminService.updateUserStatus(userCode, data.status);
    }
    async resetPassword(userCode, data) {
        return this.rbacAdminService.resetPassword(userCode, data.password);
    }
    async getUserRole(userCode) {
        return this.rbacAdminService.getUserRole(userCode);
    }
    async getMyMenus(req) {
        return this.rbacAdminService.getMyMenus(req.user.role);
    }
    async getMenuTree() {
        return this.rbacAdminService.getMenuTree();
    }
    async getRolePerms(roleCode) {
        return this.rbacAdminService.getRolePerms(roleCode);
    }
    async assignPerms(data) {
        return this.rbacAdminService.assignPerms(data);
    }
};
exports.RbacController = RbacController;
__decorate([
    (0, common_1.Get)('roles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "createRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleCode'),
    __param(0, (0, common_1.Param)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Put)('roles/:roleCode'),
    __param(0, (0, common_1.Param)('roleCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:userCode'),
    __param(0, (0, common_1.Param)('userCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:userCode'),
    __param(0, (0, common_1.Param)('userCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Put)('users/:userCode/role'),
    __param(0, (0, common_1.Param)('userCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Put)('users/:userCode/status'),
    __param(0, (0, common_1.Param)('userCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Put)('users/:userCode/password'),
    __param(0, (0, common_1.Param)('userCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('users/:userCode/role'),
    __param(0, (0, common_1.Param)('userCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getUserRole", null);
__decorate([
    (0, common_1.Get)('my-menus'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getMyMenus", null);
__decorate([
    (0, common_1.Get)('menus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getMenuTree", null);
__decorate([
    (0, common_1.Get)('role-perms/:roleCode'),
    __param(0, (0, common_1.Param)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getRolePerms", null);
__decorate([
    (0, common_1.Post)('assign-perms'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "assignPerms", null);
exports.RbacController = RbacController = __decorate([
    (0, common_1.Controller)('rbac'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [rbac_admin_service_1.RbacAdminService])
], RbacController);
//# sourceMappingURL=rbac.controller.js.map