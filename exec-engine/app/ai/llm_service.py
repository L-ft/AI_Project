import os
import json
import httpx

# ── DeepSeek API 配置 ──────────────────────────────────────────────
# Key 从环境变量读取，在 exec-engine/.env 文件中填写：
#   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"


async def generate_test_cases(interface_info: dict, scenarios: list[str] = None, extra_requirement: str = "") -> list[dict]:
    """
    根据接口信息调用 DeepSeek 生成测试用例列表。
    返回格式：[{ name, case_type, query_params, header_params, body_definition, assertions }]
    """
    if not DEEPSEEK_API_KEY:
        raise ValueError("DEEPSEEK_API_KEY 未配置，请在 exec-engine/.env 中填写")

    method = interface_info.get("method", "GET")
    path = interface_info.get("path", "/")
    name = interface_info.get("name", "未命名接口")
    query_params = interface_info.get("query_params") or []
    header_params = interface_info.get("header_params") or []
    body_definition = interface_info.get("body_definition") or {}

    scenarios_text = ""
    if scenarios:
        scenarios_text = f"\n需要覆盖的测试场景（请严格按此生成）：{', '.join(scenarios)}"

    extra_text = ""
    if extra_requirement and extra_requirement.strip():
        extra_text = f"\n额外要求：{extra_requirement.strip()}"

    system_prompt = (
        "你是一名资深 API 自动化测试专家。"
        "请根据用户提供的接口信息，生成完整的测试用例列表。"
        "严格按照 JSON 数组格式输出，不要输出任何多余文字。"
    )

    user_prompt = f"""
接口信息：
- 名称：{name}
- 方法：{method}
- 路径：{path}
- Query 参数：{json.dumps(query_params, ensure_ascii=False)}
- Header 参数：{json.dumps(header_params, ensure_ascii=False)}
- Body 定义：{json.dumps(body_definition, ensure_ascii=False)}
{scenarios_text}{extra_text}

请生成测试用例，每个用例包含以下字段：
{{
  "name": "用例名称（简洁描述场景）",
  "case_type": "positive | negative | boundary | security | other",
  "query_params": [{{ "name": "参数名", "value": "参数值", "example": "示例值" }}],
  "header_params": [{{ "name": "参数名", "value": "参数值" }}],
  "body_definition": {{ "type": "json | form-data | none", "content": "body 内容字符串" }},
  "assertions": [{{ "type": "status_code | response_json", "operator": "equals", "value": "期望值" }}]
}}

只输出 JSON 数组，不要 markdown 代码块，不要任何解释文字。
"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DEEPSEEK_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.3,
                "max_tokens": 4096,
            },
        )
        resp.raise_for_status()
        result = resp.json()

    raw_content = result["choices"][0]["message"]["content"].strip()

    # 兼容模型偶尔输出 ```json ... ``` 包裹的情况
    if raw_content.startswith("```"):
        raw_content = raw_content.split("```")[1]
        if raw_content.startswith("json"):
            raw_content = raw_content[4:]
        raw_content = raw_content.strip()

    cases = json.loads(raw_content)
    return cases if isinstance(cases, list) else []
