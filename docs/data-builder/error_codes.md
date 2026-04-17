# Data Builder — 错误码表（Error_Code_List）

约定：`code` 为全大写蛇形或 `DB_*` 前缀，HTTP 状态码与业务码分离——客户端以 `code` 分支逻辑。

## 1. 任务与清单（manifest / task）

| Code | HTTP | 含义 | 典型原因 |
|------|------|------|----------|
| `DB_TASK_MANIFEST_INVALID` | 400 | 任务清单不符合 `manifest_v1` Schema（exec-engine 校验） | 缺必填字段、枚举非法 |
| `DB_MANIFEST_INVALID` | 422 | mgmt-api **强校验**未通过（AJV + 硬约束） | 缺 `assertions` / `cleanup.plans`、Schema 错误；响应含 `fixes[]` |
| `DB_TASK_MYSQL_REQUIRED` | 400 | 创建任务未带 `mysql` 连接体 | 合同要求与 exec-engine 一致 |
| `DB_TASK_AMBIGUOUS_BODY` | 400 | 同时传 `prompt` 与 `manifest` | 二选一 |
| `DB_TASK_BODY_INVALID` | 400 | 未传 `prompt` 也未传 `manifest` | 空体 |
| `DB_TASK_MANIFEST_ASSERTION_POLICY` | 400 | 断言合同未满足 | `rowset` 缺主键列、SELECT 未含 PK、LIMIT 无法规范到 ≤20、与 `expect.kind` 不一致 |
| `DB_TASK_MANIFEST_VERSION` | 400 | 不支持的 `manifest_version` | 仅支持 `1.0` |
| `DB_TASK_NOT_FOUND` | 404 | `task_id` 不存在 | 拼写、过期清理 |
| `DB_TASK_STATE_CONFLICT` | 409 | 状态机不允许当前操作 | RUNNING 时重复执行、已 cleanup |
| `DB_TASK_BATCH_OUT_OF_RANGE` | 400 | `batch_index` 越界 | 大于 `batch_count-1` |
| `DB_TASK_BATCH_DUPLICATE` | 409 | 同一 `batch_index` 已完成且策略禁止重入 | 幂等策略可改为 200 并返回已执行 |

## 2. 执行层（SQL / 连接）→ `FAILED_EXECUTION`

与「断言业务不符」区分：**此处为引擎/语法/权限/超时**，数据可能部分写入，由任务详情中的 `batch_progress` 与审计日志判断。

| Code | HTTP | 含义 | 典型原因 |
|------|------|------|----------|
| `DB_EXEC_SQL_SYNTAX` | 502 | SQL 语法错误 | 模板展开失败、方言不兼容 |
| `DB_EXEC_SQL_REJECTED` | 400 | SQL 未通过白名单/危险语句拦截 | 非 INSERT、多语句未授权 |
| `DB_EXEC_CONNECTION` | 502 | 数据库连接失败 | 网络、池耗尽 |
| `DB_EXEC_PERMISSION` | 502 | 权限不足 | INSERT/SELECT 被拒 |
| `DB_EXEC_TIMEOUT` | 504 | 语句或连接超时 | 大批量、锁等待 |
| `DB_EXEC_DEADLOCK` | 503 | 死锁重试耗尽 | 需人工或退避重试 |
| `DB_EXEC_UNKNOWN` | 502 | 未分类执行错误 | 驱动返回原始 errno |

## 3. 断言（assertions）→ `FAILED_ASSERTION`

**数据默认保留**；任务状态为 `FAILED_ASSERTION`。用于「业务逻辑不符」或**断言 SQL 执行成功但结果不满足期望**。

| Code | HTTP | 含义 | 典型原因 |
|------|------|------|----------|
| `DB_AST_EXPECTATION_MISMATCH` | 200 | 断言结果与 `expect` 不一致 | 金额、状态机、时间序等 |
| `DB_AST_SQL_INVALID` | 502 | 断言 SQL 本身非法 | 仅 SELECT 规则被破坏后的兜底 |
| `DB_AST_SQL_REJECTED` | 400 | 断言 SQL 未通过只读守卫 | 含写操作或禁止关键字 |
| `DB_AST_RUNTIME_ERROR` | 502 | 断言 SELECT 执行失败 | 列不存在、类型错误 |
| `DB_AST_BINDING_MISSING` | 502 | 断言参数未解析 | 如 `:task_marker` 未注入 |

说明：`DB_AST_EXPECTATION_MISMATCH` 在 API 层可仍返回 **200**（batch 接口），由响应体 `status: FAILED_ASSERTION` 表达业务结果；若团队偏好统一 4xx，可映射为 422，但需在 OpenAPI 中固定。

## 4. 清理（cleanup）

| Code | HTTP | 含义 | 典型原因 |
|------|------|------|----------|
| `DB_CLEAN_CONFIRM_REQUIRED` | 400 | 未传 `confirm: true` | 防误触 |
| `DB_CLEAN_SQL_REJECTED` | 400 | DELETE 未通过守卫 | 缺 WHERE、非白名单 |
| `DB_CLEAN_PARTIAL` | 200 | 部分表删除失败 | 外键顺序、行已被删；`details` 逐表 |
| `DB_CLEAN_FORBIDDEN_WHILE_RUNNING` | 409 | 策略禁止 RUNNING 时清理 | 可配置 |

## 5. 侧车异步（row_map）

| Code | HTTP | 含义 | 典型原因 |
|------|------|------|----------|
| `DB_ROW_MAP_FLUSH_LAG` | 200 | 非致命：侧车队列有积压 | UI 可提示「清理前等待同步」 |
| `DB_ROW_MAP_FLUSH_FAILED` | 502 | 持久化侧车失败超过重试 | 需运维介入；清理应降级为 predicate-only 并告警 |

## 6. 合规

| Code | HTTP | 含义 |
|------|------|------|
| `DB_COMPLIANCE_PRODUCTION_SAMPLE` | 403 | 禁止生产行级采样未脱敏进入任务 |

---

**快速区分**

- **SQL 报错 / 连不上库** → `DB_EXEC_*` → 任务 `FAILED_EXECUTION`。
- **SELECT 能跑通但结果不对** → `DB_AST_EXPECTATION_MISMATCH` → 任务 `FAILED_ASSERTION`（数据保留）。
