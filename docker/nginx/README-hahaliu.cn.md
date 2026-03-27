# hahaliu.cn 部署说明（HTTPS + 路径反代）

与你的规划一致：

| 路径 | 后端 |
|------|------|
| `/` | 前端 Docker `3010` |
| `/api/` | 管理 API Docker `3011`（Nginx 会去掉 `/api` 前缀再转发） |
| `/engine/` | 执行引擎 Docker `8010`（去掉 `/engine` 前缀） |

## 1. DNS

在域名控制台为 **hahaliu.cn**（及若使用 **www.hahaliu.cn**）添加 **A 记录**，指向云服务器公网 IP。

## 2. 云证书（Nginx）

1. 在云厂商申请/上传证书，下载 **Nginx** 格式（或 PEM + KEY）。
2. 放到服务器目录，例如：

   ```bash
   sudo mkdir -p /etc/nginx/ssl/hahaliu.cn
   # 上传 fullchain.pem（或合并后的证书链）与 privkey.pem
   ```

3. 编辑 `hahaliu.cn.conf` 里 `ssl_certificate`、`ssl_certificate_key` 为实际路径。

## 3. 执行引擎子路径（Swagger 正常）

经 `/engine` 反代时，需让 FastAPI 知道对外前缀，否则文档页会错误请求 `/openapi.json`。

在 **`docker-compose.yml`** 里给 `exec_engine_final` 增加环境变量（或单独 override 文件）：

```yaml
environment:
  - ROOT_PATH=/engine
  # 其他原有变量保持不变…
```

并在本仓库中已支持：未设置 `ROOT_PATH` 时行为与原来一致（直连 8010）。

## 4. 前端构建环境变量

反代后浏览器应请求 **同域** 的 `/api`、`/engine`，不要用 `localhost:3011`。

**方式 A：本机构建**

```bash
cd frontend
cp .env.production.domain.example .env.production
npm ci && npm run build
```

**方式 B：Docker 构建镜像（推荐与 compose 一致）**

在 `docker-compose.yml` 的 `frontend_final.build` 下增加 `args`（不要改镜像内 Nginx，只改 **构建期** 变量）：

```yaml
  frontend_final:
    build:
      context: ./frontend
      args:
        VITE_MGMT_API_URL: /api
        VITE_EXEC_ENGINE_URL: /engine
```

然后：

```bash
docker compose build frontend_final --no-cache
docker compose up -d frontend_final
```

## 5. 安装 Nginx 并启用站点

```bash
sudo cp hahaliu.cn.conf /etc/nginx/sites-available/hahaliu.cn
sudo ln -sf /etc/nginx/sites-available/hahaliu.cn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 6. 安全建议

- Docker 端口 **3010/3011/8010** 不要在安全组对公网开放，只让本机 `127.0.0.1` 访问（Compose 里可写 `127.0.0.1:3010:80` 等形式）。
- 仅开放 **80、443** 给公网。

## 7. 验证

- 打开 `https://hahaliu.cn` 能进前端。
- 登录后 Network 里接口域名为 `https://hahaliu.cn/api/...`。
- `https://hahaliu.cn/engine/docs` 能打开 Swagger。
