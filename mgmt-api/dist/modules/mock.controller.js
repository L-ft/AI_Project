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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const faker_1 = require("@faker-js/faker");
let MockController = class MockController {
    constructor() {
        this.faker = new faker_1.Faker({ locale: [faker_1.zh_CN] });
    }
    async handleMock(req, res) {
        const path = req.params[0];
        const method = req.method;
        const query = req.query;
        console.log(`[Mock] 收到请求: ${method} ${path}`, query);
        if (path === '/auth/oauth/token' && query.mobile === '13800000000') {
            return res.json({
                code: 200,
                data: { user_id: 999, username: 'VIP用户', token: 'special-mock-token' },
                msg: '命中高级 Mock 规则'
            });
        }
        const mockResponse = this.generateSmartMock(path);
        return res.json(mockResponse);
    }
    generateSmartMock(path) {
        return {
            code: 200,
            msg: 'success',
            data: {
                id: this.faker.number.int({ min: 100, max: 999 }),
                name: this.faker.person.fullName(),
                email: this.faker.internet.email(),
                phone: this.faker.phone.number(),
                status: this.faker.helpers.arrayElement(['active', 'inactive', 'pending']),
                created_at: this.faker.date.past().toISOString(),
                description: `这是针对路径 ${path} 自动生成的智能 Mock 数据`
            }
        };
    }
};
exports.MockController = MockController;
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], MockController.prototype, "handleMock", null);
exports.MockController = MockController = __decorate([
    (0, common_1.Controller)('mock')
], MockController);
//# sourceMappingURL=mock.controller.js.map