import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { isDataBuilderPersistenceEnabled } from './data-builder-task-mode';

@Injectable()
export class DataBuilderTaskSchemaService implements OnModuleInit {
  private readonly logger = new Logger(DataBuilderTaskSchemaService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!isDataBuilderPersistenceEnabled()) {
      return;
    }
    await this.ensureTaskTables();
  }

  private async ensureTaskTables(): Promise<void> {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS data_builder_tasks (
        task_id CHAR(36) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        manifest_json JSON NOT NULL,
        manifest_hash CHAR(64) NULL,
        manifest_version VARCHAR(32) NOT NULL DEFAULT 'v1',
        mysql_conn_snapshot_json JSON NULL,
        mysql_conn_encrypted_json JSON NULL,
        mysql_conn_snapshot_version VARCHAR(32) NOT NULL DEFAULT 'v1',
        execution_mode VARCHAR(32) NOT NULL DEFAULT 'db_primary',
        orchestration_owner VARCHAR(32) NOT NULL DEFAULT 'mgmt-api',
        batch_count INT NOT NULL DEFAULT 0,
        completed_batches INT NOT NULL DEFAULT 0,
        current_batch_index INT NULL,
        rows_inserted_total BIGINT NOT NULL DEFAULT 0,
        last_heartbeat_at TIMESTAMP(3) NULL,
        last_batch_started_at TIMESTAMP(3) NULL,
        row_map_flush_lag INT NOT NULL DEFAULT 0,
        cleanup_status VARCHAR(32) NOT NULL DEFAULT 'not_applicable',
        cleanup_blocked_reason VARCHAR(64) NULL,
        cleanup_started_at TIMESTAMP(3) NULL,
        cleanup_completed_at TIMESTAMP(3) NULL,
        cleanup_completed_by VARCHAR(128) NULL,
        last_error_json JSON NULL,
        assertion_evaluated BOOLEAN NOT NULL DEFAULT FALSE,
        assertion_runs_json JSON NULL,
        created_by VARCHAR(128) NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (task_id),
        KEY idx_status_updated (status, updated_at),
        KEY idx_created_at (created_at),
        KEY idx_updated_at (updated_at),
        KEY idx_execution_mode (execution_mode, updated_at),
        KEY idx_cleanup_status (cleanup_status, updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        COMMENT='Data Builder: persistent task lifecycle and orchestration truth'
    `);

    if (!(await this.columnExists('data_builder_tasks', 'assertion_evaluated'))) {
      await this.dataSource.query(`
        ALTER TABLE data_builder_tasks
        ADD COLUMN assertion_evaluated BOOLEAN NOT NULL DEFAULT FALSE AFTER last_error_json
      `);
    }

    if (!(await this.columnExists('data_builder_tasks', 'assertion_runs_json'))) {
      await this.dataSource.query(`
        ALTER TABLE data_builder_tasks
        ADD COLUMN assertion_runs_json JSON NULL AFTER assertion_evaluated
      `);
    }

    await this.ensureColumnDefault(
      'data_builder_tasks',
      'execution_mode',
      'db_primary',
      "VARCHAR(32) NOT NULL DEFAULT 'db_primary'",
    );
    await this.ensureColumnDefault(
      'data_builder_tasks',
      'orchestration_owner',
      'mgmt-api',
      "VARCHAR(32) NOT NULL DEFAULT 'mgmt-api'",
    );

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS data_builder_task_batches (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        task_id CHAR(36) NOT NULL,
        batch_index INT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        rows_inserted BIGINT NOT NULL DEFAULT 0,
        attempt_count INT NOT NULL DEFAULT 0,
        started_at TIMESTAMP(3) NULL,
        last_heartbeat_at TIMESTAMP(3) NULL,
        finished_at TIMESTAMP(3) NULL,
        idempotency_key VARCHAR(128) NULL,
        last_error_json JSON NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uk_task_batch (task_id, batch_index),
        KEY idx_task_status (task_id, status),
        KEY idx_task_updated (task_id, updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        COMMENT='Data Builder: persistent per-batch runtime state'
    `);

    this.logger.log('Data Builder persistent task tables are ready');
  }

  private async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const rows = (await this.dataSource.query(
      `
        SELECT 1 AS ok
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
          AND column_name = ?
        LIMIT 1
      `,
      [tableName, columnName],
    )) as Array<{ ok?: number }>;
    return Array.isArray(rows) && rows.length > 0;
  }

  private async ensureColumnDefault(
    tableName: string,
    columnName: string,
    expectedDefault: string,
    columnSql: string,
  ): Promise<void> {
    const current = await this.getColumnDefault(tableName, columnName);
    if (current === expectedDefault) {
      return;
    }
    await this.dataSource.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${columnName} ${columnSql}
    `);
  }

  private async getColumnDefault(tableName: string, columnName: string): Promise<string | null> {
    const rows = (await this.dataSource.query(
      `
        SELECT column_default AS column_default
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
          AND column_name = ?
        LIMIT 1
      `,
      [tableName, columnName],
    )) as Array<{ column_default?: string | null }>;
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }
    return rows[0]?.column_default ?? null;
  }
}
