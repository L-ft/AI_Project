"""占位：未接入 LLM 时返回可校验的预览结构，便于前端联调。"""

from __future__ import annotations

from typing import Any

from app.schemas.generate import BindingItem, GeneratePreviewOut


def build_stub_preview(
    *,
    instruction: str,
    target_table: str,
    table_schema: dict[str, Any],
    generation_mode: str,
) -> GeneratePreviewOut:
    cols_raw = table_schema.get("columns") if isinstance(table_schema, dict) else None
    col_names: list[str] = []
    if isinstance(cols_raw, list):
        for c in cols_raw:
            if isinstance(c, dict) and c.get("name"):
                col_names.append(str(c["name"]))

    if not col_names:
        col_names = ["id"]

    placeholders = ", ".join(f":{c}" for c in col_names)
    quoted_cols = ", ".join(f"`{c}`" for c in col_names)
    sql_template = f"INSERT INTO `{target_table}` ({quoted_cols}) VALUES ({placeholders})"

    bindings: list[BindingItem] = []
    for c in col_names:
        bindings.append(
            BindingItem(
                placeholder=c,
                column=c,
                strategy="uniform_int",
                params={"note": "占位策略，接入 LLM 后将按列类型与描述生成"},
            )
        )

    rationale = (
        "【预览占位】尚未调用大模型。以下为根据当前表字段生成的 INSERT 模板骨架，"
        "仅用于前后端联调；接入 LLM 后将根据你的自然语言描述生成分布、约束与语义字段。\n\n"
        f"你的需求摘要（前 200 字）：{instruction[:200]}{'…' if len(instruction) > 200 else ''}"
    )

    return GeneratePreviewOut(
        rationale=rationale,
        sql_template=sql_template,
        bindings=bindings,
        generation_mode="template" if generation_mode != "semantic" else "semantic",
        estimated_total_rows=1000,
        stub=True,
    )
