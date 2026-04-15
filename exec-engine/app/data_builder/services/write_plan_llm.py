from __future__ import annotations

import json
import re
from typing import Any

from openai import OpenAI
from pydantic import TypeAdapter

from app.data_builder.schemas.orchestrate import (
    OrchestrateStepIn,
    WritePlanCotOut,
    WritePlanIn,
    WritePlanOut,
    WritePlanPlannerOut,
    WritePlanStepsIn,
)

_DEFAULT_BASE_URL: dict[str, str] = {
    "deepseek": "https://api.deepseek.com/v1",
    "qwen": "https://dashscope.aliyuncs.com/compatible-mode/v1",
}


def _resolve_base_url_raw(provider: str, base_url: str | None) -> str:
    if base_url and str(base_url).strip():
        return str(base_url).strip().rstrip("/")
    if provider == "openai_compatible":
        raise ValueError("openai_compatible 须填写 Base URL")
    return _DEFAULT_BASE_URL[provider]


def _resolve_base_url(body: WritePlanIn) -> str:
    return _resolve_base_url_raw(body.provider, body.base_url)


def _resolve_base_url_steps(body: WritePlanStepsIn) -> str:
    return _resolve_base_url_raw(body.provider, body.base_url)


def _extract_json_object(text: str) -> dict[str, Any]:
    raw = (text or "").strip()
    if not raw:
        raise ValueError("模型未返回内容")
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw, re.IGNORECASE)
    if fence:
        raw = fence.group(1).strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"模型返回非合法 JSON：{exc}") from exc
    if not isinstance(data, dict):
        raise ValueError("模型 JSON 须为对象")
    return data


