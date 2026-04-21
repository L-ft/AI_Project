import { strict as assert } from 'assert';
import { HttpException } from '@nestjs/common';

import {
  buildManifest,
  createPrimaryHarness,
  InMemoryPrimaryDb,
} from './data-builder-db-primary-smoke-fixtures';
import { getDataBuilderTaskMode } from './data-builder-task-mode';

const mysql = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'smoke-secret',
  database: 'ai_automation_db',
};

async function runSuccessLifecycleScenario(): Promise<void> {
  const { db, orchestration, proxy } = createPrimaryHarness();
  const manifest = buildManifest();

  const created = (await orchestration.createTask({
    manifest,
    mysql,
    created_by: 'smoke-user',
  })) as any;

  assert.equal((manifest as any).task_id, undefined, 'createTask must not mutate input manifest');
  assert.equal(created.status, 'PENDING');
  assert.ok(created.task_id, 'task_id should be generated');
  assert.equal(created.manifest.task_id, created.task_id);

  const taskId = String(created.task_id);
  const createdDetail = (await orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(createdDetail.status, 'PENDING');
  assert.equal(createdDetail.batch_progress.completed_batches, 0);
  assert.equal(createdDetail.cleanup_status.state, 'not_applicable');

  const listed = await orchestration.listPrimaryTasks(10);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].task_id, taskId);

  const persistedBatch = db.getBatch(taskId, 0);
  assert.ok(persistedBatch, 'batch row should be created');
  assert.equal(persistedBatch?.status, 'PENDING');

  const executeResponse = (await orchestration.executePrimaryBatch(taskId, {
    batch_index: 0,
  })) as any;
  assert.equal(executeResponse.status, 'COMPLETED_OK');
  assert.equal(proxy.internalCalls.filter((item) => item.path === '/execute-batch').length, 1);
  assert.equal(proxy.internalCalls[0].data.mysql.password, mysql.password);

  const afterExecute = (await orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(afterExecute.status, 'COMPLETED_OK');
  assert.equal(afterExecute.batch_progress.completed_batches, 1);
  assert.equal(afterExecute.batch_progress.rows_inserted_total, 3);
  assert.equal(afterExecute.cleanup_status.state, 'eligible');
  assert.equal(afterExecute.assertion_summary.evaluated, true);
  assert.deepEqual(afterExecute.assertion_summary.failed_rules, []);
  assert.equal(afterExecute.runtime.assertion_summary.passed, 1);

  const persistedTask = db.getTask(taskId);
  assert.equal(persistedTask?.status, 'COMPLETED_OK');
  assert.equal(persistedTask?.assertion_evaluated, true);
  assert.equal((persistedTask?.assertion_runs_json ?? []).length, 1);
  assert.equal(db.getBatch(taskId, 0)?.status, 'COMPLETED_OK');
  assert.equal(db.getBatch(taskId, 0)?.attempt_count, 1);

  const executeReplay = (await orchestration.executePrimaryBatch(taskId, {
    batch_index: 0,
  })) as any;
  assert.equal(executeReplay.rows_affected, 3);
  assert.equal(executeReplay.assertions_evaluated, true);
  assert.equal(executeReplay.assertion_runs.length, 1);
  assert.equal(executeReplay.assertion_summary?.passed, true);
  assert.equal(proxy.internalCalls.filter((item) => item.path === '/execute-batch').length, 1);

  const cleanupResponse = (await orchestration.cleanupPrimaryTask(taskId, {
    confirm: true,
    actor: 'smoke-user',
  })) as any;
  assert.equal(cleanupResponse.idempotent_replay, false);
  assert.equal(proxy.internalCalls.filter((item) => item.path === '/cleanup').length, 1);

  const afterCleanup = (await orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(afterCleanup.cleanup_status.state, 'completed');
  assert.equal(afterCleanup.status, 'COMPLETED_OK');

  const cleanupReplay = (await orchestration.cleanupPrimaryTask(taskId, {
    confirm: true,
    actor: 'smoke-user',
  })) as any;
  assert.equal(cleanupReplay.idempotent_replay, true);
  assert.equal(proxy.internalCalls.filter((item) => item.path === '/cleanup').length, 1);
}

async function runRestartRecoveryScenario(): Promise<void> {
  const db = new InMemoryPrimaryDb();
  const first = createPrimaryHarness(db);
  const manifest = buildManifest({ assertionId: 'asrt_restart' });

  const created = (await first.orchestration.createTask({
    manifest,
    mysql,
    created_by: 'restart-user',
  })) as any;
  const taskId = String(created.task_id);

  const afterMgmtRestart = createPrimaryHarness(db, {
    executeBatch: {
      kind: 'success',
      response: {
        task_id: taskId,
        status: 'COMPLETED_OK',
        batch_index: 0,
        rows_affected: 3,
        assertions_evaluated: true,
        assertion_summary: {
          evaluated: true,
          passed: true,
          failed_rules: [],
        },
        assertion_runs: [
          {
            assertion_id: 'asrt_restart',
            assertion_type: 'scalar',
            passed: true,
            actual: 3,
            expect: 3,
            error_code: null,
            message: null,
            primary_key_columns: ['id'],
            sample_rows: null,
            truncated: false,
          },
        ],
      },
    },
  });

  const listed = await afterMgmtRestart.orchestration.listPrimaryTasks(10);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].task_id, taskId);

  const beforeExecute = (await afterMgmtRestart.orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(beforeExecute.status, 'PENDING');
  assert.equal(beforeExecute.cleanup_status.state, 'not_applicable');

  await afterMgmtRestart.orchestration.executePrimaryBatch(taskId, { batch_index: 0 });
  const afterExecute = (await afterMgmtRestart.orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(afterExecute.status, 'COMPLETED_OK');
  assert.equal(afterExecute.cleanup_status.state, 'eligible');

  const afterExecEngineRestart = createPrimaryHarness(db);
  const recovered = (await afterExecEngineRestart.orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(recovered.status, 'COMPLETED_OK');
  assert.equal(recovered.batch_progress.completed_batches, 1);
  assert.equal(recovered.cleanup_status.state, 'eligible');

  const cleanup = (await afterExecEngineRestart.orchestration.cleanupPrimaryTask(taskId, {
    confirm: true,
    actor: 'restart-user',
  })) as any;
  assert.equal(cleanup.idempotent_replay, false);

  const afterCleanup = (await afterExecEngineRestart.orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(afterCleanup.cleanup_status.state, 'completed');
}

async function runFailedAssertionScenario(): Promise<void> {
  const db = new InMemoryPrimaryDb();
  const { orchestration } = createPrimaryHarness(db, {
    executeBatch: {
      kind: 'success',
      response: {
        task_id: 'placeholder',
        status: 'FAILED_ASSERTION',
        batch_index: 0,
        rows_affected: 2,
        assertions_evaluated: true,
        assertion_summary: {
          evaluated: true,
          passed: false,
          failed_rules: ['asrt_fail'],
        },
        assertion_runs: [
          {
            assertion_id: 'asrt_fail',
            assertion_type: 'scalar',
            passed: false,
            actual: 2,
            expect: 3,
            error_code: 'DB_AST_EXPECTATION_MISMATCH',
            message: 'expected 3 but got 2',
            primary_key_columns: ['id'],
            sample_rows: [{ id: 1, name: 'mismatch' }],
            truncated: false,
          },
        ],
      },
    },
  });

  const created = (await orchestration.createTask({
    manifest: buildManifest({ assertionId: 'asrt_fail', totalRows: 2, batchSize: 2 }),
    mysql,
    created_by: 'assert-user',
  })) as any;
  const taskId = String(created.task_id);

  await orchestration.executePrimaryBatch(taskId, { batch_index: 0 });

  const detail = (await orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(detail.status, 'FAILED_ASSERTION');
  assert.equal(detail.batch_progress.completed_batches, 1);
  assert.equal(detail.batch_progress.rows_inserted_total, 2);
  assert.equal(detail.cleanup_status.state, 'eligible');
  assert.equal(detail.assertion_summary.evaluated, true);
  assert.deepEqual(detail.assertion_summary.failed_rules, ['asrt_fail']);
  assert.equal(detail.runtime.assertion_summary.total, 1);
  assert.equal(detail.runtime.assertion_summary.passed, 0);

  assert.equal(db.getTask(taskId)?.status, 'FAILED_ASSERTION');
  assert.equal(db.getBatch(taskId, 0)?.status, 'FAILED_ASSERTION');
}

async function runOutOfOrderBatchRejectedScenario(): Promise<void> {
  const db = new InMemoryPrimaryDb();
  const { orchestration, proxy } = createPrimaryHarness(db);
  const created = (await orchestration.createTask({
    manifest: buildManifest({ assertionId: 'asrt_order', batchCount: 2, totalRows: 4, batchSize: 2 }),
    mysql,
    created_by: 'order-user',
  })) as any;
  const taskId = String(created.task_id);

  await assert.rejects(
    () => orchestration.executePrimaryBatch(taskId, { batch_index: 1 }),
    (error: unknown) =>
      error instanceof HttpException &&
      error.getStatus() === 409 &&
      String((error.getResponse() as { code?: unknown })?.code || '') ===
        'DB_TASK_BATCH_SEQUENCE_CONFLICT',
  );

  const detail = (await orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(detail.status, 'PENDING');
  assert.equal(detail.batch_progress.completed_batches, 0);
  assert.equal(detail.cleanup_status.state, 'not_applicable');
  assert.equal(proxy.internalCalls.filter((item) => item.path === '/execute-batch').length, 0);
  assert.equal(db.getBatch(taskId, 0)?.status, 'PENDING');
  assert.equal(db.getBatch(taskId, 1)?.status, 'PENDING');
}

async function runPrematureTerminalResponseNormalizedScenario(): Promise<void> {
  const db = new InMemoryPrimaryDb();
  const assertionId = 'asrt_premature_terminal';
  const { orchestration } = createPrimaryHarness(db, {
    executeBatch: (call) => {
      const batchIndex = Number(call.data.batch_index ?? 0);
      return {
        kind: 'success',
        response: {
          task_id: String(call.data.task_id ?? 'placeholder'),
          status: 'COMPLETED_OK',
          batch_index: batchIndex,
          rows_affected: 2,
          assertions_evaluated: true,
          assertion_summary: {
            evaluated: true,
            passed: true,
            failed_rules: [],
          },
          assertion_runs: [
            {
              assertion_id: assertionId,
              assertion_type: 'scalar',
              passed: true,
              actual: 2,
              expect: 2,
              error_code: null,
              message: null,
              primary_key_columns: ['id'],
              sample_rows: null,
              truncated: false,
            },
          ],
        },
      };
    },
  });
  const created = (await orchestration.createTask({
    manifest: buildManifest({
      assertionId,
      batchCount: 2,
      totalRows: 4,
      batchSize: 2,
    }),
    mysql,
    created_by: 'premature-terminal-user',
  })) as any;
  const taskId = String(created.task_id);

  const batch0 = (await orchestration.executePrimaryBatch(taskId, {
    batch_index: 0,
  })) as any;
  assert.equal(batch0.status, 'RUNNING');
  assert.equal(batch0.batch_index, 0);
  assert.equal(batch0.rows_affected, 2);
  assert.equal(batch0.assertions_evaluated, false);
  assert.equal(batch0.assertion_summary, null);
  assert.deepEqual(batch0.assertion_runs, []);

  const afterBatch0 = (await orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(afterBatch0.status, 'RUNNING');
  assert.equal(afterBatch0.batch_progress.completed_batches, 1);
  assert.equal(afterBatch0.cleanup_status.state, 'blocked');
  assert.equal(afterBatch0.cleanup_status.blocked_reason, 'task_running');
  assert.equal(afterBatch0.assertion_summary.evaluated, false);
  assert.deepEqual(afterBatch0.assertion_summary.failed_rules, []);
  assert.equal(afterBatch0.assertion_runs.length, 0);

  const persistedAfterBatch0 = db.getTask(taskId);
  assert.equal(persistedAfterBatch0?.status, 'RUNNING');
  assert.equal(persistedAfterBatch0?.assertion_evaluated, false);
  assert.deepEqual(persistedAfterBatch0?.assertion_runs_json ?? [], []);
  assert.equal(db.getBatch(taskId, 0)?.status, 'COMPLETED_OK');

  const batch1 = (await orchestration.executePrimaryBatch(taskId, {
    batch_index: 1,
  })) as any;
  assert.equal(batch1.status, 'COMPLETED_OK');
  assert.equal(batch1.batch_index, 1);
  assert.equal(batch1.rows_affected, 2);
  assert.equal(batch1.assertions_evaluated, true);
  assert.equal(batch1.assertion_summary?.passed, true);

  const afterBatch1 = (await orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(afterBatch1.status, 'COMPLETED_OK');
  assert.equal(afterBatch1.batch_progress.completed_batches, 2);
  assert.equal(afterBatch1.cleanup_status.state, 'eligible');
  assert.equal(afterBatch1.assertion_summary.evaluated, true);
  assert.deepEqual(afterBatch1.assertion_summary.failed_rules, []);
}

async function runFailedExecutionScenario(): Promise<void> {
  const db = new InMemoryPrimaryDb();
  const first = createPrimaryHarness(db);
  const created = (await first.orchestration.createTask({
    manifest: buildManifest({ assertionId: 'asrt_exec_fail' }),
    mysql,
    created_by: 'failed-exec-user',
  })) as any;
  const taskId = String(created.task_id);

  const failing = createPrimaryHarness(db, {
    executeBatch: {
      kind: 'http_error',
      status: 502,
      response: {
        code: 'DB_EXEC_UPSTREAM_UNAVAILABLE',
        message: 'exec-engine unavailable',
      },
    },
  });

  await assert.rejects(
    () => failing.orchestration.executePrimaryBatch(taskId, { batch_index: 0 }),
    (error: unknown) =>
      error instanceof HttpException && error.getStatus() === 502,
  );

  const detail = (await failing.orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(detail.status, 'FAILED_EXECUTION');
  assert.equal(detail.batch_progress.completed_batches, 1);
  assert.equal(detail.batch_progress.rows_inserted_total, 0);
  assert.equal(detail.cleanup_status.state, 'eligible');
  assert.equal(detail.last_error.code, 'DB_EXEC_UPSTREAM_UNAVAILABLE');
  assert.equal(detail.last_error.message, 'exec-engine unavailable');

  const persistedTask = db.getTask(taskId);
  const persistedBatch = db.getBatch(taskId, 0);
  assert.equal(persistedTask?.status, 'FAILED_EXECUTION');
  assert.equal(persistedTask?.completed_batches, 1);
  assert.equal(persistedTask?.current_batch_index, 0);
  assert.equal(persistedBatch?.status, 'FAILED_EXECUTION');
  assert.equal(persistedBatch?.attempt_count, 1);

  const recovered = createPrimaryHarness(db);
  const listed = await recovered.orchestration.listPrimaryTasks(10);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].task_id, taskId);

  const detailAfterRestart = (await recovered.orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(detailAfterRestart.status, 'FAILED_EXECUTION');
  assert.equal(detailAfterRestart.batch_progress.completed_batches, 1);
  assert.equal(detailAfterRestart.cleanup_status.state, 'eligible');

  const cleanup = (await recovered.orchestration.cleanupPrimaryTask(taskId, {
    confirm: true,
    actor: 'failed-exec-user',
  })) as any;
  assert.equal(cleanup.idempotent_replay, false);

  const afterCleanup = (await recovered.orchestration.getPrimaryTask(taskId)) as any;
  assert.equal(afterCleanup.cleanup_status.state, 'completed');
  assert.equal(afterCleanup.status, 'FAILED_EXECUTION');
}

function assertDefaultModeIsDbPrimary(): void {
  const originalMode = process.env.DATA_BUILDER_TASK_MODE;
  try {
    delete process.env.DATA_BUILDER_TASK_MODE;
    assert.equal(getDataBuilderTaskMode(), 'db_primary');
  } finally {
    if (originalMode == null) {
      delete process.env.DATA_BUILDER_TASK_MODE;
    } else {
      process.env.DATA_BUILDER_TASK_MODE = originalMode;
    }
  }
}

async function main(): Promise<void> {
  const originalMode = process.env.DATA_BUILDER_TASK_MODE;
  process.env.DATA_BUILDER_TASK_MODE = 'db_primary';

  try {
    assertDefaultModeIsDbPrimary();
    await runSuccessLifecycleScenario();
    await runRestartRecoveryScenario();
    await runFailedAssertionScenario();
    await runOutOfOrderBatchRejectedScenario();
    await runPrematureTerminalResponseNormalizedScenario();
    await runFailedExecutionScenario();
    console.log('db_primary smoke passed');
  } finally {
    if (originalMode == null) {
      delete process.env.DATA_BUILDER_TASK_MODE;
    } else {
      process.env.DATA_BUILDER_TASK_MODE = originalMode;
    }
  }
}

void main().catch((error) => {
  console.error('db_primary smoke failed');
  console.error(error);
  process.exitCode = 1;
});
