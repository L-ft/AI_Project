"""向后兼容：清理逻辑见 cleanup_service.CleanupService。"""

from __future__ import annotations

from app.data_builder.services.cleanup_service import run_cleanup

__all__ = ["run_cleanup"]
