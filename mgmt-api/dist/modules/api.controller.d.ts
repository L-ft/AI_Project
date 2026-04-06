import { ApiService } from './api.service';
export declare class ApiController {
    private readonly apiService;
    constructor(apiService: ApiService);
    createApi(data: any): Promise<any>;
    listApis(): Promise<{
        id: number;
        name: string;
        path: string;
        method: string;
    }[]>;
    dispatchTask(id: number): Promise<any>;
}
