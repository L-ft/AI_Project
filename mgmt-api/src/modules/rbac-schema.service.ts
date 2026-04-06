import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { buildResourceCode, isValidResourceCode } from '../common/resource-code.util';
import { User } from '../entities/user.entity';


@Injectable()
export class RbacSchemaService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureUserCodeColumn();
    await this.backfillUserCodes();
  }

  private async ensureUserCodeColumn(): Promise<void> {
    const columns = await this.dataSource.query("SHOW COLUMNS FROM users LIKE 'code'");
    if (!Array.isArray(columns) || columns.length === 0) {
      await this.dataSource.query('ALTER TABLE users ADD COLUMN code VARCHAR(128) NULL');
    }

    try {
      await this.dataSource.query('CREATE UNIQUE INDEX uq_users_code ON users (code)');
    } catch {
      // ignore when index already exists
    }
  }

  private async backfillUserCodes(): Promise<void> {
    const users = await this.userRepository.find();
    const dirtyUsers = users.filter((user) => !isValidResourceCode(user.code));
    if (dirtyUsers.length === 0) {
      return;
    }

    for (const user of dirtyUsers) {
      user.code = buildResourceCode('user', user.username || user.phone_number, user.id);
    }
    await this.userRepository.save(dirtyUsers);
  }
}
