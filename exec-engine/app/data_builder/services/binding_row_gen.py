from __future__ import annotations

import random
import re
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any

_PLACEHOLDER_SQL = re.compile(r":([a-zA-Z_][a-zA-Z0-9_]*)")


def resolve_task_marker(manifest: dict[str, Any], task_id: str) -> str:
    fp = manifest.get("fingerprint") or {}
    marker = fp.get("marker") or {}
    prefix = str(marker.get("prefix", "DB_TASK_"))
    vt = str(marker.get("value_template", "${prefix}${task_id}"))
    return vt.replace("${prefix}", prefix).replace("${task_id}", task_id)


def _strategy_value(
    binding: dict[str, Any],
    *,
    task_marker: str,
    batch_index: int,
    row_index: int,
    rng: random.Random,
) -> Any:
    strategy = binding.get("strategy") or "literal"
    params = binding.get("params") if isinstance(binding.get("params"), dict) else {}

    if strategy == "literal":
        return params.get("value")
    if strategy == "uniform_int":
        lo = int(params.get("min", 0))
        hi = int(params.get("max", 1_000_000))
        return rng.randint(lo, hi)
    if strategy == "positive_decimal":
        lo = Decimal(str(params.get("min", "0.01")))
        hi = Decimal(str(params.get("max", "99.99")))
        if hi <= lo:
            return lo
        r = rng.random()
        v = lo + (hi - lo) * Decimal(str(r))
        return str(v.quantize(Decimal("0.01")))
    if strategy == "fingerprint_remark":
        base = task_marker
        if params.get("merge_mode") == "append":
            return f"{base}|b{batch_index}r{row_index}"
        return base
    if strategy == "datetime_sequence":
        return (datetime.utcnow() + timedelta(seconds=batch_index * 10_000 + row_index)).strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    if strategy == "offset_after":
        # minimal stub: fixed offset from now
        return (datetime.utcnow() + timedelta(seconds=120 + row_index)).strftime("%Y-%m-%d %H:%M:%S")
    return params.get("value", 0)


def build_placeholder_values(
    bindings: list[dict[str, Any]],
    *,
    task_marker: str,
    batch_index: int,
    row_index: int,
    rng: random.Random,
) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for b in bindings:
        ph = b.get("placeholder")
        if not ph:
            continue
        out[str(ph)] = _strategy_value(b, task_marker=task_marker, batch_index=batch_index, row_index=row_index, rng=rng)
    return out


def _sql_literal(conn: Any, value: Any) -> str:
    if value is None:
        return "NULL"
    esc = conn.escape(value)
    if isinstance(esc, (bytes, bytearray)):
        return esc.decode(conn.charset or "utf8", errors="replace")
    return str(esc)


def expand_named_sql(conn: Any, template: str, values: dict[str, Any]) -> str:
    def repl(m: re.Match[str]) -> str:
        key = m.group(1)
        if key not in values:
            raise ValueError(f"SQL 模板缺少占位符值 :{key}")
        return _sql_literal(conn, values[key])

    return _PLACEHOLDER_SQL.sub(repl, template)


def batch_row_count(manifest: dict[str, Any], batch_index: int) -> int:
    batching = manifest["generation"]["batching"]
    batches = batching.get("batches")
    if isinstance(batches, list):
        for b in batches:
            if int(b.get("batch_index", -1)) == batch_index:
                return int(b["row_count"])
    bc = int(batching["batch_count"])
    total = int(batching["total_rows"])
    if bc <= 0:
        return total
    base, rem = divmod(total, bc)
    return base + (1 if batch_index < rem else 0)
