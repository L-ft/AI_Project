import { DataBuilderTasksProxyService } from '../modules/data-builder-tasks-proxy.service';
import { ManifestDraftService } from './manifest-draft.service';
import { ManifestValidateService } from './manifest-validate.service';
export declare class DataBuilderTaskOrchestrationService {
    private readonly proxy;
    private readonly validate;
    private readonly draft;
    constructor(proxy: DataBuilderTasksProxyService, validate: ManifestValidateService, draft: ManifestDraftService);
    createTask(body: Record<string, unknown>): Promise<unknown>;
}
