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
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const api_service_1 = require("./api.service");
const roles_guard_1 = require("../auth/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ApiController = class ApiController {
    constructor(apiService) {
        this.apiService = apiService;
    }
    async createApi(data) {
        return this.apiService.create(data);
    }
    async listApis() {
        return this.apiService.findAll();
    }
    async dispatchTask(id) {
        return this.apiService.dispatchToFastAPI(id);
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Post)('create'),
    (0, roles_guard_1.Roles)('ADMIN', 'DEV'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "createApi", null);
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "listApis", null);
__decorate([
    (0, common_1.Post)('dispatch/:id'),
    (0, roles_guard_1.Roles)('ADMIN', 'TESTER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "dispatchTask", null);
exports.ApiController = ApiController = __decorate([
    (0, common_1.Controller)('api'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [api_service_1.ApiService])
], ApiController);
//# sourceMappingURL=api.controller.js.map