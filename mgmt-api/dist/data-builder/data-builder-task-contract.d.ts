import { DataBuilderTask, DataBuilderTaskBatch } from '../entities/data-builder-task.entity';
type TaskDetailProjection = Pick<DataBuilderTask, 'task_id' | 'status' | 'manifest_json' | 'batch_count' | 'completed_batches' | 'current_batch_index' | 'rows_inserted_total' | 'last_heartbeat_at' | 'last_batch_started_at' | 'cleanup_status' | 'cleanup_blocked_reason' | 'row_map_flush_lag' | 'last_error_json' | 'assertion_evaluated' | 'assertion_runs_json'>;
type ExecuteTaskProjection = Pick<DataBuilderTask, 'task_id' | 'status' | 'manifest_json' | 'assertion_evaluated' | 'assertion_runs_json'>;
type ExecuteBatchProjection = Pick<DataBuilderTaskBatch, 'batch_index' | 'rows_inserted'>;
export declare function buildTaskDetailResponse(task: TaskDetailProjection): Record<string, unknown>;
export declare function buildExecuteBatchResponse(input: {
    task: ExecuteTaskProjection;
    batch: ExecuteBatchProjection;
    baseResponse?: Record<string, unknown>;
}): Record<string, unknown>;
export declare function failedAssertionRules(manifest: Record<string, unknown>, assertionRuns: Array<Record<string, unknown>>, evaluated: boolean): string[];
export {};
