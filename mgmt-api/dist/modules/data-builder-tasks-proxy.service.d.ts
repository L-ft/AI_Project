import { HttpService } from '@nestjs/axios';
export declare class DataBuilderTasksProxyService {
    private readonly http;
    constructor(http: HttpService);
    private execBase;
    forward(opts: {
        method: 'GET' | 'POST';
        path: string;
        params?: Record<string, string>;
        data?: unknown;
    }): Promise<unknown>;
}
