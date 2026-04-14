"""运行时配置（后续可扩展：元数据库、LLM、造数上限等）。"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # 与网关 strip 前缀后的路径一致：/api/v1/...
    api_v1_prefix: str = "/api/v1"

    # 用户目标库造数时的默认上限（可被用户设置覆盖，后续接入）
    max_insert_select_rows: int = 1_000_000


@lru_cache
def get_settings() -> Settings:
    return Settings()
