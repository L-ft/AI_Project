import { DataBuilderTaskOrchestrationService } from '../data-builder/data-builder-task-orchestration.service';
import { DataBuilderTasksProxyService } from './data-builder-tasks-proxy.service';
export declare class DataBuilderTasksProxyController {
    private readonly proxy;
    private readonly orchestration;
    constructor(proxy: DataBuilderTasksProxyService, orchestration: DataBuilderTaskOrchestrationService);
    list(limit?: string): Promise<unknown>;
    create(body: unknown): Promise<unknown>;
    getOne(taskId: string): Promise<unknown>;
    executeBatch(taskId: string, body: unknown): Promise<unknown>;
    cleanup(taskId: string, body: unknown): Promise<unknown>;
}
