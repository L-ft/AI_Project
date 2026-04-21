import {
  type DataBuilderCleanupStatus,
  type DataBuilderTaskStatus,
} from '../entities/data-builder-task.entity';

export const TERMINAL_TASK_STATUSES = new Set<DataBuilderTaskStatus>([
  'COMPLETED_OK',
  'FAILED_ASSERTION',
  'FAILED_EXECUTION',
]);

export const TERMINAL_BATCH_STATUSES = new Set<DataBuilderTaskStatus>([
  'COMPLETED_OK',
  'FAILED_ASSERTION',
  'FAILED_EXECUTION',
]);

export function isTerminalTaskStatus(status: DataBuilderTaskStatus): boolean {
  return TERMINAL_TASK_STATUSES.has(status);
}

export function statusForSuccessfulBatch(taskStatus: DataBuilderTaskStatus): DataBuilderTaskStatus {
  if (taskStatus === 'FAILED_EXECUTION' || taskStatus === 'FAILED_ASSERTION') {
    return taskStatus;
  }
  return 'COMPLETED_OK';
}

export function deriveTaskStatusFromSnapshot(input: {
  proposedTaskStatus: DataBuilderTaskStatus;
  batchCount: number;
  completedBatches: number;
}): DataBuilderTaskStatus {
  const batchCount = Math.max(0, input.batchCount);
  const completedBatches = Math.max(0, input.completedBatches);

  if (input.proposedTaskStatus === 'FAILED_EXECUTION') {
    return 'FAILED_EXECUTION';
  }
  if (batchCount === 0) {
    return input.proposedTaskStatus === 'COMPLETED_OK' ? 'COMPLETED_OK' : input.proposedTaskStatus;
  }
  if (completedBatches === 0 && input.proposedTaskStatus === 'PENDING') {
    return 'PENDING';
  }
  if (completedBatches < batchCount) {
    return 'RUNNING';
  }
  if (input.proposedTaskStatus === 'FAILED_ASSERTION') {
    return 'FAILED_ASSERTION';
  }
  return 'COMPLETED_OK';
}

export function deriveTaskStatusAfterSuccessfulBatch(input: {
  proposedTaskStatus: DataBuilderTaskStatus;
  batchCount: number;
  completedBatches: number;
}): DataBuilderTaskStatus {
  return deriveTaskStatusFromSnapshot(input);
}

export function deriveTaskStatusAfterExecutionFailure(input: {
  currentStatus: DataBuilderTaskStatus;
  shouldMarkFailed: boolean;
}): DataBuilderTaskStatus {
  if (input.shouldMarkFailed) {
    return 'FAILED_EXECUTION';
  }
  return input.currentStatus;
}

export function shouldAcceptAssertionEvaluation(status: DataBuilderTaskStatus): boolean {
  return status === 'COMPLETED_OK' || status === 'FAILED_ASSERTION';
}

export function terminalBatchCount(status: DataBuilderTaskStatus): number {
  return TERMINAL_BATCH_STATUSES.has(status) ? 1 : 0;
}

export function deriveCleanupState(input: {
  cleanupCompletedAt: Date | null;
  taskStatus: DataBuilderTaskStatus;
  rowMapFlushLag: number;
  completedBatches: number;
}): {
  cleanup_status: DataBuilderCleanupStatus;
  cleanup_blocked_reason: string | null;
} {
  if (input.cleanupCompletedAt) {
    return { cleanup_status: 'completed', cleanup_blocked_reason: null };
  }
  if (input.taskStatus === 'RUNNING') {
    return { cleanup_status: 'blocked', cleanup_blocked_reason: 'task_running' };
  }
  if (input.rowMapFlushLag > 0) {
    return { cleanup_status: 'blocked', cleanup_blocked_reason: 'row_map_flush_lag' };
  }
  if (input.completedBatches === 0 && input.taskStatus === 'PENDING') {
    return { cleanup_status: 'not_applicable', cleanup_blocked_reason: null };
  }
  return { cleanup_status: 'eligible', cleanup_blocked_reason: null };
}
