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
var DataBuilderTasksProxyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilderTasksProxyController = void 0;
const common_1 = require("@nestjs/common");
const data_builder_task_mode_1 = require("../data-builder/data-builder-task-mode");
const data_builder_task_orchestration_service_1 = require("../data-builder/data-builder-task-orchestration.service");
const data_builder_task_shadow_store_service_1 = require("../data-builder/data-builder-task-shadow-store.service");
const data_builder_tasks_proxy_service_1 = require("./data-builder-tasks-proxy.service");
let DataBuilderTasksProxyController = DataBuilderTasksProxyController_1 = class DataBuilderTasksProxyController {
    constructor(proxy, orchestration, shadowStore) {
        this.proxy = proxy;
        this.orchestration = orchestration;
        this.shadowStore = shadowStore;
        this.logger = new common_1.Logger(DataBuilderTasksProxyController_1.name);
    }
    async list(limit) {
        if ((0, data_builder_task_mode_1.isDataBuilderDbPrimaryEnabled)()) {
            return this.orchestration.listPrimaryTasks(this.parseLimit(limit));
        }
        return this.listLegacyTasks(limit);
    }
    create(body) {
        return this.orchestration.createTask(body);
    }
    async getOne(taskId) {
        if ((0, data_builder_task_mode_1.isDataBuilderDbPrimaryEnabled)()) {
            return this.orchestration.getPrimaryTask(taskId);
        }
        return this.getLegacyTask(taskId);
    }
    async executeBatch(taskId, body) {
        if ((0, data_builder_task_mode_1.isDataBuilderDbPrimaryEnabled)()) {
            return this.orchestration.executePrimaryBatch(taskId, body);
        }
        return this.executeLegacyBatch(taskId, body);
    }
    async cleanup(taskId, body) {
        if ((0, data_builder_task_mode_1.isDataBuilderDbPrimaryEnabled)()) {
            return this.orchestration.cleanupPrimaryTask(taskId, body);
        }
        return this.cleanupLegacyTask(taskId, body);
    }
    parseLimit(limit) {
        return limit != null && limit !== '' ? Number(limit) : 50;
    }
    buildLimitParams(limit) {
        return limit != null && limit !== '' ? { limit } : undefined;
    }
    async listLegacyTasks(limit) {
        if (!this.shadowStore.enabled()) {
            return this.fetchLegacyTaskListFromUpstream(limit);
        }
        try {
            const rows = await this.shadowStore.listTaskDetails(this.parseLimit(limit));
            if (rows.length > 0) {
                if ((0, data_builder_task_mode_1.shouldDataBuilderShadowReadThrough)()) {
                    void this.refreshLegacyTaskListFromUpstream(limit);
                }
                return rows;
            }
        }
        catch (error) {
            this.logger.warn(`Shadow list read failed, falling back to upstream: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
        return this.fetchLegacyTaskListFromUpstream(limit);
    }
    async getLegacyTask(taskId) {
        if (!this.shadowStore.enabled()) {
            return this.fetchLegacyTaskDetailFromUpstream(taskId);
        }
        try {
            const shadow = await this.shadowStore.getTaskDetail(taskId);
            if (shadow) {
                if ((0, data_builder_task_mode_1.shouldDataBuilderShadowReadThrough)()) {
                    void this.refreshLegacyTaskDetailFromUpstream(taskId);
                }
                return shadow;
            }
        }
        catch (error) {
            this.logger.warn(`Shadow detail read failed, falling back to upstream: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
        return this.fetchLegacyTaskDetailFromUpstream(taskId);
    }
    async executeLegacyBatch(taskId, body) {
        return this.runLegacyMutation({
            path: `/tasks/${taskId}/execute-batch`,
            body,
            mirrorFailureLog: 'Failed to mirror execute-batch failure into shadow store',
            mirrorSuccessLog: 'Failed to mirror execute-batch result into shadow store',
            onFailure: async (error) => {
                await this.shadowStore.mirrorExecuteBatchFailure(taskId, this.readBatchIndex(body), this.readHttpErrorResponse(error), this.readHttpErrorStatus(error));
            },
            onSuccess: async (upstream) => {
                await this.shadowStore.mirrorExecuteBatchResponse(upstream);
            },
        });
    }
    async cleanupLegacyTask(taskId, body) {
        return this.runLegacyMutation({
            path: `/tasks/${taskId}/cleanup`,
            body,
            mirrorFailureLog: 'Failed to mirror cleanup failure into shadow store',
            mirrorSuccessLog: 'Failed to mirror cleanup result into shadow store',
            onFailure: async (error) => {
                await this.shadowStore.mirrorCleanupFailure(taskId, this.readHttpErrorResponse(error), this.readHttpErrorStatus(error));
            },
            onSuccess: async (upstream) => {
                await this.shadowStore.mirrorCleanupResponse(upstream);
            },
        });
    }
    async runLegacyMutation(opts) {
        let upstream;
        try {
            upstream = await this.proxy.forwardLegacyLifecycle({
                method: 'POST',
                path: opts.path,
                data: opts.body,
            });
        }
        catch (error) {
            await this.mirrorLegacyFailure(opts.mirrorFailureLog, async () => opts.onFailure(error));
            throw error;
        }
        await this.mirrorLegacySuccess(opts.mirrorSuccessLog, async () => opts.onSuccess(upstream));
        return upstream;
    }
    async mirrorLegacyFailure(message, fn) {
        if (!this.shadowStore.enabled())
            return;
        try {
            await fn();
        }
        catch (error) {
            this.logger.warn(`${message}: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    async mirrorLegacySuccess(message, fn) {
        if (!this.shadowStore.enabled())
            return;
        try {
            await fn();
        }
        catch (error) {
            this.logger.warn(`${message}: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    readHttpErrorResponse(error) {
        return error instanceof common_1.HttpException ? error.getResponse() : null;
    }
    readHttpErrorStatus(error) {
        return error instanceof common_1.HttpException ? error.getStatus() : undefined;
    }
    readBatchIndex(body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return null;
        }
        const batchIndex = Number(body.batch_index);
        return Number.isFinite(batchIndex) ? batchIndex : null;
    }
    async fetchLegacyTaskListFromUpstream(limit) {
        const upstream = await this.proxy.forwardLegacyLifecycle({
            method: 'GET',
            path: '/tasks',
            params: this.buildLimitParams(limit),
        });
        let mirrored = null;
        await this.mirrorLegacySuccess('Failed to mirror upstream task list into shadow store', async () => {
            mirrored = await this.shadowStore.mirrorTaskList(upstream);
        });
        return mirrored ?? upstream;
    }
    async fetchLegacyTaskDetailFromUpstream(taskId) {
        const upstream = await this.proxy.forwardLegacyLifecycle({
            method: 'GET',
            path: `/tasks/${taskId}`,
        });
        let mirrored = null;
        await this.mirrorLegacySuccess('Failed to mirror upstream task detail into shadow store', async () => {
            mirrored = await this.shadowStore.mirrorTaskDetail(upstream);
        });
        return mirrored ?? upstream;
    }
    async refreshLegacyTaskListFromUpstream(limit) {
        try {
            await this.fetchLegacyTaskListFromUpstream(limit);
        }
        catch (error) {
            this.logger.warn(`Shadow read-through list refresh failed: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    async refreshLegacyTaskDetailFromUpstream(taskId) {
        try {
            await this.fetchLegacyTaskDetailFromUpstream(taskId);
        }
        catch (error) {
            this.logger.warn(`Shadow read-through detail refresh failed: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
};
exports.DataBuilderTasksProxyController = DataBuilderTasksProxyController;
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
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
    __metadata("design:returntype", Promise)
], DataBuilderTasksProxyController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/execute-batch'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataBuilderTasksProxyController.prototype, "executeBatch", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/cleanup'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataBuilderTasksProxyController.prototype, "cleanup", null);
exports.DataBuilderTasksProxyController = DataBuilderTasksProxyController = DataBuilderTasksProxyController_1 = __decorate([
    (0, common_1.Controller)('v1/data-builder'),
    __metadata("design:paramtypes", [data_builder_tasks_proxy_service_1.DataBuilderTasksProxyService,
        data_builder_task_orchestration_service_1.DataBuilderTaskOrchestrationService,
        data_builder_task_shadow_store_service_1.DataBuilderTaskShadowStoreService])
], DataBuilderTasksProxyController);
//# sourceMappingURL=data-builder-tasks-proxy.controller.js.map