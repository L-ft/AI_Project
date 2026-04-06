import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { Tenant, User } from '../entities/user.entity';
import { RbacService } from './rbac.service';
export declare class RbacAdminService {
    private readonly menuRepository;
    private readonly userRepository;
    private readonly tenantRepository;
    private readonly rbacService;
    constructor(menuRepository: Repository<Menu>, userRepository: Repository<User>, tenantRepository: Repository<Tenant>, rbacService: RbacService);
    private normalizeRef;
    private resolveRole;
    private resolveRequiredRole;
    private ensureUserCode;
    private resolveUser;
    getRoles(): Promise<any>;
    createRole(data: {
        name: string;
        code: string;
        description?: string;
    }): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    deleteRole(roleRef: string): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    updateRole(roleRef: string, data: {
        name: string;
        description?: string;
    }): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    getUsers(): Promise<any>;
    createUser(body: {
        username: string;
        phone_number: string;
        password: string;
        status?: number;
        role_id?: string | number;
        roleCode?: string;
    }): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    updateUser(userRef: string, data: {
        username: string;
        phone_number: string;
    }): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    deleteUser(userRef: string): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    updateUserRole(userRef: string, roleRef: string | number | null): Promise<{
        message: string;
        id: string;
        code: string;
        roleId: string;
        roleCode: string;
    }>;
    updateUserStatus(userRef: string, status: number): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    resetPassword(userRef: string, password: string): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    getUserRole(userRef: string): Promise<{
        roleId: string;
        roleCode: string;
    }>;
    getMyMenus(role: string): Promise<any>;
    getMenuTree(): Promise<Menu[]>;
    getRolePerms(roleRef: string): Promise<any>;
    assignPerms(data: {
        roleId?: string | number;
        roleCode?: string;
        menuIds: number[];
    }): Promise<{
        message: string;
        roleId: string;
        roleCode: string;
    }>;
}
