import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

function tryLoadOpenApiSpec(): Record<string, unknown> | null {
  const env = process.env.OPENAPI_DATA_BUILDER_PATH;
  const candidates = [
    env,
    path.join(process.cwd(), 'docs-contract', 'openapi_core.yaml'),
    path.join(process.cwd(), '..', 'docs', 'data-builder', 'openapi_core.yaml'),
    path.join(process.cwd(), 'docs', 'data-builder', 'openapi_core.yaml'),
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const loaded = yaml.load(raw) as Record<string, unknown> | null;
        if (loaded && typeof loaded === 'object') {
          // eslint-disable-next-line no-console
          console.log(`[OpenAPI] Loaded spec from ${p}`);
          return loaded;
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[OpenAPI] Failed to parse ${p}:`, e);
    }
  }
  // eslint-disable-next-line no-console
  console.warn('[OpenAPI] No YAML spec loaded; tried:', candidates.join(', '));
  return null;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // 注册全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  // 注册全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  const loaded = tryLoadOpenApiSpec();
  const spec =
    loaded ??
    (SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Data Builder — M1')
        .setDescription(
          '未读取到 openapi_core.yaml。Docker 请设置 OPENAPI_DATA_BUILDER_PATH 并挂载合同文件；重建 mgmt 镜像后查看日志 [OpenAPI]。',
        )
        .setVersion('0.3.0-m1')
        .addServer('/api/v1', '经网关前缀后的 mgmt-api')
        .build(),
    ) as unknown as Record<string, unknown>);

  // 使用 /docs 而非 /api/docs：避免与网关 /api 前缀、Express 路由顺序导致 404（Docker 下常见）
  SwaggerModule.setup('docs', app, spec as never);

  await app.listen(3000);
}
bootstrap();
