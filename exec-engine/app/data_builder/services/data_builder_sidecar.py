"""侧车表 DDL 与初始化（与 docs/data-builder/table_ddl.sql 对齐）。"""

from __future__ import annotations

SIDE_CAR_DDL = """
CREATE TABLE IF NOT EXISTS `data_builder_row_map` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` CHAR(36) NOT NULL COMMENT 'UUID v4 task id from mgmt-api',
  `db_name` VARCHAR(128) NOT NULL COMMENT 'Logical database name at insert time',
  `table_name` VARCHAR(128) NOT NULL COMMENT 'Physical table name',
  `pk_columns` JSON NOT NULL COMMENT 'JSON array of PK column names in order',
  `pk_values` JSON NOT NULL COMMENT 'JSON array of PK values in same order as pk_columns',
  `batch_index` INT NOT NULL DEFAULT 0 COMMENT 'Shard / batch index from manifest batching',
  `row_index` INT NOT NULL DEFAULT 0 COMMENT 'Row index within batch (0-based)',
  `statement_fingerprint` CHAR(64) NULL COMMENT 'Optional SHA-256 hex of normalized INSERT text',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_task_table` (`task_id`, `db_name`, `table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Data Builder: maps inserted rows to tasks for async cleanup';
"""


def ensure_row_map_table(cur) -> None:
    cur.execute(SIDE_CAR_DDL.strip())
