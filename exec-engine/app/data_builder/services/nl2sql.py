from __future__ import annotations

import json
import re

from openai import OpenAI

from app.data_builder.schemas.query import Nl2SqlIn, Nl2SqlOut
from app.data_builder.services.sql_guard import validate_ai_select_sql

_DEFAULT_BASE_URL: dict[str, str] = {
    "deepseek": "https://api.deepseek.com/v1",
    "qwen": "https://dashscope.aliyuncs.com/compatible-mode/v1",
}


def _resolve_base_url(body: Nl2SqlIn) -> str:
    if body.base_url and body.base_url.strip():
        return body.base_url.strip().rstrip("/")
    if body.provider == "openai_compatible":
        raise ValueError("openai_compatible 须填写 Base URL")
    return _DEFAULT_BASE_URL[body.provider]


def _extract_sql(text: str) -> str:
    raw = (text or "").strip()
    if not raw:
        raise ValueError("模型未返回内容")
    fence = re.search(r"```(?:sql)?\s*([\s\S]*?)```", raw, re.IGNORECASE)
    if fence:
        return fence.group(1).strip()
    return raw


def _build_messages(body: Nl2SqlIn) -> list[dict[str, str]]:
    schema_json = json.dumps(body.table_schema, ensure_ascii=False, indent=2)
    system = (
        "你是 MySQL 8 专家。根据给定的表结构 JSON 与用户问题，生成**一条**只读 SQL。\n"
        "硬性要求：\n"
        "1) 仅使用 SELECT 或 WITH … SELECT；禁止 INSERT/UPDATE/DELETE/DDL/存储过程/导出。\n"
        "2) 单条语句；不要分号后的第二条语句；不要 Markdown；不要解释。\n"
        "3) 表名、列名与 schema 一致，必要时用反引号包裹标识符。\n"
        "4) 若统计行数，优先 COUNT(*)；需要示例行时请 LIMIT。\n"
        "输出：只输出 SQL 文本本身。"
    )
    user = f"表结构（JSON）：\n{schema_json}\n\n用户问题：\n{body.instruction.strip()}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def generate_nl2sql(body: Nl2SqlIn) -> Nl2SqlOut:
    base_url = _resolve_base_url(body)
    client = OpenAI(api_key=body.api_key.strip(), base_url=base_url)
    messages = _build_messages(body)
    try:
        completion = client.chat.completions.create(
            model=body.model.strip(),
            messages=messages,
            temperature=0.2,
            max_tokens=2048,
        )
    except Exception as exc:
        raise ValueError(f"调用大模型失败：{exc}") from exc

    choice = completion.choices[0] if completion.choices else None
    content = (choice.message.content if choice and choice.message else "") or ""
    rationale = ""
    if choice and choice.message and getattr(choice.message, "refusal", None):
        rationale = str(choice.message.refusal)

    sql = _extract_sql(content)
    validated = validate_ai_select_sql(sql)
    return Nl2SqlOut(sql=validated, rationale=rationale)
