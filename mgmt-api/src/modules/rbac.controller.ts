import { Controller, Get, Post, Body, UseGuards, Param, Delete, Put, Request, BadRequestException } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { User, Tenant } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Controller('rbac')
@UseGuards(JwtAuthGuard, RbacGuard)
export class RbacController {
  constructor(
    private rbacService: RbacService,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>
  ) {}

  @Get('roles')
  async getRoles() {
    const roles = await this.menuRepository.query('SELECT * FROM roles ORDER BY id ASC');
    return roles;
  }

  @Post('roles')
  async createRole(@Body() data: { name: string; code: string; description?: string }) {
    await this.menuRepository.query(
      'INSERT INTO roles (name, code, description) VALUES (?, ?, ?)',
      [data.name, data.code, data.description || '']
    );
    return { message: '角色创建成功' };
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: number) {
    // 先删除关联权限，再删除角色
    await this.menuRepository.query('DELETE FROM sys_role_menu WHERE role_id = ?', [id]);
    await this.menuRepository.query('DELETE FROM roles WHERE id = ?', [id]);
    return { message: '角色删除成功' };
  }

  @Put('roles/:id')
  async updateRole(@Param('id') id: number, @Body() data: { name: string; description?: string }) {
    await this.menuRepository.query(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [data.name, data.description || '', id]
    );
    return { message: '角色更新成功' };
  }

  @Get('users')
  async getUsers() {
    // 获取用户列表，关联角色名称
    return await this.userRepository.query(`
      SELECT u.id, u.username, u.phone_number, u.email, u.role_id, u.status, u.created_at, u.updated_at, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
  }

  @Post('users')
  async createUser(@Body() body: any) {
    const { username, phone_number, password, status, role_id } = body;

    // 1. 校验必填
    if (!username || !phone_number || !password) {
      throw new BadRequestException('用户名、手机号和密码为必填项');
    }

    // 2. 检查手机号冲突
    const exists = await this.userRepository.findOne({ where: { phone_number } });
    if (exists) {
      throw new BadRequestException('手机号已存在');
    }

    // 3. 密码加密
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. 创建用户 (默认分配给 ID 为 1 的租户)
    const newUser = this.userRepository.create({
      username,
      phone_number,
      password_hash,
      status: status ?? 1,
      role_id: role_id ?? 3,
      tenant_id: 1
    });

    await this.userRepository.save(newUser);
    return { message: '用户创建成功' };
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: number, @Body() data: { username: string; phone_number: string }) {
    const { username, phone_number } = data;
    
    // 1. 检查是否存在
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('用户不存在');

    // 2. 检查手机号冲突 (如果修改了手机号)
    if (phone_number !== user.phone_number) {
      const exists = await this.userRepository.findOne({ where: { phone_number } });
      if (exists) throw new BadRequestException('新手机号已被其他用户使用');
    }

    // 3. 更新数据
    await this.userRepository.update(id, { username, phone_number });

    // 4. 强制下线逻辑：在 Redis 中标记失效
    await this.rbacService.invalidateUserSession(id);

    return { message: '用户信息更新成功，对应账号已强制下线' };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
    await this.userRepository.delete(id);
    return { message: '用户删除成功' };
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: number, @Body() data: { roleId: number }) {
    await this.userRepository.update(id, { role_id: data.roleId });
    // 权限变更，强制下线
    await this.rbacService.invalidateUserSession(id);
    return { message: '角色分配成功，该用户已强制下线' };
  }

  @Put('users/:id/status')
  async updateUserStatus(@Param('id') id: number, @Body() data: { status: number }) {
    await this.userRepository.update(id, { status: data.status });
    // 状态变更，如果是禁用则强制下线
    if (data.status === 0) {
      await this.rbacService.invalidateUserSession(id);
    }
    return { message: `用户已${data.status === 1 ? '启用' : '禁用'}` };
  }

  @Put('users/:id/password')
  async resetPassword(@Param('id') id: number, @Body() data: { password: string }) {
    if (!data.password) {
      throw new BadRequestException('新密码不能为空');
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);
    await this.userRepository.update(id, { password_hash });
    
    // 密码重置后，也强制下线该用户
    await this.rbacService.invalidateUserSession(id);
    
    return { message: '密码重置成功，该用户已强制下线' };
  }

  @Get('users/:id/role')
  async getUserRole(@Param('id') id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    return { roleId: user?.role_id };
  }

  @Get('my-menus')
  async getMyMenus(@Request() req) {
    const { role } = req.user; // role is 'ADMIN', 'DEV', or 'TESTER'
    // 通过角色代码查询对应的菜单 ID 列表，增加 UPPER 兼容性
    const menus = await this.menuRepository.query(`
      SELECT m.id, m.parent_id, m.title, m.permission_key, m.api_path
      FROM sys_menus m
      JOIN sys_role_menu rm ON m.id = rm.menu_id
      JOIN roles r ON rm.role_id = r.id
      WHERE UPPER(r.code) = UPPER(?)
      ORDER BY m.sort ASC
    `, [role]);
    return menus;
  }

  @Get('menus')
  async getMenuTree() {
    const menus = await this.menuRepository.find({ order: { sort: 'ASC' } });
    // 简单树形转换逻辑 (也可由前端处理)
    return menus;
  }

  @Get('role-perms/:roleId')
  async getRolePerms(@Param('roleId') roleId: number) {
    const perms = await this.menuRepository.query(
      'SELECT menu_id FROM sys_role_menu WHERE role_id = ?',
      [roleId]
    );
    return perms.map((p: any) => p.menu_id);
  }

  @Post('assign-perms')
  async assignPerms(@Body() data: { roleId: number; menuIds: number[] }) {
    const { roleId, menuIds } = data;
    
    // 1. 事务处理：先删后增
    await this.menuRepository.query('DELETE FROM sys_role_menu WHERE role_id = ?', [roleId]);
    if (menuIds.length > 0) {
      const values = menuIds.map(mid => `(${roleId}, ${mid})`).join(',');
      await this.menuRepository.query(`INSERT INTO sys_role_menu (role_id, menu_id) VALUES ${values}`);
    }

    // 2. 清除 Redis 缓存，强制下次请求重新加载权限
    const role = await this.menuRepository.query('SELECT code FROM roles WHERE id = ?', [roleId]);
    if (role.length > 0) {
      await this.rbacService.clearRoleCache(role[0].code);
    }

    return { message: '权限矩阵更新成功' };
  }
}
