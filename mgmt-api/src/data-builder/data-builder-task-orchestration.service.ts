import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DataBuilderTasksProxyService } from '../modules/data-builder-tasks-proxy.service';
import { ManifestDraftService, type MysqlConnDraft } from './manifest-draft.service';
import { ManifestValidateService } from './manifest-validate.service';

@Injectable()
export class DataBuilderTaskOrchestrationService {
  constructor(
    private readonly proxy: DataBuilderTasksProxyService,
    private readonly validate: ManifestValidateService,
    private readonly draft: ManifestDraftService,
  ) {}

  /**
   * 创建任务：支持 manifest 直传或 prompt 草稿（草稿经 Schema 与硬约束后方可转发 exec-engine）。
   * task_id 由 exec-engine 生成并返回（合同锁定）。
   */
  async createTask(body: Record<string, unknown>): Promise<unknown> {
    const mysql = body.mysql as MysqlConnDraft | undefined;
    if (!mysql || typeof mysql !== 'object') {
      throw new BadRequestException({
        code: 'DB_TASK_MYSQL_REQUIRED',
        message: '创建任务须提供 mysql 连接体（host/port/user/password/database）',
      });
    }
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    let manifest = body.manifest as Record<string, unknown> | undefined;
    const tableHint = typeof body.table_hint === 'string' ? body.table_hint.trim() : undefined;

    if (prompt && manifest) {
      throw new BadRequestException({
        code: 'DB_TASK_AMBIGUOUS_BODY',
        message: '请勿同时传 prompt 与 manifest；择一即可',
      });
    }
    if (!prompt && !manifest) {
      throw new BadRequestException({
        code: 'DB_TASK_BODY_INVALID',
        message: '须提供 manifest 或 prompt',
      });
    }
    if (prompt) {
      manifest = this.draft.fromPrompt(prompt, mysql, tableHint);
    }
    this.validate.assertValidManifest(manifest);
    return this.proxy.forward({
      method: 'POST',
      path: '/tasks',
      data: { manifest, mysql },
    });
  }
}
