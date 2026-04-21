from enum import Enum

from app.executor.api_contract import ApiExecutionRequest, evaluate_assertions


class Method(str, Enum):
    POST = "POST"


def test_execution_request_normalizes_enum_method_and_maps():
    req = ApiExecutionRequest.from_mapping(
        {
            "name": "create user",
            "method": Method.POST,
            "url": "/users",
            "base_url": "http://example.test",
            "headers": {"X-Trace": 123, "Empty": None},
            "params": {"page": 1, "none": None},
            "body": {"name": "Ada"},
            "assertions": [{"type": "status_code", "value": 201}],
        }
    )

    assert req.method == "POST"
    assert req.headers == {"X-Trace": "123"}
    assert req.params == {"page": 1}
    assert req.fetch_body() == {"name": "Ada"}


def test_execution_request_omits_body_for_read_methods():
    req = ApiExecutionRequest.from_mapping({"method": "GET", "body": {"ignored": True}})

    assert req.fetch_body() is None


def test_evaluate_status_code_assertion_keeps_legacy_shape():
    results = evaluate_assertions(
        [{"type": "status_code", "operator": "equals", "value": "200"}],
        status_code=200,
        response_text='{"code": 0}',
    )

    assert results == [
        {
            "name": "",
            "type": "status_code",
            "target": "status_code",
            "expression": None,
            "operator": "equals",
            "expected": "200",
            "actual": 200,
            "pass": True,
        }
    ]


def test_evaluate_response_json_path_and_operator_alias():
    results = evaluate_assertions(
        [
            {
                "type": "response_json",
                "expression": "$.data.items[0].id",
                "operator": "eq",
                "value": "42",
            }
        ],
        status_code=200,
        response_text='{"data":{"items":[{"id":42}]}}',
    )

    assert results[0]["target"] == "response_json"
    assert results[0]["operator"] == "equals"
    assert results[0]["actual"] == 42
    assert results[0]["pass"] is True


def test_evaluate_config_wrapped_assertion_from_ui_contract():
    results = evaluate_assertions(
        [
            {
                "type": "assertion",
                "config": {
                    "name": "business code",
                    "target": "response_json",
                    "expression": "code",
                    "operator": "not_equals",
                    "value": "500",
                },
            }
        ],
        status_code=200,
        response_text='{"code":200}',
    )

    assert results[0]["name"] == "business code"
    assert results[0]["actual"] == 200
    assert results[0]["pass"] is True


def test_missing_json_path_supports_not_exists():
    results = evaluate_assertions(
        [
            {
                "type": "response_json",
                "expression": "$.data.deleted",
                "operator": "not_exists",
            }
        ],
        status_code=200,
        response_text='{"data":{}}',
    )

    assert results[0]["actual"] is None
    assert results[0]["pass"] is True
    assert "message" in results[0]
