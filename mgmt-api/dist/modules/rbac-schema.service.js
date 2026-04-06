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
exports.RbacSchemaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resource_code_util_1 = require("../common/resource-code.util");
const user_entity_1 = require("../entities/user.entity");
let RbacSchemaService = class RbacSchemaService {
    constructor(dataSource, userRepository) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
    }
    async onModuleInit() {
        await this.ensureUserCodeColumn();
        await this.backfillUserCodes();
    }
    async ensureUserCodeColumn() {
        const columns = await this.dataSource.query("SHOW COLUMNS FROM users LIKE 'code'");
        if (!Array.isArray(columns) || columns.length === 0) {
            await this.dataSource.query('ALTER TABLE users ADD COLUMN code VARCHAR(128) NULL');
        }
        try {
            await this.dataSource.query('CREATE UNIQUE INDEX uq_users_code ON users (code)');
        }
        catch {
        }
    }
    async backfillUserCodes() {
        const users = await this.userRepository.find();
        const dirtyUsers = users.filter((user) => !(0, resource_code_util_1.isValidResourceCode)(user.code));
        if (dirtyUsers.length === 0) {
            return;
        }
        for (const user of dirtyUsers) {
            user.code = (0, resource_code_util_1.buildResourceCode)('user', user.username || user.phone_number, user.id);
        }
        await this.userRepository.save(dirtyUsers);
    }
};
exports.RbacSchemaService = RbacSchemaService;
exports.RbacSchemaService = RbacSchemaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository])
], RbacSchemaService);
//# sourceMappingURL=rbac-schema.service.js.map