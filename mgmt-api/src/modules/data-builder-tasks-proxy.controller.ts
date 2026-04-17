import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DataBuilderTaskOrchestrationService } from '../data-builder/data-builder-task-orchestration.service';
import { DataBuilderTasksProxyService } from './data-builder-tasks-proxy.service';

/**
 * 浏览器经 Nginx /api/ 剥离前缀后，此处为 /v1/data-builder/*；
 * 与前端 VITE_DATA_BUILDER_VIA_MGMT + baseURL=/api 组合使用。
 */
@Controller('v1/data-builder')
export class DataBuilderTasksProxyController {
  constructor(
    private readonly proxy: DataBuilderTasksProxyService,
    private readonly orchestration: DataBuilderTaskOrchestrationService,
  ) {}

  @Get('tasks')
  list(@Query('limit') limit?: string) {
    const params = limit != null && limit !== '' ? { limit } : undefined;
    return this.proxy.forward({ method: 'GET', path: '/tasks', params });
  }

  @Post('tasks')
  create(@Body() body: unknown) {
    return this.orchestration.createTask(body as Record<string, unknown>);
  }

  @Get('tasks/:taskId')
  getOne(@Param('taskId') taskId: string) {
    return this.proxy.forward({ method: 'GET', path: `/tasks/${taskId}` });
  }

  @Post('tasks/:taskId/execute-batch')
  executeBatch(@Param('taskId') taskId: string, @Body() body: unknown) {
    return this.proxy.forward({
      method: 'POST',
      path: `/tasks/${taskId}/execute-batch`,
      data: body,
    });
  }

  @Post('tasks/:taskId/cleanup')
  cleanup(@Param('taskId') taskId: string, @Body() body: unknown) {
    return this.proxy.forward({
      method: 'POST',
      path: `/tasks/${taskId}/cleanup`,
      data: body,
    });
  }
}
