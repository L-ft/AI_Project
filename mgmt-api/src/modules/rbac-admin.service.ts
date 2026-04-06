import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { buildResourceCode } from '../common/resource-code.util';
import { Menu } from '../entities/menu.entity';
import { Tenant, User } from '../entities/user.entity';
import { RbacService } from './rbac.service';


type RoleRow = {
  id: number;
  code: string;
  name: string;
  description?: string;
};


@Injectable()
export class RbacAdminService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly rbacService: RbacService,
  ) {}

  private normalizeRef(ref: string | number | null | undefined): string | null {
    if (ref === null || ref === undefined) {
      return null;
    }
    const text = String(ref).trim();
    return text || null;
  }

  private async resolveRole(ref: string | number | null | undefined): Promise<RoleRow | null> {
    const normalized = this.normalizeRef(ref);
    if (!normalized) {
      return null;
    }

    const params: Array<string | number> = [normalized.toUpperCase()];
    let sql = `
      SELECT id, code, name, description
      FROM roles
      WHERE UPPER(code) = ?
    `;
    if (/^\d+$/.test(normalized)) {
      sql += ' OR id = ?';
      params.push(Number(normalized));
    }
    sql += ' ORDER BY id ASC LIMIT 1';

    const rows = await this.menuRepository.query(sql, params);
    return rows[0] ?? null;
  }

  private async resolveRequiredRole(ref: string | number | null | undefined): Promise<RoleRow> {
    const role = await this.resolveRole(ref);
    if (!role) {
      throw new BadRequestException('Role does not exist');
    }
    return role;
  }

  private async ensureUserCode(user: User): Promise<User> {
    if (user.code) {
      return user;
    }
    user.code = buildResourceCode('user', user.username || user.phone_number, user.id);
    return this.userRepository.save(user);
  }

  private async resolveUser(userRef: string | number): Promise<User> {
    const normalized = this.normalizeRef(userRef);
    if (!normalized) {
      throw new BadRequestException('User does not exist');
    }

    let user = await this.userRepository.findOne({ where: { code: normalized } });
    if (!user && /^\d+$/.test(normalized)) {
      user = await this.userRepository.findOne({ where: { id: Number(normalized) } });
    }
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return this.ensureUserCode(user);
  }

  async getRoles() {
    return this.menuRepository.query(`
      SELECT code AS id, code, name, description
      FROM roles
      ORDER BY id ASC
    `);
  }

  async createRole(data: { name: string; code: string; description?: string }) {
    const normalizedCode = String(data.code || '').trim().toUpperCase();
    if (!data.name || !normalizedCode) {
      throw new BadRequestException('name and code are required');
    }

    await this.menuRepository.query(
      'INSERT INTO roles (name, code, description) VALUES (?, ?, ?)',
      [data.name, normalizedCode, data.description || ''],
    );
    return { message: 'role created', id: normalizedCode, code: normalizedCode };
  }

  async deleteRole(roleRef: string) {
    const role = await this.resolveRequiredRole(roleRef);
    await this.menuRepository.query('DELETE FROM sys_role_menu WHERE role_id = ?', [role.id]);
    await this.menuRepository.query('DELETE FROM roles WHERE id = ?', [role.id]);
    return { message: 'role deleted', id: role.code, code: role.code };
  }

  async updateRole(roleRef: string, data: { name: string; description?: string }) {
    const role = await this.resolveRequiredRole(roleRef);
    await this.menuRepository.query(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [data.name, data.description || '', role.id],
    );
    return { message: 'role updated', id: role.code, code: role.code };
  }

  async getUsers() {
    const rows = await this.userRepository.query(`
      SELECT
        u.code AS id,
        u.code AS code,
        u.username,
        u.phone_number,
        u.email,
        r.code AS role_id,
        r.code AS roleCode,
        u.status,
        u.created_at,
        u.updated_at,
        r.name AS role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  }

  async createUser(body: {
    username: string;
    phone_number: string;
    password: string;
    status?: number;
    role_id?: string | number;
    roleCode?: string;
  }) {
    const { username, phone_number, password, status } = body;
    const roleRef = body.roleCode ?? body.role_id ?? 'TESTER';

    if (!username || !phone_number || !password) {
      throw new BadRequestException('username, phone_number and password are required');
    }

    const exists = await this.userRepository.findOne({ where: { phone_number } });
    if (exists) {
      throw new BadRequestException('Phone number already exists');
    }

    const tenant = await this.tenantRepository.findOne({ where: { id: 1 } });
    if (!tenant) {
      throw new BadRequestException('Default tenant does not exist');
    }

    const role = await this.resolveRequiredRole(roleRef);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newUser = this.userRepository.create({
      username,
      phone_number,
      password_hash,
      status: status ?? 1,
      role_id: role.id,
      tenant_id: tenant.id,
    });

    const savedUser = await this.ensureUserCode(await this.userRepository.save(newUser));
    return { message: 'user created', id: savedUser.code, code: savedUser.code };
  }

  async updateUser(userRef: string, data: { username: string; phone_number: string }) {
    const user = await this.resolveUser(userRef);

    if (data.phone_number !== user.phone_number) {
      const exists = await this.userRepository.findOne({ where: { phone_number: data.phone_number } });
      if (exists) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    await this.userRepository.update(user.id, {
      username: data.username,
      phone_number: data.phone_number,
    });
    await this.rbacService.invalidateUserSession(user.id);
    return { message: 'user updated and session invalidated', id: user.code, code: user.code };
  }

  async deleteUser(userRef: string) {
    const user = await this.resolveUser(userRef);
    await this.rbacService.invalidateUserSession(user.id);
    await this.userRepository.delete(user.id);
    return { message: 'user deleted', id: user.code, code: user.code };
  }

  async updateUserRole(userRef: string, roleRef: string | number | null) {
    const user = await this.resolveUser(userRef);
    const role = await this.resolveRequiredRole(roleRef);
    await this.userRepository.update(user.id, { role_id: role.id });
    await this.rbacService.invalidateUserSession(user.id);
    return {
      message: 'user role updated and session invalidated',
      id: user.code,
      code: user.code,
      roleId: role.code,
      roleCode: role.code,
    };
  }

  async updateUserStatus(userRef: string, status: number) {
    const user = await this.resolveUser(userRef);
    await this.userRepository.update(user.id, { status });
    if (status === 0) {
      await this.rbacService.invalidateUserSession(user.id);
    }
    return { message: status === 1 ? 'user enabled' : 'user disabled', id: user.code, code: user.code };
  }

  async resetPassword(userRef: string, password: string) {
    if (!password) {
      throw new BadRequestException('password is required');
    }

    const user = await this.resolveUser(userRef);
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    await this.userRepository.update(user.id, { password_hash });
    await this.rbacService.invalidateUserSession(user.id);
    return { message: 'password reset and session invalidated', id: user.code, code: user.code };
  }

  async getUserRole(userRef: string) {
    const user = await this.resolveUser(userRef);
    const role = await this.resolveRole(user.role_id);
    return { roleId: role?.code || null, roleCode: role?.code || null };
  }

  async getMyMenus(role: string) {
    return this.menuRepository.query(
      `
      SELECT m.id, m.parent_id, m.title, m.permission_key, m.api_path
      FROM sys_menus m
      JOIN sys_role_menu rm ON m.id = rm.menu_id
      JOIN roles r ON rm.role_id = r.id
      WHERE UPPER(r.code) = UPPER(?)
      ORDER BY m.sort ASC
      `,
      [role],
    );
  }

  async getMenuTree() {
    return this.menuRepository.find({ order: { sort: 'ASC' } });
  }

  async getRolePerms(roleRef: string) {
    const role = await this.resolveRequiredRole(roleRef);
    const perms = await this.menuRepository.query(
      'SELECT menu_id FROM sys_role_menu WHERE role_id = ?',
      [role.id],
    );
    return perms.map((item: { menu_id: number }) => item.menu_id);
  }

  async assignPerms(data: { roleId?: string | number; roleCode?: string; menuIds: number[] }) {
    const role = await this.resolveRequiredRole(data.roleCode ?? data.roleId ?? null);
    const menuIds = data.menuIds;
    if (!Array.isArray(menuIds) || menuIds.some((menuId) => !Number.isInteger(Number(menuId)))) {
      throw new BadRequestException('Invalid menu ids');
    }

    await this.menuRepository.manager.transaction(async (manager) => {
      await manager.query('DELETE FROM sys_role_menu WHERE role_id = ?', [role.id]);
      for (const menuId of menuIds) {
        await manager.query(
          'INSERT INTO sys_role_menu (role_id, menu_id) VALUES (?, ?)',
          [role.id, Number(menuId)],
        );
      }
    });

    await this.rbacService.clearRoleCache(role.code);
    return { message: 'permissions updated', roleId: role.code, roleCode: role.code };
  }
}
