import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import Ajv2020, { type ErrorObject } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

export interface ManifestValidationFailure {
  code: string;
  message: string;
  fixes: string[];
  errors: Array<{ path: string; keyword: string; message: string }>;
}

@Injectable()
export class ManifestValidateService {
  private readonly validate: ReturnType<Ajv2020['compile']>;

  constructor() {
    const schemaPath = this.resolveSchemaPath();
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')) as object;
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    this.validate = ajv.compile(schema);
  }

  private resolveSchemaPath(): string {
    const env = process.env.MANIFEST_SCHEMA_PATH;
    if (env && fs.existsSync(env)) return env;
    const candidates = [
      path.join(__dirname, 'manifest_v1.schema.json'),
      path.join(process.cwd(), 'src', 'data-builder', 'manifest_v1.schema.json'),
      path.join(process.cwd(), 'dist', 'data-builder', 'manifest_v1.schema.json'),
      path.join(process.cwd(), '..', 'docs', 'data-builder', 'manifest_v1.schema.json'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    throw new Error(
      'manifest_v1.schema.json 未找到：设置 MANIFEST_SCHEMA_PATH 或将 schema 置于 src/data-builder/',
    );
  }

  /** Schema + 业务硬约束；不通过则禁止落库/转发 exec-engine */
  assertValidManifest(manifest: unknown): void {
    if (manifest == null || typeof manifest !== 'object') {
      throw new HttpException(
        this.toHttpBody('Manifest 须为 JSON 对象', [
          '请提供完整的 manifest_v1 对象，或改用 prompt 由编排层生成草稿后再校验。',
        ]),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const m = manifest as Record<string, unknown>;
    const ok = this.validate(manifest);
    if (!ok) {
      const errs = (this.validate.errors || []) as ErrorObject[];
      throw new HttpException(
        this.toHttpBody('Manifest 未通过 JSON Schema 校验', this.schemaFixes(errs), errs),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const assertions = m.assertions;
    if (!Array.isArray(assertions) || assertions.length === 0) {
      throw new HttpException(
        this.toHttpBody('缺少断言（assertions）', [
          '在 manifest 中增加 assertions 数组，至少 1 条；每条需含 id、sql、expect 等字段。',
          '参考 docs/data-builder/manifest_v1.example.json。',
        ]),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const cleanup = m.cleanup as Record<string, unknown> | undefined;
    const plans = cleanup?.plans;
    if (!Array.isArray(plans) || plans.length === 0) {
      throw new HttpException(
        this.toHttpBody('缺少清理计划（cleanup.plans）', [
          '在 cleanup 下增加 plans 数组，至少 1 项；每项含 table、order；row_map 模式可用 source: row_map。',
          '参考 docs/data-builder/manifest_minimal_api_environments.example.json。',
        ]),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private toHttpBody(
    message: string,
    fixes: string[],
    ajvErrors?: ErrorObject[],
  ): ManifestValidationFailure {
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

  private schemaFixes(errors: ErrorObject[]): string[] {
    const fixes: string[] = [];
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
}
