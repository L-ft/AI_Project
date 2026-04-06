import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RbacService } from '../modules/rbac.service';
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepository;
    private readonly rbacService;
    constructor(userRepository: Repository<User>, rbacService: RbacService);
    validate(payload: any): Promise<{
        uid: any;
        tenantId: any;
        role: any;
        iat: any;
    }>;
}
export {};
