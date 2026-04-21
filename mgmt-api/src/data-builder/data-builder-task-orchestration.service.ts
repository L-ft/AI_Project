import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataBuilderTasksProxyService } from '../modules/data-builder-tasks-proxy.service';
import { DataBuilderPrimaryTaskStoreService } from './data-builder-primary-task-store.service';
import { isDataBuilderDbPrimaryEnabled } from './data-builder-task-mode';
import { DataBuilderTaskShadowStoreService } from './data-builder-task-shadow-store.service';
import { ManifestDraftService, type MysqlConnDraft } from './manifest-draft.service';
import { ManifestValidateService } from './manifest-validate.service';

@Injectable()
export class DataBuilderTaskOrchestrationService {
  private readonly logger = new Logger(DataBuilderTaskOrchestrationService.name);

  constructor(
    private readonly proxy: DataBuilderTasksProxyService,
    private readonly validate: ManifestValidateService,
    private readonly draft: ManifestDraftService,
    private readonly shadowStore: DataBuilderTaskShadowStoreService,
    private readonly primaryStore: DataBuilderPrimaryTaskStoreService,
  ) {}

  async createTask(body: Record<string, unknown>): Promise<unknown> {
    const input = this.buildCreateInput(body);
    if (isDataBuilderDbPrimaryEnabled()) {
      return this.primaryStore.createTask(input.manifest, input.mysql, this.readActor(body));
    }
    return this.createLegacyTask(input);
  }

  private async createLegacyTask(input: {
    mysql: MysqlConnDraft;
    manifest: Record<string, unknown>;
  }): Promise<unknown> {
    const upstream = await this.proxy.forwardLegacyLifecycle({
      method: 'POST',
      path: '/tasks',
      data: { manifest: input.manifest, mysql: input.mysql },
    });
    if (!this.shadowStore.enabled()) {
      return upstream;
    }
    try {
      await this.shadowStore.mirrorCreateResponse(upstream, input.mysql, input.manifest);
    } catch (error) {
      this.logger.warn(
        `Failed to mirror upstream create response into shadow store: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
    return upstream;
  }

  async listPrimaryTasks(limit = 50): Promise<Array<Record<string, unknown>>> {
    return this.primaryStore.listTaskDetails(limit);
  }

  async getPrimaryTask(taskId: string): Promise<Record<string, unknown>> {
    const detail = await this.primaryStore.getTaskDetail(taskId);
    if (!detail) {
      throw new NotFoundException({
        code: 'DB_TASK_NOT_FOUND',
        message: taskId,
      });
    }
    return detail;
  }

  async executePrimaryBatch(taskId: string, body: unknown): Promise<unknown> {
    const batchIndex = this.readBatchIndex(body);
    const dryRun = this.readDryRun(body);
    const claim = dryRun
      ? await this.primaryStore.getBatchExecutionInput(taskId, batchIndex)
      : await this.primaryStore.claimBatchExecution(taskId, batchIndex);

    if (claim.kind === 'replay') {
      return claim.response;
    }

    try {
      const upstream = await this.proxy.forwardInternal({
        path: '/execute-batch',
        data: {
          task_id: claim.taskId,
          manifest: claim.manifest,
          mysql: claim.mysql,
          batch_index: batchIndex,
          dry_run: dryRun,
        },
      });
      if (!dryRun) {
        return this.primaryStore.markBatchExecutionSuccess(taskId, batchIndex, upstream);
      }
      return upstream;
    } catch (error) {
      if (!dryRun) {
        await this.primaryStore.markBatchExecutionFailure(
          taskId,
          batchIndex,
          error instanceof HttpException ? error.getResponse() : null,
          error instanceof HttpException ? error.getStatus() : undefined,
        );
      }
      throw error;
    }
  }

  async cleanupPrimaryTask(taskId: string, body: unknown): Promise<unknown> {
    if (!this.readConfirm(body)) {
      throw new BadRequestException({
        code: 'DB_CLEAN_CONFIRM_REQUIRED',
        message: 'confirm=true is required',
      });
    }

    const claim = await this.primaryStore.claimCleanup(taskId, this.readActor(body));
    if (claim.kind === 'replay') {
      return claim.response;
    }

    try {
      const upstream = await this.proxy.forwardInternal({
        path: '/cleanup',
        data: {
          task_id: claim.taskId,
          manifest: claim.manifest,
          mysql: claim.mysql,
          confirm: true,
          actor: claim.actor,
        },
      });
      await this.primaryStore.markCleanupSuccess(taskId, upstream);
      return upstream;
    } catch (error) {
      await this.primaryStore.markCleanupFailure(
        taskId,
        error instanceof HttpException ? error.getResponse() : null,
        error instanceof HttpException ? error.getStatus() : undefined,
      );
      throw error;
    }
  }

  private buildCreateInput(body: Record<string, unknown>): {
    mysql: MysqlConnDraft;
    manifest: Record<string, unknown>;
  } {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException({
        code: 'DB_TASK_BODY_INVALID',
        message: 'request body must be a JSON object',
      });
    }
    const mysql = body.mysql as MysqlConnDraft | undefined;
    if (!mysql || typeof mysql !== 'object') {
      throw new BadRequestException({
        code: 'DB_TASK_MYSQL_REQUIRED',
        message: 'create task requires mysql connection fields',
      });
    }
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    let manifest = body.manifest as Record<string, unknown> | undefined;
    const tableHint = typeof body.table_hint === 'string' ? body.table_hint.trim() : undefined;

    if (prompt && manifest) {
      throw new BadRequestException({
        code: 'DB_TASK_AMBIGUOUS_BODY',
        message: 'provide either prompt or manifest, not both',
      });
    }
    if (!prompt && !manifest) {
      throw new BadRequestException({
        code: 'DB_TASK_BODY_INVALID',
        message: 'provide manifest or prompt',
      });
    }
    if (prompt) {
      manifest = this.draft.fromPrompt(prompt, mysql, tableHint);
    }
    this.validate.assertValidManifest(manifest);
    return { mysql, manifest: manifest as Record<string, unknown> };
  }

  private readBatchIndex(body: unknown): number {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException({
        code: 'DB_TASK_BODY_INVALID',
        message: 'execute-batch body must be a JSON object',
      });
    }
    const n = Number((body as { batch_index?: unknown }).batch_index);
    if (!Number.isInteger(n) || n < 0) {
      throw new BadRequestException({
        code: 'DB_TASK_BATCH_OUT_OF_RANGE',
        message: 'batch_index must be a non-negative integer',
      });
    }
    return n;
  }

  private readDryRun(body: unknown): boolean {
    return Boolean((body as { dry_run?: unknown } | null)?.dry_run);
  }

  private readConfirm(body: unknown): boolean {
    return Boolean((body as { confirm?: unknown } | null)?.confirm);
  }

  private readActor(body: unknown): string | null {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null;
    }
    const actor =
      (body as { actor?: unknown }).actor ?? (body as { created_by?: unknown }).created_by;
    if (actor == null) return null;
    const s = String(actor).trim();
    return s ? s : null;
  }
}
