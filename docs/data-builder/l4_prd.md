# L4 PRD：Data Builder 持久化任务与编排边界

**版本**：R1 合同冻结版  
**状态**：文档与 DDL 基线；实现从 R2/PR-2 开始  
**核心原则**：任务真相归 mgmt-api，执行动作归 exec-engine，运行时遥测不得写回 Manifest。

## 1. 产品目标

在 L3 分片执行、断言、row_map、cleanup 的基础上，提供可审计、可恢复、可运营的企业级造数任务能力。

R1 的目标不是立刻切换运行链路，而是先冻结以下合同：

- 任务必须可持久化。
- 批次状态必须可持久化。
- cleanup 状态必须闭环。
- MySQL 连接快照必须有安全边界。
- mgmt-api 与 exec-engine 的职责必须清晰。

## 2. 必须坚持

| 项 | 要求 |
|----|------|
| 任务落库 | 创建成功的任务必须有 `data_builder_tasks` 主记录。后续 `db_primary` 模式下，`task_id` 由 mgmt-api 生成 |
| 批次落库 | 每个 batch 必须有 `data_builder_task_batches` 子记录，使用 `task_id + batch_index` 唯一识别 |
| 状态闭环 | `GET task` 的状态、进度、错误和 cleanup 信息必须能从 DB 解释，不能依赖 exec-engine 内存对象 |
| Manifest 边界 | `manifest_json` 是输入快照，不是运行时状态容器。心跳、进度、错误、cleanup 状态不得写回 Manifest |
| 连接快照 | MySQL 密码不得进入 `mysql_conn_snapshot_json`；密文或 secret payload 只能进入 `mysql_conn_encrypted_json`，且公开 API 禁止返回 |
| AI -> Manifest | 自然语言到 Manifest 的生成、解析、校验与人工确认归 mgmt-api；exec-engine 不承担 LLM 编排职责 |
| 合规默认值 | `meta.compliance.production_row_sampling` 默认 false；不以生产采样作为默认路径 |

## 3. 范围

R1/PR-1 只做合同冻结：

- 更新 `data_builder_tasks` DDL。
- 新增 `data_builder_task_batches` DDL。
- 明确 `data_builder_row_map` 与 task/batch 的关系。
- 明确 `proxy|shadow|db_primary` 三种迁移模式。
- 明确 MySQL 连接快照字段和脱敏规则。
- 明确 task/batch/cleanup 状态枚举。

R2/PR-2 才进入 `shadow` 持久化实现。  
R3/PR-3 才进入 `db_primary` 编排切换。  
R4/PR-4 才调整前端对持久化任务的文案和状态行为。

## 4. 非目标

- R1 不改后端业务代码。
- R1 不改前端页面。
- R1 不迁移 Scenario 执行链。
- R1 不实现加密服务、密钥轮换或 secret manager。
- R1 不把 LLM 或长链路 Agent 放入 exec-engine。
- R1 不新增生产数据采样能力。

## 5. 数据对象

| 对象 | 表 | 职责 |
|------|----|------|
| Task | `data_builder_tasks` | 任务级生命周期、Manifest 快照、连接快照、迁移模式、cleanup 状态、进度缓存、任务级错误 |
| Batch | `data_builder_task_batches` | 批次级状态、心跳、写入行数、重试次数、批次级错误 |
| Row map | `data_builder_row_map` | 插入行追踪，cleanup 按 `task_id` 与 cleanup plan 执行删除 |

主表中的 `completed_batches`、`rows_inserted_total` 是反规范化缓存。可审计明细以 batch 表和 row_map 为准。

## 6. 状态机

任务状态：

```text
PENDING -> RUNNING -> COMPLETED_OK
PENDING -> RUNNING -> FAILED_ASSERTION
PENDING -> RUNNING -> FAILED_EXECUTION
```

批次状态与任务状态共用枚举：

```text
PENDING|RUNNING|COMPLETED_OK|FAILED_ASSERTION|FAILED_EXECUTION
```

cleanup 状态：

```text
not_applicable -> eligible -> running -> completed
eligible -> blocked
running -> blocked
```

`FAILED_ASSERTION` 表示数据已经落库但断言失败，应保留现场，不能自动 rollback 或自动 cleanup。

## 7. mgmt-api 与 exec-engine 边界

| 层级 | 职责 |
|------|------|
| mgmt-api | 任务 CRUD、任务持久化、AI -> Manifest、Manifest 校验、状态流转、批次编排、cleanup 编排、公开查询 API |
| exec-engine | 受控执行器。执行内部 batch/cleanup 请求，返回 rows/assertion/error 结果，不拥有任务生命周期真相 |

`db_primary` 模式下，mgmt-api 调用 exec-engine 时必须使用短事务模型：

1. 事务 A：claim task/batch，写入 `RUNNING`、`last_batch_started_at`。
2. 事务外：调用 exec-engine 内部执行接口。
3. 事务 B：根据执行结果写入终态、进度、心跳和错误。

mgmt-api 不得持有数据库行锁跨越 exec-engine HTTP 调用。

## 8. 验收要点

- exec-engine 重启后，已创建任务的元数据仍可查询。
- `GET task` 可以从 DB 中解释任务状态和进度。
- 每个 batch 有持久化状态，可定位失败批次。
- cleanup 有 `eligible/running/completed/blocked` 闭环。
- 公开任务详情 API 不返回 `mysql_conn_encrypted_json`。
- Manifest 只作为输入快照，不承载运行时遥测。
- R1 文档能直接指导 R2 shadow persistence 和 R3 orchestration cutover。
