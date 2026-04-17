# L4 一页纸 PRD（任务落库 + AI 填 Manifest）

**版本**：0.1（与 `openapi_core.yaml` v0.2、`manifest_v1` 对齐）  
**状态**：合同基线；实现以 mgmt-api 编排层为主，exec-engine 保持受控执行。

---

## 1. 产品目标

在 **L3 闭环**（分片执行、断言、指纹/侧车、确认清理）之上，提供 **可审计、可恢复、可运营** 的企业级造数任务能力：**任务必须持久化**；**Manifest 必须由 AI（或经 AI 辅助的 ChatOps）在 mgmt-api 侧生成/修订并校验后再落库**，避免「只存在于浏览器或执行进程内存」的草稿任务。

---

## 2. 必须坚持（非协商项）

| 项 | 要求 |
|----|------|
| **任务落库** | 每个任务在创建成功后写入 **`data_builder_tasks`**（见 `task_table_ddl.sql`），`task_id` 全局唯一；状态、进度、心跳、`cleanup_status`、`last_error_json` 等与 OpenAPI `TaskDetailResponse` 对齐，**不得仅依赖 exec-engine 内存**。 |
| **AI 填 Manifest** | 「自然语言 / 指令 → `manifest_v1`」在 **mgmt-api** 完成：调用模型、解析 JSON、`manifest_v1.schema.json` 校验、可选人机确认后再 `POST` 创建任务；exec-engine **不承担** LLM 编排与指令理解。 |
| **合规** | `meta.compliance.production_row_sampling` **恒为 false**；不依赖生产库采样作为默认路径（与 `README.md` 边界一致）。 |

---

## 3. 范围（L4 做什么）

- **编排与单一写入点**：`execute-batch`、心跳、`last_batch_started_at` / `last_heartbeat_at` 的更新规则与 `execution_and_poc.md` 一致；exec-engine 仅执行白名单内的批处理与断言调用（或等价适配器），**状态真相以 mgmt-api 持久化任务行为准**。
- **侧车策略**：`row_map` 异步 flush、`row_map_flush_lag`、清理前是否阻塞等产品策略在编排层实现并写入任务行；与 `CleanupService` chunked delete 语义一致。
- **错误与可观测**：错误体与 `error_codes.md` 一致；支持轮询、挂死提示、清理幂等与部分失败重试（见 `execution_and_poc.md` §6）。
- **可选增强（规划）**：在不合规前提下逼近业务分布的「分布克隆」、更丰富的断言编排——仍放在 mgmt-api，不扩张 exec-engine 核心路径。

---

## 4. 非目标（L4 不做什么）

- 不在 exec-engine 内嵌大模型或长链路 Agent。
- 不把运行时遥测（心跳、`cleanup_status` 等）写回 **Manifest JSON 正文**（见 `openapi_core.yaml`：遥测在任务表）。
- 不默认打开生产环境行级采样；若未来引入 masking-service，须单独安全评审与开关。

---

## 5. 与 L3 / exec-engine 的边界

| 层级 | 职责 |
|------|------|
| **L4（mgmt-api）** | 任务 CRUD 与持久化、AI → Manifest、校验、调用下游执行、更新任务状态与遥测、侧车异步与清理编排。 |
| **L3（exec-engine）** | 受控执行：`validate_manifest`、按批 INSERT、断言执行、`row_map` 写入、cleanup SQL 等（保持「哑管道」或可替换适配器）。 |

**接口契约**：对外仍以 `openapi_core.yaml` 四个核心路径为准；mgmt-api 为权威实现，exec-engine 为执行后端（URL 由 `EXEC_ENGINE_URL` 等配置）。

---

## 6. 关键数据对象

- **`data_builder_tasks`**：任务主表与遥测（`task_table_ddl.sql`）。
- **`data_builder_row_map`**：插入行与 `task_id` 映射，清理数据源（`table_ddl.sql`）。
- **Manifest**：`manifest_v1.schema.json`；创建请求体中的 `manifest` + `mysql` 连接体与现网一致。

---

## 7. 建议里程碑（交付节奏）

1. **M1**：mgmt-api 落库任务表 + 创建/查询/列表与 exec-engine 代理一致；前端可选只走 `/api/v1/data-builder/*`。  
2. **M2**：AI 填 Manifest（结构化输出 + Schema 校验 + 审计日志）；失败可重试与人工编辑。  
3. **M3**：编排层完整心跳与 `cleanup_status` 策略；侧车 lag 与清理阻塞规则产品化。  
4. **M4**（可选）：分布克隆与高级断言仅在 mgmt-api 扩展。

---

## 8. 验收要点（摘要）

- 重启 exec-engine **不丢失**任务记录；已创建任务的 `task_id` 仍可查询（状态可能需与下游对齐）。  
- 任意经 AI 产生的 Manifest **均通过** `manifest_v1` Schema 校验后方可持久化。  
- 清理与断言语义与 `error_codes.md`、OpenAPI 描述一致，可演示完整「创建 → 分片执行 → 断言失败保留现场 → 确认清理」。

---

*本文档为 `docs/data-builder` 内对 L4 的产品与架构承诺摘要；细节以 `openapi_core.yaml`、`execution_and_poc.md` 为准。*
