import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
export declare class RbacService {
    private menuRepository;
    private redis;
    constructor(menuRepository: Repository<Menu>);
    getRolePermissions(roleCode: string): Promise<string[]>;
    clearRoleCache(roleCode: string): Promise<void>;
    invalidateUserSession(userId: number): Promise<void>;
    isTokenInvalid(userId: number, tokenIat: number): Promise<boolean>;
    clearUserSessionInvalidation(userId: number): Promise<void>;
}
