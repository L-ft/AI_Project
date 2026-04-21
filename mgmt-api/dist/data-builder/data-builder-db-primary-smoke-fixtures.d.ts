import { DataBuilderTaskOrchestrationService } from './data-builder-task-orchestration.service';
import { DataBuilderPrimaryTaskStoreService } from './data-builder-primary-task-store.service';
import { DataBuilderTask, DataBuilderTaskBatch } from '../entities/data-builder-task.entity';
type TaskRow = DataBuilderTask & Record<string, any>;
type BatchRow = DataBuilderTaskBatch & Record<string, any>;
type InMemoryFindOptions = {
    where?: Record<string, unknown>;
    order?: Record<string, 'ASC' | 'DESC'>;
    take?: number;
    select?: Record<string, unknown>;
};
export declare class InMemoryPrimaryDb {
    private readonly tasks;
    private readonly batches;
    private batchAutoId;
    readonly manager: {
        transaction: <T>(fn: (manager: typeof this.managerApi) => Promise<T>) => Promise<T>;
    };
    readonly managerApi: {
        findOne: (entity: unknown, options: InMemoryFindOptions) => Promise<any>;
        find: (entity: unknown, options?: InMemoryFindOptions) => Promise<any[]>;
        create: <T extends Record<string, unknown>>(_entity: unknown, partial: T) => T;
        save: <T>(value: T | T[]) => Promise<T | T[]>;
    };
    findOneByKind(kind: 'task' | 'batch', options: InMemoryFindOptions): Promise<any>;
    findByKind(kind: 'task' | 'batch', options?: InMemoryFindOptions): Promise<any[]>;
    existByKind(kind: 'task' | 'batch', options?: InMemoryFindOptions): Promise<boolean>;
    getTask(taskId: string): TaskRow | undefined;
    getBatch(taskId: string, batchIndex: number): BatchRow | undefined;
    private findOne;
    private find;
    private save;
    private saveOne;
    private matches;
    private sortRows;
    private project;
}
export declare class FakeRepository<T> {
    private readonly kind;
    private readonly db;
    readonly manager: any;
    constructor(kind: 'task' | 'batch', db: InMemoryPrimaryDb);
    findOne(options: InMemoryFindOptions): Promise<T | null>;
    find(options?: InMemoryFindOptions): Promise<T[]>;
    exist(options?: InMemoryFindOptions): Promise<boolean>;
    upsert(value: T | T[], _conflictPaths: string[]): Promise<void>;
    save(value: T | T[]): Promise<T | T[]>;
}
export declare class FakeValidateService {
    assertValidManifest(_manifest: unknown): void;
}
export declare class FakeDraftService {
    fromPrompt(): never;
}
export declare class FakeShadowStore {
    enabled(): boolean;
    mirrorCreateResponse(): Promise<void>;
}
export type ProxyInternalCall = {
    path: '/execute-batch' | '/cleanup';
    data: Record<string, any>;
};
type SuccessOutcome = {
    kind: 'success';
    response: Record<string, unknown>;
};
type HttpErrorOutcome = {
    kind: 'http_error';
    status: number;
    response: Record<string, unknown>;
};
export type ExecuteBatchOutcome = SuccessOutcome | HttpErrorOutcome;
export type CleanupOutcome = SuccessOutcome | HttpErrorOutcome;
type ProxyPlan = {
    executeBatch?: ExecuteBatchOutcome | ((call: ProxyInternalCall) => ExecuteBatchOutcome);
    cleanup?: CleanupOutcome | ((call: ProxyInternalCall) => CleanupOutcome);
};
export declare class ScenarioProxyService {
    private readonly plan;
    readonly internalCalls: ProxyInternalCall[];
    constructor(plan?: ProxyPlan);
    forwardLegacyLifecycle(): Promise<never>;
    forwardInternal(opts: ProxyInternalCall): Promise<unknown>;
    private resolveOutcome;
}
export declare function buildManifest(options?: {
    assertionId?: string;
    batchCount?: number;
    totalRows?: number;
    batchSize?: number;
    rowCounts?: number[];
}): Record<string, unknown>;
export declare function createPrimaryHarness(db?: InMemoryPrimaryDb, plan?: ProxyPlan): {
    db: InMemoryPrimaryDb;
    proxy: ScenarioProxyService;
    orchestration: DataBuilderTaskOrchestrationService;
    primaryStore: DataBuilderPrimaryTaskStoreService;
};
export {};
