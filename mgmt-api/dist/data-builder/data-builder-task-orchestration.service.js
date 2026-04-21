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
var DataBuilderTaskOrchestrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilderTaskOrchestrationService = void 0;
const common_1 = require("@nestjs/common");
const data_builder_tasks_proxy_service_1 = require("../modules/data-builder-tasks-proxy.service");
const data_builder_primary_task_store_service_1 = require("./data-builder-primary-task-store.service");
const data_builder_task_mode_1 = require("./data-builder-task-mode");
const data_builder_task_shadow_store_service_1 = require("./data-builder-task-shadow-store.service");
const manifest_draft_service_1 = require("./manifest-draft.service");
const manifest_validate_service_1 = require("./manifest-validate.service");
let DataBuilderTaskOrchestrationService = DataBuilderTaskOrchestrationService_1 = class DataBuilderTaskOrchestrationService {
    constructor(proxy, validate, draft, shadowStore, primaryStore) {
        this.proxy = proxy;
        this.validate = validate;
        this.draft = draft;
        this.shadowStore = shadowStore;
        this.primaryStore = primaryStore;
        this.logger = new common_1.Logger(DataBuilderTaskOrchestrationService_1.name);
    }
    async createTask(body) {
        const input = this.buildCreateInput(body);
        if ((0, data_builder_task_mode_1.isDataBuilderDbPrimaryEnabled)()) {
            return this.primaryStore.createTask(input.manifest, input.mysql, this.readActor(body));
        }
        return this.createLegacyTask(input);
    }
    async createLegacyTask(input) {
        const upstream = await this.proxy.forwardLegacyLifecycle({
            method: 'POST',
            path: '/tasks',
            data: { manifest: input.manifest, mysql: input.mysql },
        });
        if (!this.shadowStore.enabled()) {
            return upstream;
        }
        try {
            await this.shadowStore.mirrorCreateResponse(upstream, input.mysql, input.manifest);
        }
        catch (error) {
            this.logger.warn(`Failed to mirror upstream create response into shadow store: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
        return upstream;
    }
    async listPrimaryTasks(limit = 50) {
        return this.primaryStore.listTaskDetails(limit);
    }
    async getPrimaryTask(taskId) {
        const detail = await this.primaryStore.getTaskDetail(taskId);
        if (!detail) {
            throw new common_1.NotFoundException({
                code: 'DB_TASK_NOT_FOUND',
                message: taskId,
            });
        }
        return detail;
    }
    async executePrimaryBatch(taskId, body) {
        const batchIndex = this.readBatchIndex(body);
        const dryRun = this.readDryRun(body);
        const claim = dryRun
            ? await this.primaryStore.getBatchExecutionInput(taskId, batchIndex)
            : await this.primaryStore.claimBatchExecution(taskId, batchIndex);
        if (claim.kind === 'replay') {
            return claim.response;
        }
        try {
            const upstream = await this.proxy.forwardInternal({
                path: '/execute-batch',
                data: {
                    task_id: claim.taskId,
                    manifest: claim.manifest,
                    mysql: claim.mysql,
                    batch_index: batchIndex,
                    dry_run: dryRun,
                },
            });
            if (!dryRun) {
                return this.primaryStore.markBatchExecutionSuccess(taskId, batchIndex, upstream);
            }
            return upstream;
        }
        catch (error) {
            if (!dryRun) {
                await this.primaryStore.markBatchExecutionFailure(taskId, batchIndex, error instanceof common_1.HttpException ? error.getResponse() : null, error instanceof common_1.HttpException ? error.getStatus() : undefined);
            }
            throw error;
        }
    }
    async cleanupPrimaryTask(taskId, body) {
        if (!this.readConfirm(body)) {
            throw new common_1.BadRequestException({
                code: 'DB_CLEAN_CONFIRM_REQUIRED',
                message: 'confirm=true is required',
            });
        }
        const claim = await this.primaryStore.claimCleanup(taskId, this.readActor(body));
        if (claim.kind === 'replay') {
            return claim.response;
        }
        try {
            const upstream = await this.proxy.forwardInternal({
                path: '/cleanup',
                data: {
                    task_id: claim.taskId,
                    manifest: claim.manifest,
                    mysql: claim.mysql,
                    confirm: true,
                    actor: claim.actor,
                },
            });
            await this.primaryStore.markCleanupSuccess(taskId, upstream);
            return upstream;
        }
        catch (error) {
            await this.primaryStore.markCleanupFailure(taskId, error instanceof common_1.HttpException ? error.getResponse() : null, error instanceof common_1.HttpException ? error.getStatus() : undefined);
            throw error;
        }
    }
    buildCreateInput(body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_BODY_INVALID',
                message: 'request body must be a JSON object',
            });
        }
        const mysql = body.mysql;
        if (!mysql || typeof mysql !== 'object') {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_MYSQL_REQUIRED',
                message: 'create task requires mysql connection fields',
            });
        }
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        let manifest = body.manifest;
        const tableHint = typeof body.table_hint === 'string' ? body.table_hint.trim() : undefined;
        if (prompt && manifest) {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_AMBIGUOUS_BODY',
                message: 'provide either prompt or manifest, not both',
            });
        }
        if (!prompt && !manifest) {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_BODY_INVALID',
                message: 'provide manifest or prompt',
            });
        }
        if (prompt) {
            manifest = this.draft.fromPrompt(prompt, mysql, tableHint);
        }
        this.validate.assertValidManifest(manifest);
        return { mysql, manifest: manifest };
    }
    readBatchIndex(body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_BODY_INVALID',
                message: 'execute-batch body must be a JSON object',
            });
        }
        const n = Number(body.batch_index);
        if (!Number.isInteger(n) || n < 0) {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_BATCH_OUT_OF_RANGE',
                message: 'batch_index must be a non-negative integer',
            });
        }
        return n;
    }
    readDryRun(body) {
        return Boolean(body?.dry_run);
    }
    readConfirm(body) {
        return Boolean(body?.confirm);
    }
    readActor(body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return null;
        }
        const actor = body.actor ?? body.created_by;
        if (actor == null)
            return null;
        const s = String(actor).trim();
        return s ? s : null;
    }
};
exports.DataBuilderTaskOrchestrationService = DataBuilderTaskOrchestrationService;
exports.DataBuilderTaskOrchestrationService = DataBuilderTaskOrchestrationService = DataBuilderTaskOrchestrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_builder_tasks_proxy_service_1.DataBuilderTasksProxyService,
        manifest_validate_service_1.ManifestValidateService,
        manifest_draft_service_1.ManifestDraftService,
        data_builder_task_shadow_store_service_1.DataBuilderTaskShadowStoreService,
        data_builder_primary_task_store_service_1.DataBuilderPrimaryTaskStoreService])
], DataBuilderTaskOrchestrationService);
//# sourceMappingURL=data-builder-task-orchestration.service.js.map