-- data_builder_tasks — mgmt-api 编排层任务与运行时遥测（非 Manifest 正文）
-- 与 manifest 分库存储时可调整库名；须与 OpenAPI TaskDetailResponse 字段对齐。

CREATE TABLE IF NOT EXISTS `data_builder_tasks` (
  `task_id` CHAR(36) NOT NULL COMMENT 'UUID v4',
  `status` VARCHAR(32) NOT NULL COMMENT 'PENDING|RUNNING|COMPLETED_OK|FAILED_ASSERTION|FAILED_EXECUTION',
  `manifest_json` JSON NOT NULL COMMENT 'manifest_v1 快照（版本化由业务策略决定）',
  `batch_count` INT NOT NULL DEFAULT 0,
  `completed_batches` INT NOT NULL DEFAULT 0,
  `current_batch_index` INT NULL COMMENT '当前正在执行或最近完成的 batch_index',
  `rows_inserted_total` BIGINT NOT NULL DEFAULT 0,
  `last_heartbeat_at` TIMESTAMP(3) NULL COMMENT '每批 exec 成功回调后由编排层单一写入点更新',
  `last_batch_started_at` TIMESTAMP(3) NULL COMMENT '收到 execute-batch 并开始调用 exec-engine 时更新',
  `row_map_flush_lag` INT NOT NULL DEFAULT 0 COMMENT '侧车异步队列积压条数（估算）',
  `cleanup_status` VARCHAR(32) NOT NULL DEFAULT 'not_applicable'
    COMMENT 'not_applicable|eligible|completed|blocked',
  `cleanup_blocked_reason` VARCHAR(64) NULL COMMENT '如 row_map_flush_lag, task_running',
  `last_error_json` JSON NULL COMMENT 'ErrorEnvelope 结构',
  `cleanup_completed_at` TIMESTAMP(3) NULL,
  `cleanup_completed_by` VARCHAR(128) NULL COMMENT '用户 id 或服务账号',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`task_id`),
  KEY `idx_status_updated` (`status`, `updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Data Builder: task runtime and dashboard telemetry';
