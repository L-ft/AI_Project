import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { ApiService } from './api.service';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('create')
  @Roles('ADMIN', 'DEV')
  async createApi(@Body() data: any) {
    return this.apiService.create(data);
  }

  @Get('list')
  async listApis() {
    return this.apiService.findAll();
  }

  @Post('dispatch/:id')
  @Roles('ADMIN', 'TESTER')
  async dispatchTask(@Param('id') id: number) {
    // 转发任务到 FastAPI 引擎
    return this.apiService.dispatchToFastAPI(id);
  }
}
