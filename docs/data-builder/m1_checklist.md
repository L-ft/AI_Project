# M1 架构交付 Checklist（日会 / 周报）

与 `l4_prd.md`、`openapi_core.yaml` v0.3 对齐。

## 活文档（Swagger）

- [ ] mgmt-api 启动后可打开 **`http://<host>:3000/api/docs`**（加载 `docs/data-builder/openapi_core.yaml`）。
- [ ] `POST/GET /data-builder/tasks` 在文档中可见 **Request/Response 示例**（含 `runtime`、`422`）。

## Schema 与仓库

- [ ] `manifest_v1.schema.json` 在 Git 中；mgmt-api 使用 `src/data-builder/manifest_v1.schema.json`（或 `MANIFEST_SCHEMA_PATH`）。
- [ ] 前端构建若需 Schema，路径与 CI 一致（可选：从 `docs/` 拷贝）。

## 状态机

- [ ] `task_status` 枚举在全栈一致：`PENDING` | `RUNNING` | `COMPLETED_OK` | `FAILED_ASSERTION` | `FAILED_EXECUTION`（OpenAPI `TaskStatus`、exec-engine、TS `TaskStatusL3`）。

## 心跳

- [ ] **建议**：`last_heartbeat_at` / `last_batch_started_at` 由 **mgmt-api 编排层**在调用 exec-engine 前后更新（当前 PoC 可由 exec-engine 回写内存任务，生产以任务表为准）。
- [ ] 文档与实现已标注「权威写入点」，避免双写冲突。

## 强校验

- [ ] AI 或 Prompt 草稿 → **必须先过** mgmt-api `ManifestValidateService`，**422** 禁止落库与转发。
- [ ] 错误体含 **`fixes`**（见 `ManifestValidationError`）。

## 清理与安全

- [ ] `CleanupService`（exec-engine）chunk **500**、侧车 `task_id` 隔离；predicate 路径仅替换 `:task_marker`。
- [ ] 单元测试覆盖 chunk 删除与空任务（待补全）。

## 并行开发催办（PM）

- [ ] **前端**：拿到 `task_id` 后做详情页 **进度条** + **`runtime.assertion_summary.total/passed`**。
- [ ] **后端**：`CleanupService` 单测作为安全底线。
- [ ] **AI 组**：按 DDL 调 Prompt，使输出 **稳过** Schema。
