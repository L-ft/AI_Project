import { HttpException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { getDataBuilderTaskMode } from '../data-builder/data-builder-task-mode';

@Injectable()
export class DataBuilderTasksProxyService {
  private readonly logger = new Logger(DataBuilderTasksProxyService.name);
  private legacyLifecycleCallCount = 0;

  constructor(private readonly http: HttpService) {}

  private execBase(): string {
    return (process.env.EXEC_ENGINE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  }

  /**
   * Legacy lifecycle fallback routed to exec-engine public task endpoints.
   */
  async forwardLegacyLifecycle(opts: {
    method: 'GET' | 'POST';
    path: string;
    params?: Record<string, string>;
    data?: unknown;
  }): Promise<unknown> {
    this.warnLegacyLifecycleFallback(opts.method, opts.path);
    const url = `${this.execBase()}/api/v1/data-builder${opts.path}`;
    try {
      const res = await this.http.axiosRef.request({
        method: opts.method,
        url,
        params: opts.params,
        data: opts.data,
        timeout: 130_000,
      });
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        throw new HttpException(e.response.data, e.response.status);
      }
      const msg = e instanceof Error ? e.message : 'upstream error';
      throw new HttpException({ code: 'DB_PROXY_UPSTREAM', message: msg }, 502);
    }
  }

  async forwardInternal(opts: {
    path: '/execute-batch' | '/cleanup';
    data: unknown;
  }): Promise<unknown> {
    const token = String(process.env.DATA_BUILDER_EXEC_INTERNAL_TOKEN || '').trim();
    if (!token) {
      throw new ServiceUnavailableException({
        code: 'DB_EXEC_INTERNAL_UNAVAILABLE',
        message: 'DATA_BUILDER_EXEC_INTERNAL_TOKEN is required for db_primary mode',
      });
    }
    const url = `${this.execBase()}/api/v1/data-builder/internal${opts.path}`;
    try {
      const res = await this.http.axiosRef.request({
        method: 'POST',
        url,
        data: opts.data,
        timeout: 130_000,
        headers: {
          'x-data-builder-internal-token': token,
        },
      });
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        throw new HttpException(e.response.data, e.response.status);
      }
      const msg = e instanceof Error ? e.message : 'upstream error';
      throw new HttpException({ code: 'DB_PROXY_UPSTREAM', message: msg }, 502);
    }
  }

  private warnLegacyLifecycleFallback(method: 'GET' | 'POST', path: string): void {
    this.legacyLifecycleCallCount += 1;
    this.logger.warn(
      [
        'code=DB_LEGACY_LIFECYCLE_FALLBACK',
        `count=${this.legacyLifecycleCallCount}`,
        `mode=${getDataBuilderTaskMode()}`,
        `method=${method}`,
        `path=${path}`,
        'message=exec-engine legacy task lifecycle endpoint invoked; db_primary should use mgmt-api persistence and internal exec-engine routes only',
      ].join(' '),
    );
  }
}
