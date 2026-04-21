"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilderTaskShadowStoreService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto = require("crypto");
const typeorm_2 = require("typeorm");
const data_builder_task_entity_1 = require("../entities/data-builder-task.entity");
const data_builder_connection_crypto_service_1 = require("./data-builder-connection-crypto.service");
const data_builder_task_contract_1 = require("./data-builder-task-contract");
const data_builder_task_mode_1 = require("./data-builder-task-mode");
const data_builder_task_state_1 = require("./data-builder-task-state");
const TASK_DETAIL_SELECT = {
    task_id: true,
    status: true,
    manifest_json: true,
    batch_count: true,
    completed_batches: true,
    current_batch_index: true,
    rows_inserted_total: true,
    last_heartbeat_at: true,
    last_batch_started_at: true,
    row_map_flush_lag: true,
    cleanup_status: true,
    cleanup_blocked_reason: true,
    last_error_json: true,
    assertion_evaluated: true,
    assertion_runs_json: true,
    created_at: true,
    updated_at: true,
};
let DataBuilderTaskShadowStoreService = class DataBuilderTaskShadowStoreService {
    constructor(taskRepo, batchRepo, cryptoService) {
        this.taskRepo = taskRepo;
        this.batchRepo = batchRepo;
        this.cryptoService = cryptoService;
    }
    enabled() {
        return (0, data_builder_task_mode_1.isDataBuilderShadowEnabled)();
    }
    async mirrorCreateResponse(upstream, mysql, fallbackManifest) {
        if (!this.enabled())
            return;
        const obj = this.asRecord(upstream);
        const taskId = this.asString(obj.task_id);
        if (!taskId)
            return;
        const manifest = this.asRecord(obj.manifest) ?? fallbackManifest;
        const batchCount = this.deriveBatchCount(manifest);
        const mysqlSnapshot = this.cryptoService.buildSnapshot(mysql);
        await this.taskRepo.save({
            task_id: taskId,
            status: this.coerceStatus(obj.status, 'PENDING'),
            manifest_json: manifest,
            manifest_hash: this.hashJson(manifest),
            manifest_version: this.deriveManifestVersion(manifest),
            mysql_conn_snapshot_json: mysqlSnapshot.snapshot,
            mysql_conn_encrypted_json: mysqlSnapshot.encrypted,
            mysql_conn_snapshot_version: 'v1',
            execution_mode: 'shadow',
            orchestration_owner: 'exec-engine',
            batch_count: batchCount,
            completed_batches: 0,
            current_batch_index: null,
            rows_inserted_total: '0',
            last_heartbeat_at: null,
            last_batch_started_at: null,
            row_map_flush_lag: 0,
            cleanup_status: 'not_applicable',
            cleanup_blocked_reason: null,
            cleanup_started_at: null,
            cleanup_completed_at: null,
            cleanup_completed_by: null,
            last_error_json: null,
            assertion_evaluated: false,
            assertion_runs_json: [],
            created_by: null,
        });
        if (batchCount > 0) {
            await this.batchRepo.upsert(Array.from({ length: batchCount }, (_, batchIndex) => ({
                task_id: taskId,
                batch_index: batchIndex,
                status: 'PENDING',
                rows_inserted: '0',
                attempt_count: 0,
                started_at: null,
                last_heartbeat_at: null,
                finished_at: null,
                idempotency_key: null,
                last_error_json: null,
            })), ['task_id', 'batch_index']);
        }
    }
    async mirrorTaskDetail(detail) {
        if (!this.enabled())
            return null;
        const obj = this.asRecord(detail) ?? {};
        const taskId = this.asString(obj.task_id);
        if (!taskId)
            return null;
        const existing = await this.taskRepo.findOne({ where: { task_id: taskId } });
        const incomingManifest = this.asRecord(obj.manifest);
        const manifest = incomingManifest && Object.keys(incomingManifest).length > 0
            ? incomingManifest
            : existing?.manifest_json ?? {};
        const batchProgress = this.asRecord(obj.batch_progress);
        const cleanupStatus = this.asRecord(obj.cleanup_status);
        const assertionSummary = this.asRecord(obj.assertion_summary);
        const assertionRuns = this.asRecordArray(obj.assertion_runs);
        const hasAssertionRuns = Object.prototype.hasOwnProperty.call(obj, 'assertion_runs');
        const batchCount = Math.max(0, this.asNumber(batchProgress?.batch_count, existing?.batch_count ?? this.deriveBatchCount(manifest)));
        const completedBatches = this.normalizeCompletedBatches(this.asNumber(batchProgress?.completed_batches, existing?.completed_batches ?? 0), batchCount);
        const nextTaskStatus = (0, data_builder_task_state_1.deriveTaskStatusFromSnapshot)({
            proposedTaskStatus: this.coerceStatus(obj.status, existing?.status ?? 'PENDING'),
            batchCount,
            completedBatches,
        });
        const rowMapFlushLag = Math.max(0, this.asNumber(obj.row_map_flush_lag, existing?.row_map_flush_lag ?? 0));
        const assertionEvaluated = (assertionSummary != null && Object.prototype.hasOwnProperty.call(assertionSummary, 'evaluated')
            ? Boolean(assertionSummary.evaluated)
            : existing?.assertion_evaluated ?? false) &&
            (0, data_builder_task_state_1.shouldAcceptAssertionEvaluation)(nextTaskStatus);
        const cleanup = this.resolveMirroredCleanupState({
            upstreamState: this.coerceCleanupStatus(cleanupStatus?.state, existing?.cleanup_status ?? 'not_applicable'),
            upstreamBlockedReason: this.asString(cleanupStatus?.blocked_reason) ?? existing?.cleanup_blocked_reason ?? null,
            existingStartedAt: existing?.cleanup_started_at ?? null,
            existingCompletedAt: existing?.cleanup_completed_at ?? null,
            taskStatus: nextTaskStatus,
            rowMapFlushLag,
            completedBatches,
        });
        const saved = (await this.taskRepo.save({
            ...(existing ?? {}),
            task_id: taskId,
            status: nextTaskStatus,
            manifest_json: manifest,
            manifest_hash: Object.keys(manifest).length ? this.hashJson(manifest) : existing?.manifest_hash ?? null,
            manifest_version: Object.keys(manifest).length
                ? this.deriveManifestVersion(manifest)
                : existing?.manifest_version ?? 'v1',
            mysql_conn_snapshot_json: existing?.mysql_conn_snapshot_json ?? null,
            mysql_conn_encrypted_json: existing?.mysql_conn_encrypted_json ?? null,
            mysql_conn_snapshot_version: existing?.mysql_conn_snapshot_version ?? 'v1',
            execution_mode: existing?.execution_mode ?? 'shadow',
            orchestration_owner: existing?.orchestration_owner ?? 'exec-engine',
            batch_count: batchCount,
            completed_batches: completedBatches,
            current_batch_index: this.normalizeCurrentBatchIndex(this.asNullableNumber(batchProgress?.current_batch_index, existing?.current_batch_index ?? null), batchCount, nextTaskStatus),
            rows_inserted_total: String(Math.max(0, this.asNumber(batchProgress?.rows_inserted_total, Number(existing?.rows_inserted_total ?? 0)))),
            last_heartbeat_at: this.asDate(obj.last_heartbeat_at) ?? existing?.last_heartbeat_at ?? null,
            last_batch_started_at: this.asDate(obj.last_batch_started_at) ?? existing?.last_batch_started_at ?? null,
            row_map_flush_lag: rowMapFlushLag,
            cleanup_status: cleanup.cleanup_status,
            cleanup_blocked_reason: cleanup.cleanup_blocked_reason,
            cleanup_started_at: cleanup.cleanup_started_at,
            cleanup_completed_at: cleanup.cleanup_completed_at,
            cleanup_completed_by: existing?.cleanup_completed_by ?? null,
            last_error_json: this.asRecord(obj.last_error) ?? existing?.last_error_json ?? null,
            assertion_evaluated: assertionEvaluated,
            assertion_runs_json: assertionEvaluated
                ? hasAssertionRuns
                    ? assertionRuns
                    : existing?.assertion_runs_json ?? []
                : [],
            created_by: existing?.created_by ?? null,
        }));
        await this.ensureBatchRows(taskId, batchCount);
        return (0, data_builder_task_contract_1.buildTaskDetailResponse)(saved);
    }
    async mirrorTaskList(details) {
        if (!this.enabled() || !Array.isArray(details))
            return [];
        const mirrored = [];
        for (const item of details) {
            const row = await this.mirrorTaskDetail(item);
            if (row) {
                mirrored.push(row);
            }
        }
        return mirrored;
    }
    async mirrorExecuteBatchResponse(response) {
        if (!this.enabled())
            return;
        const obj = this.asRecord(response) ?? {};
        const taskId = this.asString(obj.task_id);
        const batchIndex = this.asNullableNumber(obj.batch_index, null);
        if (!taskId || batchIndex == null)
            return;
        const now = new Date();
        const proposedTaskStatus = this.coerceStatus(obj.status, 'RUNNING');
        const batchStatus = (0, data_builder_task_state_1.statusForSuccessfulBatch)(proposedTaskStatus);
        const assertionsEvaluated = Boolean(obj.assertions_evaluated);
        const assertionRuns = this.asRecordArray(obj.assertion_runs);
        const existingBatch = await this.batchRepo.findOne({
            where: { task_id: taskId, batch_index: batchIndex },
        });
        const previousBatchStatus = existingBatch?.status ?? 'PENDING';
        const previousRowsInserted = this.asNumber(existingBatch?.rows_inserted, 0);
        const nextRowsInserted = this.asNumber(obj.rows_affected, 0);
        await this.batchRepo.save({
            ...(existingBatch ?? {}),
            task_id: taskId,
            batch_index: batchIndex,
            status: batchStatus,
            rows_inserted: String(nextRowsInserted),
            attempt_count: (existingBatch?.attempt_count ?? 0) + 1,
            started_at: existingBatch?.started_at ?? now,
            last_heartbeat_at: now,
            finished_at: now,
            idempotency_key: existingBatch?.idempotency_key ?? null,
            last_error_json: null,
        });
        const task = await this.taskRepo.findOne({ where: { task_id: taskId } });
        if (!task)
            return;
        this.applyBatchAggregateDelta(task, {
            previousStatus: previousBatchStatus,
            nextStatus: batchStatus,
            previousRowsInserted,
            nextRowsInserted,
        });
        const nextTaskStatus = (0, data_builder_task_state_1.deriveTaskStatusAfterSuccessfulBatch)({
            proposedTaskStatus,
            batchCount: this.asNumber(task.batch_count, 0),
            completedBatches: this.asNumber(task.completed_batches, 0),
        });
        task.status = nextTaskStatus;
        task.current_batch_index = batchIndex;
        task.last_heartbeat_at = now;
        task.last_batch_started_at = task.last_batch_started_at ?? now;
        task.last_error_json = null;
        if (assertionsEvaluated && (0, data_builder_task_state_1.shouldAcceptAssertionEvaluation)(nextTaskStatus)) {
            task.assertion_evaluated = true;
            task.assertion_runs_json = assertionRuns;
        }
        else {
            task.assertion_evaluated = false;
            task.assertion_runs_json = [];
        }
        this.applyDerivedCleanupState(task);
        await this.taskRepo.save(task);
    }
    async mirrorCleanupResponse(response) {
        if (!this.enabled())
            return;
        const obj = this.asRecord(response);
        const taskId = this.asString(obj.task_id);
        if (!taskId)
            return;
        const task = await this.taskRepo.findOne({ where: { task_id: taskId } });
        if (!task)
            return;
        task.cleanup_status = 'completed';
        task.cleanup_blocked_reason = null;
        task.cleanup_completed_at = this.asDate(obj.cleanup_completed_at) ?? new Date();
        task.cleanup_completed_by = this.asString(obj.cleanup_completed_by) ?? task.cleanup_completed_by;
        await this.taskRepo.save(task);
    }
    async mirrorExecuteBatchFailure(taskId, batchIndex, errorResponse, httpStatus) {
        if (!this.enabled())
            return;
        const task = await this.taskRepo.findOne({ where: { task_id: taskId } });
        if (!task)
            return;
        const normalizedError = this.normalizeErrorEnvelope(errorResponse, httpStatus);
        task.last_error_json = normalizedError;
        if (batchIndex != null) {
            const now = new Date();
            const existingBatch = await this.batchRepo.findOne({
                where: { task_id: taskId, batch_index: batchIndex },
            });
            if (existingBatch) {
                const previousBatchStatus = existingBatch.status;
                const previousRowsInserted = this.asNumber(existingBatch.rows_inserted, 0);
                existingBatch.attempt_count += 1;
                existingBatch.started_at = existingBatch.started_at ?? now;
                existingBatch.finished_at = now;
                existingBatch.last_heartbeat_at = now;
                existingBatch.last_error_json = normalizedError;
                if (this.shouldMarkExecutionFailed(normalizedError.code, httpStatus)) {
                    existingBatch.status = 'FAILED_EXECUTION';
                }
                await this.batchRepo.save(existingBatch);
                this.applyBatchAggregateDelta(task, {
                    previousStatus: previousBatchStatus,
                    nextStatus: existingBatch.status,
                    previousRowsInserted,
                    nextRowsInserted: previousRowsInserted,
                });
            }
            const shouldMarkFailed = this.shouldMarkExecutionFailed(normalizedError.code, httpStatus);
            task.current_batch_index = batchIndex;
            task.last_batch_started_at = task.last_batch_started_at ?? now;
            task.last_heartbeat_at = now;
            task.status = (0, data_builder_task_state_1.deriveTaskStatusAfterExecutionFailure)({
                currentStatus: task.status,
                shouldMarkFailed,
            });
        }
        this.applyDerivedCleanupState(task);
        await this.taskRepo.save(task);
    }
    async mirrorCleanupFailure(taskId, errorResponse, httpStatus) {
        if (!this.enabled())
            return;
        const task = await this.taskRepo.findOne({ where: { task_id: taskId } });
        if (!task)
            return;
        const normalizedError = this.normalizeErrorEnvelope(errorResponse, httpStatus);
        task.last_error_json = normalizedError;
        if (normalizedError.code === 'DB_CLEAN_FORBIDDEN_WHILE_RUNNING') {
            task.cleanup_status = 'blocked';
            task.cleanup_blocked_reason = 'task_running';
        }
        if (normalizedError.code === 'DB_ROW_MAP_FLUSH_LAG') {
            task.cleanup_status = 'blocked';
            task.cleanup_blocked_reason = 'row_map_flush_lag';
        }
        if (task.cleanup_status !== 'blocked') {
            task.cleanup_status = 'blocked';
            task.cleanup_blocked_reason = 'partial_failure';
        }
        await this.taskRepo.save(task);
    }
    async listTaskDetails(limit = 50) {
        if (!this.enabled())
            return [];
        const rows = await this.taskRepo.find({
            select: TASK_DETAIL_SELECT,
            order: { updated_at: 'DESC', created_at: 'DESC' },
            take: Math.max(1, Math.min(limit, 200)),
        });
        return rows.map((row) => (0, data_builder_task_contract_1.buildTaskDetailResponse)(row));
    }
    async getTaskDetail(taskId) {
        if (!this.enabled())
            return null;
        const row = await this.taskRepo.findOne({
            select: TASK_DETAIL_SELECT,
            where: { task_id: taskId },
        });
        return row ? (0, data_builder_task_contract_1.buildTaskDetailResponse)(row) : null;
    }
    async ensureBatchRows(taskId, batchCount) {
        if (batchCount <= 0)
            return;
        const existing = await this.batchRepo.find({ where: { task_id: taskId } });
        const existingIndexes = new Set(existing.map((row) => row.batch_index));
        const missing = Array.from({ length: batchCount }, (_, i) => i)
            .filter((i) => !existingIndexes.has(i))
            .map((batchIndex) => ({
            task_id: taskId,
            batch_index: batchIndex,
            status: 'PENDING',
            rows_inserted: '0',
            attempt_count: 0,
            started_at: null,
            last_heartbeat_at: null,
            finished_at: null,
            idempotency_key: null,
            last_error_json: null,
        }));
        if (missing.length) {
            await this.batchRepo.save(missing);
        }
    }
    applyBatchAggregateDelta(task, delta) {
        const completedDelta = (0, data_builder_task_state_1.terminalBatchCount)(delta.nextStatus) - (0, data_builder_task_state_1.terminalBatchCount)(delta.previousStatus);
        const rowsInsertedDelta = delta.nextRowsInserted - delta.previousRowsInserted;
        task.completed_batches = Math.max(0, this.asNumber(task.completed_batches, 0) + completedDelta);
        task.rows_inserted_total = String(Math.max(0, this.asNumber(task.rows_inserted_total, 0) + rowsInsertedDelta));
    }
    applyDerivedCleanupState(task) {
        const next = (0, data_builder_task_state_1.deriveCleanupState)({
            cleanupCompletedAt: task.cleanup_completed_at,
            taskStatus: task.status,
            rowMapFlushLag: this.asNumber(task.row_map_flush_lag, 0),
            completedBatches: this.asNumber(task.completed_batches, 0),
        });
        task.cleanup_status = next.cleanup_status;
        task.cleanup_blocked_reason = next.cleanup_blocked_reason;
    }
    normalizeCompletedBatches(completedBatches, batchCount) {
        const normalizedCompleted = Math.max(0, completedBatches);
        if (batchCount <= 0) {
            return 0;
        }
        return Math.min(normalizedCompleted, batchCount);
    }
    normalizeCurrentBatchIndex(currentBatchIndex, batchCount, taskStatus) {
        if (taskStatus === 'PENDING') {
            return null;
        }
        if (currentBatchIndex == null || batchCount <= 0) {
            return currentBatchIndex;
        }
        return Math.max(0, Math.min(currentBatchIndex, batchCount - 1));
    }
    resolveMirroredCleanupState(input) {
        if (input.upstreamState === 'completed') {
            return {
                cleanup_status: 'completed',
                cleanup_blocked_reason: null,
                cleanup_started_at: input.existingStartedAt,
                cleanup_completed_at: input.existingCompletedAt ?? new Date(),
            };
        }
        if (input.upstreamState === 'running') {
            return {
                cleanup_status: 'running',
                cleanup_blocked_reason: null,
                cleanup_started_at: input.existingStartedAt ?? new Date(),
                cleanup_completed_at: input.existingCompletedAt,
            };
        }
        if (input.upstreamState === 'blocked' && input.upstreamBlockedReason === 'partial_failure') {
            return {
                cleanup_status: 'blocked',
                cleanup_blocked_reason: 'partial_failure',
                cleanup_started_at: input.existingStartedAt,
                cleanup_completed_at: input.existingCompletedAt,
            };
        }
        const derived = (0, data_builder_task_state_1.deriveCleanupState)({
            cleanupCompletedAt: input.existingCompletedAt,
            taskStatus: input.taskStatus,
            rowMapFlushLag: input.rowMapFlushLag,
            completedBatches: input.completedBatches,
        });
        return {
            ...derived,
            cleanup_started_at: input.existingStartedAt,
            cleanup_completed_at: input.existingCompletedAt,
        };
    }
    deriveBatchCount(manifest) {
        const generation = this.asRecord(manifest.generation);
        const batching = this.asRecord(generation?.batching);
        return this.asNumber(batching?.batch_count, 0);
    }
    deriveManifestVersion(manifest) {
        return this.asString(manifest.manifest_version) ?? 'v1';
    }
    normalizeErrorEnvelope(response, httpStatus) {
        const raw = this.asRecord(response);
        const detail = this.asRecord(raw?.detail) ?? raw;
        const code = this.asString(detail?.code) ??
            this.asString(raw?.code) ??
            (httpStatus != null && httpStatus >= 500 ? 'DB_PROXY_UPSTREAM' : 'DB_PROXY_ERROR');
        const message = this.asString(detail?.message) ??
            this.asString(raw?.message) ??
            (httpStatus != null ? `HTTP ${httpStatus}` : 'upstream error');
        return {
            code,
            message,
            details: detail?.details ?? raw ?? {},
        };
    }
    shouldMarkExecutionFailed(code, httpStatus) {
        if (code != null && code.startsWith('DB_EXEC_'))
            return true;
        if (code === 'DB_PROXY_UPSTREAM')
            return true;
        return httpStatus != null && httpStatus >= 500;
    }
    hashJson(value) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(value ?? {}))
            .digest('hex');
    }
    coerceStatus(value, fallback) {
        const s = this.asString(value);
        if (s === 'PENDING' ||
            s === 'RUNNING' ||
            s === 'COMPLETED_OK' ||
            s === 'FAILED_ASSERTION' ||
            s === 'FAILED_EXECUTION') {
            return s;
        }
        return fallback;
    }
    coerceCleanupStatus(value, fallback) {
        const s = this.asString(value);
        if (s === 'not_applicable' ||
            s === 'eligible' ||
            s === 'running' ||
            s === 'completed' ||
            s === 'blocked') {
            return s;
        }
        return fallback;
    }
    asRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value))
            return null;
        return value;
    }
    asRecordArray(value) {
        if (!Array.isArray(value))
            return [];
        return value.filter((item) => item && typeof item === 'object');
    }
    asString(value) {
        if (value == null)
            return null;
        const s = String(value).trim();
        return s ? s : null;
    }
    asNumber(value, fallback) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }
    asNullableNumber(value, fallback) {
        if (value == null || value === '')
            return fallback;
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }
    asDate(value) {
        if (!value)
            return null;
        if (value instanceof Date)
            return Number.isNaN(value.getTime()) ? null : value;
        const d = new Date(String(value));
        return Number.isNaN(d.getTime()) ? null : d;
    }
};
exports.DataBuilderTaskShadowStoreService = DataBuilderTaskShadowStoreService;
exports.DataBuilderTaskShadowStoreService = DataBuilderTaskShadowStoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(data_builder_task_entity_1.DataBuilderTask)),
    __param(1, (0, typeorm_1.InjectRepository)(data_builder_task_entity_1.DataBuilderTaskBatch)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        data_builder_connection_crypto_service_1.DataBuilderConnectionCryptoService])
], DataBuilderTaskShadowStoreService);
//# sourceMappingURL=data-builder-task-shadow-store.service.js.map