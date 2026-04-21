import json

from app.services.generated_test_case_contract import (
    normalize_generated_test_case,
    normalize_generated_test_cases,
)


def test_normalize_generated_test_case_maps_alias_fields():
    case = normalize_generated_test_case(
        {
            "title": "Create user happy path",
            "kind": "success",
            "queryParams": [
                {"key": "page", "default": 1, "required": True, "description": "page number"},
                {"name": "", "value": "ignored"},
            ],
            "header_params": [{"name": "X-Trace-Id", "value": 12345}],
            "bodyDefinition": {"type": "json", "content": {"name": "Ada", "enabled": True}},
            "assertions": [{"type": "status_code", "value": "201"}],
        }
    )

    assert case["name"] == "Create user happy path"
    assert case["case_type"] == "positive"
    assert case["query_params"] == [
        {
            "name": "page",
            "value": "1",
            "example": "1",
            "required": True,
            "description": "page number",
        }
    ]
    assert case["header_params"] == [{"name": "X-Trace-Id", "value": "12345", "example": "12345"}]
    assert case["body_definition"]["type"] == "json"
    assert json.loads(case["body_definition"]["content"]) == {"name": "Ada", "enabled": True}
    assert case["assertions"] == [
        {
            "name": "",
            "type": "status_code",
            "target": "status_code",
            "expression": None,
            "operator": "equals",
            "value": "201",
        }
    ]


def test_normalize_generated_test_case_infers_body_and_assertion_defaults():
    case = normalize_generated_test_case(
        {
            "name": "Delete should fail",
            "case_type": "negative",
            "body_definition": '{"reason":"locked"}',
            "assertions": [
                {"type": "status_code"},
                {"type": "response_json", "field": "code", "operator": "eq", "value": "403"},
                {"type": "response_header", "value": "ignored"},
            ],
        }
    )

    assert case["body_definition"] == {"type": "json", "content": '{"reason":"locked"}'}
    assert case["assertions"] == [
        {
            "name": "",
            "type": "status_code",
            "target": "status_code",
            "expression": None,
            "operator": "equals",
            "value": 200,
        },
        {
            "name": "",
            "type": "response_json",
            "target": "response_json",
            "expression": "code",
            "operator": "equals",
            "value": "403",
        },
    ]


def test_normalize_generated_test_cases_skips_invalid_items_and_uses_fallbacks():
    cases = normalize_generated_test_cases(
        [
            None,
            "bad",
            {"name": "  ", "case_type": "mystery", "body": None, "assertions": []},
        ]
    )

    assert cases == [
        {
            "name": "AI generated case 3",
            "case_type": "other",
            "query_params": [],
            "header_params": [],
            "body_definition": {"type": "none", "content": ""},
            "assertions": [],
        }
    ]
