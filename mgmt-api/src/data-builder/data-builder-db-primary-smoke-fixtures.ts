import { HttpException } from '@nestjs/common';

import { DataBuilderTaskOrchestrationService } from './data-builder-task-orchestration.service';
import { DataBuilderPrimaryTaskStoreService } from './data-builder-primary-task-store.service';
import { DataBuilderConnectionCryptoService } from './data-builder-connection-crypto.service';
import { DataBuilderTask, DataBuilderTaskBatch } from '../entities/data-builder-task.entity';

type TaskRow = DataBuilderTask & Record<string, any>;
type BatchRow = DataBuilderTaskBatch & Record<string, any>;
type InMemoryFindOptions = {
  where?: Record<string, unknown>;
  order?: Record<string, 'ASC' | 'DESC'>;
  take?: number;
  select?: Record<string, unknown>;
};

export class InMemoryPrimaryDb {
  private readonly tasks = new Map<string, TaskRow>();
  private readonly batches = new Map<string, BatchRow>();
  private batchAutoId = 1;

  readonly manager = {
    transaction: async <T>(fn: (manager: typeof this.managerApi) => Promise<T>): Promise<T> =>
      fn(this.managerApi),
  };

  readonly managerApi = {
    findOne: async (entity: unknown, options: InMemoryFindOptions) =>
      this.findOne(entity, options),
    find: async (entity: unknown, options?: InMemoryFindOptions) => this.find(entity, options),
    create: <T extends Record<string, unknown>>(_entity: unknown, partial: T): T => ({ ...partial }),
    save: async <T>(value: T | T[]) => this.save(value),
  };

  async findOneByKind(kind: 'task' | 'batch', options: InMemoryFindOptions): Promise<any> {
    return this.findOne(kind === 'task' ? DataBuilderTask : DataBuilderTaskBatch, options);
  }

  async findByKind(
    kind: 'task' | 'batch',
    options?: InMemoryFindOptions,
  ): Promise<any[]> {
    return this.find(kind === 'task' ? DataBuilderTask : DataBuilderTaskBatch, options);
  }

  async existByKind(kind: 'task' | 'batch', options?: InMemoryFindOptions): Promise<boolean> {
    return (await this.findByKind(kind, { ...options, take: 1 })).length > 0;
  }

  getTask(taskId: string): TaskRow | undefined {
    return this.tasks.get(taskId);
  }

  getBatch(taskId: string, batchIndex: number): BatchRow | undefined {
    return this.batches.get(`${taskId}:${batchIndex}`);
  }

  private async findOne(entity: unknown, options: InMemoryFindOptions): Promise<any> {
    const rows = await this.find(entity, { ...options, take: 1 });
    return rows[0] ?? null;
  }

  private async find(entity: unknown, options?: InMemoryFindOptions): Promise<any[]> {
    const source = entity === DataBuilderTask ? [...this.tasks.values()] : [...this.batches.values()];
    const filtered = source.filter((row) => this.matches(row, options?.where));
    const ordered = this.sortRows(filtered, options?.order);
    const rows = typeof options?.take === 'number' ? ordered.slice(0, options.take) : ordered;
    return rows.map((row) => this.project(row, options?.select));
  }

  private async save<T>(value: T | T[]): Promise<T | T[]> {
    if (Array.isArray(value)) {
      const out: T[] = [];
      for (const item of value) {
        out.push((await this.saveOne(item)) as T);
      }
      return out;
    }
    return (await this.saveOne(value)) as T;
  }

  private async saveOne(value: any): Promise<any> {
    if (value && typeof value === 'object' && 'batch_index' in value) {
      const row = value as BatchRow;
      const key = `${row.task_id}:${row.batch_index}`;
      const now = new Date();
      if (!row.id) row.id = String(this.batchAutoId++);
      row.created_at = row.created_at ?? now;
      row.updated_at = now;
      this.batches.set(key, row);
      return row;
    }

    const row = value as TaskRow;
    const now = new Date();
    row.created_at = row.created_at ?? now;
    row.updated_at = now;
    this.tasks.set(row.task_id, row);
    return row;
  }

  private matches(row: Record<string, unknown>, where?: Record<string, unknown>): boolean {
    if (!where) return true;
    return Object.entries(where).every(([key, value]) => row[key] === value);
  }

  private sortRows<T extends Record<string, unknown>>(
    rows: T[],
    order?: Record<string, 'ASC' | 'DESC'>,
  ): T[] {
    if (!order) return rows;
    const entries = Object.entries(order);
    return [...rows].sort((left, right) => {
      for (const [key, direction] of entries) {
        const lv = left[key];
        const rv = right[key];
        if (lv === rv) continue;
        const factor = direction === 'DESC' ? -1 : 1;
        if (lv == null) return -1 * factor;
        if (rv == null) return 1 * factor;
        if (lv instanceof Date && rv instanceof Date) {
          return (lv.getTime() - rv.getTime()) * factor;
        }
        if (lv < rv) return -1 * factor;
        if (lv > rv) return 1 * factor;
      }
      return 0;
    });
  }

