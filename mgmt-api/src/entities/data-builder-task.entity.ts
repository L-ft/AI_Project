import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DataBuilderTaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED_OK'
  | 'FAILED_ASSERTION'
  | 'FAILED_EXECUTION';

export type DataBuilderCleanupStatus =
  | 'not_applicable'
  | 'eligible'
  | 'running'
  | 'completed'
  | 'blocked';

@Entity('data_builder_tasks')
@Index('idx_status_updated', ['status', 'updated_at'])
@Index('idx_execution_mode', ['execution_mode', 'updated_at'])
@Index('idx_cleanup_status', ['cleanup_status', 'updated_at'])
export class DataBuilderTask {
  @PrimaryColumn({ type: 'char', length: 36 })
  task_id: string;

  @Column({ type: 'varchar', length: 32, default: 'PENDING' })
  status: DataBuilderTaskStatus;

  @Column({ type: 'json' })
  manifest_json: Record<string, unknown>;

  @Column({ type: 'char', length: 64, nullable: true })
  manifest_hash: string | null;

  @Column({ type: 'varchar', length: 32, default: 'v1' })
  manifest_version: string;

  @Column({ type: 'json', nullable: true })
  mysql_conn_snapshot_json: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  mysql_conn_encrypted_json: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 32, default: 'v1' })
  mysql_conn_snapshot_version: string;

  @Column({ type: 'varchar', length: 32, default: 'db_primary' })
  execution_mode: string;

  @Column({ type: 'varchar', length: 32, default: 'mgmt-api' })
  orchestration_owner: string;

  @Column({ type: 'int', default: 0 })
  batch_count: number;

  @Column({ type: 'int', default: 0 })
  completed_batches: number;

  @Column({ type: 'int', nullable: true })
  current_batch_index: number | null;

  @Column({ type: 'bigint', default: 0 })
  rows_inserted_total: string;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  last_heartbeat_at: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  last_batch_started_at: Date | null;

  @Column({ type: 'int', default: 0 })
  row_map_flush_lag: number;

  @Column({ type: 'varchar', length: 32, default: 'not_applicable' })
  cleanup_status: DataBuilderCleanupStatus;

  @Column({ type: 'varchar', length: 64, nullable: true })
  cleanup_blocked_reason: string | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  cleanup_started_at: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  cleanup_completed_at: Date | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  cleanup_completed_by: string | null;

  @Column({ type: 'json', nullable: true })
  last_error_json: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: false })
  assertion_evaluated: boolean;

  @Column({ type: 'json', nullable: true })
  assertion_runs_json: Array<Record<string, unknown>> | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  created_by: string | null;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;
}

@Entity('data_builder_task_batches')
@Index('idx_task_status', ['task_id', 'status'])
@Index('idx_task_updated', ['task_id', 'updated_at'])
export class DataBuilderTaskBatch {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'char', length: 36 })
  task_id: string;

  @Column({ type: 'int' })
  batch_index: number;

  @Column({ type: 'varchar', length: 32, default: 'PENDING' })
  status: DataBuilderTaskStatus;

  @Column({ type: 'bigint', default: 0 })
  rows_inserted: string;

  @Column({ type: 'int', default: 0 })
  attempt_count: number;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  started_at: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  last_heartbeat_at: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  finished_at: Date | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  idempotency_key: string | null;

  @Column({ type: 'json', nullable: true })
  last_error_json: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;
}
