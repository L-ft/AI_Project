import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  isDataBuilderDbPrimaryEnabled,
  shouldDataBuilderShadowReadThrough,
} from '../data-builder/data-builder-task-mode';
import { DataBuilderTaskOrchestrationService } from '../data-builder/data-builder-task-orchestration.service';
import { DataBuilderTaskShadowStoreService } from '../data-builder/data-builder-task-shadow-store.service';
import { DataBuilderTasksProxyService } from './data-builder-tasks-proxy.service';

/**
 * Browser requests reach `/v1/data-builder/*` here after the gateway strips `/api`.
 * Public lifecycle calls stay on mgmt-api; legacy exec-engine routes remain fallback only.
 */
@Controller('v1/data-builder')
export class DataBuilderTasksProxyController {
  private readonly logger = new Logger(DataBuilderTasksProxyController.name);

  constructor(
    private readonly proxy: DataBuilderTasksProxyService,
    private readonly orchestration: DataBuilderTaskOrchestrationService,
    private readonly shadowStore: DataBuilderTaskShadowStoreService,
  ) {}

  @Get('tasks')
  async list(@Query('limit') limit?: string) {
    if (isDataBuilderDbPrimaryEnabled()) {
      return this.orchestration.listPrimaryTasks(this.parseLimit(limit));
    }
    return this.listLegacyTasks(limit);
  }

  @Post('tasks')
  create(@Body() body: unknown) {
    return this.orchestration.createTask(body as Record<string, unknown>);
  }

  @Get('tasks/:taskId')
  async getOne(@Param('taskId') taskId: string) {
    if (isDataBuilderDbPrimaryEnabled()) {
      return this.orchestration.getPrimaryTask(taskId);
    }
    return this.getLegacyTask(taskId);
  }

  @Post('tasks/:taskId/execute-batch')
  async executeBatch(@Param('taskId') taskId: string, @Body() body: unknown) {
    if (isDataBuilderDbPrimaryEnabled()) {
      return this.orchestration.executePrimaryBatch(taskId, body);
    }
    return this.executeLegacyBatch(taskId, body);
  }

  @Post('tasks/:taskId/cleanup')
  async cleanup(@Param('taskId') taskId: string, @Body() body: unknown) {
    if (isDataBuilderDbPrimaryEnabled()) {
      return this.orchestration.cleanupPrimaryTask(taskId, body);
    }
    return this.cleanupLegacyTask(taskId, body);
  }

  private parseLimit(limit?: string): number {
    return limit != null && limit !== '' ? Number(limit) : 50;
  }

  private buildLimitParams(limit?: string): Record<string, string> | undefined {
    return limit != null && limit !== '' ? { limit } : undefined;
  }

