"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./auth.controller");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const rbac_guard_1 = require("./rbac.guard");
const permission_guard_1 = require("./permission.guard");
const roles_guard_1 = require("./roles.guard");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../entities/user.entity");
const menu_entity_1 = require("../entities/menu.entity");
const rbac_service_1 = require("../modules/rbac.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_entity_1.Tenant, menu_entity_1.Menu]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'ai_platform_secret',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard, permission_guard_1.PermissionGuard, roles_guard_1.RolesGuard, rbac_service_1.RbacService],
        exports: [jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard, rbac_service_1.RbacService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map