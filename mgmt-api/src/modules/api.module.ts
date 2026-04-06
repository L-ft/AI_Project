import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Menu } from '../entities/menu.entity';
import { User, Tenant } from '../entities/user.entity';
import { RbacController } from './rbac.controller';
import { RbacAdminService } from './rbac-admin.service';
import { RbacSchemaService } from './rbac-schema.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, User, Tenant]), AuthModule],
  controllers: [RbacController],
  providers: [RbacAdminService, RbacSchemaService],
})
export class ApiModule {}