  private async listLegacyTasks(limit?: string): Promise<unknown> {
    if (!this.shadowStore.enabled()) {
      return this.fetchLegacyTaskListFromUpstream(limit);
    }
    try {
      const rows = await this.shadowStore.listTaskDetails(this.parseLimit(limit));
      if (rows.length > 0) {
        if (shouldDataBuilderShadowReadThrough()) {
          void this.refreshLegacyTaskListFromUpstream(limit);
        }
        return rows;
      }
    } catch (error) {
      this.logger.warn(
        `Shadow list read failed, falling back to upstream: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
    return this.fetchLegacyTaskListFromUpstream(limit);
  }

  private async getLegacyTask(taskId: string): Promise<unknown> {
    if (!this.shadowStore.enabled()) {
      return this.fetchLegacyTaskDetailFromUpstream(taskId);
    }
    try {
      const shadow = await this.shadowStore.getTaskDetail(taskId);
      if (shadow) {
        if (shouldDataBuilderShadowReadThrough()) {
          void this.refreshLegacyTaskDetailFromUpstream(taskId);
        }
        return shadow;
      }
    } catch (error) {
      this.logger.warn(
        `Shadow detail read failed, falling back to upstream: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
    return this.fetchLegacyTaskDetailFromUpstream(taskId);
  }

  private async executeLegacyBatch(taskId: string, body: unknown): Promise<unknown> {
    return this.runLegacyMutation({
      path: `/tasks/${taskId}/execute-batch`,
      body,
      mirrorFailureLog: 'Failed to mirror execute-batch failure into shadow store',
      mirrorSuccessLog: 'Failed to mirror execute-batch result into shadow store',
      onFailure: async (error) => {
        await this.shadowStore.mirrorExecuteBatchFailure(
          taskId,
          this.readBatchIndex(body),
          this.readHttpErrorResponse(error),
          this.readHttpErrorStatus(error),
        );
      },
      onSuccess: async (upstream) => {
        await this.shadowStore.mirrorExecuteBatchResponse(upstream);
      },
    });
  }

  private async cleanupLegacyTask(taskId: string, body: unknown): Promise<unknown> {
    return this.runLegacyMutation({
      path: `/tasks/${taskId}/cleanup`,
      body,
      mirrorFailureLog: 'Failed to mirror cleanup failure into shadow store',
      mirrorSuccessLog: 'Failed to mirror cleanup result into shadow store',
      onFailure: async (error) => {
        await this.shadowStore.mirrorCleanupFailure(
          taskId,
          this.readHttpErrorResponse(error),
          this.readHttpErrorStatus(error),
        );
      },
      onSuccess: async (upstream) => {
        await this.shadowStore.mirrorCleanupResponse(upstream);
      },
    });
  }

  private async runLegacyMutation(opts: {
    path: string;
    body: unknown;
    mirrorFailureLog: string;
    mirrorSuccessLog: string;
    onFailure: (error: unknown) => Promise<void>;
    onSuccess: (upstream: unknown) => Promise<void>;
  }): Promise<unknown> {
    let upstream: unknown;
    try {
      upstream = await this.proxy.forwardLegacyLifecycle({
        method: 'POST',
        path: opts.path,
        data: opts.body,
      });
    } catch (error) {
      await this.mirrorLegacyFailure(opts.mirrorFailureLog, async () => opts.onFailure(error));
      throw error;
    }
    await this.mirrorLegacySuccess(opts.mirrorSuccessLog, async () => opts.onSuccess(upstream));
    return upstream;
  }

  private async mirrorLegacyFailure(message: string, fn: () => Promise<void>): Promise<void> {
    if (!this.shadowStore.enabled()) return;
    try {
      await fn();
    } catch (error) {
      this.logger.warn(
        `${message}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private async mirrorLegacySuccess(message: string, fn: () => Promise<void>): Promise<void> {
    if (!this.shadowStore.enabled()) return;
    try {
      await fn();
    } catch (error) {
      this.logger.warn(
        `${message}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private readHttpErrorResponse(error: unknown): unknown | null {
    return error instanceof HttpException ? error.getResponse() : null;
  }

  private readHttpErrorStatus(error: unknown): number | undefined {
    return error instanceof HttpException ? error.getStatus() : undefined;
  }

  private readBatchIndex(body: unknown): number | null {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null;
    }
    const batchIndex = Number((body as { batch_index?: unknown }).batch_index);
    return Number.isFinite(batchIndex) ? batchIndex : null;
  }

  private async fetchLegacyTaskListFromUpstream(limit?: string): Promise<unknown> {
    const upstream = await this.proxy.forwardLegacyLifecycle({
      method: 'GET',
      path: '/tasks',
      params: this.buildLimitParams(limit),
    });
    let mirrored: Array<Record<string, unknown>> | null = null;
    await this.mirrorLegacySuccess('Failed to mirror upstream task list into shadow store', async () => {
      mirrored = await this.shadowStore.mirrorTaskList(upstream);
    });
    return mirrored ?? upstream;
  }

  private async fetchLegacyTaskDetailFromUpstream(taskId: string): Promise<unknown> {
    const upstream = await this.proxy.forwardLegacyLifecycle({
      method: 'GET',
      path: `/tasks/${taskId}`,
    });
    let mirrored: Record<string, unknown> | null = null;
    await this.mirrorLegacySuccess(
      'Failed to mirror upstream task detail into shadow store',
      async () => {
        mirrored = await this.shadowStore.mirrorTaskDetail(upstream);
      },
    );
    return mirrored ?? upstream;
  }

  private async refreshLegacyTaskListFromUpstream(limit?: string): Promise<void> {
    try {
      await this.fetchLegacyTaskListFromUpstream(limit);
    } catch (error) {
      this.logger.warn(
        `Shadow read-through list refresh failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private async refreshLegacyTaskDetailFromUpstream(taskId: string): Promise<void> {
    try {
      await this.fetchLegacyTaskDetailFromUpstream(taskId);
    } catch (error) {
      this.logger.warn(
        `Shadow read-through detail refresh failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}
