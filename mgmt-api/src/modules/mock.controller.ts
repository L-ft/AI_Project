import { Controller, All, Req, Res, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Faker, zh_CN } from '@faker-js/faker';

@Controller('mock')
export class MockController {
  private faker = new Faker({ locale: [zh_CN] });

  @All('*')
  async handleMock(@Req() req: Request, @Res() res: Response) {
    const path = req.params[0];
    const method = req.method;
    const query = req.query;

    console.log(`[Mock] 收到请求: ${method} ${path}`, query);

    // 1. 高级匹配逻辑示例
    if (path === '/auth/oauth/token' && query.mobile === '13800000000') {
      return res.json({
        code: 200,
        data: { user_id: 999, username: 'VIP用户', token: 'special-mock-token' },
        msg: '命中高级 Mock 规则'
      });
    }

    // 2. 模拟从数据库获取的 JSON Schema 自动生成
    // 这里以一个通用的响应结构为例
    const mockResponse = this.generateSmartMock(path);
    
    return res.json(mockResponse);
  }

  private generateSmartMock(path: string) {
    // 智能生成逻辑：根据路径模拟不同的数据类型
    return {
      code: 200,
      msg: 'success',
      data: {
        id: this.faker.number.int({ min: 100, max: 999 }),
        name: this.faker.person.fullName(),
        email: this.faker.internet.email(),
        phone: this.faker.phone.number(),
        status: this.faker.helpers.arrayElement(['active', 'inactive', 'pending']),
        created_at: this.faker.date.past().toISOString(),
        description: `这是针对路径 ${path} 自动生成的智能 Mock 数据`
      }
    };
  }
}
