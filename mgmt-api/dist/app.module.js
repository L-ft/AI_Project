"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const api_module_1 = require("./modules/api.module");
const account_module_1 = require("./modules/account.module");
const data_builder_tasks_proxy_module_1 = require("./modules/data-builder-tasks-proxy.module");
const user_entity_1 = require("./entities/user.entity");
const menu_entity_1 = require("./entities/menu.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || 'root_password',
                database: process.env.DB_NAME || 'ai_automation_db',
                entities: [user_entity_1.User, user_entity_1.Tenant, menu_entity_1.Menu],
                charset: 'utf8mb4',
                extra: {
                    charset: 'utf8mb4_unicode_ci',
                },
                timezone: '+08:00',
                synchronize: false,
            }),
            auth_module_1.AuthModule,
            api_module_1.ApiModule,
            account_module_1.AccountModule,
            data_builder_tasks_proxy_module_1.DataBuilderTasksProxyModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map