import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}

  async create(data: any) {
    // 保存到 MySQL 逻辑 (简化)
    console.log('Saving to MySQL:', data);
    return { id: 1, ...data };
  }

  async findAll() {
    return [{ id: 1, name: 'User Login API', path: '/login', method: 'POST' }];
  }

  async dispatchToFastAPI(apiId: number) {
    const fastApiUrl = process.env.EXEC_ENGINE_URL || 'http://localhost:8000';
    // 获取接口定义并发起请求
    const response = await lastValueFrom(
      this.httpService.post(`${fastApiUrl}/run-test`, { api_id: apiId })
    );
    return response.data;
  }
}
