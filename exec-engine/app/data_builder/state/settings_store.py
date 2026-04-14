"""进程内用户偏好（后续可迁入元数据库）。"""

from app.data_builder.config import get_settings

_runtime_encrypt: bool = False
_runtime_max_rows: int | None = None


def get_effective_settings() -> dict:
    base = get_settings()
    return {
        "encrypt_fulltext_enabled": _runtime_encrypt,
        "max_insert_select_rows": _runtime_max_rows if _runtime_max_rows is not None else base.max_insert_select_rows,
    }


def patch_settings(*, encrypt_fulltext_enabled: bool | None = None, max_insert_select_rows: int | None = None) -> None:
    global _runtime_encrypt, _runtime_max_rows
    if encrypt_fulltext_enabled is not None:
        _runtime_encrypt = encrypt_fulltext_enabled
    if max_insert_select_rows is not None:
        _runtime_max_rows = max_insert_select_rows
