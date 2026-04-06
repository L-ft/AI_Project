"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const typeorm_2 = require("typeorm");
const resource_code_util_1 = require("../common/resource-code.util");
const user_entity_1 = require("../entities/user.entity");
const rbac_service_1 = require("../modules/rbac.service");
let AuthService = class AuthService {
    constructor(jwtService, userRepository, tenantRepository, rbacService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.rbacService = rbacService;
    }
    mapRole(roleId) {
        if (roleId === 1)
            return 'ADMIN';
        if (roleId === 2)
            return 'DEV';
        if (roleId === 3)
            return 'TESTER';
        return 'GUEST';
    }
    async ensureUserCode(user) {
        if (user.code) {
            return user;
        }
        user.code = (0, resource_code_util_1.buildResourceCode)('user', user.username || user.phone_number, user.id);
        return this.userRepository.save(user);
    }
    async register(body) {
        const { phone, password, username } = body;
        const existingUser = await this.userRepository.findOne({ where: { phone_number: phone } });
        if (existingUser) {
            throw new common_1.BadRequestException('Phone number already registered');
        }
        const tenant = await this.tenantRepository.findOne({ where: { id: 1 } });
        if (!tenant) {
            throw new common_1.BadRequestException('Default tenant does not exist');
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
    async login(body) {
        const { phone, password } = body;
        const user = await this.userRepository.findOne({
            where: { phone_number: phone },
            relations: ['tenant'],
        });
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new common_1.UnauthorizedException('Invalid phone or password');
        }
        if (user.status !== 1) {
            throw new common_1.UnauthorizedException('Account has been disabled');
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
    getProfile(user) {
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.Tenant)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        rbac_service_1.RbacService])
], AuthService);
//# sourceMappingURL=auth.service.js.map