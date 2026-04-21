"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilderTasksProxyModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const data_builder_connection_crypto_service_1 = require("../data-builder/data-builder-connection-crypto.service");
const data_builder_primary_task_store_service_1 = require("../data-builder/data-builder-primary-task-store.service");
const data_builder_task_orchestration_service_1 = require("../data-builder/data-builder-task-orchestration.service");
const data_builder_task_schema_service_1 = require("../data-builder/data-builder-task-schema.service");
const data_builder_task_shadow_store_service_1 = require("../data-builder/data-builder-task-shadow-store.service");
const manifest_draft_service_1 = require("../data-builder/manifest-draft.service");
const manifest_validate_service_1 = require("../data-builder/manifest-validate.service");
const data_builder_task_entity_1 = require("../entities/data-builder-task.entity");
const data_builder_tasks_proxy_controller_1 = require("./data-builder-tasks-proxy.controller");
const data_builder_tasks_proxy_service_1 = require("./data-builder-tasks-proxy.service");
let DataBuilderTasksProxyModule = class DataBuilderTasksProxyModule {
};
exports.DataBuilderTasksProxyModule = DataBuilderTasksProxyModule;
exports.DataBuilderTasksProxyModule = DataBuilderTasksProxyModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, typeorm_1.TypeOrmModule.forFeature([data_builder_task_entity_1.DataBuilderTask, data_builder_task_entity_1.DataBuilderTaskBatch])],
        controllers: [data_builder_tasks_proxy_controller_1.DataBuilderTasksProxyController],
        providers: [
            data_builder_tasks_proxy_service_1.DataBuilderTasksProxyService,
            manifest_validate_service_1.ManifestValidateService,
            manifest_draft_service_1.ManifestDraftService,
            data_builder_connection_crypto_service_1.DataBuilderConnectionCryptoService,
            data_builder_primary_task_store_service_1.DataBuilderPrimaryTaskStoreService,
            data_builder_task_shadow_store_service_1.DataBuilderTaskShadowStoreService,
            data_builder_task_schema_service_1.DataBuilderTaskSchemaService,
            data_builder_task_orchestration_service_1.DataBuilderTaskOrchestrationService,
        ],
    })
], DataBuilderTasksProxyModule);
//# sourceMappingURL=data-builder-tasks-proxy.module.js.map