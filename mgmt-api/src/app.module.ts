import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ApiModule } from './modules/api.module';
import { AccountModule } from './modules/account.module';
import { User, Tenant } from './entities/user.entity';
import { Menu } from './entities/menu.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root_password',
      database: process.env.DB_NAME || 'ai_automation_db',
      entities: [User, Tenant, Menu],
      charset: 'utf8mb4', // 修正为驱动支持的简写
      extra: {
        charset: 'utf8mb4_unicode_ci',
      },
      timezone: '+08:00',
      synchronize: false,
    }),
    AuthModule, 
    ApiModule, 
    AccountModule
  ],
})
export class AppModule {}
