# Data Builder 执行模式、任务状态机与 PoC 约束

本文冻结 R1/PR-1 的执行语义。R1 只定义合同，不切换运行链路。

## 1. Execution Modes

| mode | create | read | execute-batch | cleanup | source of truth |
|------|--------|------|---------------|---------|-----------------|
| `proxy` | exec-engine | exec-engine | exec-engine | exec-engine | exec-engine memory |
| `shadow` | exec-engine + mgmt-api mirror | mgmt-api first, fallback exec-engine | exec-engine | exec-engine | mgmt-api mirror |
| `db_primary` | mgmt-api | mgmt-api | mgmt-api orchestrates internal exec-engine call | mgmt-api orchestrates internal exec-engine call | mgmt-api DB |

R1 定义三种模式。R2/PR-2 进入 `shadow`，R3/PR-3 进入 `db_primary`，R4/PR-4 再切前端持久化任务心智。
当前运行时默认模式应为 `db_primary`；`proxy` / `shadow` 仅保留为兼容或回滚模式。

当前前端逐批调用 `execute-batch` 的说明，只代表 `proxy/shadow` 兼容阶段。`db_primary` 之后，前端仍可按批触发，但状态流转和持久化写入由 mgmt-api 完成。

### P2 Route Boundary Clarification

- In `db_primary`, external callers use mgmt-api lifecycle routes only.
- `exec-engine /data-builder/internal/*` is reserved for mgmt-api orchestration and must stay stateless.
- `exec-engine /data-builder/tasks*` remains as deprecated fallback for rollback or direct-mode compatibility.
- Any `DB_LEGACY_LIFECYCLE_FALLBACK` warning in mgmt-api logs means a caller or environment is still using the deprecated lifecycle path.

## 2. 任务状态机

| 状态 | 含义 |
|------|------|
| `PENDING` | 任务已创建，尚未执行任何 batch |
| `RUNNING` | 至少一个 batch 正在执行，或任务处于执行编排中 |
| `COMPLETED_OK` | 全部 batch 成功，断言通过 |
| `FAILED_ASSERTION` | 数据已落库，但断言不通过。必须保留现场 |
| `FAILED_EXECUTION` | SQL、连接、权限、执行器不可用等执行失败，可能已有部分 batch 写入 |

状态流转：

```text
PENDING -> RUNNING -> COMPLETED_OK
PENDING -> RUNNING -> FAILED_ASSERTION
PENDING -> RUNNING -> FAILED_EXECUTION
```

断言失败不得自动 rollback 或自动 cleanup。用户确认后通过 cleanup 链路清理。

## 3. 批次状态

批次状态保存在 `data_builder_task_batches`，使用 `task_id + batch_index` 唯一定位。

批次状态枚举与任务状态一致：

```text
PENDING|RUNNING|COMPLETED_OK|FAILED_ASSERTION|FAILED_EXECUTION
```

聚合规则：

- `batch_count = count(*) from data_builder_task_batches where task_id = ?`
- `completed_batches = count(*) where status in ('COMPLETED_OK', 'FAILED_ASSERTION', 'FAILED_EXECUTION')`
- `rows_inserted_total = sum(rows_inserted)`
- `current_batch_index` 优先取正在 `RUNNING` 的 batch；无 RUNNING 时取最近更新的 batch
- task 级 `last_error_json` 记录任务最终错误；batch 级错误记录在 `data_builder_task_batches.last_error_json`

`completed_batches` 是终态批次数，不是成功批次数。这样失败任务仍能准确展示执行进度。

## 4. mgmt-api 编排规则

`db_primary` 模式下，mgmt-api 是唯一任务状态写入点。

执行单个 batch 时，mgmt-api 必须使用两段短事务：

```text
transaction A:
  load task and batch
  assert transition is allowed
  batch.status = RUNNING
  batch.attempt_count += 1
  batch.started_at = now
  task.status = RUNNING
  task.current_batch_index = batch_index
  task.last_batch_started_at = now
  persist

outside transaction:
  call exec-engine internal execute-batch endpoint

transaction B:
  persist rows_inserted / heartbeat / finished_at
  persist batch terminal status
  recompute task progress cache
  if final batch, run or persist assertion result
  persist task terminal status or keep RUNNING
```

mgmt-api 不得持有数据库行锁跨越 exec-engine HTTP 调用。

## 5. 兼容阶段前端流程

`proxy/shadow` 阶段，前端仍可能按下面流程执行：

```text
POST /data-builder/tasks -> task_id
for batch_index in 0..batch_count-1:
  POST /data-builder/tasks/{task_id}/execute-batch
  GET /data-builder/tasks/{task_id}
POST /data-builder/tasks/{task_id}/cleanup
```

这是迁移期兼容行为，不代表最终 ownership。最终 task truth 以 mgmt-api DB 为准。

## 6. 心跳与卡住判断

核心字段：

- `data_builder_tasks.last_batch_started_at`
- `data_builder_tasks.last_heartbeat_at`
- `data_builder_task_batches.started_at`
- `data_builder_task_batches.last_heartbeat_at`
- `data_builder_task_batches.finished_at`

建议阈值：

```text
BATCH_HTTP_TIMEOUT_SEC >= 单批 SQL 预算
STALL_THRESHOLD_SEC = 30
POLL_INTERVAL_SEC = 1..3
```

判断逻辑：

```text
if task.status == RUNNING
and last_batch_started_at is not null
and now - last_batch_started_at > STALL_THRESHOLD_SEC
and (last_heartbeat_at is null or last_heartbeat_at < last_batch_started_at):
  show stall warning
```

卡住提示只用于观测，不应自动把任务改成失败。是否转为 `FAILED_EXECUTION` 由 mgmt-api 的执行超时策略决定。

## 7. row_map 与 cleanup

`data_builder_row_map` 是 cleanup 的行级依据。cleanup 必须以 `task_id` 为入口，不能只依赖业务 remark 盲删。

cleanup 状态：

```text
not_applicable|eligible|running|completed|blocked
```

cleanup 基本规则：

- `confirm=false` 必须拒绝执行。
- task 为 `RUNNING` 时 cleanup 必须 blocked，原因 `task_running`。
- `row_map_flush_lag > 0` 时 cleanup 默认 blocked，原因 `row_map_flush_lag`。
- cleanup 开始时写 `cleanup_status=running` 和 `cleanup_started_at`。
- cleanup 成功后写 `cleanup_status=completed`、`cleanup_completed_at`、`cleanup_completed_by`。
- cleanup 局部失败时写 `last_error_json`，不得误标为 completed。

执行顺序：

1. 按 `manifest.cleanup.plans.order` 升序执行。
2. 对 row_map 计划，按 `task_id + table + pk` 分块删除。
3. 对 hybrid 计划，优先 row_map 精确删除，再按产品策略决定是否执行 predicate fallback。

## 8. ErrorEnvelope

task 级错误写入 `data_builder_tasks.last_error_json`。  
batch 级错误写入 `data_builder_task_batches.last_error_json`。

建议结构：

```json
{
  "code": "DB_EXEC_TIMEOUT",
  "message": "execute-batch timed out",
  "details": {
    "task_id": "...",
    "batch_index": 0
  }
}
```

错误码应与 `error_codes.md` 保持一致。

## 9. R1 到 R4 迁移路径

```text
R1/PR-1: docs + DDL contract only
R2/PR-2: mgmt-api shadow persistence
R3/PR-3: mgmt-api db_primary orchestration
R4/PR-4: frontend persistent-task UX cutover
```

R1 验收只看合同是否清晰，不要求代码实现。