  private project<T extends Record<string, unknown>>(
    row: T,
    select?: Record<string, unknown>,
  ): T {
    if (!select) return row;
    const projected: Record<string, unknown> = {};
    for (const [key, enabled] of Object.entries(select)) {
      if (enabled === true) {
        projected[key] = row[key];
      }
    }
    return projected as T;
  }
}

export class FakeRepository<T> {
  readonly manager;

  constructor(
    private readonly kind: 'task' | 'batch',
    private readonly db: InMemoryPrimaryDb,
  ) {
    this.manager = {
      transaction: async <R>(fn: (manager: typeof this.db.managerApi) => Promise<R>) =>
        this.db.manager.transaction(fn),
    };
  }

  async findOne(options: InMemoryFindOptions): Promise<T | null> {
    return (await this.db.findOneByKind(this.kind, options)) as T | null;
  }

  async find(options?: InMemoryFindOptions): Promise<T[]> {
    return (await this.db.findByKind(this.kind, options)) as T[];
  }

  async exist(options?: InMemoryFindOptions): Promise<boolean> {
    return this.db.existByKind(this.kind, options);
  }

  async upsert(value: T | T[], _conflictPaths: string[]): Promise<void> {
    await this.db.managerApi.save(value);
  }

  async save(value: T | T[]): Promise<T | T[]> {
    return (await this.db.managerApi.save(value)) as T | T[];
  }
}

export class FakeValidateService {
  assertValidManifest(_manifest: unknown): void {}
}

export class FakeDraftService {
  fromPrompt(): never {
    throw new Error('prompt path is not used in db_primary smoke');
  }
}

export class FakeShadowStore {
  enabled(): boolean {
    return false;
  }

  async mirrorCreateResponse(): Promise<void> {}
}

export type ProxyInternalCall = {
  path: '/execute-batch' | '/cleanup';
  data: Record<string, any>;
};

type SuccessOutcome = {
  kind: 'success';
  response: Record<string, unknown>;
};

type HttpErrorOutcome = {
  kind: 'http_error';
  status: number;
  response: Record<string, unknown>;
};

export type ExecuteBatchOutcome = SuccessOutcome | HttpErrorOutcome;
export type CleanupOutcome = SuccessOutcome | HttpErrorOutcome;

type ProxyPlan = {
  executeBatch?: ExecuteBatchOutcome | ((call: ProxyInternalCall) => ExecuteBatchOutcome);
  cleanup?: CleanupOutcome | ((call: ProxyInternalCall) => CleanupOutcome);
};

export class ScenarioProxyService {
  readonly internalCalls: ProxyInternalCall[] = [];

  constructor(private readonly plan: ProxyPlan = {}) {}

  async forwardLegacyLifecycle(): Promise<never> {
    throw new Error('legacy lifecycle forward should not be used in db_primary smoke');
  }

  async forwardInternal(opts: ProxyInternalCall): Promise<unknown> {
    this.internalCalls.push(opts);
    const outcome = this.resolveOutcome(opts);
    if (outcome.kind === 'http_error') {
      throw new HttpException(outcome.response, outcome.status);
    }
    return outcome.response;
  }

  private resolveOutcome(opts: ProxyInternalCall): ExecuteBatchOutcome | CleanupOutcome {
    if (opts.path === '/execute-batch') {
      const planned =
        typeof this.plan.executeBatch === 'function'
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

    const planned =
      typeof this.plan.cleanup === 'function' ? this.plan.cleanup(opts) : this.plan.cleanup;
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

export function buildManifest(options?: {
  assertionId?: string;
  batchCount?: number;
  totalRows?: number;
  batchSize?: number;
  rowCounts?: number[];
}): Record<string, unknown> {
  const assertionId = options?.assertionId ?? 'asrt_smoke';
  const batchCount = options?.batchCount ?? 1;
  const totalRows = options?.totalRows ?? 3;
  const batchSize = options?.batchSize ?? totalRows;
  const rowCounts =
    options?.rowCounts ??
    Array.from({ length: batchCount }, (_, index) =>
      index === batchCount - 1 ? totalRows - batchSize * index : batchSize,
    );

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

export function createPrimaryHarness(
  db = new InMemoryPrimaryDb(),
  plan: ProxyPlan = {},
): {
  db: InMemoryPrimaryDb;
  proxy: ScenarioProxyService;
  orchestration: DataBuilderTaskOrchestrationService;
  primaryStore: DataBuilderPrimaryTaskStoreService;
} {
  const taskRepo = new FakeRepository<DataBuilderTask>('task', db);
  const batchRepo = new FakeRepository<DataBuilderTaskBatch>('batch', db);
  const cryptoService = new DataBuilderConnectionCryptoService();
  const primaryStore = new DataBuilderPrimaryTaskStoreService(
    taskRepo as any,
    batchRepo as any,
    cryptoService,
  );
  const proxy = new ScenarioProxyService(plan);
  const orchestration = new DataBuilderTaskOrchestrationService(
    proxy as any,
    new FakeValidateService() as any,
    new FakeDraftService() as any,
    new FakeShadowStore() as any,
    primaryStore,
  );
  return {
    db,
    proxy,
    orchestration,
    primaryStore,
  };
}
