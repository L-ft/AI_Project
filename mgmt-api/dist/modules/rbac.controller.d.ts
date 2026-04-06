import { RbacAdminService } from './rbac-admin.service';
export declare class RbacController {
    private readonly rbacAdminService;
    constructor(rbacAdminService: RbacAdminService);
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
    deleteRole(roleCode: string): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    updateRole(roleCode: string, data: {
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
    updateUser(userCode: string, data: {
        username: string;
        phone_number: string;
    }): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    deleteUser(userCode: string): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    updateUserRole(userCode: string, data: {
        roleId?: string | number;
        roleCode?: string;
    }): Promise<{
        message: string;
        id: string;
        code: string;
        roleId: string;
        roleCode: string;
    }>;
    updateUserStatus(userCode: string, data: {
        status: number;
    }): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    resetPassword(userCode: string, data: {
        password: string;
    }): Promise<{
        message: string;
        id: string;
        code: string;
    }>;
    getUserRole(userCode: string): Promise<{
        roleId: string;
        roleCode: string;
    }>;
    getMyMenus(req: {
        user: {
            role: string;
        };
    }): Promise<any>;
    getMenuTree(): Promise<import("../entities/menu.entity").Menu[]>;
    getRolePerms(roleCode: string): Promise<any>;
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
