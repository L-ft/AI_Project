-- data_builder_task_batches
-- Batch-level runtime truth for Data Builder tasks.
-- Parent task lifecycle lives in data_builder_tasks; per-batch progress and failures live here.
-- mgmt-api owns state transitions; exec-engine does not persist batch truth directly.

CREATE TABLE IF NOT EXISTS `data_builder_task_batches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  `task_id` CHAR(36) NOT NULL
    COMMENT 'Parent task id from data_builder_tasks',

  `batch_index` INT NOT NULL
    COMMENT '0-based batch index derived from manifest batching',

  `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING'
    COMMENT 'PENDING|RUNNING|COMPLETED_OK|FAILED_ASSERTION|FAILED_EXECUTION',

  `rows_inserted` BIGINT NOT NULL DEFAULT 0
    COMMENT 'Rows inserted by this batch; dry-run stays 0',

  `attempt_count` INT NOT NULL DEFAULT 0
    COMMENT 'Incremented each time mgmt-api claims this batch for execution or retry',

  `started_at` TIMESTAMP(3) NULL
    COMMENT 'Set when mgmt-api transitions this batch to RUNNING',

  `last_heartbeat_at` TIMESTAMP(3) NULL
    COMMENT 'Updated after successful exec-engine progress/return for this batch',

  `finished_at` TIMESTAMP(3) NULL
    COMMENT 'Set when this batch reaches terminal state',

  `idempotency_key` VARCHAR(128) NULL
    COMMENT 'Reserved for dedupe / safe retry of repeated execute-batch calls',

  `last_error_json` JSON NULL
    COMMENT 'ErrorEnvelope for this batch only',

  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_batch` (`task_id`, `batch_index`),
  KEY `idx_task_status` (`task_id`, `status`),
  KEY `idx_task_updated` (`task_id`, `updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Data Builder: persistent per-batch runtime state';
