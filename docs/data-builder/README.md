# Data Builder 架构合同与 R1 落地说明

本目录是 **Task Manifest v1、持久化任务模型、执行编排边界** 的单一事实来源。R1/PR-1 只冻结合同和 DDL，不改业务代码、不切换运行链路。

## 文件索引

| 文件 | 说明 |
|------|------|
| `manifest_v1.schema.json` | Manifest v1 JSON Schema，约束 AI 输出、API body 与人工编辑结果 |
| `manifest_v1.json` | Manifest v1 交付样例 |
| `manifest_v1.example.json` | Manifest v1 示例副本，便于引用和 diff |
| `table_ddl.sql` | 插入行追踪表 `data_builder_row_map`，为 cleanup 提供行级依据 |
| `task_table_ddl.sql` | 主任务表 `data_builder_tasks`，保存任务级生命周期、连接快照、迁移模式、cleanup 状态、断言结果与进度缓存 |
| `task_batch_table_ddl.sql` | 批次表 `data_builder_task_batches`，保存 per-batch 状态、心跳、重试次数和单批错误 |
| `openapi_core.yaml` | 核心 API 合同 |
| `error_codes.md` | 错误码合同，区分执行失败、断言失败、cleanup 失败等 |
| `execution_and_poc.md` | 执行模式、状态流转、迁移路径与 PoC 约束 |
| `l4_prd.md` | L4 产品与架构承诺 |
| `m1_checklist.md` | M1/R1 验收清单 |

## Ownership / Source of Truth

| 层级 | 职责 |
|------|------|
| `mgmt-api` | 任务创建、任务持久化、Manifest 校验、AI -> Manifest、状态流转、批次编排、cleanup 编排、公开查询 API |
| `exec-engine` | 受控执行器。只执行内部 batch/cleanup 请求并返回结果，不拥有任务生命周期真相 |
| `frontend` | 提交请求、展示状态、轮询详情。前端不持有任务状态真相，也不负责补写任务结果 |

R1 冻结目标：后续 `GET task` 的公开结果必须能从持久化 DB 状态解释，不能依赖 exec-engine 进程内存对象。

## Route Boundary (P2 clarification)

- Public lifecycle contract: `mgmt-api /api/v1/data-builder/tasks*`
- Internal stateless executor: `exec-engine /api/v1/data-builder/internal/*`
- Deprecated fallback only: `exec-engine /api/v1/data-builder/tasks*`
- Frontend and new integrations must not call exec-engine legacy lifecycle routes directly.
- `mgmt-api` logs `DB_LEGACY_LIFECYCLE_FALLBACK` whenever it still has to call the deprecated exec-engine lifecycle surface.

## Persistent Task Model

| 对象 | 表 | 说明 |
|------|----|------|
| 任务级真相 | `data_builder_tasks` | 生命周期状态、Manifest 快照、MySQL 连接快照、迁移模式、cleanup 状态、任务级错误、断言结果、进度缓存 |
| 批次级真相 | `data_builder_task_batches` | `task_id + batch_index` 下的状态、心跳、单批写入量、重试次数、单批错误 |
| 插入行级真相 | `data_builder_row_map` | 记录任务插入了哪些业务行，cleanup 按 `task_id` 拉取并分批删除 |

`data_builder_tasks.completed_batches`、`rows_inserted_total`、`current_batch_index` 是列表页和轮询页使用的反规范化缓存。可审计明细以 `data_builder_task_batches` 和 `data_builder_row_map` 为准。

`data_builder_tasks.assertion_evaluated` 和 `assertion_runs_json` 保存最终批次后的断言评估结果，避免 `db_primary` 模式下任务详情依赖 exec-engine 内存状态。

## 状态枚举

任务和批次共用状态枚举：

```text
PENDING
RUNNING
COMPLETED_OK
FAILED_ASSERTION
FAILED_EXECUTION
```

cleanup 独立状态枚举：

```text
not_applicable
eligible
running
completed
blocked
```

`completed_batches` 定义为终态批次数，包含 `COMPLETED_OK`、`FAILED_ASSERTION`、`FAILED_EXECUTION`。这样失败任务也能解释“执行到哪一批结束”，不会让进度永久停在非终态。

## MySQL 连接快照

`data_builder_tasks.mysql_conn_snapshot_json` 只允许保存非敏感字段，例如 `host`、`port`、`user`、`database`、连接选项。

`data_builder_tasks.mysql_conn_encrypted_json` 保存加密后的 secret payload 或密码密文，公开 API 禁止返回该字段。

R1 只冻结字段和安全边界；具体加密算法、密钥管理和轮换策略在 R2/PR-2 实现。

## Migration Modes

| mode | create | read | execute-batch | cleanup | source of truth |
|------|--------|------|---------------|---------|-----------------|
| `proxy` | exec-engine | exec-engine | exec-engine | exec-engine | exec-engine memory |
| `shadow` | exec-engine + mgmt-api mirror | mgmt-api first, fallback exec-engine | exec-engine | exec-engine | mgmt-api mirror |
| `db_primary` | mgmt-api | mgmt-api | mgmt-api orchestrates internal exec-engine call | mgmt-api orchestrates internal exec-engine call | mgmt-api DB |

R1 只定义这些模式。R2/PR-2 进入 `shadow`，R3/PR-3 进入 `db_primary`，R4/PR-4 再调整前端持久化任务心智。
当前运行时默认模式应为 `db_primary`；`proxy` / `shadow` 仅作为兼容或回滚路径保留。

## R1 非目标

- 不改 `mgmt-api` 业务代码。
- 不改 `exec-engine` 执行代码。
- 不改 `frontend`。
- 不迁移 Scenario Runner。
- 不把 LLM 编排逻辑塞进 exec-engine。

## R1 验收口径

- 主任务表、批次表、row_map 三层关系清晰。
- `mgmt-api` 和 `exec-engine` ownership 清晰。
- 任务状态、批次状态、cleanup 状态枚举清晰。
- MySQL 连接快照的敏感字段边界清晰。
- `proxy -> shadow -> db_primary` 迁移路径清晰。
- Manifest 是输入快照，运行时遥测不得写回 Manifest。
