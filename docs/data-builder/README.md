# Data Builder — 架构合同与 PoC 说明

本目录为 **Task Manifest v1** 与各端契约的单一事实来源（Vue / mgmt-api / AI 输出解析）。

## 文件索引

| 文件 | 说明 |
|------|------|
| `manifest_v1.schema.json` | JSON Schema 合同（校验 AI 输出与 API body） |
| `manifest_v1.json` | **交付名**：样板实例（与 `.example.json` 内容一致） |
| `manifest_v1.example.json` | 同上副本，便于 diff 与引用 |
| `table_ddl.sql` | 侧车表 `data_builder_row_map` 最终 DDL |
| `task_table_ddl.sql` | 任务表 `data_builder_tasks`：运行时遥测与 `cleanup_status`（勿写入 Manifest） |
| `openapi_core.yaml` | 四个核心接口的 OpenAPI 3 定义 |
| `error_codes.md` | 错误码：区分执行失败 vs 断言业务不符 |
| `execution_and_poc.md` | 分片轮询、任务状态机、侧车 PoC（编排层，不碰 exec-engine 核心） |
| `l4_prd.md` | **L4 一页纸 PRD**：任务落库 + AI 填 Manifest（必须坚持项）、范围与非目标、与 L3 边界 |
| `m1_checklist.md` | **M1 交付 Checklist**：Swagger、Schema、状态机、心跳、校验、Cleanup |

## 边界（用户叮嘱）

- **L3/L4 软实现**：断言、指纹、克隆分布的「智能」逻辑放在 **mgmt-api 任务编排层**；exec-engine 保持「受控执行」能力即可，避免改动其核心路径。
- **无生产采样**：无 masking-service 时，manifest `meta.compliance.production_row_sampling` 恒为 false。
