import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import Redis from 'ioredis';

@Injectable()
export class RbacService {
  private redis: Redis;

  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    });
  }

  /**
   * 获取指定角色的所有可访问 API 路径列表 (带缓存)
   */
  async getRolePermissions(roleCode: string): Promise<string[]> {
    const normalizedCode = roleCode.toUpperCase();
    const cacheKey = `role_perms:${normalizedCode}`;
    
    // 1. 优先从 Redis 获取
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. 缓存失效，查 MySQL
    // 使用 UPPER 确保匹配，无论数据库存的是大写还是小写
    const menus = await this.menuRepository.query(`
      SELECT m.api_path 
      FROM sys_menus m
      JOIN sys_role_menu rm ON m.id = rm.menu_id
      JOIN roles r ON rm.role_id = r.id
      WHERE UPPER(r.code) = ? AND m.api_path IS NOT NULL
    `, [normalizedCode]);

    const perms = menus.map((m: any) => m.api_path);

    // 3. 写入 Redis，缓存 1 小时
    await this.redis.set(cacheKey, JSON.stringify(perms), 'EX', 3600);
    
    return perms;
  }

  /**
   * 当权限变更时清除缓存
   */
  async clearRoleCache(roleCode: string) {
    const normalizedCode = roleCode.toUpperCase();
    await this.redis.del(`role_perms:${normalizedCode}`);
  }

  /**
   * 记录用户关键信息变更的时间戳 (强制该时间点之前的 Token 失效)
   */
  async invalidateUserSession(userId: number) {
    const now = Math.floor(Date.now() / 1000);
    // 设置 24 小时过期，对应 JWT 的最大有效期
    await this.redis.set(`user_invalid_before:${userId}`, now, 'EX', 86400);
  }

  /**
   * 检查 Token 是否在失效标记之前签发
   */
  async isTokenInvalid(userId: number, tokenIat: number): Promise<boolean> {
    const invalidBefore = await this.redis.get(`user_invalid_before:${userId}`);
    if (!invalidBefore) return false;
    
    const invalidTime = parseInt(invalidBefore);
    
    // 严格判定逻辑：
    // 如果 Token 签发时间 (tokenIat) 小于等于 账号变更时间 (invalidTime)，
    // 则说明该 Token 是基于旧信息签发的，必须立即判定为失效。
    const isInvalid = tokenIat <= invalidTime;
    
    if (isInvalid) {
      console.warn(`[RbacService] 强制下线生效: userId=${userId}, Token签发时间(${tokenIat}) <= 变更时间(${invalidTime})`);
    }
    
    return isInvalid;
  }

  /**
   * 清除用户失效标记 (现在主要用于用户注销或特殊重置)
   */
  async clearUserSessionInvalidation(userId: number) {
    await this.redis.del(`user_invalid_before:${userId}`);
  }
}
