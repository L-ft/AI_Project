from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, Optional, List
import asyncio
import os
import time
from faker import Faker
import httpx
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()  # 加载 exec-engine/.env 中的环境变量

from app.database import get_db, init_db
from app.models.api_mgmt import Folder, Interface, TestCase, Environment, TestScenario
from app.schemas.api_mgmt import ResponseModel
from app.routers import folders, interfaces, test_cases, executor, environments, test_scenarios, dashboard

# 经 Nginx 挂在子路径（如 /engine）时设置 ROOT_PATH=/engine，Swagger/OpenAPI 链接才正确；直连 8010 不要设置
_root_path = os.getenv("ROOT_PATH", "").strip()
_fastapi_kw: dict = {"title": "AI Execution Engine & Mock Service"}
if _root_path:
    _fastapi_kw["root_path"] = _root_path
app = FastAPI(**_fastapi_kw)
fake = Faker("zh_CN")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境建议限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据库（MySQL 可能比本容器先起但未就绪，需重试，否则会跳过建表导致 500）
@app.on_event("startup")
def startup_event():
    last_err: Optional[Exception] = None
    for attempt in range(1, 31):
        try:
            init_db()
            print("数据库初始化成功")
            return
        except Exception as e:
            last_err = e
            print(f"数据库初始化失败 (第 {attempt}/30 次，2s 后重试): {e}")
            time.sleep(2)
    print(f"数据库初始化在多次重试后仍失败: {last_err}")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# 注册路由模块
app.include_router(folders.router)
app.include_router(interfaces.router)
app.include_router(test_cases.router)
app.include_router(executor.router)
app.include_router(environments.router)
app.include_router(test_scenarios.router)
app.include_router(dashboard.router)

_DEFAULT_PROXY_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


def _proxy_http_client() -> httpx.AsyncClient:
    """
    调试代理专用 httpx 客户端。
    - trust_env=False：避免 Windows 下 HTTP(S)_PROXY 等环境变量导致 TLS 握手被中断（EOF）。
    - http2=False：部分网关对 HTTP/2 支持差，易在握手阶段断开。
    - verify：默认校验证书；在 .env 设置 EXEC_PROXY_SSL_VERIFY=0 可关闭（仅建议内网调试）。
    """
    verify_raw = os.getenv("EXEC_PROXY_SSL_VERIFY", "true").strip().lower()
    verify = verify_raw not in ("0", "false", "no", "off")
    return httpx.AsyncClient(
        timeout=httpx.Timeout(30.0, connect=20.0),
        verify=verify,
        trust_env=False,
        http2=False,
        follow_redirects=True,
    )


def _normalize_proxy_headers(h: Any) -> Dict[str, str]:
    out: Dict[str, str] = {}
    if isinstance(h, dict):
        out = {str(k): str(v) for k, v in h.items() if k is not None}
    if not any(str(k).lower() == "user-agent" for k in out):
        out["User-Agent"] = _DEFAULT_PROXY_UA
    return out


# --- 调试代理服务 ---
@app.post("/proxy")
async def debug_proxy(request: Request):
    """
    调试代理：将前端请求转发到目标真实服务器
    """
    try:
        data = await request.json()
        target_url = data.get("url")  # 目标完整路径
        method = data.get("method", "GET")
        headers = _normalize_proxy_headers(data.get("headers"))
        payload = data.get("body")
        
        print(f"[Proxy] 转发请求: {method} {target_url}")

        m = (method or "GET").upper()
        async with _proxy_http_client() as client:
            if payload is None or m == "GET":
                resp = await client.request(
                    m, target_url, headers=headers
                )
            elif isinstance(payload, (dict, list)):
                resp = await client.request(
                    m, target_url, headers=headers, json=payload
                )
            else:
                body_bytes = str(payload).encode("utf-8")
                resp = await client.request(
                    m, target_url, headers=headers, content=body_bytes
                )

            ct = resp.headers.get("Content-Type", "") or ""
            try:
                if "application/json" in ct:
                    data_out = resp.json()
                else:
                    data_out = resp.text
            except Exception:
                data_out = resp.text

            return {
                "status_code": resp.status_code,
                "headers": dict(resp.headers),
                "data": data_out,
                "elapsed": resp.elapsed.total_seconds() * 1000,
            }
    except Exception as e:
        return {"error": str(e), "msg": "代理请求失败"}

# --- Mock 引擎逻辑 ---

def smart_generate(path: str) -> Dict[str, Any]:
    """根据路径信息智能生成随机数据"""
    return {
        "code": 200,
        "msg": "success",
        "data": {
            "id": fake.random_int(min=1000, max=9999),
            "name": fake.name(),
            "email": fake.email(),
            "phone": fake.phone_number(),
            "address": fake.address(),
            "company": fake.company(),
            "created_at": fake.date_time_this_year().isoformat(),
            "mock_path": path,
            "tip": "这是由 AI 引擎自动生成的随机数据"
        }
    }

@app.api_route("/mock/{interface_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def dynamic_mock_handler(request: Request, interface_path: str):
    """
    通配符 Mock 路由
    """
    method = request.method
    query_params = dict(request.query_params)
    
    print(f"[Mock Engine] 收到请求: {method} /{interface_path}, 参数: {query_params}")

    if query_params.get("mobile") == "13800000000":
        return {
            "code": 200,
            "data": {
                "user_id": 888,
                "username": "VIP超级管理员",
                "role": "ADMIN",
                "notice": "已触发高级 Mock 匹配规则"
            },
            "msg": "success"
        }

    return smart_generate(f"/{interface_path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
