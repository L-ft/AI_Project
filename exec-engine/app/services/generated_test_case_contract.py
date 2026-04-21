from __future__ import annotations

import json
from typing import Any, Iterable, Mapping

from ..executor.api_contract import normalize_assertion_rule


ALLOWED_AI_CASE_TYPES = {"positive", "negative", "boundary", "security", "other"}
ALLOWED_BODY_TYPES = {"none", "json", "form-data", "x-www-form-urlencoded", "text"}
SUPPORTED_ASSERTION_TARGETS = {"status_code", "response_json", "response_text"}


def normalize_generated_test_cases(raw_cases: Iterable[Any] | None) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for index, raw in enumerate(raw_cases or []):
        if not isinstance(raw, Mapping):
            continue
        normalized.append(normalize_generated_test_case(raw, index))
    return normalized


def normalize_generated_test_case(raw_case: Mapping[str, Any], index: int = 0) -> dict[str, Any]:
    return {
        "name": _normalize_case_name(raw_case, index),
        "case_type": _normalize_case_type(
            _first_present(raw_case, "case_type", "caseType", "kind", "group")
        ),
        "query_params": _normalize_param_rows(
            _first_present(raw_case, "query_params", "queryParams")
        ),
        "header_params": _normalize_param_rows(
            _first_present(raw_case, "header_params", "headerParams")
        ),
        "body_definition": _normalize_body_definition(
            _first_present(raw_case, "body_definition", "bodyDefinition", "body")
        ),
        "assertions": _normalize_assertions(raw_case.get("assertions")),
    }


def _normalize_case_name(raw_case: Mapping[str, Any], index: int) -> str:
    for key in ("name", "title", "case_name", "caseName"):
        value = raw_case.get(key)
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text[:255]
    return f"AI generated case {index + 1}"


def _normalize_case_type(value: Any) -> str:
    text = str(value or "").strip().lower()
    if not text:
        return "other"
    aliases = {
        "positive_case": "positive",
        "success": "positive",
        "happy_path": "positive",
        "negative_case": "negative",
        "error": "negative",
        "failure": "negative",
        "invalid": "negative",
        "edge": "boundary",
        "edge_case": "boundary",
        "limit": "boundary",
        "auth": "security",
    }
    text = aliases.get(text, text)
    return text if text in ALLOWED_AI_CASE_TYPES else "other"


def _normalize_param_rows(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []

    rows: list[dict[str, Any]] = []
    for item in value:
        if not isinstance(item, Mapping):
            continue
        name = _as_optional_string(
            _first_present(item, "name", "key", "param", "field")
        )
        if not name:
            continue
        actual_value = _first_present(item, "value", "example", "default", "sample")
        serialized_value = _serialize_scalar(actual_value)
        row: dict[str, Any] = {"name": name}
        if serialized_value is not None:
            row["value"] = serialized_value
            row["example"] = serialized_value
        if "required" in item:
            row["required"] = bool(item.get("required"))
        description = _as_optional_string(item.get("description"))
        if description:
            row["description"] = description
        rows.append(row)
    return rows


def _normalize_body_definition(value: Any) -> dict[str, str]:
    if isinstance(value, Mapping):
        raw_type = _as_optional_string(
            _first_present(value, "type", "body_type", "bodyType", "content_type", "contentType")
        )
        content = _first_present(value, "content", "value", "data", "body")
    else:
        raw_type = None
        content = value

    body_type = _normalize_body_type(raw_type, content)
    content_text = _serialize_body_content(content, body_type)
    if body_type == "none":
        content_text = ""
    return {"type": body_type, "content": content_text}


def _normalize_body_type(raw_type: str | None, content: Any) -> str:
    if raw_type:
        text = raw_type.strip().lower()
        aliases = {
            "raw": "text",
            "plaintext": "text",
            "plain_text": "text",
            "formdata": "form-data",
            "multipart": "form-data",
            "multipart/form-data": "form-data",
            "form": "x-www-form-urlencoded",
            "urlencoded": "x-www-form-urlencoded",
        }
        text = aliases.get(text, text)
        if text in ALLOWED_BODY_TYPES:
            return text
    if content in (None, "", {}, []):
        return "none"
    if isinstance(content, (dict, list)):
        return "json"
    if isinstance(content, str):
        text = content.strip()
        if not text:
            return "none"
        if text.startswith("{") or text.startswith("["):
            return "json"
    return "text"


def _serialize_body_content(content: Any, body_type: str) -> str:
    if content is None:
        return ""
    if body_type == "json":
        if isinstance(content, str):
            return content
        return json.dumps(content, ensure_ascii=False)
    if isinstance(content, (dict, list)):
        return json.dumps(content, ensure_ascii=False)
    return str(content)


def _normalize_assertions(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []

    normalized: list[dict[str, Any]] = []
    for item in value:
        if not isinstance(item, Mapping):
            continue
        rule = normalize_assertion_rule(item)
        if rule["target"] not in SUPPORTED_ASSERTION_TARGETS:
            continue
        if rule["target"] == "status_code" and rule.get("value") in (None, ""):
            rule["value"] = 200
        normalized.append(rule)
    return normalized


def _serialize_scalar(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def _as_optional_string(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _first_present(mapping: Mapping[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in mapping:
            return mapping[key]
    return None
