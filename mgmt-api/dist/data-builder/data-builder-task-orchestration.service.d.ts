import { DataBuilderTasksProxyService } from '../modules/data-builder-tasks-proxy.service';
import { DataBuilderPrimaryTaskStoreService } from './data-builder-primary-task-store.service';
import { DataBuilderTaskShadowStoreService } from './data-builder-task-shadow-store.service';
import { ManifestDraftService } from './manifest-draft.service';
import { ManifestValidateService } from './manifest-validate.service';
export declare class DataBuilderTaskOrchestrationService {
    private readonly proxy;
    private readonly validate;
    private readonly draft;
    private readonly shadowStore;
    private readonly primaryStore;
    private readonly logger;
    constructor(proxy: DataBuilderTasksProxyService, validate: ManifestValidateService, draft: ManifestDraftService, shadowStore: DataBuilderTaskShadowStoreService, primaryStore: DataBuilderPrimaryTaskStoreService);
    createTask(body: Record<string, unknown>): Promise<unknown>;
    private createLegacyTask;
    listPrimaryTasks(limit?: number): Promise<Array<Record<string, unknown>>>;
    getPrimaryTask(taskId: string): Promise<Record<string, unknown>>;
    executePrimaryBatch(taskId: string, body: unknown): Promise<unknown>;
    cleanupPrimaryTask(taskId: string, body: unknown): Promise<unknown>;
    private buildCreateInput;
    private readBatchIndex;
    private readDryRun;
    private readConfirm;
    private readActor;
}
