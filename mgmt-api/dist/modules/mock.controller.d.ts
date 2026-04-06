import { Request, Response } from 'express';
export declare class MockController {
    private faker;
    handleMock(req: Request, res: Response): Promise<any>;
    private generateSmartMock;
}
