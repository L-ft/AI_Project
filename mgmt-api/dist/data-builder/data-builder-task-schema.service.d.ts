import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DataBuilderTaskSchemaService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private ensureTaskTables;
    private columnExists;
    private ensureColumnDefault;
    private getColumnDefault;
}
