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
exports.DataBuilderTaskOrchestrationService = void 0;
const common_1 = require("@nestjs/common");
const data_builder_tasks_proxy_service_1 = require("../modules/data-builder-tasks-proxy.service");
const manifest_draft_service_1 = require("./manifest-draft.service");
const manifest_validate_service_1 = require("./manifest-validate.service");
let DataBuilderTaskOrchestrationService = class DataBuilderTaskOrchestrationService {
    constructor(proxy, validate, draft) {
        this.proxy = proxy;
        this.validate = validate;
        this.draft = draft;
    }
    async createTask(body) {
        const mysql = body.mysql;
        if (!mysql || typeof mysql !== 'object') {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_MYSQL_REQUIRED',
                message: '创建任务须提供 mysql 连接体（host/port/user/password/database）',
            });
        }
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        let manifest = body.manifest;
        const tableHint = typeof body.table_hint === 'string' ? body.table_hint.trim() : undefined;
        if (prompt && manifest) {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_AMBIGUOUS_BODY',
                message: '请勿同时传 prompt 与 manifest；择一即可',
            });
        }
        if (!prompt && !manifest) {
            throw new common_1.BadRequestException({
                code: 'DB_TASK_BODY_INVALID',
                message: '须提供 manifest 或 prompt',
            });
        }
        if (prompt) {
            manifest = this.draft.fromPrompt(prompt, mysql, tableHint);
        }
        this.validate.assertValidManifest(manifest);
        return this.proxy.forward({
            method: 'POST',
            path: '/tasks',
            data: { manifest, mysql },
        });
    }
};
exports.DataBuilderTaskOrchestrationService = DataBuilderTaskOrchestrationService;
exports.DataBuilderTaskOrchestrationService = DataBuilderTaskOrchestrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_builder_tasks_proxy_service_1.DataBuilderTasksProxyService,
        manifest_validate_service_1.ManifestValidateService,
        manifest_draft_service_1.ManifestDraftService])
], DataBuilderTaskOrchestrationService);
//# sourceMappingURL=data-builder-task-orchestration.service.js.map