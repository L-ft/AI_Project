"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
function tryLoadOpenApiSpec() {
    const env = process.env.OPENAPI_DATA_BUILDER_PATH;
    const candidates = [
        env,
        path.join(process.cwd(), 'docs-contract', 'openapi_core.yaml'),
        path.join(process.cwd(), '..', 'docs', 'data-builder', 'openapi_core.yaml'),
        path.join(process.cwd(), 'docs', 'data-builder', 'openapi_core.yaml'),
    ].filter(Boolean);
    for (const p of candidates) {
        try {
            if (fs.existsSync(p)) {
                const raw = fs.readFileSync(p, 'utf8');
                const loaded = yaml.load(raw);
                if (loaded && typeof loaded === 'object') {
                    console.log(`[OpenAPI] Loaded spec from ${p}`);
                    return loaded;
                }
            }
        }
        catch (e) {
            console.error(`[OpenAPI] Failed to parse ${p}:`, e);
        }
    }
    console.warn('[OpenAPI] No YAML spec loaded; tried:', candidates.join(', '));
    return null;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const loaded = tryLoadOpenApiSpec();
    const spec = loaded ??
        swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
            .setTitle('Data Builder — M1')
            .setDescription('未读取到 openapi_core.yaml。Docker 请设置 OPENAPI_DATA_BUILDER_PATH 并挂载合同文件；重建 mgmt 镜像后查看日志 [OpenAPI]。')
            .setVersion('0.3.0-m1')
            .addServer('/api/v1', '经网关前缀后的 mgmt-api')
            .build());
    swagger_1.SwaggerModule.setup('docs', app, spec);
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map