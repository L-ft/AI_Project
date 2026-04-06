import { OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class RbacSchemaService implements OnModuleInit {
    private readonly dataSource;
    private readonly userRepository;
    constructor(dataSource: DataSource, userRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    private ensureUserCodeColumn;
    private backfillUserCodes;
}
