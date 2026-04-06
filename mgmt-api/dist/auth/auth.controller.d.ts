import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: {
        user: unknown;
    }): Promise<unknown>;
}
