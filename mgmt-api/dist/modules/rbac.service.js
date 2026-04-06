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
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_entity_1 = require("../entities/menu.entity");
const ioredis_1 = require("ioredis");
let RbacService = class RbacService {
    constructor(menuRepository) {
        this.menuRepository = menuRepository;
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: 6379,
        });
    }
    async getRolePermissions(roleCode) {
        const normalizedCode = roleCode.toUpperCase();
        const cacheKey = `role_perms:${normalizedCode}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const menus = await this.menuRepository.query(`
      SELECT m.api_path 
      FROM sys_menus m
      JOIN sys_role_menu rm ON m.id = rm.menu_id
      JOIN roles r ON rm.role_id = r.id
      WHERE UPPER(r.code) = ? AND m.api_path IS NOT NULL
    `, [normalizedCode]);
        const perms = menus.map((m) => m.api_path);
        await this.redis.set(cacheKey, JSON.stringify(perms), 'EX', 3600);
        return perms;
    }
    async clearRoleCache(roleCode) {
        const normalizedCode = roleCode.toUpperCase();
        await this.redis.del(`role_perms:${normalizedCode}`);
    }
    async invalidateUserSession(userId) {
        const now = Math.floor(Date.now() / 1000);
        await this.redis.set(`user_invalid_before:${userId}`, now, 'EX', 86400);
    }
    async isTokenInvalid(userId, tokenIat) {
        const invalidBefore = await this.redis.get(`user_invalid_before:${userId}`);
        if (!invalidBefore)
            return false;
        const invalidTime = parseInt(invalidBefore);
        const isInvalid = tokenIat <= invalidTime;
        if (isInvalid) {
            console.warn(`[RbacService] 强制下线生效: userId=${userId}, Token签发时间(${tokenIat}) <= 变更时间(${invalidTime})`);
        }
        return isInvalid;
    }
    async clearUserSessionInvalidation(userId) {
        await this.redis.del(`user_invalid_before:${userId}`);
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_entity_1.Menu)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RbacService);
//# sourceMappingURL=rbac.service.js.map