import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User, Tenant } from '../entities/user.entity';
import { Menu } from '../entities/menu.entity';
import { RbacService } from '../modules/rbac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Menu]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ai_platform_secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard, RbacService],
  exports: [JwtAuthGuard, RbacService],
})
export class AuthModule {}
