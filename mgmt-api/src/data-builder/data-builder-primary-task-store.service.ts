import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { EntityManager, type FindOptionsSelect, Repository } from 'typeorm';

import {
  DataBuilderTask,
  DataBuilderTaskBatch,
  DataBuilderTaskStatus,
} from '../entities/data-builder-task.entity';
import { DataBuilderConnectionCryptoService } from './data-builder-connection-crypto.service';
import {
  buildExecuteBatchResponse,
  buildTaskDetailResponse,
} from './data-builder-task-contract';
import {
  deriveCleanupState,
  deriveTaskStatusAfterExecutionFailure,
  deriveTaskStatusAfterSuccessfulBatch,
  isTerminalTaskStatus,
  shouldAcceptAssertionEvaluation,
  statusForSuccessfulBatch,
  terminalBatchCount,
} from './data-builder-task-state';
import type { MysqlConnDraft } from './manifest-draft.service';

type ErrorEnvelope = Record<string, unknown> & {
  code: string;
  message: string;
};

const TASK_DETAIL_SELECT: FindOptionsSelect<DataBuilderTask> = {
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

const TASK_EXECUTION_INPUT_SELECT: FindOptionsSelect<DataBuilderTask> = {
  task_id: true,
  manifest_json: true,
  mysql_conn_snapshot_json: true,
  mysql_conn_encrypted_json: true,
};

export type BatchExecutionClaim =
  | {
      kind: 'replay';
      response: Record<string, unknown>;
    }
  | {
      kind: 'execute';
      taskId: string;
      batchIndex: number;
      manifest: Record<string, unknown>;
      mysql: MysqlConnDraft;
    };

export type CleanupClaim =
  | {
      kind: 'replay';
      response: Record<string, unknown>;
    }
  | {
      kind: 'execute';
      taskId: string;
      manifest: Record<string, unknown>;
      mysql: MysqlConnDraft;
      actor: string | null;
    };

@Injectable()
export class DataBuilderPrimaryTaskStoreService {
  constructor(
    @InjectRepository(DataBuilderTask)
    private readonly taskRepo: Repository<DataBuilderTask>,
    @InjectRepository(DataBuilderTaskBatch)
    private readonly batchRepo: Repository<DataBuilderTaskBatch>,
    private readonly cryptoService: DataBuilderConnectionCryptoService,
  ) {}

  async createTask(
    manifest: Record<string, unknown>,
    mysql: MysqlConnDraft,
    createdBy: string | null = null,
  ): Promise<Record<string, unknown>> {
    const taskId = crypto.randomUUID();
    const manifestSnapshot = this.cloneManifest(manifest);
    manifestSnapshot.task_id = taskId;
    const batchCount = this.deriveBatchCount(manifestSnapshot);
    const mysqlSnapshot = this.cryptoService.buildSnapshot(mysql);

    await this.taskRepo.manager.transaction(async (manager) => {
      const task = manager.create(DataBuilderTask, {
        task_id: taskId,
        status: 'PENDING',
        manifest_json: manifestSnapshot,
        manifest_hash: this.hashJson(manifestSnapshot),
        manifest_version: this.deriveManifestVersion(manifestSnapshot),
        mysql_conn_snapshot_json: mysqlSnapshot.snapshot,
        mysql_conn_encrypted_json: mysqlSnapshot.encrypted,
        mysql_conn_snapshot_version: 'v1',
        execution_mode: 'db_primary',
        orchestration_owner: 'mgmt-api',
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
        created_by: createdBy,
      });
      this.applyDerivedCleanupState(task);
      await manager.save(task);

      if (batchCount > 0) {
        const batches = Array.from({ length: batchCount }, (_, batchIndex) =>
          manager.create(DataBuilderTaskBatch, {
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
          }),
        );
        await manager.save(batches);
      }
    });

    return {
      task_id: taskId,
      status: 'PENDING',
      manifest: manifestSnapshot,
    };
  }

  async listTaskDetails(limit = 50): Promise<Array<Record<string, unknown>>> {
    const rows = await this.taskRepo.find({
      select: TASK_DETAIL_SELECT,
      order: { updated_at: 'DESC', created_at: 'DESC' },
      take: Math.max(1, Math.min(limit, 200)),
    });
    return rows.map((row) => buildTaskDetailResponse(row));
  }

  async getTaskDetail(taskId: string): Promise<Record<string, unknown> | null> {
    const row = await this.taskRepo.findOne({
      select: TASK_DETAIL_SELECT,
      where: { task_id: taskId },
    });
    return row ? buildTaskDetailResponse(row) : null;
  }

  async getBatchExecutionInput(
    taskId: string,
    batchIndex: number,
  ): Promise<Extract<BatchExecutionClaim, { kind: 'execute' }>> {
    const task = await this.taskRepo.findOne({
      select: TASK_EXECUTION_INPUT_SELECT,
      where: { task_id: taskId },
    });
    if (!task) {
      throw new NotFoundException({
        code: 'DB_TASK_NOT_FOUND',
        message: taskId,
      });
    }
    const batchExists = await this.batchRepo.exist({
      where: { task_id: taskId, batch_index: batchIndex },
    });
    if (!batchExists) {
      throw new BadRequestException({
        code: 'DB_TASK_BATCH_OUT_OF_RANGE',
        message: `batch ${batchIndex} does not exist`,
      });
    }
    return {
      kind: 'execute',
      taskId,
      batchIndex,
      manifest: task.manifest_json,
      mysql: this.restoreMysql(task),
    };
  }

  async claimBatchExecution(taskId: string, batchIndex: number): Promise<BatchExecutionClaim> {
    return this.taskRepo.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);
      const batch = await this.lockBatch(manager, taskId, batchIndex);
      const mysql = this.restoreMysql(task);

      if (terminalBatchCount(batch.status) > 0) {
        return { kind: 'replay', response: buildExecuteBatchResponse({ task, batch }) };
      }
      if (batch.status === 'RUNNING') {
        throw new ConflictException({
          code: 'DB_TASK_STATE_CONFLICT',
          message: `batch ${batchIndex} is already RUNNING`,
        });
      }
      if (task.cleanup_status === 'running' || task.cleanup_status === 'completed') {
        throw new ConflictException({
          code: 'DB_TASK_STATE_CONFLICT',
          message: 'cleanup already running or completed',
        });
      }
      if (isTerminalTaskStatus(task.status)) {
        throw new ConflictException({
          code: 'DB_TASK_STATE_CONFLICT',
          message:
            task.status === 'FAILED_EXECUTION'
              ? 'task is already in FAILED_EXECUTION'
              : `task is already in ${task.status}`,
        });
      }
      const nextBatchIndex = this.asNumber(task.completed_batches, 0);
      if (batch.status === 'PENDING' && batchIndex !== nextBatchIndex) {
        throw new ConflictException({
          code: 'DB_TASK_BATCH_SEQUENCE_CONFLICT',
          message: `expected next batch_index ${nextBatchIndex}, got ${batchIndex}`,
        });
      }

      const now = new Date();
      batch.status = 'RUNNING';
      batch.attempt_count += 1;
      batch.started_at = batch.started_at ?? now;
      batch.last_heartbeat_at = null;
      batch.finished_at = null;
      batch.last_error_json = null;

      task.status = 'RUNNING';
      task.current_batch_index = batchIndex;
      task.last_batch_started_at = now;
      task.last_error_json = null;
      this.applyDerivedCleanupState(task);

      await manager.save(batch);
      await manager.save(task);

      return {
        kind: 'execute',
        taskId,
        batchIndex,
        manifest: task.manifest_json,
        mysql,
      };
    });
  }

  async markBatchExecutionSuccess(
    taskId: string,
    batchIndex: number,
    response: unknown,
  ): Promise<Record<string, unknown>> {
    const obj: Record<string, unknown> = this.asRecord(response) ?? {};
    const proposedTaskStatus = this.coerceStatus(obj.status, 'RUNNING');
    const rowsAffected = this.asNumber(obj.rows_affected, 0);
    const assertionsEvaluated = Boolean(obj.assertions_evaluated);
    const assertionRuns = this.asRecordArray(obj.assertion_runs);

    return this.taskRepo.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);
      const batch = await this.lockBatch(manager, taskId, batchIndex);
      const now = new Date();
      const previousBatchStatus = batch.status;
      const previousRowsInserted = this.asNumber(batch.rows_inserted, 0);
      const nextBatchStatus = statusForSuccessfulBatch(proposedTaskStatus);

      batch.status = nextBatchStatus;
      batch.rows_inserted = String(rowsAffected);
      batch.last_heartbeat_at = now;
      batch.finished_at = now;
      batch.last_error_json = null;
      await manager.save(batch);

      this.applyBatchAggregateDelta(task, {
        previousStatus: previousBatchStatus,
        nextStatus: nextBatchStatus,
        previousRowsInserted,
        nextRowsInserted: rowsAffected,
      });
      const nextTaskStatus = deriveTaskStatusAfterSuccessfulBatch({
        proposedTaskStatus,
        batchCount: this.asNumber(task.batch_count, 0),
        completedBatches: this.asNumber(task.completed_batches, 0),
      });
      task.status = nextTaskStatus;
      task.current_batch_index = batchIndex;
      task.last_heartbeat_at = now;
      task.last_error_json = null;
      if (assertionsEvaluated && shouldAcceptAssertionEvaluation(nextTaskStatus)) {
        task.assertion_evaluated = true;
        task.assertion_runs_json = assertionRuns;
      } else {
        task.assertion_evaluated = false;
        task.assertion_runs_json = [];
      }
      this.applyDerivedCleanupState(task);
      await manager.save(task);

      return buildExecuteBatchResponse({
        task,
        batch,
        baseResponse: obj,
      });
    });
  }

  async markBatchExecutionFailure(
    taskId: string,
    batchIndex: number,
    errorResponse: unknown,
    httpStatus?: number,
  ): Promise<void> {
    const normalizedError = this.normalizeErrorEnvelope(errorResponse, httpStatus);
    await this.taskRepo.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);
      const batch = await this.lockBatch(manager, taskId, batchIndex);
      const now = new Date();
      const shouldMarkFailed = this.shouldMarkExecutionFailed(normalizedError.code, httpStatus);
      const previousBatchStatus = batch.status;
      const previousRowsInserted = this.asNumber(batch.rows_inserted, 0);
      const nextBatchStatus = shouldMarkFailed ? 'FAILED_EXECUTION' : batch.status;

      batch.last_error_json = normalizedError;
      batch.last_heartbeat_at = now;
      batch.finished_at = now;
      if (shouldMarkFailed) {
        batch.status = 'FAILED_EXECUTION';
      }
      await manager.save(batch);

      this.applyBatchAggregateDelta(task, {
        previousStatus: previousBatchStatus,
        nextStatus: nextBatchStatus,
        previousRowsInserted,
        nextRowsInserted: previousRowsInserted,
      });
      const nextTaskStatus = deriveTaskStatusAfterExecutionFailure({
        currentStatus: task.status,
        shouldMarkFailed,
      });
      task.current_batch_index = batchIndex;
      task.last_error_json = normalizedError;
      task.last_heartbeat_at = now;
      task.status = nextTaskStatus;
      this.applyDerivedCleanupState(task);
      await manager.save(task);
    });
  }

  async claimCleanup(taskId: string, actor: string | null): Promise<CleanupClaim> {
    return this.taskRepo.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);
      const mysql = this.restoreMysql(task);

      if (task.cleanup_completed_at) {
        return { kind: 'replay', response: this.toCleanupReplay(task) };
      }
      if (task.status === 'RUNNING') {
        throw new ConflictException({
          code: 'DB_CLEAN_FORBIDDEN_WHILE_RUNNING',
          message: 'task is RUNNING',
        });
      }
      if (task.row_map_flush_lag > 0) {
        throw new ConflictException({
          code: 'DB_ROW_MAP_FLUSH_LAG',
          message: 'row_map_flush_lag > 0',
        });
      }

      task.cleanup_status = 'running';
      task.cleanup_blocked_reason = null;
      task.cleanup_started_at = new Date();
      task.last_error_json = null;
      await manager.save(task);

      return {
        kind: 'execute',
        taskId,
        manifest: task.manifest_json,
        mysql,
        actor,
      };
    });
  }

  async markCleanupSuccess(taskId: string, response: unknown): Promise<void> {
    const obj = this.asRecord(response);
    await this.taskRepo.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);
      task.cleanup_status = 'completed';
      task.cleanup_blocked_reason = null;
      task.cleanup_completed_at = this.asDate(obj?.cleanup_completed_at) ?? new Date();
      task.cleanup_completed_by =
        this.asString(obj?.cleanup_completed_by) ?? task.cleanup_completed_by;
      task.last_error_json = null;
      await manager.save(task);
    });
  }

  async markCleanupFailure(
    taskId: string,
    errorResponse: unknown,
    httpStatus?: number,
  ): Promise<void> {
    const normalizedError = this.normalizeErrorEnvelope(errorResponse, httpStatus);
    await this.taskRepo.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);
      task.last_error_json = normalizedError;
      task.cleanup_status = 'blocked';
      if (normalizedError.code === 'DB_CLEAN_FORBIDDEN_WHILE_RUNNING') {
        task.cleanup_blocked_reason = 'task_running';
      } else if (normalizedError.code === 'DB_ROW_MAP_FLUSH_LAG') {
        task.cleanup_blocked_reason = 'row_map_flush_lag';
      } else {
        task.cleanup_blocked_reason = 'partial_failure';
      }
      await manager.save(task);
    });
  }

  private async lockTask(manager: EntityManager, taskId: string): Promise<DataBuilderTask> {
    const task = await manager.findOne(DataBuilderTask, {
      where: { task_id: taskId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!task) {
      throw new NotFoundException({
        code: 'DB_TASK_NOT_FOUND',
        message: taskId,
      });
    }
    return task;
  }

  private async lockBatch(
    manager: EntityManager,
    taskId: string,
    batchIndex: number,
  ): Promise<DataBuilderTaskBatch> {
    const batch = await manager.findOne(DataBuilderTaskBatch, {
      where: { task_id: taskId, batch_index: batchIndex },
      lock: { mode: 'pessimistic_write' },
    });
    if (!batch) {
      throw new BadRequestException({
        code: 'DB_TASK_BATCH_OUT_OF_RANGE',
        message: `batch ${batchIndex} does not exist`,
      });
    }
    return batch;
  }

  private restoreMysql(task: DataBuilderTask): MysqlConnDraft {
    const mysql = this.cryptoService.restoreConnection(
      task.mysql_conn_snapshot_json,
      task.mysql_conn_encrypted_json,
    );
    if (!mysql?.host || !mysql.user || !mysql.database) {
      throw new ServiceUnavailableException({
        code: 'DB_TASK_CONN_UNAVAILABLE',
        message: 'task mysql snapshot is incomplete',
      });
    }
    return mysql;
  }

  private toCleanupReplay(task: DataBuilderTask): Record<string, unknown> {
    return {
      task_id: task.task_id,
      deleted_by_table: {},
      mode_used: null,
      cleanup_completed_at: task.cleanup_completed_at,
      cleanup_completed_by: task.cleanup_completed_by,
      idempotent_replay: true,
    };
  }

  private applyBatchAggregateDelta(
    task: DataBuilderTask,
    delta: {
      previousStatus: DataBuilderTaskStatus;
      nextStatus: DataBuilderTaskStatus;
      previousRowsInserted: number;
      nextRowsInserted: number;
    },
  ): void {
    const completedDelta =
      terminalBatchCount(delta.nextStatus) - terminalBatchCount(delta.previousStatus);
    const rowsInsertedDelta = delta.nextRowsInserted - delta.previousRowsInserted;

    task.completed_batches = Math.max(
      0,
      this.asNumber(task.completed_batches, 0) + completedDelta,
    );
    task.rows_inserted_total = String(
      Math.max(0, this.asNumber(task.rows_inserted_total, 0) + rowsInsertedDelta),
    );
  }

  private applyDerivedCleanupState(task: DataBuilderTask): void {
    const next = deriveCleanupState({
      cleanupCompletedAt: task.cleanup_completed_at,
      taskStatus: task.status,
      rowMapFlushLag: this.asNumber(task.row_map_flush_lag, 0),
      completedBatches: this.asNumber(task.completed_batches, 0),
    });
    task.cleanup_status = next.cleanup_status;
    task.cleanup_blocked_reason = next.cleanup_blocked_reason;
  }

  private normalizeErrorEnvelope(
    response: unknown,
    httpStatus?: number,
  ): ErrorEnvelope {
    const raw = this.asRecord(response);
    const detail = this.asRecord(raw?.detail) ?? raw;
    const code =
      this.asString(detail?.code) ??
      this.asString(raw?.code) ??
      (httpStatus != null && httpStatus >= 500 ? 'DB_PROXY_UPSTREAM' : 'DB_PROXY_ERROR');
    const message =
      this.asString(detail?.message) ??
      this.asString(raw?.message) ??
      (httpStatus != null ? `HTTP ${httpStatus}` : 'upstream error');
    return {
      code,
      message,
      details: detail?.details ?? raw ?? {},
    };
  }

  private shouldMarkExecutionFailed(code: string | undefined, httpStatus?: number): boolean {
    void code;
    void httpStatus;
    return true;
  }

  private deriveBatchCount(manifest: Record<string, unknown>): number {
    const generation = this.asRecord(manifest.generation);
    const batching = this.asRecord(generation?.batching);
    return this.asNumber(batching?.batch_count, 0);
  }

  private deriveManifestVersion(manifest: Record<string, unknown>): string {
    return this.asString(manifest.manifest_version) ?? 'v1';
  }

  private hashJson(value: unknown): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(value ?? {}))
      .digest('hex');
  }

  private cloneManifest(manifest: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(JSON.stringify(manifest ?? {})) as Record<string, unknown>;
  }

  private coerceStatus(value: unknown, fallback: DataBuilderTaskStatus): DataBuilderTaskStatus {
    const s = this.asString(value);
    if (
      s === 'PENDING' ||
      s === 'RUNNING' ||
      s === 'COMPLETED_OK' ||
      s === 'FAILED_ASSERTION' ||
      s === 'FAILED_EXECUTION'
    ) {
      return s;
    }
    return fallback;
  }

  private asRecord(value: unknown): Record<string, any> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value as Record<string, any>;
  }

  private asRecordArray(value: unknown): Array<Record<string, unknown>> {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => item && typeof item === 'object') as Array<Record<string, unknown>>;
  }

  private asString(value: unknown): string | null {
    if (value == null) return null;
    const s = String(value).trim();
    return s ? s : null;
  }

  private asNumber(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  private asDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
