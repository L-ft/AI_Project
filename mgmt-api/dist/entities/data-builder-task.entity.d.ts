export type DataBuilderTaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED_OK' | 'FAILED_ASSERTION' | 'FAILED_EXECUTION';
export type DataBuilderCleanupStatus = 'not_applicable' | 'eligible' | 'running' | 'completed' | 'blocked';
export declare class DataBuilderTask {
    task_id: string;
    status: DataBuilderTaskStatus;
    manifest_json: Record<string, unknown>;
    manifest_hash: string | null;
    manifest_version: string;
    mysql_conn_snapshot_json: Record<string, unknown> | null;
    mysql_conn_encrypted_json: Record<string, unknown> | null;
    mysql_conn_snapshot_version: string;
    execution_mode: string;
    orchestration_owner: string;
    batch_count: number;
    completed_batches: number;
    current_batch_index: number | null;
    rows_inserted_total: string;
    last_heartbeat_at: Date | null;
    last_batch_started_at: Date | null;
    row_map_flush_lag: number;
    cleanup_status: DataBuilderCleanupStatus;
    cleanup_blocked_reason: string | null;
    cleanup_started_at: Date | null;
    cleanup_completed_at: Date | null;
    cleanup_completed_by: string | null;
    last_error_json: Record<string, unknown> | null;
    assertion_evaluated: boolean;
    assertion_runs_json: Array<Record<string, unknown>> | null;
    created_by: string | null;
    created_at: Date;
    updated_at: Date;
}
export declare class DataBuilderTaskBatch {
    id: string;
    task_id: string;
    batch_index: number;
    status: DataBuilderTaskStatus;
    rows_inserted: string;
    attempt_count: number;
    started_at: Date | null;
    last_heartbeat_at: Date | null;
    finished_at: Date | null;
    idempotency_key: string | null;
    last_error_json: Record<string, unknown> | null;
    created_at: Date;
    updated_at: Date;
}
