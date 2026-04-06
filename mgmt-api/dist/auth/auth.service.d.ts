import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, Tenant } from '../entities/user.entity';
import { RbacService } from '../modules/rbac.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly userRepository;
    private readonly tenantRepository;
    private readonly rbacService;
    constructor(jwtService: JwtService, userRepository: Repository<User>, tenantRepository: Repository<Tenant>, rbacService: RbacService);
    private mapRole;
    private ensureUserCode;
    register(body: {
        phone: string;
        password: string;
        username?: string;
    }): Promise<{
        message: string;
        phone: string;
        userCode: string;
    }>;
    login(body: {
        phone: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            uid: string;
            userCode: string;
            username: string;
            phone: string;
            role: string;
        };
    }>;
    getProfile(user: unknown): unknown;
}
