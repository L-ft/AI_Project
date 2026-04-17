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
exports.DataBuilderTasksProxyController = void 0;
const common_1 = require("@nestjs/common");
const data_builder_task_orchestration_service_1 = require("../data-builder/data-builder-task-orchestration.service");
const data_builder_tasks_proxy_service_1 = require("./data-builder-tasks-proxy.service");
let DataBuilderTasksProxyController = class DataBuilderTasksProxyController {
    constructor(proxy, orchestration) {
        this.proxy = proxy;
        this.orchestration = orchestration;
    }
    list(limit) {
        const params = limit != null && limit !== '' ? { limit } : undefined;
        return this.proxy.forward({ method: 'GET', path: '/tasks', params });
    }
    create(body) {
        return this.orchestration.createTask(body);
    }
    getOne(taskId) {
        return this.proxy.forward({ method: 'GET', path: `/tasks/${taskId}` });
    }
    executeBatch(taskId, body) {
        return this.proxy.forward({
            method: 'POST',
            path: `/tasks/${taskId}/execute-batch`,
            data: body,
        });
    }
    cleanup(taskId, body) {
        return this.proxy.forward({
            method: 'POST',
            path: `/tasks/${taskId}/cleanup`,
            data: body,
        });
    }
};
exports.DataBuilderTasksProxyController = DataBuilderTasksProxyController;
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DataBuilderTasksProxyController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('tasks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DataBuilderTasksProxyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DataBuilderTasksProxyController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/execute-batch'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DataBuilderTasksProxyController.prototype, "executeBatch", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/cleanup'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DataBuilderTasksProxyController.prototype, "cleanup", null);
exports.DataBuilderTasksProxyController = DataBuilderTasksProxyController = __decorate([
    (0, common_1.Controller)('v1/data-builder'),
    __metadata("design:paramtypes", [data_builder_tasks_proxy_service_1.DataBuilderTasksProxyService,
        data_builder_task_orchestration_service_1.DataBuilderTaskOrchestrationService])
], DataBuilderTasksProxyController);
//# sourceMappingURL=data-builder-tasks-proxy.controller.js.map