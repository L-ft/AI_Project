from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any, Mapping


WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
_MISSING = object()


@dataclass(frozen=True)
class ApiExecutionRequest:
    name: str = ""
    method: str = "GET"
    url: str = ""
    base_url: str | None = None
    headers: dict[str, str] = field(default_factory=dict)
    params: dict[str, Any] = field(default_factory=dict)
    body: Any = None
    assertions: list[dict[str, Any]] = field(default_factory=list)

    @classmethod
    def from_mapping(cls, raw: Mapping[str, Any] | None) -> "ApiExecutionRequest":
        data = dict(raw or {})
        method = _as_string(_enum_value(data.get("method")), "GET").upper()
        return cls(
            name=_as_string(data.get("name"), ""),
            method=method,
            url=_as_string(data.get("url"), ""),
            base_url=_as_optional_string(data.get("base_url")),
            headers=_string_map(data.get("headers")),
            params=_value_map(data.get("params")),
            body=data.get("body"),
            assertions=_dict_list(data.get("assertions")),
        )

    def fetch_body(self) -> Any:
        return self.body if self.method in WRITE_METHODS else None


def evaluate_assertions(
    assertions: list[dict[str, Any]] | None,
    *,
    status_code: int,
    response_text: str,
) -> list[dict[str, Any]]:
    parsed_json = _try_parse_json(response_text)
    return [
        evaluate_assertion(assertion, status_code=status_code, response_text=response_text, parsed_json=parsed_json)
        for assertion in assertions or []
        if isinstance(assertion, dict)
    ]


def evaluate_assertion(
    assertion: dict[str, Any],
    *,
    status_code: int,
    response_text: str,
    parsed_json: Any = _MISSING,
) -> dict[str, Any]:
    rule = normalize_assertion_rule(assertion)
    target = rule["target"]
    operator = rule["operator"]
    expression = rule.get("expression")
    expected = rule.get("value")

    actual: Any
    message: str | None = None
    if target == "status_code":
        actual = status_code
    elif target == "response_text":
        actual = response_text
    elif target == "response_json":
        if parsed_json is _MISSING:
            parsed_json = _try_parse_json(response_text)
        if parsed_json is _MISSING:
            actual = None
            message = "response body is not valid JSON"
        else:
            actual = _read_json_path(parsed_json, expression)
            if actual is _MISSING:
                actual = None
                message = f"JSON path not found: {expression}"
    else:
        actual = None
        message = f"unsupported assertion target: {target}"

    passed = False if message and target not in {"response_json"} else _compare(actual, operator, expected)
    if message and operator not in {"not_exists"}:
        passed = False

    result = {
        "name": rule.get("name", ""),
        "type": rule.get("type", target),
        "target": target,
        "expression": expression,
        "operator": operator,
        "expected": expected,
        "actual": actual,
        "pass": passed,
    }
    if message:
        result["message"] = message
    return result


def normalize_assertion_rule(assertion: Mapping[str, Any]) -> dict[str, Any]:
    rule = _flatten_assertion(assertion)
    target = _normalize_target(rule.get("target") or rule.get("type"))
    normalized = {
        "name": _as_string(rule.get("name"), ""),
        "type": _normalized_rule_type(rule.get("type"), target),
        "target": target,
        "expression": _as_optional_string(
            rule.get("expression") or rule.get("path") or rule.get("json_path") or rule.get("field")
        ),
        "operator": _normalize_operator(rule.get("operator") or "equals"),
        "value": _first_present(
            rule,
            "value",
            "expected",
            "expect",
            "expect_status",
            "expected_status",
        ),
    }
    return normalized


def _flatten_assertion(assertion: dict[str, Any]) -> dict[str, Any]:
    config = assertion.get("config")
    if isinstance(config, dict):
        return {**assertion, **config}
    return dict(assertion)


def _normalized_rule_type(raw_type: Any, target: str) -> str:
    text = _as_optional_string(raw_type)
    if not text or text == "assertion":
        return target
    return text


