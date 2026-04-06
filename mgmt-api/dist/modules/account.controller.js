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
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const crypto = require("crypto");
let AccountController = class AccountController {
    async getAssetOverview(req) {
        const { uid, tenantId } = req.user;
        return {
            apiCount: 42,
            projectCount: 5,
            recentExecutions: [
                { id: 'login-api-test-a', code: 'login-api-test-a', name: 'Login API Test', status: 'SUCCESS', time: '2026-01-17 10:00:00' }
            ]
        };
    }
    async generateApiKey(req) {
        const key = `ai_${crypto.randomBytes(30).toString('hex')}`;
        return {
            name: 'Default Key',
            apiKey: key,
            createdAt: new Date().toISOString()
        };
    }
    async listApiKeys(req) {
        return [
            { id: 'production-key-a', code: 'production-key-a', name: 'Production Key', apiKey: 'ai_5f7d...3a2b', isActive: true }
        ];
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Get)('assets'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAssetOverview", null);
__decorate([
    (0, common_1.Post)('apikey/generate'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "generateApiKey", null);
__decorate([
    (0, common_1.Get)('apikey/list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "listApiKeys", null);
exports.AccountController = AccountController = __decorate([
    (0, common_1.Controller)('account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)
], AccountController);
//# sourceMappingURL=account.controller.js.map