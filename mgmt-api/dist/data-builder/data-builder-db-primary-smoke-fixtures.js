"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioProxyService = exports.FakeShadowStore = exports.FakeDraftService = exports.FakeValidateService = exports.FakeRepository = exports.InMemoryPrimaryDb = void 0;
exports.buildManifest = buildManifest;
exports.createPrimaryHarness = createPrimaryHarness;
const common_1 = require("@nestjs/common");
const data_builder_task_orchestration_service_1 = require("./data-builder-task-orchestration.service");
const data_builder_primary_task_store_service_1 = require("./data-builder-primary-task-store.service");
const data_builder_connection_crypto_service_1 = require("./data-builder-connection-crypto.service");
const data_builder_task_entity_1 = require("../entities/data-builder-task.entity");
class InMemoryPrimaryDb {
    constructor() {
        this.tasks = new Map();
        this.batches = new Map();
        this.batchAutoId = 1;
        this.manager = {
            transaction: async (fn) => fn(this.managerApi),
        };
        this.managerApi = {
            findOne: async (entity, options) => this.findOne(entity, options),
            find: async (entity, options) => this.find(entity, options),
            create: (_entity, partial) => ({ ...partial }),
            save: async (value) => this.save(value),
        };
    }
    async findOneByKind(kind, options) {
        return this.findOne(kind === 'task' ? data_builder_task_entity_1.DataBuilderTask : data_builder_task_entity_1.DataBuilderTaskBatch, options);
    }
    async findByKind(kind, options) {
        return this.find(kind === 'task' ? data_builder_task_entity_1.DataBuilderTask : data_builder_task_entity_1.DataBuilderTaskBatch, options);
    }
    async existByKind(kind, options) {
        return (await this.findByKind(kind, { ...options, take: 1 })).length > 0;
    }
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    getBatch(taskId, batchIndex) {
        return this.batches.get(`${taskId}:${batchIndex}`);
    }
    async findOne(entity, options) {
        const rows = await this.find(entity, { ...options, take: 1 });
        return rows[0] ?? null;
    }
    async find(entity, options) {
        const source = entity === data_builder_task_entity_1.DataBuilderTask ? [...this.tasks.values()] : [...this.batches.values()];
        const filtered = source.filter((row) => this.matches(row, options?.where));
        const ordered = this.sortRows(filtered, options?.order);
        const rows = typeof options?.take === 'number' ? ordered.slice(0, options.take) : ordered;
        return rows.map((row) => this.project(row, options?.select));
    }
    async save(value) {
        if (Array.isArray(value)) {
            const out = [];
            for (const item of value) {
                out.push((await this.saveOne(item)));
            }
            return out;
        }
        return (await this.saveOne(value));
    }
    async saveOne(value) {
        if (value && typeof value === 'object' && 'batch_index' in value) {
            const row = value;
            const key = `${row.task_id}:${row.batch_index}`;
            const now = new Date();
            if (!row.id)
                row.id = String(this.batchAutoId++);
            row.created_at = row.created_at ?? now;
            row.updated_at = now;
            this.batches.set(key, row);
            return row;
        }
        const row = value;
        const now = new Date();
        row.created_at = row.created_at ?? now;
        row.updated_at = now;
        this.tasks.set(row.task_id, row);
        return row;
    }
    matches(row, where) {
        if (!where)
            return true;
        return Object.entries(where).every(([key, value]) => row[key] === value);
    }
    sortRows(rows, order) {
        if (!order)
            return rows;
        const entries = Object.entries(order);
        return [...rows].sort((left, right) => {
            for (const [key, direction] of entries) {
                const lv = left[key];
                const rv = right[key];
                if (lv === rv)
                    continue;
                const factor = direction === 'DESC' ? -1 : 1;
                if (lv == null)
                    return -1 * factor;
                if (rv == null)
                    return 1 * factor;
                if (lv instanceof Date && rv instanceof Date) {
                    return (lv.getTime() - rv.getTime()) * factor;
                }
                if (lv < rv)
                    return -1 * factor;
                if (lv > rv)
                    return 1 * factor;
            }
            return 0;
        });
    }
    project(row, select) {
        if (!select)
            return row;
        const projected = {};
        for (const [key, enabled] of Object.entries(select)) {
            if (enabled === true) {
                projected[key] = row[key];
            }
        }
        return projected;
    }
}
exports.InMemoryPrimaryDb = InMemoryPrimaryDb;
class FakeRepository {
    constructor(kind, db) {
        this.kind = kind;
        this.db = db;
        this.manager = {
            transaction: async (fn) => this.db.manager.transaction(fn),
        };
    }
    async findOne(options) {
        return (await this.db.findOneByKind(this.kind, options));
    }
    async find(options) {
        return (await this.db.findByKind(this.kind, options));
    }
    async exist(options) {
        return this.db.existByKind(this.kind, options);
    }
    async upsert(value, _conflictPaths) {
        await this.db.managerApi.save(value);
    }
    async save(value) {
        return (await this.db.managerApi.save(value));
    }
}
exports.FakeRepository = FakeRepository;
class FakeValidateService {
    assertValidManifest(_manifest) { }
}
exports.FakeValidateService = FakeValidateService;
class FakeDraftService {
    fromPrompt() {
        throw new Error('prompt path is not used in db_primary smoke');
    }
}
exports.FakeDraftService = FakeDraftService;
class FakeShadowStore {
    enabled() {
        return false;
    }
    async mirrorCreateResponse() { }
}
exports.FakeShadowStore = FakeShadowStore;
class ScenarioProxyService {
    constructor(plan = {}) {
        this.plan = plan;
        this.internalCalls = [];
    }
    async forwardLegacyLifecycle() {
        throw new Error('legacy lifecycle forward should not be used in db_primary smoke');
    }
    async forwardInternal(opts) {
        this.internalCalls.push(opts);
        const outcome = this.resolveOutcome(opts);
        if (outcome.kind === 'http_error') {
            throw new common_1.HttpException(outcome.response, outcome.status);
        }
        return outcome.response;
    }
    resolveOutcome(opts) {
        if (opts.path === '/execute-batch') {
            const planned = typeof this.plan.executeBatch === 'function'
                ? this.plan.executeBatch(opts)
                : this.plan.executeBatch;
            return planned ?? {
                kind: 'success',
                response: {
                    task_id: opts.data.task_id,
                    status: 'COMPLETED_OK',
                    batch_index: opts.data.batch_index,
                    rows_affected: 3,
                    assertions_evaluated: true,
                    assertion_summary: {
                        evaluated: true,
                        passed: true,
                        failed_rules: [],
                    },
                    assertion_runs: [
                        {
                            assertion_id: 'asrt_smoke',
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
            };
        }
        const planned = typeof this.plan.cleanup === 'function' ? this.plan.cleanup(opts) : this.plan.cleanup;
        return planned ?? {
            kind: 'success',
            response: {
                task_id: opts.data.task_id,
                deleted_by_table: { smoke_table: 3 },
                mode_used: 'row_map',
                cleanup_completed_at: new Date().toISOString(),
                cleanup_completed_by: opts.data.actor,
                idempotent_replay: false,
            },
        };
    }
}
exports.ScenarioProxyService = ScenarioProxyService;
function buildManifest(options) {
    const assertionId = options?.assertionId ?? 'asrt_smoke';
    const batchCount = options?.batchCount ?? 1;
    const totalRows = options?.totalRows ?? 3;
    const batchSize = options?.batchSize ?? totalRows;
    const rowCounts = options?.rowCounts ??
        Array.from({ length: batchCount }, (_, index) => index === batchCount - 1 ? totalRows - batchSize * index : batchSize);
    return {
        manifest_version: '1.0',
        database_context: {
            dialect: 'mysql8',
            database: 'ai_automation_db',
            tables: [{ name: 'smoke_table', role: 'primary' }],
        },
        generation: {
            mode: 'template',
            sql_template: 'INSERT INTO `smoke_table` (`name`) VALUES (:name)',
            bindings: [],
            batching: {
                total_rows: totalRows,
                batch_size: batchSize,
                batch_count: batchCount,
                batches: rowCounts.map((rowCount, batchIndex) => ({
                    batch_index: batchIndex,
                    row_count: rowCount,
                    label: `b${batchIndex}`,
                })),
            },
            post_insert_sql: [],
            state_machine: null,
        },
        fingerprint: {
            marker: {
                prefix: 'DB_TASK_',
                value_template: '${prefix}${task_id}',
            },
        },
        assertions: [
            {
                id: assertionId,
                severity: 'error',
            },
        ],
        cleanup: {
            mode: 'row_map',
            requires_confirm: true,
            plans: [{ table: 'smoke_table', order: 10, source: 'row_map' }],
        },
        meta: {
            data_builder: { insert_pk_column: 'id' },
        },
    };
}
function createPrimaryHarness(db = new InMemoryPrimaryDb(), plan = {}) {
    const taskRepo = new FakeRepository('task', db);
    const batchRepo = new FakeRepository('batch', db);
    const cryptoService = new data_builder_connection_crypto_service_1.DataBuilderConnectionCryptoService();
    const primaryStore = new data_builder_primary_task_store_service_1.DataBuilderPrimaryTaskStoreService(taskRepo, batchRepo, cryptoService);
    const proxy = new ScenarioProxyService(plan);
    const orchestration = new data_builder_task_orchestration_service_1.DataBuilderTaskOrchestrationService(proxy, new FakeValidateService(), new FakeDraftService(), new FakeShadowStore(), primaryStore);
    return {
        db,
        proxy,
        orchestration,
        primaryStore,
    };
}
//# sourceMappingURL=data-builder-db-primary-smoke-fixtures.js.map