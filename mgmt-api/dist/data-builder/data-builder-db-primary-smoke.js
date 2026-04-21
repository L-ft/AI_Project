"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const common_1 = require("@nestjs/common");
const data_builder_db_primary_smoke_fixtures_1 = require("./data-builder-db-primary-smoke-fixtures");
const data_builder_task_mode_1 = require("./data-builder-task-mode");
const mysql = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'smoke-secret',
    database: 'ai_automation_db',
};
async function runSuccessLifecycleScenario() {
    const { db, orchestration, proxy } = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)();
    const manifest = (0, data_builder_db_primary_smoke_fixtures_1.buildManifest)();
    const created = (await orchestration.createTask({
        manifest,
        mysql,
        created_by: 'smoke-user',
    }));
    assert_1.strict.equal(manifest.task_id, undefined, 'createTask must not mutate input manifest');
    assert_1.strict.equal(created.status, 'PENDING');
    assert_1.strict.ok(created.task_id, 'task_id should be generated');
    assert_1.strict.equal(created.manifest.task_id, created.task_id);
    const taskId = String(created.task_id);
    const createdDetail = (await orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(createdDetail.status, 'PENDING');
    assert_1.strict.equal(createdDetail.batch_progress.completed_batches, 0);
    assert_1.strict.equal(createdDetail.cleanup_status.state, 'not_applicable');
    const listed = await orchestration.listPrimaryTasks(10);
    assert_1.strict.equal(listed.length, 1);
    assert_1.strict.equal(listed[0].task_id, taskId);
    const persistedBatch = db.getBatch(taskId, 0);
    assert_1.strict.ok(persistedBatch, 'batch row should be created');
    assert_1.strict.equal(persistedBatch?.status, 'PENDING');
    const executeResponse = (await orchestration.executePrimaryBatch(taskId, {
        batch_index: 0,
    }));
    assert_1.strict.equal(executeResponse.status, 'COMPLETED_OK');
    assert_1.strict.equal(proxy.internalCalls.filter((item) => item.path === '/execute-batch').length, 1);
    assert_1.strict.equal(proxy.internalCalls[0].data.mysql.password, mysql.password);
    const afterExecute = (await orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(afterExecute.status, 'COMPLETED_OK');
    assert_1.strict.equal(afterExecute.batch_progress.completed_batches, 1);
    assert_1.strict.equal(afterExecute.batch_progress.rows_inserted_total, 3);
    assert_1.strict.equal(afterExecute.cleanup_status.state, 'eligible');
    assert_1.strict.equal(afterExecute.assertion_summary.evaluated, true);
    assert_1.strict.deepEqual(afterExecute.assertion_summary.failed_rules, []);
    assert_1.strict.equal(afterExecute.runtime.assertion_summary.passed, 1);
    const persistedTask = db.getTask(taskId);
    assert_1.strict.equal(persistedTask?.status, 'COMPLETED_OK');
    assert_1.strict.equal(persistedTask?.assertion_evaluated, true);
    assert_1.strict.equal((persistedTask?.assertion_runs_json ?? []).length, 1);
    assert_1.strict.equal(db.getBatch(taskId, 0)?.status, 'COMPLETED_OK');
    assert_1.strict.equal(db.getBatch(taskId, 0)?.attempt_count, 1);
    const executeReplay = (await orchestration.executePrimaryBatch(taskId, {
        batch_index: 0,
    }));
    assert_1.strict.equal(executeReplay.rows_affected, 3);
    assert_1.strict.equal(executeReplay.assertions_evaluated, true);
    assert_1.strict.equal(executeReplay.assertion_runs.length, 1);
    assert_1.strict.equal(executeReplay.assertion_summary?.passed, true);
    assert_1.strict.equal(proxy.internalCalls.filter((item) => item.path === '/execute-batch').length, 1);
    const cleanupResponse = (await orchestration.cleanupPrimaryTask(taskId, {
        confirm: true,
        actor: 'smoke-user',
    }));
    assert_1.strict.equal(cleanupResponse.idempotent_replay, false);
    assert_1.strict.equal(proxy.internalCalls.filter((item) => item.path === '/cleanup').length, 1);
    const afterCleanup = (await orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(afterCleanup.cleanup_status.state, 'completed');
    assert_1.strict.equal(afterCleanup.status, 'COMPLETED_OK');
    const cleanupReplay = (await orchestration.cleanupPrimaryTask(taskId, {
        confirm: true,
        actor: 'smoke-user',
    }));
    assert_1.strict.equal(cleanupReplay.idempotent_replay, true);
    assert_1.strict.equal(proxy.internalCalls.filter((item) => item.path === '/cleanup').length, 1);
}
async function runRestartRecoveryScenario() {
    const db = new data_builder_db_primary_smoke_fixtures_1.InMemoryPrimaryDb();
    const first = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db);
    const manifest = (0, data_builder_db_primary_smoke_fixtures_1.buildManifest)({ assertionId: 'asrt_restart' });
    const created = (await first.orchestration.createTask({
        manifest,
        mysql,
        created_by: 'restart-user',
    }));
    const taskId = String(created.task_id);
    const afterMgmtRestart = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db, {
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
    assert_1.strict.equal(listed.length, 1);
    assert_1.strict.equal(listed[0].task_id, taskId);
    const beforeExecute = (await afterMgmtRestart.orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(beforeExecute.status, 'PENDING');
    assert_1.strict.equal(beforeExecute.cleanup_status.state, 'not_applicable');
    await afterMgmtRestart.orchestration.executePrimaryBatch(taskId, { batch_index: 0 });
    const afterExecute = (await afterMgmtRestart.orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(afterExecute.status, 'COMPLETED_OK');
    assert_1.strict.equal(afterExecute.cleanup_status.state, 'eligible');
    const afterExecEngineRestart = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db);
    const recovered = (await afterExecEngineRestart.orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(recovered.status, 'COMPLETED_OK');
    assert_1.strict.equal(recovered.batch_progress.completed_batches, 1);
    assert_1.strict.equal(recovered.cleanup_status.state, 'eligible');
    const cleanup = (await afterExecEngineRestart.orchestration.cleanupPrimaryTask(taskId, {
        confirm: true,
        actor: 'restart-user',
    }));
    assert_1.strict.equal(cleanup.idempotent_replay, false);
    const afterCleanup = (await afterExecEngineRestart.orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(afterCleanup.cleanup_status.state, 'completed');
}
async function runFailedAssertionScenario() {
    const db = new data_builder_db_primary_smoke_fixtures_1.InMemoryPrimaryDb();
    const { orchestration } = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db, {
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
        manifest: (0, data_builder_db_primary_smoke_fixtures_1.buildManifest)({ assertionId: 'asrt_fail', totalRows: 2, batchSize: 2 }),
        mysql,
        created_by: 'assert-user',
    }));
    const taskId = String(created.task_id);
    await orchestration.executePrimaryBatch(taskId, { batch_index: 0 });
    const detail = (await orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(detail.status, 'FAILED_ASSERTION');
    assert_1.strict.equal(detail.batch_progress.completed_batches, 1);
    assert_1.strict.equal(detail.batch_progress.rows_inserted_total, 2);
    assert_1.strict.equal(detail.cleanup_status.state, 'eligible');
    assert_1.strict.equal(detail.assertion_summary.evaluated, true);
    assert_1.strict.deepEqual(detail.assertion_summary.failed_rules, ['asrt_fail']);
    assert_1.strict.equal(detail.runtime.assertion_summary.total, 1);
    assert_1.strict.equal(detail.runtime.assertion_summary.passed, 0);
    assert_1.strict.equal(db.getTask(taskId)?.status, 'FAILED_ASSERTION');
    assert_1.strict.equal(db.getBatch(taskId, 0)?.status, 'FAILED_ASSERTION');
}
async function runOutOfOrderBatchRejectedScenario() {
    const db = new data_builder_db_primary_smoke_fixtures_1.InMemoryPrimaryDb();
    const { orchestration, proxy } = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db);
    const created = (await orchestration.createTask({
        manifest: (0, data_builder_db_primary_smoke_fixtures_1.buildManifest)({ assertionId: 'asrt_order', batchCount: 2, totalRows: 4, batchSize: 2 }),
        mysql,
        created_by: 'order-user',
    }));
    const taskId = String(created.task_id);
    await assert_1.strict.rejects(() => orchestration.executePrimaryBatch(taskId, { batch_index: 1 }), (error) => error instanceof common_1.HttpException &&
        error.getStatus() === 409 &&
        String(error.getResponse()?.code || '') ===
            'DB_TASK_BATCH_SEQUENCE_CONFLICT');
    const detail = (await orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(detail.status, 'PENDING');
    assert_1.strict.equal(detail.batch_progress.completed_batches, 0);
    assert_1.strict.equal(detail.cleanup_status.state, 'not_applicable');
    assert_1.strict.equal(proxy.internalCalls.filter((item) => item.path === '/execute-batch').length, 0);
    assert_1.strict.equal(db.getBatch(taskId, 0)?.status, 'PENDING');
    assert_1.strict.equal(db.getBatch(taskId, 1)?.status, 'PENDING');
}
async function runPrematureTerminalResponseNormalizedScenario() {
    const db = new data_builder_db_primary_smoke_fixtures_1.InMemoryPrimaryDb();
    const assertionId = 'asrt_premature_terminal';
    const { orchestration } = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db, {
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
        manifest: (0, data_builder_db_primary_smoke_fixtures_1.buildManifest)({
            assertionId,
            batchCount: 2,
            totalRows: 4,
            batchSize: 2,
        }),
        mysql,
        created_by: 'premature-terminal-user',
    }));
    const taskId = String(created.task_id);
    const batch0 = (await orchestration.executePrimaryBatch(taskId, {
        batch_index: 0,
    }));
    assert_1.strict.equal(batch0.status, 'RUNNING');
    assert_1.strict.equal(batch0.batch_index, 0);
    assert_1.strict.equal(batch0.rows_affected, 2);
    assert_1.strict.equal(batch0.assertions_evaluated, false);
    assert_1.strict.equal(batch0.assertion_summary, null);
    assert_1.strict.deepEqual(batch0.assertion_runs, []);
    const afterBatch0 = (await orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(afterBatch0.status, 'RUNNING');
    assert_1.strict.equal(afterBatch0.batch_progress.completed_batches, 1);
    assert_1.strict.equal(afterBatch0.cleanup_status.state, 'blocked');
    assert_1.strict.equal(afterBatch0.cleanup_status.blocked_reason, 'task_running');
    assert_1.strict.equal(afterBatch0.assertion_summary.evaluated, false);
    assert_1.strict.deepEqual(afterBatch0.assertion_summary.failed_rules, []);
    assert_1.strict.equal(afterBatch0.assertion_runs.length, 0);
    const persistedAfterBatch0 = db.getTask(taskId);
    assert_1.strict.equal(persistedAfterBatch0?.status, 'RUNNING');
    assert_1.strict.equal(persistedAfterBatch0?.assertion_evaluated, false);
    assert_1.strict.deepEqual(persistedAfterBatch0?.assertion_runs_json ?? [], []);
    assert_1.strict.equal(db.getBatch(taskId, 0)?.status, 'COMPLETED_OK');
    const batch1 = (await orchestration.executePrimaryBatch(taskId, {
        batch_index: 1,
    }));
    assert_1.strict.equal(batch1.status, 'COMPLETED_OK');
    assert_1.strict.equal(batch1.batch_index, 1);
    assert_1.strict.equal(batch1.rows_affected, 2);
    assert_1.strict.equal(batch1.assertions_evaluated, true);
    assert_1.strict.equal(batch1.assertion_summary?.passed, true);
    const afterBatch1 = (await orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(afterBatch1.status, 'COMPLETED_OK');
    assert_1.strict.equal(afterBatch1.batch_progress.completed_batches, 2);
    assert_1.strict.equal(afterBatch1.cleanup_status.state, 'eligible');
    assert_1.strict.equal(afterBatch1.assertion_summary.evaluated, true);
    assert_1.strict.deepEqual(afterBatch1.assertion_summary.failed_rules, []);
}
async function runFailedExecutionScenario() {
    const db = new data_builder_db_primary_smoke_fixtures_1.InMemoryPrimaryDb();
    const first = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db);
    const created = (await first.orchestration.createTask({
        manifest: (0, data_builder_db_primary_smoke_fixtures_1.buildManifest)({ assertionId: 'asrt_exec_fail' }),
        mysql,
        created_by: 'failed-exec-user',
    }));
    const taskId = String(created.task_id);
    const failing = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db, {
        executeBatch: {
            kind: 'http_error',
            status: 502,
            response: {
                code: 'DB_EXEC_UPSTREAM_UNAVAILABLE',
                message: 'exec-engine unavailable',
            },
        },
    });
    await assert_1.strict.rejects(() => failing.orchestration.executePrimaryBatch(taskId, { batch_index: 0 }), (error) => error instanceof common_1.HttpException && error.getStatus() === 502);
    const detail = (await failing.orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(detail.status, 'FAILED_EXECUTION');
    assert_1.strict.equal(detail.batch_progress.completed_batches, 1);
    assert_1.strict.equal(detail.batch_progress.rows_inserted_total, 0);
    assert_1.strict.equal(detail.cleanup_status.state, 'eligible');
    assert_1.strict.equal(detail.last_error.code, 'DB_EXEC_UPSTREAM_UNAVAILABLE');
    assert_1.strict.equal(detail.last_error.message, 'exec-engine unavailable');
    const persistedTask = db.getTask(taskId);
    const persistedBatch = db.getBatch(taskId, 0);
    assert_1.strict.equal(persistedTask?.status, 'FAILED_EXECUTION');
    assert_1.strict.equal(persistedTask?.completed_batches, 1);
    assert_1.strict.equal(persistedTask?.current_batch_index, 0);
    assert_1.strict.equal(persistedBatch?.status, 'FAILED_EXECUTION');
    assert_1.strict.equal(persistedBatch?.attempt_count, 1);
    const recovered = (0, data_builder_db_primary_smoke_fixtures_1.createPrimaryHarness)(db);
    const listed = await recovered.orchestration.listPrimaryTasks(10);
    assert_1.strict.equal(listed.length, 1);
    assert_1.strict.equal(listed[0].task_id, taskId);
    const detailAfterRestart = (await recovered.orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(detailAfterRestart.status, 'FAILED_EXECUTION');
    assert_1.strict.equal(detailAfterRestart.batch_progress.completed_batches, 1);
    assert_1.strict.equal(detailAfterRestart.cleanup_status.state, 'eligible');
    const cleanup = (await recovered.orchestration.cleanupPrimaryTask(taskId, {
        confirm: true,
        actor: 'failed-exec-user',
    }));
    assert_1.strict.equal(cleanup.idempotent_replay, false);
    const afterCleanup = (await recovered.orchestration.getPrimaryTask(taskId));
    assert_1.strict.equal(afterCleanup.cleanup_status.state, 'completed');
    assert_1.strict.equal(afterCleanup.status, 'FAILED_EXECUTION');
}
function assertDefaultModeIsDbPrimary() {
    const originalMode = process.env.DATA_BUILDER_TASK_MODE;
    try {
        delete process.env.DATA_BUILDER_TASK_MODE;
        assert_1.strict.equal((0, data_builder_task_mode_1.getDataBuilderTaskMode)(), 'db_primary');
    }
    finally {
        if (originalMode == null) {
            delete process.env.DATA_BUILDER_TASK_MODE;
        }
        else {
            process.env.DATA_BUILDER_TASK_MODE = originalMode;
        }
    }
}
async function main() {
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
    }
    finally {
        if (originalMode == null) {
            delete process.env.DATA_BUILDER_TASK_MODE;
        }
        else {
            process.env.DATA_BUILDER_TASK_MODE = originalMode;
        }
    }
}
void main().catch((error) => {
    console.error('db_primary smoke failed');
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=data-builder-db-primary-smoke.js.map