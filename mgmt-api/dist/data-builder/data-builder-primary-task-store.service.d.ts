import { Repository } from 'typeorm';
import { DataBuilderTask, DataBuilderTaskBatch } from '../entities/data-builder-task.entity';
import { DataBuilderConnectionCryptoService } from './data-builder-connection-crypto.service';
import type { MysqlConnDraft } from './manifest-draft.service';
export type BatchExecutionClaim = {
    kind: 'replay';
    response: Record<string, unknown>;
} | {
    kind: 'execute';
    taskId: string;
    batchIndex: number;
    manifest: Record<string, unknown>;
    mysql: MysqlConnDraft;
};
export type CleanupClaim = {
    kind: 'replay';
    response: Record<string, unknown>;
} | {
    kind: 'execute';
    taskId: string;
    manifest: Record<string, unknown>;
    mysql: MysqlConnDraft;
    actor: string | null;
};
export declare class DataBuilderPrimaryTaskStoreService {
    private readonly taskRepo;
    private readonly batchRepo;
    private readonly cryptoService;
    constructor(taskRepo: Repository<DataBuilderTask>, batchRepo: Repository<DataBuilderTaskBatch>, cryptoService: DataBuilderConnectionCryptoService);
    createTask(manifest: Record<string, unknown>, mysql: MysqlConnDraft, createdBy?: string | null): Promise<Record<string, unknown>>;
    listTaskDetails(limit?: number): Promise<Array<Record<string, unknown>>>;
    getTaskDetail(taskId: string): Promise<Record<string, unknown> | null>;
    getBatchExecutionInput(taskId: string, batchIndex: number): Promise<Extract<BatchExecutionClaim, {
        kind: 'execute';
    }>>;
    claimBatchExecution(taskId: string, batchIndex: number): Promise<BatchExecutionClaim>;
    markBatchExecutionSuccess(taskId: string, batchIndex: number, response: unknown): Promise<Record<string, unknown>>;
    markBatchExecutionFailure(taskId: string, batchIndex: number, errorResponse: unknown, httpStatus?: number): Promise<void>;
    claimCleanup(taskId: string, actor: string | null): Promise<CleanupClaim>;
    markCleanupSuccess(taskId: string, response: unknown): Promise<void>;
    markCleanupFailure(taskId: string, errorResponse: unknown, httpStatus?: number): Promise<void>;
    private lockTask;
    private lockBatch;
    private restoreMysql;
    private toCleanupReplay;
    private applyBatchAggregateDelta;
    private applyDerivedCleanupState;
    private normalizeErrorEnvelope;
    private shouldMarkExecutionFailed;
    private deriveBatchCount;
    private deriveManifestVersion;
    private hashJson;
    private cloneManifest;
    private coerceStatus;
    private asRecord;
    private asRecordArray;
    private asString;
    private asNumber;
    private asDate;
}
