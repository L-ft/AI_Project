import { Controller, Post, Body, UnauthorizedException, Get, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Tenant } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RbacService } from '../modules/rbac.service';

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private rbacService: RbacService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const { phone, password, username } = body;
    
    // 检查手机号是否已存在
    const existingUser = await this.userRepository.findOne({ where: { phone_number: phone } });
    if (existingUser) {
      throw new BadRequestException('该手机号已被注册');
    }

    // 获取默认租户 (ID: 1)
    const tenant = await this.tenantRepository.findOne({ where: { id: 1 } });
    if (!tenant) {
      throw new BadRequestException('系统初始租户不存在，请检查数据库');
    }

    // bcrypt 加密密码
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 存储到数据库
    const newUser = this.userRepository.create({
      username: username || `User_${phone.slice(-4)}`,
      phone_number: phone,
      password_hash: hash,
      tenant_id: tenant.id,
      role_id: 3 // 默认测试者
    });

    await this.userRepository.save(newUser);
    return { message: '注册成功', phone };
  }

  @Post('login')
  async login(@Body() body: any) {
    const { phone, password } = body;
    
    // 从数据库查找用户
    const user = await this.userRepository.findOne({ 
      where: { phone_number: phone },
      relations: ['tenant']
    });

    if (user && await bcrypt.compare(password, user.password_hash)) {
      // 检查用户是否已启用
      if (user.status !== 1) {
        throw new UnauthorizedException('你的账号已被禁用，请联系管理员');
      }

      const payload = { 
        uid: user.id, 
        tenantId: user.tenant_id, 
        role: user.role_id === 1 ? 'ADMIN' : (user.role_id === 2 ? 'DEV' : (user.role_id === 3 ? 'TESTER' : 'GUEST'))
      };

      // 强制清理：登录成功后清除失效标记
      // 虽然 iat 逻辑可以自动过滤旧 Token，但显式清理可以作为一种双重保险，
      // 确保用户只要登录成功，当前设备就绝对不会被误踢
      await this.rbacService.clearUserSessionInvalidation(user.id);

      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
        user: {
          uid: user.id,
          username: user.username,
          phone: user.phone_number,
          role: payload.role
        }
      };
    }
    
    throw new UnauthorizedException('手机号或密码错误');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }
}
