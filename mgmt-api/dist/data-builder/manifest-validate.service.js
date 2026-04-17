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
exports.ManifestValidateService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const _2020_1 = require("ajv/dist/2020");
const ajv_formats_1 = require("ajv-formats");
let ManifestValidateService = class ManifestValidateService {
    constructor() {
        const schemaPath = this.resolveSchemaPath();
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        const ajv = new _2020_1.default({ allErrors: true, strict: false });
        (0, ajv_formats_1.default)(ajv);
        this.validate = ajv.compile(schema);
    }
    resolveSchemaPath() {
        const env = process.env.MANIFEST_SCHEMA_PATH;
        if (env && fs.existsSync(env))
            return env;
        const candidates = [
            path.join(__dirname, 'manifest_v1.schema.json'),
            path.join(process.cwd(), 'src', 'data-builder', 'manifest_v1.schema.json'),
            path.join(process.cwd(), 'dist', 'data-builder', 'manifest_v1.schema.json'),
            path.join(process.cwd(), '..', 'docs', 'data-builder', 'manifest_v1.schema.json'),
        ];
        for (const p of candidates) {
            if (fs.existsSync(p))
                return p;
        }
        throw new Error('manifest_v1.schema.json 未找到：设置 MANIFEST_SCHEMA_PATH 或将 schema 置于 src/data-builder/');
    }
    assertValidManifest(manifest) {
        if (manifest == null || typeof manifest !== 'object') {
            throw new common_1.HttpException(this.toHttpBody('Manifest 须为 JSON 对象', [
                '请提供完整的 manifest_v1 对象，或改用 prompt 由编排层生成草稿后再校验。',
            ]), common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const m = manifest;
        const ok = this.validate(manifest);
        if (!ok) {
            const errs = (this.validate.errors || []);
            throw new common_1.HttpException(this.toHttpBody('Manifest 未通过 JSON Schema 校验', this.schemaFixes(errs), errs), common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const assertions = m.assertions;
        if (!Array.isArray(assertions) || assertions.length === 0) {
            throw new common_1.HttpException(this.toHttpBody('缺少断言（assertions）', [
                '在 manifest 中增加 assertions 数组，至少 1 条；每条需含 id、sql、expect 等字段。',
                '参考 docs/data-builder/manifest_v1.example.json。',
            ]), common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const cleanup = m.cleanup;
        const plans = cleanup?.plans;
        if (!Array.isArray(plans) || plans.length === 0) {
            throw new common_1.HttpException(this.toHttpBody('缺少清理计划（cleanup.plans）', [
                '在 cleanup 下增加 plans 数组，至少 1 项；每项含 table、order；row_map 模式可用 source: row_map。',
                '参考 docs/data-builder/manifest_minimal_api_environments.example.json。',
            ]), common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
    toHttpBody(message, fixes, ajvErrors) {
        return {
            code: 'DB_MANIFEST_INVALID',
            message,
            fixes,
            errors: (ajvErrors || []).map((e) => ({
                path: e.instancePath || '(root)',
                keyword: e.keyword || 'unknown',
                message: e.message || '',
            })),
        };
    }
    schemaFixes(errors) {
        const fixes = [];
        const text = errors.map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
        if (text.includes('assertions') || text.includes('required')) {
            fixes.push('核对 manifest_v1.schema.json 的 required 字段：generation、fingerprint、assertions、cleanup 等。');
        }
        if (text.includes('cleanup')) {
            fixes.push('补全 cleanup.mode 与 cleanup.plans（至少一条）。');
        }
        if (fixes.length === 0) {
            fixes.push('对照 docs/data-builder/manifest_v1.example.json 逐项补齐字段。');
        }
        return fixes;
    }
};
exports.ManifestValidateService = ManifestValidateService;
exports.ManifestValidateService = ManifestValidateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ManifestValidateService);
//# sourceMappingURL=manifest-validate.service.js.map