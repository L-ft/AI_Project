import { strict as assert } from 'assert';
import * as mysql from 'mysql2/promise';

type SmokePhase = 'full' | 'prepare' | 'verify';

type TaskRow = {
  task_id: string;
  status: string;
  execution_mode: string;
  orchestration_owner: string;
  batch_count: number;
  completed_batches: number;
  rows_inserted_total: number | string;
  cleanup_status: string;
  cleanup_completed_at: Date | null;
  created_by: string | null;
};

type BatchRow = {
  batch_index: number;
  status: string;
  rows_inserted: number | string;
  attempt_count: number;
};

const smokeBaseUrl = readStringEnv('MGMT_API_SMOKE_BASE_URL', 'http://127.0.0.1:3011');
const mysqlHost = readStringEnv('MGMT_API_SMOKE_DB_HOST', '127.0.0.1');
const mysqlPort = readNumberEnv('MGMT_API_SMOKE_DB_PORT', 3308);
const mysqlUser = readStringEnv('MGMT_API_SMOKE_DB_USER', 'root');
const mysqlPassword = readStringEnv('MGMT_API_SMOKE_DB_PASS', 'root_password');
const mysqlDatabase = readStringEnv('MGMT_API_SMOKE_DB_NAME', 'ai_automation_db');
const smokePhase = readPhaseEnv();
const smokeTaskId = readOptionalStringEnv('MGMT_API_SMOKE_TASK_ID');

const smokeMysql = {
  host: mysqlHost,
  port: mysqlPort,
  user: mysqlUser,
  password: mysqlPassword,
  database: mysqlDatabase,
};
const smokeTargetTable = 'data_builder_smoke_targets';

function readStringEnv(name: string, fallback: string): string {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return fallback;
  return String(raw).trim();
}

function readOptionalStringEnv(name: string): string | null {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return null;
  return String(raw).trim();
}

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return fallback;
  const out = Number(raw);
  return Number.isFinite(out) ? out : fallback;
}

function readPhaseEnv(): SmokePhase {
  const raw = String(process.env.MGMT_API_SMOKE_PHASE || 'full').trim().toLowerCase();
  if (raw === 'prepare' || raw === 'verify') return raw;
  return 'full';
}

function smokeBaseUrlNoSlash(): string {
  return smokeBaseUrl.replace(/\/$/, '');
}

function apiUrl(path: string): string {
  return `${smokeBaseUrlNoSlash()}${path}`;
}

function buildManifest(totalRows = 4): Record<string, unknown> {
  return {
    manifest_version: '1.0',
    database_context: {
      dialect: 'mysql8',
      connection_ref: 'smoke_mysql',
      database: mysqlDatabase,
      tables: [{ name: smokeTargetTable, role: 'primary' }],
    },
    generation: {
      mode: 'template',
      instruction_echo: 'db_primary http smoke',
      sql_template: `INSERT INTO \`${smokeTargetTable}\` (\`name\`, \`base_url\`) VALUES (:name, :base_url)`,
      bindings: [
        {
          placeholder: 'name',
          column: 'name',
          strategy: 'fingerprint_remark',
          params: { merge_mode: 'append' },
        },
        {
          placeholder: 'base_url',
          column: 'base_url',
          strategy: 'literal',
          params: { value: 'https://l3.example/http-smoke' },
        },
      ],
      batching: {
        total_rows: totalRows,
        batch_size: 2,
        batch_count: 2,
        batches: [
          { batch_index: 0, row_count: 2, label: 'b0' },
          { batch_index: 1, row_count: 2, label: 'b1' },
        ],
      },
      post_insert_sql: [],
      state_machine: null,
    },
    fingerprint: {
      strategy: 'row_map_only',
      remark_column: null,
      marker: {
        format: 'prefixed_token',
        prefix: 'DB_TASK_',
        value_template: '${prefix}${task_id}',
      },
      row_map: {
        enabled: true,
        async_flush: false,
        table: 'data_builder_row_map',
      },
    },
    assertions: [
      {
        id: 'asrt_row_count_for_task_marker',
        name: 'http smoke row count',
        assertion_type: 'scalar',
        severity: 'error',
        sql: `SELECT COUNT(*) AS c FROM \`${smokeTargetTable}\` WHERE \`name\` LIKE CONCAT('%', :task_marker, '%')`,
        expect: { kind: 'row_count_eq', value: totalRows, column: 'c' },
        rationale: 'all generated names should include task marker',
        run_after_batch: null,
      },
    ],
    cleanup: {
      mode: 'row_map',
      requires_confirm: true,
      plans: [{ table: smokeTargetTable, order: 10, source: 'row_map' }],
    },
    meta: {
      source: 'api',
      compliance: { production_row_sampling: false },
      data_builder: { insert_pk_column: 'id' },
    },
  };
}

