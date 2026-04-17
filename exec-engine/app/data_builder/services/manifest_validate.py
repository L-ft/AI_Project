from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import jsonschema

_SCHEMA_CACHE: dict[str, Any] | None = None


def _exec_engine_root() -> Path:
    # …/exec-engine/app/data_builder/services/manifest_validate.py -> …/exec-engine
    return Path(__file__).resolve().parents[3]


def _bundled_schema_path() -> Path:
    # …/app/data_builder/schemas/manifest_v1.schema.json（随 Docker 镜像发布）
    return Path(__file__).resolve().parents[1] / "schemas" / "manifest_v1.schema.json"


def _load_manifest_schema() -> dict[str, Any]:
    global _SCHEMA_CACHE
    if _SCHEMA_CACHE is not None:
        return _SCHEMA_CACHE

    env_path = (os.environ.get("DATA_BUILDER_MANIFEST_SCHEMA") or "").strip()
    candidates: list[Path] = []
    if env_path:
        candidates.append(Path(env_path))
    # 单体仓库本地开发：优先与 docs 单一事实来源一致
    candidates.append(_exec_engine_root().parent / "docs" / "data-builder" / "manifest_v1.schema.json")
    candidates.append(_bundled_schema_path())

    for p in candidates:
        if p.is_file():
            _SCHEMA_CACHE = json.loads(p.read_text(encoding="utf-8"))
            return _SCHEMA_CACHE
    raise FileNotFoundError(
        "manifest_v1.schema.json not found. "
        "Set DATA_BUILDER_MANIFEST_SCHEMA or ensure app/data_builder/schemas/manifest_v1.schema.json exists (Docker)."
    )


def validate_manifest(manifest: dict[str, Any]) -> None:
    schema = _load_manifest_schema()
    jsonschema.validate(instance=manifest, schema=schema)
    _validate_rowset_rules(manifest)


_LIMIT_RE = re.compile(r"(?is)\blimit\s+(\d+)\s*$")


def _strip_limit(sql: str) -> tuple[str, int | None]:
    s = sql.strip().rstrip(";").strip()
    m = _LIMIT_RE.search(s)
    if not m:
        return s, None
    n = int(m.group(1))
    return s[: m.start()].rstrip(), n


def _select_column_names(sql: str) -> list[str]:
    """Very small parser: expects SELECT `a`, b FROM ... — enough for contract checks."""
    text = sql.strip()
    if not text.upper().startswith("SELECT"):
        return []
    m = re.match(r"(?is)select\s+(.*?)\s+from\b", text)
    if not m:
        return []
    inner = m.group(1)
    parts = inner.split(",")
    cols: list[str] = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        pm = re.match(r"^`([^`]+)`", p)
        if pm:
            cols.append(pm.group(1))
            continue
        pm = re.match(r"^(\w+)", p)
        if pm:
            cols.append(pm.group(1))
    return cols


def _validate_rowset_rules(manifest: dict[str, Any]) -> None:
    assertions = manifest.get("assertions") or []
    for rule in assertions:
        at = rule.get("assertion_type") or "scalar"
        if at != "rowset":
            continue
        sql = rule.get("sql") or ""
        pks = rule.get("primary_key_columns") or []
        cols = _select_column_names(sql)
        for pk in pks:
            if pk not in cols:
                raise ValueError(
                    f"断言 {rule.get('id')}: rowset SELECT 必须包含主键列 `{pk}`（当前解析到列: {cols}）"
                )
        _, lim = _strip_limit(sql)
        if lim is not None and lim > 20:
            raise ValueError(f"断言 {rule.get('id')}: rowset LIMIT 不得超过 20（当前 {lim}）")
