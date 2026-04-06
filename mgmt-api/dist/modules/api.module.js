"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const menu_entity_1 = require("../entities/menu.entity");
const user_entity_1 = require("../entities/user.entity");
const rbac_controller_1 = require("./rbac.controller");
const rbac_admin_service_1 = require("./rbac-admin.service");
const rbac_schema_service_1 = require("./rbac-schema.service");
let ApiModule = class ApiModule {
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([menu_entity_1.Menu, user_entity_1.User, user_entity_1.Tenant]), auth_module_1.AuthModule],
        controllers: [rbac_controller_1.RbacController],
        providers: [rbac_admin_service_1.RbacAdminService, rbac_schema_service_1.RbacSchemaService],
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map