"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TERMINAL_BATCH_STATUSES = exports.TERMINAL_TASK_STATUSES = void 0;
exports.isTerminalTaskStatus = isTerminalTaskStatus;
exports.statusForSuccessfulBatch = statusForSuccessfulBatch;
exports.deriveTaskStatusFromSnapshot = deriveTaskStatusFromSnapshot;
exports.deriveTaskStatusAfterSuccessfulBatch = deriveTaskStatusAfterSuccessfulBatch;
exports.deriveTaskStatusAfterExecutionFailure = deriveTaskStatusAfterExecutionFailure;
exports.shouldAcceptAssertionEvaluation = shouldAcceptAssertionEvaluation;
exports.terminalBatchCount = terminalBatchCount;
exports.deriveCleanupState = deriveCleanupState;
exports.TERMINAL_TASK_STATUSES = new Set([
    'COMPLETED_OK',
    'FAILED_ASSERTION',
    'FAILED_EXECUTION',
]);
exports.TERMINAL_BATCH_STATUSES = new Set([
    'COMPLETED_OK',
    'FAILED_ASSERTION',
    'FAILED_EXECUTION',
]);
function isTerminalTaskStatus(status) {
    return exports.TERMINAL_TASK_STATUSES.has(status);
}
function statusForSuccessfulBatch(taskStatus) {
    if (taskStatus === 'FAILED_EXECUTION' || taskStatus === 'FAILED_ASSERTION') {
        return taskStatus;
    }
    return 'COMPLETED_OK';
}
function deriveTaskStatusFromSnapshot(input) {
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
function deriveTaskStatusAfterSuccessfulBatch(input) {
    return deriveTaskStatusFromSnapshot(input);
}
function deriveTaskStatusAfterExecutionFailure(input) {
    if (input.shouldMarkFailed) {
        return 'FAILED_EXECUTION';
    }
    return input.currentStatus;
}
function shouldAcceptAssertionEvaluation(status) {
    return status === 'COMPLETED_OK' || status === 'FAILED_ASSERTION';
}
function terminalBatchCount(status) {
    return exports.TERMINAL_BATCH_STATUSES.has(status) ? 1 : 0;
}
function deriveCleanupState(input) {
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
//# sourceMappingURL=data-builder-task-state.js.map