"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const data_builder_tasks_proxy_controller_1 = require("../modules/data-builder-tasks-proxy.controller");
const data_builder_connection_crypto_service_1 = require("./data-builder-connection-crypto.service");
const data_builder_task_shadow_store_service_1 = require("./data-builder-task-shadow-store.service");
const data_builder_db_primary_smoke_fixtures_1 = require("./data-builder-db-primary-smoke-fixtures");
const taskId = '00000000-0000-4000-8000-000000000001';
const assertionId = 'asrt_shadow';
const detailTaskId = '00000000-0000-4000-8000-000000000002';
const detailAssertionId = 'asrt_shadow_detail';
const mysql = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'shadow-secret',
    database: 'ai_automation_db',
};
class ShadowSmokeLegacyProxy {
    constructor() {
        this.calls = [];
    }
    async forwardLegacyLifecycle(opts) {
        this.calls.push(opts);
        if (opts.method === 'GET' && opts.path === '/tasks') {
            return [this.buildPrematureTerminalDetail()];
        }
        if (opts.method === 'GET' && opts.path === `/tasks/${detailTaskId}`) {
            return this.buildPrematureTerminalDetail();
        }
        if (opts.path === `/tasks/${taskId}/execute-batch`) {
            return {
                task_id: taskId,
                status: 'FAILED_ASSERTION',
                batch_index: 0,
                rows_affected: 2,
                assertions_evaluated: true,
                assertion_summary: {
                    evaluated: true,
                    passed: false,
                    failed_rules: [assertionId],
                },
                assertion_runs: [
                    {
                        assertion_id: assertionId,
                        assertion_type: 'scalar',
                        passed: false,
                        actual: 2,
                        expect: 3,
                        error_code: 'DB_AST_EXPECTATION_MISMATCH',
                        message: 'expected 3 but got 2',
                        primary_key_columns: ['id'],
                        sample_rows: null,
                        truncated: false,
                    },
                ],
            };
        }
        if (opts.path === `/tasks/${taskId}/cleanup`) {
            return {
                task_id: taskId,
                deleted_by_table: { smoke_table: 2 },
                mode_used: 'row_map',
                cleanup_completed_at: new Date().toISOString(),
                cleanup_completed_by: 'shadow-user',
                idempotent_replay: false,
            };
        }
        throw new Error(`unexpected legacy lifecycle call: ${opts.method} ${opts.path}`);
    }
    buildPrematureTerminalDetail() {
        const manifest = {
            ...(0, data_builder_db_primary_smoke_fixtures_1.buildManifest)({
                assertionId: detailAssertionId,
                batchCount: 2,
                totalRows: 4,
                batchSize: 2,
            }),
            task_id: detailTaskId,
        };
        const batchProgress = {
            batch_count: 2,
            completed_batches: 1,
            current_batch_index: 0,
            rows_inserted_total: 2,
        };
        const cleanupStatus = {
            state: 'eligible',
            blocked_reason: null,
        };
        return {
            task_id: detailTaskId,
            status: 'COMPLETED_OK',
            manifest,
            batch_progress: batchProgress,
            last_heartbeat_at: new Date('2026-04-20T09:00:00.000Z').toISOString(),
            last_batch_started_at: new Date('2026-04-20T08:59:00.000Z').toISOString(),
            assertion_summary: {
                evaluated: true,
                passed: true,
                failed_rules: [],
            },
            assertion_runs: [
                {
                    assertion_id: detailAssertionId,
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
            cleanup_status: cleanupStatus,
            row_map_flush_lag: 0,
            last_error: null,
            runtime: {
                batch_progress: batchProgress,
                last_heartbeat_at: new Date('2026-04-20T09:00:00.000Z').toISOString(),
                last_batch_started_at: new Date('2026-04-20T08:59:00.000Z').toISOString(),
                cleanup_status: cleanupStatus,
                assertion_summary: {
                    total: 1,
                    passed: 1,
                },
            },
        };
    }
}
function createShadowStore() {
    const db = new data_builder_db_primary_smoke_fixtures_1.InMemoryPrimaryDb();
    const taskRepo = new data_builder_db_primary_smoke_fixtures_1.FakeRepository('task', db);
    const batchRepo = new data_builder_db_primary_smoke_fixtures_1.FakeRepository('batch', db);
    const shadowStore = new data_builder_task_shadow_store_service_1.DataBuilderTaskShadowStoreService(taskRepo, batchRepo, new data_builder_connection_crypto_service_1.DataBuilderConnectionCryptoService());
    return { db, shadowStore };
}
function createShadowController() {
    const { db, shadowStore } = createShadowStore();
    const proxy = new ShadowSmokeLegacyProxy();
    const controller = new data_builder_tasks_proxy_controller_1.DataBuilderTasksProxyController(proxy, {}, shadowStore);
    return { db, proxy, shadowStore, controller };
}
async function runShadowReadNormalizationScenario() {
    const detailHarness = createShadowController();
    const detail = (await detailHarness.controller.getOne(detailTaskId));
    assert_1.strict.equal(detail.status, 'RUNNING');
    assert_1.strict.equal(detail.batch_progress.batch_count, 2);
    assert_1.strict.equal(detail.batch_progress.completed_batches, 1);
    assert_1.strict.equal(detail.batch_progress.rows_inserted_total, 2);
    assert_1.strict.equal(detail.cleanup_status.state, 'blocked');
    assert_1.strict.equal(detail.cleanup_status.blocked_reason, 'task_running');
    assert_1.strict.equal(detail.assertion_summary.evaluated, false);
    assert_1.strict.deepEqual(detail.assertion_summary.failed_rules, []);
    assert_1.strict.equal(detail.assertion_runs.length, 0);
    assert_1.strict.equal(detail.runtime.assertion_summary.total, 1);
    assert_1.strict.equal(detail.runtime.assertion_summary.passed, 0);
    assert_1.strict.equal(detailHarness.proxy.calls.length, 1);
    assert_1.strict.equal(detailHarness.proxy.calls[0].method, 'GET');
    assert_1.strict.equal(detailHarness.proxy.calls[0].path, `/tasks/${detailTaskId}`);
    const mirroredDetail = (await detailHarness.shadowStore.getTaskDetail(detailTaskId));
    assert_1.strict.equal(mirroredDetail.status, 'RUNNING');
    assert_1.strict.equal(mirroredDetail.cleanup_status.state, 'blocked');
    assert_1.strict.equal(mirroredDetail.assertion_summary.evaluated, false);
    assert_1.strict.equal(mirroredDetail.assertion_runs.length, 0);
    const listHarness = createShadowController();
    const listed = (await listHarness.controller.list('50'));
    assert_1.strict.equal(listHarness.proxy.calls.length, 1);
    assert_1.strict.equal(listHarness.proxy.calls[0].method, 'GET');
    assert_1.strict.equal(listHarness.proxy.calls[0].path, '/tasks');
    assert_1.strict.equal(listed.length, 1);
    assert_1.strict.equal(listed[0].task_id, detailTaskId);
    assert_1.strict.equal(listed[0].status, 'RUNNING');
    assert_1.strict.equal(listed[0].cleanup_status.state, 'blocked');
    assert_1.strict.equal(listed[0].cleanup_status.blocked_reason, 'task_running');
    assert_1.strict.equal(listed[0].assertion_summary.evaluated, false);
    assert_1.strict.equal(listed[0].assertion_runs.length, 0);
    assert_1.strict.equal(listed[0].runtime.assertion_summary.total, 1);
}
async function main() {
    const originalMode = process.env.DATA_BUILDER_TASK_MODE;
    const originalReadThrough = process.env.DATA_BUILDER_SHADOW_READ_THROUGH;
    process.env.DATA_BUILDER_TASK_MODE = 'shadow';
    process.env.DATA_BUILDER_SHADOW_READ_THROUGH = 'false';
    try {
        await runShadowReadNormalizationScenario();
        const { shadowStore, proxy, controller } = createShadowController();
        const manifest = (0, data_builder_db_primary_smoke_fixtures_1.buildManifest)({ assertionId, totalRows: 2, batchSize: 2 });
        const manifestSnapshot = { ...manifest, task_id: taskId };
        await shadowStore.mirrorCreateResponse({
            task_id: taskId,
            status: 'PENDING',
            manifest: manifestSnapshot,
        }, mysql, manifest);
        const executeResponse = (await controller.executeBatch(taskId, { batch_index: 0 }));
        assert_1.strict.equal(executeResponse.status, 'FAILED_ASSERTION');
        assert_1.strict.equal(proxy.calls.length, 1);
        assert_1.strict.equal(proxy.calls[0].method, 'POST');
        assert_1.strict.equal(proxy.calls[0].path, `/tasks/${taskId}/execute-batch`);
        const afterExecute = (await shadowStore.getTaskDetail(taskId));
        assert_1.strict.equal(afterExecute.status, 'FAILED_ASSERTION');
        assert_1.strict.equal(afterExecute.batch_progress.completed_batches, 1);
        assert_1.strict.equal(afterExecute.batch_progress.rows_inserted_total, 2);
        assert_1.strict.equal(afterExecute.assertion_summary.evaluated, true);
        assert_1.strict.equal(afterExecute.assertion_summary.passed, false);
        assert_1.strict.deepEqual(afterExecute.assertion_summary.failed_rules, [assertionId]);
        assert_1.strict.equal(afterExecute.assertion_runs.length, 1);
        assert_1.strict.equal(afterExecute.runtime.assertion_summary.total, 1);
        assert_1.strict.equal(afterExecute.runtime.assertion_summary.passed, 0);
        assert_1.strict.equal(afterExecute.cleanup_status.state, 'eligible');
        const cleanupResponse = (await controller.cleanup(taskId, {
            confirm: true,
            actor: 'shadow-user',
        }));
        assert_1.strict.equal(cleanupResponse.idempotent_replay, false);
        assert_1.strict.equal(proxy.calls.length, 2);
        assert_1.strict.equal(proxy.calls[1].method, 'POST');
        assert_1.strict.equal(proxy.calls[1].path, `/tasks/${taskId}/cleanup`);
        assert_1.strict.equal(proxy.calls.filter((call) => call.method === 'GET').length, 0);
        const afterCleanup = (await shadowStore.getTaskDetail(taskId));
        assert_1.strict.equal(afterCleanup.cleanup_status.state, 'completed');
        assert_1.strict.equal(afterCleanup.status, 'FAILED_ASSERTION');
        console.log('shadow smoke passed');
    }
    finally {
        if (originalMode == null) {
            delete process.env.DATA_BUILDER_TASK_MODE;
        }
        else {
            process.env.DATA_BUILDER_TASK_MODE = originalMode;
        }
        if (originalReadThrough == null) {
            delete process.env.DATA_BUILDER_SHADOW_READ_THROUGH;
        }
        else {
            process.env.DATA_BUILDER_SHADOW_READ_THROUGH = originalReadThrough;
        }
    }
}
void main().catch((error) => {
    console.error('shadow smoke failed');
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=data-builder-shadow-smoke.js.map