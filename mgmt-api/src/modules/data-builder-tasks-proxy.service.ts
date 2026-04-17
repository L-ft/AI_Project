import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

@Injectable()
export class DataBuilderTasksProxyService {
  constructor(private readonly http: HttpService) {}

  private execBase(): string {
    return (process.env.EXEC_ENGINE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  }

  /**
   * 转发到 exec-engine 已实现的 OpenAPI 路径 /api/v1/data-builder/*
   */
  async forward(opts: {
    method: 'GET' | 'POST';
    path: string;
    params?: Record<string, string>;
    data?: unknown;
  }): Promise<unknown> {
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
}
