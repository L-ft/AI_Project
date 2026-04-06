"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const typeorm_2 = require("typeorm");
const resource_code_util_1 = require("../common/resource-code.util");
const menu_entity_1 = require("../entities/menu.entity");
const user_entity_1 = require("../entities/user.entity");
const rbac_service_1 = require("./rbac.service");
let RbacAdminService = class RbacAdminService {
    constructor(menuRepository, userRepository, tenantRepository, rbacService) {
        this.menuRepository = menuRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.rbacService = rbacService;
    }
    normalizeRef(ref) {
        if (ref === null || ref === undefined) {
            return null;
        }
        const text = String(ref).trim();
        return text || null;
    }
    async resolveRole(ref) {
        const normalized = this.normalizeRef(ref);
        if (!normalized) {
            return null;
        }
        const params = [normalized.toUpperCase()];
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
    async resolveRequiredRole(ref) {
        const role = await this.resolveRole(ref);
        if (!role) {
            throw new common_1.BadRequestException('Role does not exist');
        }
        return role;
    }
    async ensureUserCode(user) {
        if (user.code) {
            return user;
        }
        user.code = (0, resource_code_util_1.buildResourceCode)('user', user.username || user.phone_number, user.id);
        return this.userRepository.save(user);
    }
    async resolveUser(userRef) {
        const normalized = this.normalizeRef(userRef);
        if (!normalized) {
            throw new common_1.BadRequestException('User does not exist');
        }
        let user = await this.userRepository.findOne({ where: { code: normalized } });
        if (!user && /^\d+$/.test(normalized)) {
            user = await this.userRepository.findOne({ where: { id: Number(normalized) } });
        }
        if (!user) {
            throw new common_1.BadRequestException('User does not exist');
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
    async createRole(data) {
        const normalizedCode = String(data.code || '').trim().toUpperCase();
        if (!data.name || !normalizedCode) {
            throw new common_1.BadRequestException('name and code are required');
        }
        await this.menuRepository.query('INSERT INTO roles (name, code, description) VALUES (?, ?, ?)', [data.name, normalizedCode, data.description || '']);
        return { message: 'role created', id: normalizedCode, code: normalizedCode };
    }
    async deleteRole(roleRef) {
        const role = await this.resolveRequiredRole(roleRef);
        await this.menuRepository.query('DELETE FROM sys_role_menu WHERE role_id = ?', [role.id]);
        await this.menuRepository.query('DELETE FROM roles WHERE id = ?', [role.id]);
        return { message: 'role deleted', id: role.code, code: role.code };
    }
    async updateRole(roleRef, data) {
        const role = await this.resolveRequiredRole(roleRef);
        await this.menuRepository.query('UPDATE roles SET name = ?, description = ? WHERE id = ?', [data.name, data.description || '', role.id]);
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
    async createUser(body) {
        const { username, phone_number, password, status } = body;
        const roleRef = body.roleCode ?? body.role_id ?? 'TESTER';
        if (!username || !phone_number || !password) {
            throw new common_1.BadRequestException('username, phone_number and password are required');
        }
        const exists = await this.userRepository.findOne({ where: { phone_number } });
        if (exists) {
            throw new common_1.BadRequestException('Phone number already exists');
        }
        const tenant = await this.tenantRepository.findOne({ where: { id: 1 } });
        if (!tenant) {
            throw new common_1.BadRequestException('Default tenant does not exist');
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
    async updateUser(userRef, data) {
        const user = await this.resolveUser(userRef);
        if (data.phone_number !== user.phone_number) {
            const exists = await this.userRepository.findOne({ where: { phone_number: data.phone_number } });
            if (exists) {
                throw new common_1.BadRequestException('Phone number already in use');
            }
        }
        await this.userRepository.update(user.id, {
            username: data.username,
            phone_number: data.phone_number,
        });
        await this.rbacService.invalidateUserSession(user.id);
        return { message: 'user updated and session invalidated', id: user.code, code: user.code };
    }
    async deleteUser(userRef) {
        const user = await this.resolveUser(userRef);
        await this.rbacService.invalidateUserSession(user.id);
        await this.userRepository.delete(user.id);
        return { message: 'user deleted', id: user.code, code: user.code };
    }
    async updateUserRole(userRef, roleRef) {
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
    async updateUserStatus(userRef, status) {
        const user = await this.resolveUser(userRef);
        await this.userRepository.update(user.id, { status });
        if (status === 0) {
            await this.rbacService.invalidateUserSession(user.id);
        }
        return { message: status === 1 ? 'user enabled' : 'user disabled', id: user.code, code: user.code };
    }
    async resetPassword(userRef, password) {
        if (!password) {
            throw new common_1.BadRequestException('password is required');
        }
        const user = await this.resolveUser(userRef);
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        await this.userRepository.update(user.id, { password_hash });
        await this.rbacService.invalidateUserSession(user.id);
        return { message: 'password reset and session invalidated', id: user.code, code: user.code };
    }
    async getUserRole(userRef) {
        const user = await this.resolveUser(userRef);
        const role = await this.resolveRole(user.role_id);
        return { roleId: role?.code || null, roleCode: role?.code || null };
    }
    async getMyMenus(role) {
        return this.menuRepository.query(`
      SELECT m.id, m.parent_id, m.title, m.permission_key, m.api_path
      FROM sys_menus m
      JOIN sys_role_menu rm ON m.id = rm.menu_id
      JOIN roles r ON rm.role_id = r.id
      WHERE UPPER(r.code) = UPPER(?)
      ORDER BY m.sort ASC
      `, [role]);
    }
    async getMenuTree() {
        return this.menuRepository.find({ order: { sort: 'ASC' } });
    }
    async getRolePerms(roleRef) {
        const role = await this.resolveRequiredRole(roleRef);
        const perms = await this.menuRepository.query('SELECT menu_id FROM sys_role_menu WHERE role_id = ?', [role.id]);
        return perms.map((item) => item.menu_id);
    }
    async assignPerms(data) {
        const role = await this.resolveRequiredRole(data.roleCode ?? data.roleId ?? null);
        const menuIds = data.menuIds;
        if (!Array.isArray(menuIds) || menuIds.some((menuId) => !Number.isInteger(Number(menuId)))) {
            throw new common_1.BadRequestException('Invalid menu ids');
        }
        await this.menuRepository.manager.transaction(async (manager) => {
            await manager.query('DELETE FROM sys_role_menu WHERE role_id = ?', [role.id]);
            for (const menuId of menuIds) {
                await manager.query('INSERT INTO sys_role_menu (role_id, menu_id) VALUES (?, ?)', [role.id, Number(menuId)]);
            }
        });
        await this.rbacService.clearRoleCache(role.code);
        return { message: 'permissions updated', roleId: role.code, roleCode: role.code };
    }
};
exports.RbacAdminService = RbacAdminService;
exports.RbacAdminService = RbacAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_entity_1.Menu)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        rbac_service_1.RbacService])
], RbacAdminService);
//# sourceMappingURL=rbac-admin.service.js.map