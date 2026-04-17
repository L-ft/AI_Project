# 分片执行、任务状态机与侧车 PoC（编排层）

## 1. 任务状态枚举（冻结）

| 状态 | 含义 |
|------|------|
| `PENDING` | 已创建，未执行任何 batch |
| `RUNNING` | 至少一个 batch 在执行或已执行但未终态 |
| `COMPLETED_OK` | 全部 batch 成功且断言通过 |
| `FAILED_ASSERTION` | 数据已落库，断言未通过；**保留现场** |
| `FAILED_EXECUTION` | 语法/连接/权限等执行失败；可能部分 batch 已写入 |

断言失败 **不** 自动回滚或自动删除数据；用户通过 `POST .../cleanup` 在排查后清理。

## 2. 分片执行与前端轮询

### 2.1 流程

1. `POST /data-builder/tasks` → 返回 `task_id`，`PENDING`。
2. 前端循环 `batch_index = 0 .. batch_count-1`：
   - `POST /data-builder/tasks/{taskId}/execute-batch` body `{ "batch_index": n }`
   - 若响应 `status` 为 `FAILED_EXECUTION`，停止循环并展示 `last_error`。
3. 每步之间（或仅最终步后）前端可 `GET /data-builder/tasks/{taskId}` 刷新进度条。
4. 当最后一批完成且断言在服务端跑完：
   - 全部通过 → `COMPLETED_OK`
   - 任一失败 → `FAILED_ASSERTION`（响应体中带 `assertion_summary`）

### 2.2 超时

- 单个 `execute-batch` 请求应有独立超时（略大于单批 SQL 预算）；**不要**用一次请求覆盖全量行。
- 前端对 `GET` 使用轮询间隔 1s～3s（可退避），展示 `batch_progress` 与 `row_map_flush_lag`。

### 2.3 幂等

- 建议对 `(task_id, batch_index)` 做「已完成则短路」：重复 POST 返回 200 + 已执行标记，避免前端重试导致双倍插入（具体以编排层实现为准）。

## 3. 侧车 + 备注：PoC 闭环（不重构 exec-engine 核心）

**原则**：INSERT 的实际执行可在现有 exec-engine 或 mgmt-api 直连 MySQL 的「薄适配器」中完成；**侧车写入与备注注入**优先放在 **mgmt-api 编排层** 的同一事务或紧随其后的逻辑中，避免深入修改 exec-engine 内部。

### 3.1 备注注入（方案 A 变体）

- 若 `fingerprint.strategy` 含 `remark_only` 或 `remark_and_row_map`：
  - 在生成绑定数据时，将 `marker` 解析为具体字符串（如 `DB_TASK_{uuid}`），写入 `remark_column`。
  - 若业务 remark 已有内容，使用 `merge_mode: append`（manifest 的 binding `params`）避免覆盖。

### 3.2 侧车异步（无备注列时）

- INSERT 成功后，编排层将 `(task_id, db, table, pk_columns, pk_values, batch_index, row_index)` 推入 **内存队列**。
- 后台 worker（或每 N 毫秒 flush）批量 `INSERT INTO data_builder_row_map ...`。
- `GET task` 返回 `row_map_flush_lag`（队列长度），清理前若 `lag > 0` 可提示用户稍后或阻塞 cleanup（产品策略二选一）。

### 3.3 主键提取（PoC 级拦截器思路）

**Python 示例（仅说明意图；实现可放在 mgmt-api 的 TypeScript 等价管线中）**：

```python
# PoC: after cursor.execute(insert_sql, params)
last_id = cursor.lastrowid  # 单 AUTO_INCREMENT PK
# 复合主键：使用驱动返回的 OK_PACKET 或再 SELECT 限定 task_marker / 时间窗（PoC 可只支持单列 PK）
```

**装饰器形态（概念）**：

```python
def with_row_map(task_id: str, batch_index: int, table: str, pk_columns: list[str]):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            result = fn(*args, **kwargs)
            schedule_async_row_map(task_id, table, pk_columns, extract_pk(result), batch_index)
            return result
        return wrapper
    return decorator
```

生产实现建议：**编排层显式函数** `record_row_map(...)` 优于魔法装饰器，便于审计与单测。

### 3.4 清理顺序

- `hybrid`：`cleanup.plans` 按 `order` 升序执行 DELETE；同时可用 `data_builder_row_map` 生成 `WHERE (pk_col,...) IN (...)` 分批删除，避免遗漏无 remark 行。

## 4. 与 OpenAPI 的对应关系

详见 `openapi_core.yaml` 中四个路径；状态与错误体字段与 `error_codes.md` 一致。

## 5. 分片执行超时与看板「灰条」逻辑（伪代码）

**常量**

- `BATCH_HTTP_TIMEOUT_SEC`：对单次 `POST .../execute-batch` 的客户端超时（建议 ≥ 略大于 exec-engine 单批预算，如 60）。
- `STALL_THRESHOLD_SEC`：轮询侧判定「本批挂死」阈值（需求：30s），与 HTTP 超时配合使用。
- `POLL_INTERVAL_SEC`：前端轮询 `GET task` 间隔（1～3s，可退避）。

