import {
  DataBuilderTask,
  DataBuilderTaskBatch,
} from '../entities/data-builder-task.entity';

type TaskDetailProjection = Pick<
  DataBuilderTask,
  | 'task_id'
  | 'status'
  | 'manifest_json'
  | 'batch_count'
  | 'completed_batches'
  | 'current_batch_index'
  | 'rows_inserted_total'
  | 'last_heartbeat_at'
  | 'last_batch_started_at'
  | 'cleanup_status'
  | 'cleanup_blocked_reason'
  | 'row_map_flush_lag'
  | 'last_error_json'
  | 'assertion_evaluated'
  | 'assertion_runs_json'
>;

type ExecuteTaskProjection = Pick<
  DataBuilderTask,
  'task_id' | 'status' | 'manifest_json' | 'assertion_evaluated' | 'assertion_runs_json'
>;

type ExecuteBatchProjection = Pick<DataBuilderTaskBatch, 'batch_index' | 'rows_inserted'>;

export function buildTaskDetailResponse(task: TaskDetailProjection): Record<string, unknown> {
  const assertionEvaluated = Boolean(task.assertion_evaluated);
  const assertionRuns = asRecordArray(task.assertion_runs_json);
  const batchProgress = {
    batch_count: task.batch_count,
    completed_batches: task.completed_batches,
    current_batch_index: task.current_batch_index,
    rows_inserted_total: Number(task.rows_inserted_total || 0),
  };
  const cleanupStatus = {
    state: task.cleanup_status,
    blocked_reason: task.cleanup_blocked_reason,
  };
  const assertionCount = Array.isArray(task.manifest_json?.assertions)
    ? task.manifest_json.assertions.length
    : 0;
  const failedRules = failedAssertionRules(task.manifest_json, assertionRuns, assertionEvaluated);

  return {
    task_id: task.task_id,
    status: task.status,
    manifest: task.manifest_json,
    batch_progress: batchProgress,
    last_heartbeat_at: task.last_heartbeat_at,
    last_batch_started_at: task.last_batch_started_at,
    assertion_summary: {
      evaluated: assertionEvaluated,
      passed: failedRules.length === 0,
      failed_rules: failedRules,
    },
    assertion_runs: assertionRuns,
    cleanup_status: cleanupStatus,
    row_map_flush_lag: task.row_map_flush_lag,
    last_error: task.last_error_json,
    runtime: {
      batch_progress: batchProgress,
      last_heartbeat_at: task.last_heartbeat_at,
      last_batch_started_at: task.last_batch_started_at,
      cleanup_status: cleanupStatus,
      assertion_summary: {
        total: assertionCount,
        passed: assertionEvaluated
          ? assertionRuns.filter((run) => run.passed === true).length
          : 0,
      },
    },
  };
}

export function buildExecuteBatchResponse(input: {
  task: ExecuteTaskProjection;
  batch: ExecuteBatchProjection;
  baseResponse?: Record<string, unknown>;
}): Record<string, unknown> {
  const assertionEvaluated = Boolean(input.task.assertion_evaluated);
  const assertionRuns = assertionEvaluated ? asRecordArray(input.task.assertion_runs_json) : [];
  const failedRules = assertionEvaluated
    ? failedAssertionRules(input.task.manifest_json, assertionRuns, true)
    : [];
  const response: Record<string, unknown> = {
    ...(input.baseResponse ?? {}),
    task_id: input.task.task_id,
    status: input.task.status,
    batch_index: input.batch.batch_index,
    rows_affected: Number(input.batch.rows_inserted || 0),
    assertions_evaluated: assertionEvaluated,
    assertion_summary: assertionEvaluated
      ? {
          evaluated: true,
          passed: failedRules.length === 0,
          failed_rules: failedRules,
        }
      : null,
  };
  if (assertionEvaluated || input.baseResponse?.assertion_runs !== undefined) {
    response.assertion_runs = assertionRuns;
  }
  return response;
}

export function failedAssertionRules(
  manifest: Record<string, unknown>,
  assertionRuns: Array<Record<string, unknown>>,
  evaluated: boolean,
): string[] {
  if (!evaluated) return [];

  const failed: string[] = [];
  for (const run of assertionRuns) {
    if (run.passed === true) continue;
    const assertionId = asString(run.assertion_id);
    if (!assertionId) continue;
    const severity = Array.isArray(manifest.assertions)
      ? String(
          manifest.assertions.find(
            (item) => item && typeof item === 'object' && item.id === assertionId,
          )?.severity ?? 'error',
        )
      : 'error';
    if (severity === 'error') {
      failed.push(assertionId);
    }
  }
  return failed;
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === 'object') as Array<Record<string, unknown>>;
}

function asString(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s ? s : null;
}
