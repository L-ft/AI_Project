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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilderTasksProxyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const axios_2 = require("axios");
let DataBuilderTasksProxyService = class DataBuilderTasksProxyService {
    constructor(http) {
        this.http = http;
    }
    execBase() {
        return (process.env.EXEC_ENGINE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
    }
    async forward(opts) {
        const url = `${this.execBase()}/api/v1/data-builder${opts.path}`;
        try {
            const res = await this.http.axiosRef.request({
                method: opts.method,
                url,
                params: opts.params,
                data: opts.data,
                timeout: 130_000,
            });
            return res.data;
        }
        catch (e) {
            if (axios_2.default.isAxiosError(e) && e.response) {
                throw new common_1.HttpException(e.response.data, e.response.status);
            }
            const msg = e instanceof Error ? e.message : 'upstream error';
            throw new common_1.HttpException({ code: 'DB_PROXY_UPSTREAM', message: msg }, 502);
        }
    }
};
exports.DataBuilderTasksProxyService = DataBuilderTasksProxyService;
exports.DataBuilderTasksProxyService = DataBuilderTasksProxyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], DataBuilderTasksProxyService);
//# sourceMappingURL=data-builder-tasks-proxy.service.js.map