**编排层：`execute-batch` 入口（单一写入点）**

```
function onExecuteBatchRequest(task_id, batch_index):
    task = loadTask(task_id)
    assertStateAllowsBatch(task, batch_index)

    now = utc_now()
    task.last_batch_started_at = now
    persist(task)

    try:
        // 客户端应对同一请求设置 BATCH_HTTP_TIMEOUT_SEC
        result = execEngine.runBatch(task_id, batch_index)  // 同步：INSERT + 侧车入队等
    except TimeoutOrUnavailable:
        task.last_error = mapToErrorEnvelope(DB_EXEC_TIMEOUT, ...)
        task.status = FAILED_EXECUTION  // 或保持 RUNNING 由产品定；须文档化
        persist(task)
        return errorResponse

    task.last_heartbeat_at = utc_now()   // 每批 SQL 成功回调后更新（仅此路径写入）
    task.completed_batches = ...
    task.current_batch_index = batch_index
    persist(task)

    if isFinalBatch(task, batch_index):
        runAssertions(task)
    return okResponse
```

**前端：单次分片请求**

```
function executeBatchHttp(task_id, batch_index):
    try:
        return await post(`/tasks/${task_id}/execute-batch`, { batch_index },
            timeout: BATCH_HTTP_TIMEOUT_SEC)
    catch (isTimeout):
        showBanner("执行引擎响应超时，请检查后端进程或数据库锁")
        // 进度条置灰；可提示用户查看 last_batch_started_at / 运维日志
```

**前端：轮询看板（双信号）**

```
function onPollTick(taskDetail):
    if taskDetail.status not in (RUNNING, PENDING):
        clearStallBanner()
        return

    now = nowUtc()
    started = taskDetail.last_batch_started_at
    heartbeat = taskDetail.last_heartbeat_at

    // 信号 A：本批已发起但长时间未成功回调（编排层已写 started_at，heartbeat 未推进）
    if started != null and taskDetail.status == RUNNING:
        if now - started > STALL_THRESHOLD_SEC:
            if heartbeat == null or heartbeat < started:
                showStallBanner("执行可能挂死：已超过阈值未收到本批成功心跳")
                return

    // 信号 B：多批间隙「空闲等待」——仅当未发 in-flight 请求时，started_at 未刷新属正常；
    // 产品可选：若 RUNNING 且无 in-flight 且 completed_batches < batch_count，展示「等待下一批」而非挂死。
    clearStallBanner()
```

**rowset 断言执行（服务端）**

```
function normalizeRowsetAssertionSql(sql, manifestRule):
    assert manifestRule.assertion_type == "rowset"
    assert all(pk in parsedSelectColumns(sql) for pk in manifestRule.primary_key_columns)
    sql2 = ensureLimitAtMost(sql, 20)   // 无 LIMIT 则追加；有则改为 LEAST(n,20)
    return sql2

function runRowsetEmpty(rule, ctx):
    rows = db.query(normalizeRowsetAssertionSql(rule.sql, rule), ctx.bindings)
    if len(rows) == 0:
        return AssertionRunItem(passed=true, sample_rows=null)
    return AssertionRunItem(passed=false, sample_rows=rows, truncated=(hadMoreThan20))
```

## 6. CleanupService（专项，与 cleanup.plans 顺序一致）

**职责**：从 `data_builder_row_map` 按 `task_id` 拉取 PK，按 `manifest.cleanup.plans` 的 `order` 升序执行 **chunked_delete**；与 `predicate` 计划组合时，同一 `order` 组内先 row_map 再 predicate（与 `hybrid` 语义一致，具体以实现为准）。

**幂等与审计**

```
function cleanup(task_id, confirm, actor):
    if not confirm: raise DB_CLEAN_CONFIRM_REQUIRED
    task = loadTask(task_id)
    if task.cleanup_status.state == completed:
        return CleanupResponse(idempotent_replay=true, deleted_by_table={})

    if task.status == RUNNING:
        task.cleanup_status = { state: blocked, blocked_reason: task_running }
        persist(task)
        raise DB_CLEAN_FORBIDDEN_WHILE_RUNNING

    if task.row_map_flush_lag > 0:
        task.cleanup_status = { state: blocked, blocked_reason: row_map_flush_lag }
        persist(task)
        // 或仍允许仅 predicate 路径；产品策略二选一，须与 OpenAPI 对齐

    deleted = {}
    for plan in sorted(task.manifest.cleanup.plans, key=order):
        if plan.source == row_map or hybridUsesRowMap(plan):
            for chunk in chunked(selectPkRows(task_id, plan.table), CHUNK_SIZE):
                deleted[plan.table] += execDeleteByPkChunk(plan.table, chunk)
        else:
            deleted[plan.table] += execDeleteByPredicate(plan)

    task.cleanup_status = { state: completed, blocked_reason: null }
    task.cleanup_completed_at = now()
    task.cleanup_completed_by = actor
    persist(task)
    return CleanupResponse(deleted_by_table=deleted, ...)
```

部分失败时：记录 `DB_CLEAN_PARTIAL`，写入 `last_error_json` 子集，**不**将 `cleanup_status` 标为 `completed`，以支持重试。