async function http<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method,
    headers: body == null ? undefined : { 'content-type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${JSON.stringify(parsed)}`);
  }
  return parsed as T;
}

async function fetchTaskDetail(taskId: string): Promise<any> {
  return http<any>('GET', `/v1/data-builder/tasks/${taskId}`);
}

async function fetchTaskList(limit = 50): Promise<any[]> {
  return http<any[]>('GET', `/v1/data-builder/tasks?limit=${limit}`);
}

async function executeBatch(taskId: string, batchIndex: number): Promise<any> {
  return http<any>('POST', `/v1/data-builder/tasks/${taskId}/execute-batch`, {
    batch_index: batchIndex,
    dry_run: false,
  });
}

async function cleanupTask(taskId: string): Promise<any> {
  return http<any>('POST', `/v1/data-builder/tasks/${taskId}/cleanup`, {
    confirm: true,
    actor: 'http-smoke-user',
  });
}

async function assertRequiredTables(conn: mysql.Connection): Promise<void> {
  const [rows] = await conn.query<any[]>(
    `
      SELECT table_name AS table_name
      FROM information_schema.tables
      WHERE table_schema = ?
        AND table_name IN (
          'data_builder_tasks',
          'data_builder_task_batches',
          'data_builder_row_map',
          '${smokeTargetTable}'
        )
    `,
    [mysqlDatabase],
  );
  const names = new Set(rows.map((row) => String(row.table_name ?? row.TABLE_NAME)));
  for (const required of [
    'data_builder_tasks',
    'data_builder_task_batches',
    'data_builder_row_map',
    smokeTargetTable,
  ]) {
    assert.ok(names.has(required), `required table is missing: ${required}`);
  }
}

async function assertTaskTableDefaults(conn: mysql.Connection): Promise<void> {
  const [rows] = await conn.query<any[]>(
    `
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_schema = ?
        AND table_name = 'data_builder_tasks'
        AND column_name IN ('execution_mode', 'orchestration_owner')
    `,
    [mysqlDatabase],
  );
  const defaults = new Map(
    rows.map((row) => [
      String(row.column_name ?? row.COLUMN_NAME),
      row.column_default ?? row.COLUMN_DEFAULT,
    ]),
  );
  assert.equal(defaults.get('execution_mode'), 'db_primary');
  assert.equal(defaults.get('orchestration_owner'), 'mgmt-api');
}

