import { HttpService } from '@nestjs/axios';
export declare class ApiService {
    private readonly httpService;
    constructor(httpService: HttpService);
    create(data: any): Promise<any>;
    findAll(): Promise<{
        id: number;
        name: string;
        path: string;
        method: string;
    }[]>;
    dispatchToFastAPI(apiId: number): Promise<any>;
}
