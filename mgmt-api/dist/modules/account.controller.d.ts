export declare class AccountController {
    getAssetOverview(req: any): Promise<{
        apiCount: number;
        projectCount: number;
        recentExecutions: {
            id: string;
            code: string;
            name: string;
            status: string;
            time: string;
        }[];
    }>;
    generateApiKey(req: any): Promise<{
        name: string;
        apiKey: string;
        createdAt: string;
    }>;
    listApiKeys(req: any): Promise<{
        id: string;
        code: string;
        name: string;
        apiKey: string;
        isActive: boolean;
    }[]>;
}
