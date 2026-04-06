import { Controller, Get, Post, Delete, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as crypto from 'crypto';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  
  @Get('assets')
  async getAssetOverview(@Request() req) {
    const { uid, tenantId } = req.user;
    // 业务逻辑：基于 tenantId 和 uid 进行数据隔离查询
    return {
      apiCount: 42,
      projectCount: 5,
      recentExecutions: [
        { id: 'login-api-test-a', code: 'login-api-test-a', name: 'Login API Test', status: 'SUCCESS', time: '2026-01-17 10:00:00' }
      ]
    };
  }

  @Post('apikey/generate')
  async generateApiKey(@Request() req) {
    // 生成带前缀的 64 位 API Key
    const key = `ai_${crypto.randomBytes(30).toString('hex')}`;
    // 实际应异步存入 MySQL (user_api_keys 表)
    return { 
      name: 'Default Key',
      apiKey: key, 
      createdAt: new Date().toISOString() 
    };
  }

  @Get('apikey/list')
  async listApiKeys(@Request() req) {
    return [
      { id: 'production-key-a', code: 'production-key-a', name: 'Production Key', apiKey: 'ai_5f7d...3a2b', isActive: true }
    ];
  }
}
