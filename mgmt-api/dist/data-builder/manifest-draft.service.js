"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestDraftService = void 0;
const common_1 = require("@nestjs/common");
let ManifestDraftService = class ManifestDraftService {
    fromPrompt(prompt, mysql, tableHint) {
        const db = String(mysql.database || '').trim() || 'ai_automation_db';
        const table = (tableHint || process.env.DATA_BUILDER_DEFAULT_TABLE || 'api_environments').trim();
        return {
            manifest_version: '1.0',
            database_context: {
                dialect: 'mysql8',
                connection_ref: 'mgmt_mysql',
                database: db,
                tables: [{ name: table, role: 'primary' }],
            },
            generation: {
                mode: 'template',
                instruction_echo: prompt,
                sql_template: `INSERT INTO \`${table}\` (\`name\`, \`base_url\`) VALUES (:name, :base_url)`,
                bindings: [
                    {
                        placeholder: 'name',
                        column: 'name',
                        strategy: 'fingerprint_remark',
                        params: { merge_mode: 'append' },
                    },
                    {
                        placeholder: 'base_url',
                        column: 'base_url',
                        strategy: 'literal',
                        params: { value: 'https://draft.example/l4' },
                    },
                ],
                batching: {
                    total_rows: 2,
                    batch_size: 2,
                    batch_count: 1,
                    batches: [{ batch_index: 0, row_count: 2, label: 'b0' }],
                },
                post_insert_sql: [],
                state_machine: null,
            },
            fingerprint: {
                strategy: 'row_map_only',
                remark_column: null,
                marker: {
                    format: 'prefixed_token',
                    prefix: 'DB_TASK_',
                    value_template: '${prefix}${task_id}',
                },
                row_map: { enabled: true, async_flush: false, table: 'data_builder_row_map' },
            },
            assertions: [
                {
                    id: 'asrt_draft_row_count',
                    name: '草稿任务行数',
                    assertion_type: 'scalar',
                    severity: 'error',
                    sql: `SELECT COUNT(*) AS c FROM \`${table}\` WHERE \`name\` LIKE CONCAT('%', :task_marker, '%')`,
                    expect: { kind: 'row_count_eq', value: 2, column: 'c' },
                    rationale: '占位断言：接入 AI 后请按业务改写',
                    run_after_batch: null,
                },
            ],
            cleanup: {
                mode: 'row_map',
                requires_confirm: true,
                plans: [{ table, order: 10, source: 'row_map' }],
            },
            meta: {
                source: 'api',
                compliance: { production_row_sampling: false },
                data_builder: { insert_pk_column: 'id', draft: true },
            },
        };
    }
};
exports.ManifestDraftService = ManifestDraftService;
exports.ManifestDraftService = ManifestDraftService = __decorate([
    (0, common_1.Injectable)()
], ManifestDraftService);
//# sourceMappingURL=manifest-draft.service.js.map