def _chat_completion_json(
    *,
    api_key: str,
    base_url: str,
    model: str,
    messages: list[dict[str, str]],
    max_tokens: int,
    temperature: float,
) -> dict[str, Any]:
    client = OpenAI(api_key=api_key.strip(), base_url=base_url)
    try:
        completion = client.chat.completions.create(
            model=model.strip(),
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    except Exception as exc:
        raise ValueError(f"调用大模型失败：{exc}") from exc

    choice = completion.choices[0] if completion.choices else None
    content = (choice.message.content if choice and choice.message else "") or ""
    return _extract_json_object(content)


def _build_planner_messages(body: WritePlanIn) -> list[dict[str, str]]:
    tables = body.tables_schema or []
    payload = {"tables": tables}
    schema_json = json.dumps(payload, ensure_ascii=False, indent=2)
    hints = body.relation_hints or []
    hints_txt = "\n".join(f"- {h}" for h in hints) if hints else "（无）"

    system = (
        "你是 MySQL 8 数据造数「规划器」。只做推理与规划，不生成最终 SQL。\n"
        "请先用中文自我问答，再输出**仅一个 JSON 对象**（不要 Markdown 围栏外的文字）。\n"
        "JSON 键（必须齐全，可为空数组/空字符串）：\n"
        "- rationale: string，规划要点摘要。\n"
        "- self_qa: array of {question, answer}，至少包含三条，对应："
        "①哪些字段/表必须引用其他表才能完成造数；②哪些列最容易导致崩溃或越界；③当前需求是否适合大批量 INSERT/INSERT…SELECT，需注意什么。\n"
        "- must_reference: string[]，如 [\"api_test_cases.interface_id -> api_interfaces.id\"]。\n"
        "- ordered_tables: string[]，建议的父→子或执行顺序表名。\n"
        "- execution_strategy: 下列之一："
        "single_insert_select | multi_step_select_then_insert | foreach_template_from_prior_select | mixed。\n"
        "- bulk_insert_feasible: boolean。\n"
        "- bulk_insert_notes: string。\n"
        "- risky_columns: string[]，如 [\"orders.amount\"]。\n"
        "- generator_directives: string，给下一步「生成器」的硬性指示（例如必须先 SELECT 抽样父 id，再 foreach 写入子表）。\n"
    )
    user = (
        f"表结构（JSON）：\n{schema_json}\n\n"
        f"用户确认的关联提示：\n{hints_txt}\n\n"
        f"造数/写入目标：\n{body.instruction.strip()}\n"
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def _build_generator_messages(body: WritePlanStepsIn, planner: WritePlanPlannerOut) -> list[dict[str, str]]:
    tables = body.tables_schema or []
    payload = {"tables": tables}
    schema_json = json.dumps(payload, ensure_ascii=False, indent=2)
    hints = body.relation_hints or []
    hints_txt = "\n".join(f"- {h}" for h in hints) if hints else "（无）"
    planner_json = planner.model_dump(mode="json")

    system = (
        "你是 MySQL 8 数据造数「生成器」。必须在规划器 JSON 约束下输出**仅 JSON**。\n"
        "JSON 字段：\n"
        '- "rationale": 字符串，说明如何落实规划器策略。\n'
        '- "steps": 数组；每项含 id（**字符串**，如 "s1"，勿用裸数字）, kind, sql；可选 max_rows（仅 kind=readonly）；'
        "可选 foreach_source_step_id（**字符串**，与前置步骤 id 一致）。\n"
        "规则：\n"
        "1) kind=readonly：sql 为单条 SELECT；务必带合理 LIMIT。\n"
        "2) kind=write：无 foreach 时为完整单条 INSERT（可 INSERT…SELECT）。\n"
        "3) kind=write 且 foreach_source_step_id 指向前序只读步骤：sql 为模板，用 {列名} 占位。\n"
        "4) 步骤顺序：先只读后写入；仅使用 DDL JSON 中的表名与列名；标识符必要时反引号。\n"
        "5) 禁止 DDL/DELETE/UPDATE；写入仅 INSERT。\n"
    )
    user = (
        f"表结构（JSON）：\n{schema_json}\n\n"
        f"用户确认的关联提示：\n{hints_txt}\n\n"
        f"规划器输出（JSON）：\n{json.dumps(planner_json, ensure_ascii=False, indent=2)}\n\n"
        f"用户原始目标（勿偏离）：\n{body.instruction.strip()}\n"
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def generate_write_plan_planner(body: WritePlanIn) -> WritePlanPlannerOut:
    base_url = _resolve_base_url(body)
    data = _chat_completion_json(
        api_key=body.api_key,
        base_url=base_url,
        model=body.model,
        messages=_build_planner_messages(body),
        max_tokens=3072,
        temperature=0.1,
    )
    try:
        return WritePlanPlannerOut.model_validate(data)
    except Exception as exc:
        raise ValueError(f"规划器 JSON 无法通过校验：{exc}") from exc


def generate_write_plan_steps(body: WritePlanStepsIn) -> WritePlanOut:
    try:
        planner = WritePlanPlannerOut.model_validate(body.planner)
    except Exception as exc:
        raise ValueError(f"planner 字段不是合法的规划器 JSON：{exc}") from exc

    base_url = _resolve_base_url_steps(body)
    data = _chat_completion_json(
        api_key=body.api_key,
        base_url=base_url,
        model=body.model,
        messages=_build_generator_messages(body, planner),
        max_tokens=4096,
        temperature=0.2,
    )
    rationale = str(data.get("rationale") or "").strip()
    raw_steps = data.get("steps")
    if not isinstance(raw_steps, list) or not raw_steps:
        raise ValueError("模型 JSON 缺少非空 steps 数组")

    adapter = TypeAdapter(list[OrchestrateStepIn])
    steps = adapter.validate_python(raw_steps)
    return WritePlanOut(rationale=rationale, steps=steps)


def generate_write_plan_cot(body: WritePlanIn) -> WritePlanCotOut:
    planner = generate_write_plan_planner(body)
    steps_body = WritePlanStepsIn(
        instruction=body.instruction,
        tables_schema=body.tables_schema,
        relation_hints=body.relation_hints,
        planner=planner.model_dump(mode="python"),
        provider=body.provider,
        model=body.model,
        api_key=body.api_key,
        base_url=body.base_url,
    )
    wp = generate_write_plan_steps(steps_body)
    return WritePlanCotOut(planner=planner, write_plan=wp)


def generate_write_plan(body: WritePlanIn) -> WritePlanOut:
    """单段生成（兼容旧客户端）；与 CoT 双段接口独立。"""
    base_url = _resolve_base_url(body)
    messages = _build_single_shot_messages(body)
    data = _chat_completion_json(
        api_key=body.api_key,
        base_url=base_url,
        model=body.model,
        messages=messages,
        max_tokens=4096,
        temperature=0.2,
    )
    rationale = str(data.get("rationale") or "").strip()
    raw_steps = data.get("steps")
    if not isinstance(raw_steps, list) or not raw_steps:
        raise ValueError("模型 JSON 缺少非空 steps 数组")

    adapter = TypeAdapter(list[OrchestrateStepIn])
    steps = adapter.validate_python(raw_steps)
    return WritePlanOut(rationale=rationale, steps=steps)


def _build_single_shot_messages(body: WritePlanIn) -> list[dict[str, str]]:
    tables = body.tables_schema or []
    payload = {"tables": tables}
    schema_json = json.dumps(payload, ensure_ascii=False, indent=2)
    hints = body.relation_hints or []
    hints_txt = "\n".join(f"- {h}" for h in hints) if hints else "（无）"

    system = (
        "你是 MySQL 8 数据造数编排专家。根据多表 DDL JSON 与用户目标，输出**仅 JSON**（不要 Markdown 围栏外的文字）。\n"
        "JSON 字段：\n"
        '- "rationale": 字符串，简短中文说明思路。\n'
        '- "steps": 数组；每项含 id（**字符串**，如 "s1"，勿用裸数字）, kind, sql；可选 max_rows（仅 kind=readonly）；'
        "可选 foreach_source_step_id（**字符串**）。\n"
        "规则：\n"
        "1) kind=readonly：sql 为单条 SELECT；用于抽样父表 id、预查等；务必带合理 LIMIT。\n"
        "2) kind=write：若 foreach_source_step_id 为空，则 sql 为完整单条 INSERT（可 INSERT…SELECT）。\n"
        "3) kind=write 且 foreach_source_step_id 指向前序只读步骤：sql 为模板，用 {列名} 占位，来源行必须有该列；"
        "对每一行展开成单条 INSERT 执行（禁止在模板里写分号连接多语句）。\n"
        "4) 步骤顺序：先只读后写入；引用父 id 时优先用前置 SELECT 的列名。\n"
        "5) 只使用 JSON 中出现的表名与列名；标识符必要时用反引号。\n"
        "6) 禁止 DDL/DELETE/UPDATE；写入仅 INSERT。\n"
    )
    user = (
        f"表结构（JSON）：\n{schema_json}\n\n"
        f"用户确认的关联提示：\n{hints_txt}\n\n"
        f"造数/写入目标：\n{body.instruction.strip()}\n"
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
