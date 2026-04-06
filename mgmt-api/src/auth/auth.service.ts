import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { buildResourceCode } from '../common/resource-code.util';
import { User, Tenant } from '../entities/user.entity';
import { RbacService } from '../modules/rbac.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly rbacService: RbacService,
  ) {}

  private mapRole(roleId: number): string {
    if (roleId === 1) return 'ADMIN';
    if (roleId === 2) return 'DEV';
    if (roleId === 3) return 'TESTER';
    return 'GUEST';
  }

  private async ensureUserCode(user: User): Promise<User> {
    if (user.code) {
      return user;
    }
    user.code = buildResourceCode('user', user.username || user.phone_number, user.id);
    return this.userRepository.save(user);
  }

  async register(body: { phone: string; password: string; username?: string }) {
    const { phone, password, username } = body;
    const existingUser = await this.userRepository.findOne({ where: { phone_number: phone } });
    if (existingUser) {
      throw new BadRequestException('Phone number already registered');
    }

    const tenant = await this.tenantRepository.findOne({ where: { id: 1 } });
    if (!tenant) {
      throw new BadRequestException('Default tenant does not exist');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = this.userRepository.create({
      username: username || `User_${phone.slice(-4)}`,
      phone_number: phone,
      password_hash: passwordHash,
      tenant_id: tenant.id,
      role_id: 3,
    });

    const savedUser = await this.ensureUserCode(await this.userRepository.save(newUser));
    return { message: 'register success', phone, userCode: savedUser.code };
  }

  async login(body: { phone: string; password: string }) {
    const { phone, password } = body;
    const user = await this.userRepository.findOne({
      where: { phone_number: phone },
      relations: ['tenant'],
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('Account has been disabled');
    }

    const normalizedUser = await this.ensureUserCode(user);

    const payload = {
      uid: normalizedUser.id,
      tenantId: normalizedUser.tenant_id,
      role: this.mapRole(normalizedUser.role_id),
    };

    await this.rbacService.clearUserSessionInvalidation(normalizedUser.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        uid: normalizedUser.code,
        userCode: normalizedUser.code,
        username: normalizedUser.username,
        phone: normalizedUser.phone_number,
        role: payload.role,
      },
    };
  }

  getProfile(user: unknown) {
    return user;
  }
}