async function ensureDataBuilderTables(conn: mysql.Connection): Promise<void> {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS data_builder_tasks (
      task_id CHAR(36) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      manifest_json JSON NOT NULL,
      manifest_hash CHAR(64) NULL,
      manifest_version VARCHAR(32) NOT NULL DEFAULT 'v1',
      mysql_conn_snapshot_json JSON NULL,
      mysql_conn_encrypted_json JSON NULL,
      mysql_conn_snapshot_version VARCHAR(32) NOT NULL DEFAULT 'v1',
      execution_mode VARCHAR(32) NOT NULL DEFAULT 'db_primary',
      orchestration_owner VARCHAR(32) NOT NULL DEFAULT 'mgmt-api',
      batch_count INT NOT NULL DEFAULT 0,
      completed_batches INT NOT NULL DEFAULT 0,
      current_batch_index INT NULL,
      rows_inserted_total BIGINT NOT NULL DEFAULT 0,
      last_heartbeat_at TIMESTAMP(3) NULL,
      last_batch_started_at TIMESTAMP(3) NULL,
      row_map_flush_lag INT NOT NULL DEFAULT 0,
      cleanup_status VARCHAR(32) NOT NULL DEFAULT 'not_applicable',
      cleanup_blocked_reason VARCHAR(64) NULL,
      cleanup_started_at TIMESTAMP(3) NULL,
      cleanup_completed_at TIMESTAMP(3) NULL,
      cleanup_completed_by VARCHAR(128) NULL,
      last_error_json JSON NULL,
      assertion_evaluated BOOLEAN NOT NULL DEFAULT FALSE,
      assertion_runs_json JSON NULL,
      created_by VARCHAR(128) NULL,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (task_id),
      KEY idx_status_updated (status, updated_at),
      KEY idx_created_at (created_at),
      KEY idx_updated_at (updated_at),
      KEY idx_execution_mode (execution_mode, updated_at),
      KEY idx_cleanup_status (cleanup_status, updated_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Data Builder: persistent task lifecycle and orchestration truth'
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS data_builder_task_batches (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      task_id CHAR(36) NOT NULL,
      batch_index INT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      rows_inserted BIGINT NOT NULL DEFAULT 0,
      attempt_count INT NOT NULL DEFAULT 0,
      started_at TIMESTAMP(3) NULL,
      last_heartbeat_at TIMESTAMP(3) NULL,
      finished_at TIMESTAMP(3) NULL,
      idempotency_key VARCHAR(128) NULL,
      last_error_json JSON NULL,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uk_task_batch (task_id, batch_index),
      KEY idx_task_status (task_id, status),
      KEY idx_task_updated (task_id, updated_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Data Builder: persistent per-batch runtime state'
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS ${smokeTargetTable} (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      base_url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_smoke_name (name),
      KEY idx_smoke_base_url (base_url)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Data Builder HTTP smoke target table'
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS data_builder_row_map (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      task_id CHAR(36) NOT NULL,
      db_name VARCHAR(128) NOT NULL,
      table_name VARCHAR(128) NOT NULL,
      pk_columns JSON NOT NULL,
      pk_values JSON NOT NULL,
      batch_index INT NOT NULL DEFAULT 0,
      row_index INT NOT NULL DEFAULT 0,
      statement_fingerprint CHAR(64) NULL,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_task_id (task_id),
      KEY idx_task_batch (task_id, batch_index),
      KEY idx_task_table (task_id, db_name, table_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Data Builder: maps inserted rows to tasks for precise cleanup'
  `);
}

async function cleanupStaleRows(conn: mysql.Connection): Promise<void> {
  await conn.query(
    `DELETE FROM \`${smokeTargetTable}\` WHERE \`base_url\` = 'https://l3.example/http-smoke'`,
  );
}

async function getTaskRow(conn: mysql.Connection, taskId: string): Promise<TaskRow | null> {
  const [rows] = await conn.query<any[]>(
    `
      SELECT
        task_id,
        status,
        execution_mode,
        orchestration_owner,
        batch_count,
        completed_batches,
        rows_inserted_total,
        cleanup_status,
        cleanup_completed_at,
        created_by
      FROM data_builder_tasks
      WHERE task_id = ?
    `,
    [taskId],
  );
  return (rows[0] as TaskRow | undefined) ?? null;
}

async function getBatchRows(conn: mysql.Connection, taskId: string): Promise<BatchRow[]> {
  const [rows] = await conn.query<any[]>(
    `
      SELECT batch_index, status, rows_inserted, attempt_count
      FROM data_builder_task_batches
      WHERE task_id = ?
      ORDER BY batch_index ASC
    `,
    [taskId],
  );
  return rows as BatchRow[];
}

async function countInsertedRows(conn: mysql.Connection, taskId: string): Promise<number> {
  const [rows] = await conn.query<any[]>(
    `
      SELECT COUNT(*) AS c
      FROM ${smokeTargetTable}
      WHERE name LIKE CONCAT('%', ?, '%')
        AND base_url = 'https://l3.example/http-smoke'
    `,
    [`DB_TASK_${taskId}`],
  );
  return Number(rows[0]?.c ?? 0);
}

async function countRowMapRows(conn: mysql.Connection, taskId: string): Promise<number> {
  const [rows] = await conn.query<any[]>(
    'SELECT COUNT(*) AS c FROM data_builder_row_map WHERE task_id = ?',
    [taskId],
  );
  return Number(rows[0]?.c ?? 0);
}

async function verifyDbPrimaryPersistence(conn: mysql.Connection, taskId: string): Promise<void> {
  const taskRow = await getTaskRow(conn, taskId);
  assert.ok(taskRow, `task row should exist for ${taskId}`);
  assert.equal(taskRow?.execution_mode, 'db_primary');
  assert.equal(taskRow?.orchestration_owner, 'mgmt-api');
  assert.equal(taskRow?.created_by, 'http-smoke-user');

  const batchRows = await getBatchRows(conn, taskId);
  assert.equal(batchRows.length, 2);
}

async function runPreparePhase(conn: mysql.Connection): Promise<string> {
  await cleanupStaleRows(conn);

  const created = await http<any>('POST', '/v1/data-builder/tasks', {
    manifest: buildManifest(),
    mysql: smokeMysql,
    created_by: 'http-smoke-user',
  });
  const taskId = String(created.task_id);
  assert.ok(taskId, 'task_id should be returned by create');

  const detail = await fetchTaskDetail(taskId);
  assert.equal(detail.status, 'PENDING');
  assert.equal(detail.batch_progress.batch_count, 2);
  assert.equal(detail.cleanup_status.state, 'not_applicable');

  await assert.rejects(
    () => executeBatch(taskId, 1),
    /DB_TASK_BATCH_SEQUENCE_CONFLICT/,
  );

  const afterOutOfOrderAttempt = await fetchTaskDetail(taskId);
  assert.equal(afterOutOfOrderAttempt.status, 'PENDING');
  assert.equal(afterOutOfOrderAttempt.batch_progress.completed_batches, 0);
  assert.equal(afterOutOfOrderAttempt.cleanup_status.state, 'not_applicable');

  const listed = await fetchTaskList(50);
  assert.ok(listed.some((row) => row.task_id === taskId), 'task should appear in list');

  await verifyDbPrimaryPersistence(conn, taskId);

  const batch0 = await executeBatch(taskId, 0);
  assert.equal(batch0.status, 'RUNNING');
  assert.equal(batch0.batch_index, 0);
  assert.equal(batch0.rows_affected, 2);
  assert.equal(batch0.assertions_evaluated, false);

  const afterBatch0 = await fetchTaskDetail(taskId);
  assert.equal(afterBatch0.status, 'RUNNING');
  assert.equal(afterBatch0.batch_progress.completed_batches, 1);
  assert.equal(afterBatch0.batch_progress.rows_inserted_total, 2);
  assert.equal(afterBatch0.cleanup_status.state, 'blocked');
  assert.equal(afterBatch0.cleanup_status.blocked_reason, 'task_running');

  const batch1 = await executeBatch(taskId, 1);
  assert.equal(batch1.status, 'COMPLETED_OK');
  assert.equal(batch1.batch_index, 1);
  assert.equal(batch1.rows_affected, 2);
  assert.equal(batch1.assertions_evaluated, true);
  assert.equal(batch1.assertion_summary?.passed, true);

  const afterBatch1 = await fetchTaskDetail(taskId);
  assert.equal(afterBatch1.status, 'COMPLETED_OK');
  assert.equal(afterBatch1.batch_progress.completed_batches, 2);
  assert.equal(afterBatch1.batch_progress.rows_inserted_total, 4);
  assert.equal(afterBatch1.cleanup_status.state, 'eligible');
  assert.equal(afterBatch1.assertion_summary.evaluated, true);
  assert.deepEqual(afterBatch1.assertion_summary.failed_rules, []);

  const taskRow = await getTaskRow(conn, taskId);
  assert.equal(taskRow?.status, 'COMPLETED_OK');
  assert.equal(taskRow?.completed_batches, 2);
  assert.equal(Number(taskRow?.rows_inserted_total ?? 0), 4);
  assert.equal(taskRow?.cleanup_status, 'eligible');

  const batchRows = await getBatchRows(conn, taskId);
  assert.deepEqual(
    batchRows.map((row) => row.status),
    ['COMPLETED_OK', 'COMPLETED_OK'],
  );
  assert.deepEqual(
    batchRows.map((row) => Number(row.rows_inserted)),
    [2, 2],
  );
  assert.deepEqual(
    batchRows.map((row) => row.attempt_count),
    [1, 1],
  );

  assert.equal(await countInsertedRows(conn, taskId), 4);
  assert.equal(await countRowMapRows(conn, taskId), 4);

  return taskId;
}

async function runVerifyPhase(conn: mysql.Connection, taskId: string, cleanupAfterVerify: boolean): Promise<void> {
  const listed = await fetchTaskList(50);
  assert.ok(listed.some((row) => row.task_id === taskId), 'task should still be listed after restart');

  const detail = await fetchTaskDetail(taskId);
  assert.ok(
    ['COMPLETED_OK', 'FAILED_ASSERTION', 'FAILED_EXECUTION'].includes(detail.status),
    `unexpected terminal status: ${detail.status}`,
  );
  assert.ok(
    ['eligible', 'completed'].includes(detail.cleanup_status.state),
    `unexpected cleanup state: ${detail.cleanup_status.state}`,
  );

  await verifyDbPrimaryPersistence(conn, taskId);
  assert.ok(await countInsertedRows(conn, taskId) >= 0);

  if (!cleanupAfterVerify || detail.cleanup_status.state === 'completed') {
    return;
  }

  const cleanup = await cleanupTask(taskId);
  assert.equal(cleanup.idempotent_replay, false);

  const afterCleanup = await fetchTaskDetail(taskId);
  assert.equal(afterCleanup.cleanup_status.state, 'completed');

  assert.equal(await countInsertedRows(conn, taskId), 0);
  assert.equal(await countRowMapRows(conn, taskId), 0);

  const replay = await cleanupTask(taskId);
  assert.equal(replay.idempotent_replay, true);
}

async function main(): Promise<void> {
  const conn = await mysql.createConnection({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
    charset: 'utf8mb4',
  });

  try {
    await ensureDataBuilderTables(conn);
    await assertRequiredTables(conn);
    await assertTaskTableDefaults(conn);

    if (smokePhase === 'prepare') {
      const taskId = await runPreparePhase(conn);
      console.log(JSON.stringify({ phase: 'prepare', task_id: taskId }));
      return;
    }

    if (smokePhase === 'verify') {
      assert.ok(smokeTaskId, 'MGMT_API_SMOKE_TASK_ID is required for verify phase');
      await runVerifyPhase(conn, smokeTaskId, true);
      console.log(JSON.stringify({ phase: 'verify', task_id: smokeTaskId, cleanup: 'completed' }));
      return;
    }

    const taskId = await runPreparePhase(conn);
    await runVerifyPhase(conn, taskId, true);
    console.log('db_primary http smoke passed');
  } finally {
    await conn.end();
  }
}

void main().catch((error) => {
  console.error('db_primary http smoke failed');
  console.error(error);
  process.exitCode = 1;
});
