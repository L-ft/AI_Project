-- data_builder_row_map
-- Inserted-row trace table for Data Builder cleanup.
-- This table belongs to the data_builder_tasks / data_builder_task_batches execution chain.
-- Cleanup must start from task_id and cleanup plans; remark-only deletion must not be the only source of truth.
-- The table may live in the target MySQL database or an operations database, depending on deployment policy.

CREATE TABLE IF NOT EXISTS `data_builder_row_map` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  `task_id` CHAR(36) NOT NULL
    COMMENT 'UUID v4 task id from mgmt-api / data_builder_tasks',

  `db_name` VARCHAR(128) NOT NULL
    COMMENT 'Logical database name at insert time',

  `table_name` VARCHAR(128) NOT NULL
    COMMENT 'Physical table name',

  `pk_columns` JSON NOT NULL
    COMMENT 'JSON array of PK column names in order, e.g. ["id"]',

  `pk_values` JSON NOT NULL
    COMMENT 'JSON array of PK values in same order as pk_columns',

  `batch_index` INT NOT NULL DEFAULT 0
    COMMENT 'Shard / batch index from manifest batching',

  `row_index` INT NOT NULL DEFAULT 0
    COMMENT 'Row index within batch, 0-based',

  `statement_fingerprint` CHAR(64) NULL
    COMMENT 'Optional SHA-256 hex of normalized INSERT text for idempotency/debug',

  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_task_batch` (`task_id`, `batch_index`),
  KEY `idx_task_table` (`task_id`, `db_name`, `table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Data Builder: maps inserted rows to tasks for precise cleanup';