def _normalize_target(value: Any) -> str:
    target = _as_string(value, "status_code").lower()
    if target in {"status", "http_status", "http_code"}:
        return "status_code"
    if target in {"body", "text", "response_body"}:
        return "response_text"
    if target in {"json", "response"}:
        return "response_json"
    return target


def _normalize_operator(value: Any) -> str:
    op = _as_string(value, "equals").lower()
    return {
        "eq": "equals",
        "==": "equals",
        "neq": "not_equals",
        "!=": "not_equals",
        "gt": "greater_than",
        ">": "greater_than",
        "gte": "greater_than_or_equals",
        ">=": "greater_than_or_equals",
        "lt": "less_than",
        "<": "less_than",
        "lte": "less_than_or_equals",
        "<=": "less_than_or_equals",
    }.get(op, op)


def _compare(actual: Any, operator: str, expected: Any) -> bool:
    if operator == "exists":
        return actual not in (None, "")
    if operator == "not_exists":
        return actual in (None, "")

    expected_value = _coerce_expected(expected)
    if operator == "equals":
        return _values_equal(actual, expected_value)
    if operator == "not_equals":
        return not _values_equal(actual, expected_value)
    if operator == "contains":
        return str(expected_value) in str(actual)
    if operator == "not_contains":
        return str(expected_value) not in str(actual)
    if operator == "regex":
        try:
            return re.search(str(expected_value), str(actual or "")) is not None
        except re.error:
            return False

    if operator in {"greater_than", "greater_than_or_equals", "less_than", "less_than_or_equals"}:
        left = _to_float(actual)
        right = _to_float(expected_value)
        if left is None or right is None:
            return False
        if operator == "greater_than":
            return left > right
        if operator == "greater_than_or_equals":
            return left >= right
        if operator == "less_than":
            return left < right
        return left <= right

    return False


def _values_equal(actual: Any, expected: Any) -> bool:
    if isinstance(actual, (dict, list)) or isinstance(expected, (dict, list)):
        return actual == expected
    actual_number = _to_float(actual)
    expected_number = _to_float(expected)
    if actual_number is not None and expected_number is not None:
        return actual_number == expected_number
    return str(actual) == str(expected)


def _read_json_path(value: Any, expression: str | None) -> Any:
    if not expression:
        return value
    path = expression.strip()
    if path.startswith("$."):
        path = path[2:]
    elif path.startswith("$"):
        path = path[1:]
    if not path:
        return value

    current = value
    for part in path.split("."):
        if part == "":
            continue
        match = re.fullmatch(r"([^\[\]]+)(?:\[(\d+)\])?", part)
        if not match:
            return _MISSING
        key, index = match.groups()
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return _MISSING
        if index is not None:
            if not isinstance(current, list):
                return _MISSING
            idx = int(index)
            if idx >= len(current):
                return _MISSING
            current = current[idx]
    return current


def _try_parse_json(text: str) -> Any:
    try:
        return json.loads(text)
    except (TypeError, json.JSONDecodeError):
        return _MISSING


def _coerce_expected(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    text = value.strip()
    if not text:
        return value
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return value


def _to_float(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _enum_value(value: Any) -> Any:
    return value.value if hasattr(value, "value") else value


def _as_string(value: Any, fallback: str) -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    return text or fallback


def _as_optional_string(value: Any) -> str | None:
    text = _as_string(value, "")
    return text or None


def _string_map(value: Any) -> dict[str, str]:
    if not isinstance(value, Mapping):
        return {}
    return {
        str(key): str(val)
        for key, val in value.items()
        if key is not None and val is not None
    }


def _value_map(value: Any) -> dict[str, Any]:
    if not isinstance(value, Mapping):
        return {}
    return {str(key): val for key, val in value.items() if key is not None and val is not None}


def _dict_list(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [dict(item) for item in value if isinstance(item, dict)]


def _first_present(mapping: Mapping[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in mapping:
            return mapping[key]
    return None
