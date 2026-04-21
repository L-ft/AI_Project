# R1 架构交付 Checklist

本清单用于评审 R1/PR-1：只冻结 Data Builder 持久化任务合同，不要求代码实现。

## DDL 合同

- [ ] `data_builder_tasks` 已明确为任务级 source of truth。
- [ ] `data_builder_task_batches` 已明确为批次级 source of truth。
- [ ] `data_builder_row_map` 已明确从属于 task/batch 执行链，并以 `task_id` 作为 cleanup 入口。
- [ ] `data_builder_tasks.completed_batches` 与 `rows_inserted_total` 被定义为反规范化缓存，而非唯一审计来源。

## 状态机

- [ ] task 状态枚举固定为 `PENDING|RUNNING|COMPLETED_OK|FAILED_ASSERTION|FAILED_EXECUTION`。
- [ ] batch 状态枚举与 task 状态枚举一致。
- [ ] cleanup 状态枚举固定为 `not_applicable|eligible|running|completed|blocked`。
- [ ] `completed_batches` 统计终态批次，包括 `COMPLETED_OK`、`FAILED_ASSERTION`、`FAILED_EXECUTION`。

## Ownership

- [ ] `mgmt-api` 被定义为 `db_primary` 模式下的任务状态写入点。
- [ ] `exec-engine` 被定义为受控执行器，不持久化或修改任务生命周期真相。
- [ ] 前端只负责提交、轮询和展示，不负责补写任务结果。
- [ ] `proxy|shadow|db_primary` 三种迁移模式已在文档中对齐。

## 安全与连接快照

- [ ] `mysql_conn_snapshot_json` 只允许非敏感字段。
- [ ] `mysql_conn_encrypted_json` 不允许通过公开 API 返回。
- [ ] R1 只冻结字段和安全边界，具体加密实现留到 R2/PR-2。

## 执行与事务

- [ ] `db_primary` 模式明确使用两段短事务。
- [ ] mgmt-api 不得持有 DB 行锁跨越 exec-engine HTTP 调用。
- [ ] task 级错误写入 `data_builder_tasks.last_error_json`。
- [ ] batch 级错误写入 `data_builder_task_batches.last_error_json`。

## 非目标确认

- [ ] R1 不改 `mgmt-api` 业务代码。
- [ ] R1 不改 `exec-engine` 执行代码。
- [ ] R1 不改前端。
- [ ] R1 不迁移 Scenario Runner。
- [ ] R1 不实现加密服务或密钥轮换。
