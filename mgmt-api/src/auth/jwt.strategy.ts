import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RbacService } from '../modules/rbac.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rbacService: RbacService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'ai_platform_secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({ where: { id: payload.uid } });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('AUTH_USER_INVALID');
    }
    if (payload?.iat && await this.rbacService.isTokenInvalid(user.id, payload.iat)) {
      throw new UnauthorizedException('AUTH_SESSION_EXPIRED');
    }
    return { uid: payload.uid, tenantId: payload.tenantId, role: payload.role, iat: payload.iat };
  }
}
