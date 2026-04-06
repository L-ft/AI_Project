from __future__ import annotations

import os
from typing import Any, Dict
from urllib.parse import urlparse

import httpx
from faker import Faker
from fastapi import HTTPException


fake = Faker("zh_CN")
DEFAULT_PROXY_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


class DebugService:
    def _proxy_http_client(self) -> httpx.AsyncClient:
        verify_raw = os.getenv("EXEC_PROXY_SSL_VERIFY", "true").strip().lower()
        verify = verify_raw not in ("0", "false", "no", "off")
        return httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=20.0),
            verify=verify,
            trust_env=False,
            http2=False,
            follow_redirects=True,
        )

    @staticmethod
    def _normalize_proxy_headers(headers: Any) -> Dict[str, str]:
        result: Dict[str, str] = {}
        if isinstance(headers, dict):
            result = {str(k): str(v) for k, v in headers.items() if k is not None}
        if not any(str(key).lower() == "user-agent" for key in result):
            result["User-Agent"] = DEFAULT_PROXY_UA
        return result

    @staticmethod
    def _validate_proxy_url(target_url: str) -> None:
        parsed = urlparse(target_url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise HTTPException(status_code=400, detail="Invalid proxy target url")

    async def proxy_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        target_url = str(payload.get("url") or "").strip()
        if not target_url:
            raise HTTPException(status_code=400, detail="Missing proxy target url")
        self._validate_proxy_url(target_url)

        method = str(payload.get("method") or "GET").upper()
        headers = self._normalize_proxy_headers(payload.get("headers"))
        body = payload.get("body")

        async with self._proxy_http_client() as client:
            if body is None or method == "GET":
                response = await client.request(method, target_url, headers=headers)
            elif isinstance(body, (dict, list)):
                response = await client.request(method, target_url, headers=headers, json=body)
            else:
                response = await client.request(
                    method,
                    target_url,
                    headers=headers,
                    content=str(body).encode("utf-8"),
                )

            content_type = response.headers.get("Content-Type", "") or ""
            try:
                data = response.json() if "application/json" in content_type else response.text
            except Exception:
                data = response.text

            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "data": data,
                "elapsed": response.elapsed.total_seconds() * 1000,
            }

    @staticmethod
    def smart_generate(path: str) -> Dict[str, Any]:
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
                "tip": "这是由 AI 执行引擎自动生成的随机数据",
            },
        }

    def mock_response(self, interface_path: str, query_params: Dict[str, Any]) -> Dict[str, Any]:
        if query_params.get("mobile") == "13800000000":
            return {
                "code": 200,
                "data": {
                    "user_id": 888,
                    "username": "VIP超级管理员",
                    "role": "ADMIN",
                    "notice": "已触发高级 Mock 匹配规则",
                },
                "msg": "success",
            }
        return self.smart_generate(f"/{interface_path}")

