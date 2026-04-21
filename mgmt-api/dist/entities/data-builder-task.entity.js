"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilderTaskBatch = exports.DataBuilderTask = void 0;
const typeorm_1 = require("typeorm");
let DataBuilderTask = class DataBuilderTask {
};
exports.DataBuilderTask = DataBuilderTask;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'char', length: 36 }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "task_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'PENDING' }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], DataBuilderTask.prototype, "manifest_json", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 64, nullable: true }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "manifest_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'v1' }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "manifest_version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataBuilderTask.prototype, "mysql_conn_snapshot_json", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataBuilderTask.prototype, "mysql_conn_encrypted_json", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'v1' }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "mysql_conn_snapshot_version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'db_primary' }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "execution_mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'mgmt-api' }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "orchestration_owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataBuilderTask.prototype, "batch_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataBuilderTask.prototype, "completed_batches", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DataBuilderTask.prototype, "current_batch_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "rows_inserted_total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', precision: 3, nullable: true }),
    __metadata("design:type", Date)
], DataBuilderTask.prototype, "last_heartbeat_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', precision: 3, nullable: true }),
    __metadata("design:type", Date)
], DataBuilderTask.prototype, "last_batch_started_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataBuilderTask.prototype, "row_map_flush_lag", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'not_applicable' }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "cleanup_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "cleanup_blocked_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', precision: 3, nullable: true }),
    __metadata("design:type", Date)
], DataBuilderTask.prototype, "cleanup_started_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', precision: 3, nullable: true }),
    __metadata("design:type", Date)
], DataBuilderTask.prototype, "cleanup_completed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "cleanup_completed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataBuilderTask.prototype, "last_error_json", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DataBuilderTask.prototype, "assertion_evaluated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], DataBuilderTask.prototype, "assertion_runs_json", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", String)
], DataBuilderTask.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 3 }),
    __metadata("design:type", Date)
], DataBuilderTask.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', precision: 3 }),
    __metadata("design:type", Date)
], DataBuilderTask.prototype, "updated_at", void 0);
exports.DataBuilderTask = DataBuilderTask = __decorate([
    (0, typeorm_1.Entity)('data_builder_tasks'),
    (0, typeorm_1.Index)('idx_status_updated', ['status', 'updated_at']),
    (0, typeorm_1.Index)('idx_execution_mode', ['execution_mode', 'updated_at']),
    (0, typeorm_1.Index)('idx_cleanup_status', ['cleanup_status', 'updated_at'])
], DataBuilderTask);
let DataBuilderTaskBatch = class DataBuilderTaskBatch {
};
exports.DataBuilderTaskBatch = DataBuilderTaskBatch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], DataBuilderTaskBatch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 36 }),
    __metadata("design:type", String)
], DataBuilderTaskBatch.prototype, "task_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], DataBuilderTaskBatch.prototype, "batch_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'PENDING' }),
    __metadata("design:type", String)
], DataBuilderTaskBatch.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", String)
], DataBuilderTaskBatch.prototype, "rows_inserted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataBuilderTaskBatch.prototype, "attempt_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', precision: 3, nullable: true }),
    __metadata("design:type", Date)
], DataBuilderTaskBatch.prototype, "started_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', precision: 3, nullable: true }),
    __metadata("design:type", Date)
], DataBuilderTaskBatch.prototype, "last_heartbeat_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', precision: 3, nullable: true }),
    __metadata("design:type", Date)
], DataBuilderTaskBatch.prototype, "finished_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", String)
], DataBuilderTaskBatch.prototype, "idempotency_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataBuilderTaskBatch.prototype, "last_error_json", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 3 }),
    __metadata("design:type", Date)
], DataBuilderTaskBatch.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', precision: 3 }),
    __metadata("design:type", Date)
], DataBuilderTaskBatch.prototype, "updated_at", void 0);
exports.DataBuilderTaskBatch = DataBuilderTaskBatch = __decorate([
    (0, typeorm_1.Entity)('data_builder_task_batches'),
    (0, typeorm_1.Index)('idx_task_status', ['task_id', 'status']),
    (0, typeorm_1.Index)('idx_task_updated', ['task_id', 'updated_at'])
], DataBuilderTaskBatch);
//# sourceMappingURL=data-builder-task.entity.js.map