import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '../entities/menu.entity';
import { User, Tenant } from '../entities/user.entity';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Menu, User, Tenant])],
  controllers: [ApiController, RbacController],
  providers: [ApiService, RbacService],
  exports: [RbacService],
})
export class ApiModule {}
