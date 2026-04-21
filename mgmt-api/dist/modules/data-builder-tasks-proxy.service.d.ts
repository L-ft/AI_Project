import { HttpService } from '@nestjs/axios';
export declare class DataBuilderTasksProxyService {
    private readonly http;
    private readonly logger;
    private legacyLifecycleCallCount;
    constructor(http: HttpService);
    private execBase;
    forwardLegacyLifecycle(opts: {
        method: 'GET' | 'POST';
        path: string;
        params?: Record<string, string>;
        data?: unknown;
    }): Promise<unknown>;
    forwardInternal(opts: {
        path: '/execute-batch' | '/cleanup';
        data: unknown;
    }): Promise<unknown>;
    private warnLegacyLifecycleFallback;
}
