export declare class Tenant {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
}
export declare class User {
    id: number;
    code: string;
    tenant_id: number;
    username: string;
    phone_number: string;
    email: string;
    password_hash: string;
    role_id: number;
    status: number;
    created_at: Date;
    updated_at: Date;
    tenant: Tenant;
}
