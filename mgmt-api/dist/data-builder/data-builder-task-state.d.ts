import { type DataBuilderCleanupStatus, type DataBuilderTaskStatus } from '../entities/data-builder-task.entity';
export declare const TERMINAL_TASK_STATUSES: Set<DataBuilderTaskStatus>;
export declare const TERMINAL_BATCH_STATUSES: Set<DataBuilderTaskStatus>;
export declare function isTerminalTaskStatus(status: DataBuilderTaskStatus): boolean;
export declare function statusForSuccessfulBatch(taskStatus: DataBuilderTaskStatus): DataBuilderTaskStatus;
export declare function deriveTaskStatusFromSnapshot(input: {
    proposedTaskStatus: DataBuilderTaskStatus;
    batchCount: number;
    completedBatches: number;
}): DataBuilderTaskStatus;
export declare function deriveTaskStatusAfterSuccessfulBatch(input: {
    proposedTaskStatus: DataBuilderTaskStatus;
    batchCount: number;
    completedBatches: number;
}): DataBuilderTaskStatus;
export declare function deriveTaskStatusAfterExecutionFailure(input: {
    currentStatus: DataBuilderTaskStatus;
    shouldMarkFailed: boolean;
}): DataBuilderTaskStatus;
export declare function shouldAcceptAssertionEvaluation(status: DataBuilderTaskStatus): boolean;
export declare function terminalBatchCount(status: DataBuilderTaskStatus): number;
export declare function deriveCleanupState(input: {
    cleanupCompletedAt: Date | null;
    taskStatus: DataBuilderTaskStatus;
    rowMapFlushLag: number;
    completedBatches: number;
}): {
    cleanup_status: DataBuilderCleanupStatus;
    cleanup_blocked_reason: string | null;
};
