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


def _mock_requirement_plan(text: str) -> dict:
    """无 API Key 时：从文本行生成演示用关键点与用例。"""
    lines = [l.strip() for l in text.splitlines() if l.strip()][:12]
    key_points = []
    for i, line in enumerate(lines[:8]):
        key_points.append(
            {
                "id": f"kp{i + 1}",
                "text": line[:500],
                "ref": f"文档第 {i + 1} 条有效行",
            }
        )
    if not key_points:
        key_points = [
            {
                "id": "kp1",
                "text": "（文档为空或无法解析，请上传含文本的 .md / .txt）",
                "ref": "—",
            }
        ]
    kp0 = key_points[0]["id"]
    kp1 = key_points[1]["id"] if len(key_points) > 1 else kp0
    cases = [
        {
            "id": "c1",
            "title": "正向：主流程按需求可完成",
            "priority": "P1",
            "kind": "positive",
            "steps": [
                "准备测试数据与环境",
                "按需求文档执行主路径操作",
                "校验输出与业务规则一致",
            ],
            "sourceKeyPointId": kp0,
        },
        {
            "id": "c2",
            "title": "异常：非法输入与边界条件",
            "priority": "P2",
            "kind": "negative",
            "steps": [
                "构造非法或越界参数",
                "触发接口或页面校验",
                "断言错误提示与状态码符合预期",
            ],
            "sourceKeyPointId": kp1,
        },
    ]
    return {"keyPoints": key_points, "cases": cases}


async def generate_requirement_test_plan(text: str) -> dict:
    """
    根据需求文档全文生成：关键点列表 + 原子化测试用例（标题、优先级、正/异常、步骤、溯源 id）。
    返回 {"keyPoints": [...], "cases": [...]}。
    """
    if not text or not str(text).strip():
        return _mock_requirement_plan("")

    if not DEEPSEEK_API_KEY:
        return _mock_requirement_plan(text)

    snippet = text.strip()[:12000]
    system_prompt = (
        "你是资深软件测试架构师。根据需求文档抽取可验证的关键点，并生成原子化测试用例。"
        "只输出一个 JSON 对象，不要 markdown，不要解释。"
    )
    user_prompt = f"""
需求文档如下：
---
{snippet}
---

请输出 JSON 对象，格式严格如下：
{{
  "keyPoints": [
    {{"id": "kp1", "text": "关键点描述（一句话）", "ref": "对应文档中的位置说明（如章节或小节名）"}}
  ],
  "cases": [
    {{
      "id": "c1",
      "title": "用例标题",
      "priority": "P0",
      "kind": "positive",
      "steps": ["步骤1", "步骤2"],
      "sourceKeyPointId": "kp1"
    }}
  ]
}}

要求：
- keyPoints 3～10 条；cases 不少于 2 条，覆盖正向（kind 为 positive）与异常（kind 为 negative）。
- priority 只能是 P0、P1、P2。
- 每个 case 的 id 唯一；sourceKeyPointId 必须对应某条 keyPoints 的 id。
"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
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
                    "temperature": 0.2,
                    "max_tokens": 4096,
                },
            )
            resp.raise_for_status()
            result = resp.json()
    except httpx.HTTPStatusError as e:
        body = ""
        if e.response is not None:
            body = (e.response.text or "")[:800]
        raise ValueError(
            f"DeepSeek 接口 HTTP {e.response.status_code}。"
            f"请检查 DEEPSEEK_API_KEY 是否有效、账户是否有余额、是否可访问 api.deepseek.com。"
            f" 响应片段：{body}"
        ) from e
    except httpx.RequestError as e:
        raise ValueError(
            f"无法连接 DeepSeek（网络/防火墙/代理/DNS）：{e}"
        ) from e

    try:
        raw_content = result["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as e:
        raise ValueError(
            f"DeepSeek 返回格式异常（缺少 choices/message/content）：{str(result)[:600]}"
        ) from e

    if raw_content.startswith("```"):
        raw_content = raw_content.split("```")[1]
        if raw_content.startswith("json"):
            raw_content = raw_content[4:]
        raw_content = raw_content.strip()

    try:
        data = json.loads(raw_content)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"模型输出不是合法 JSON（可重试或缩短文档）。解析错误：{e}；"
            f"内容前 400 字：{raw_content[:400]!r}"
        ) from e
    if not isinstance(data, dict):
        return _mock_requirement_plan(text)

    key_points = data.get("keyPoints") or data.get("key_points") or []
    cases = data.get("cases") or []
    if not isinstance(key_points, list):
        key_points = []
    if not isinstance(cases, list):
        cases = []

    # 补齐 id，避免前端 key 冲突
    for i, kp in enumerate(key_points):
        if not isinstance(kp, dict):
            continue
        if not kp.get("id"):
            kp["id"] = f"kp{i + 1}"
        kp.setdefault("text", "")
        kp.setdefault("ref", "")

    for i, c in enumerate(cases):
        if not isinstance(c, dict):
            continue
        if not c.get("id"):
            c["id"] = f"c{i + 1}"
        c.setdefault("title", f"用例 {i + 1}")
        c.setdefault("priority", "P2")
        if c.get("kind") not in ("positive", "negative"):
            c["kind"] = "positive" if i % 2 == 0 else "negative"
        if not isinstance(c.get("steps"), list):
            c["steps"] = []
        c.setdefault("sourceKeyPointId", key_points[0]["id"] if key_points else None)

    if len(cases) == 0:
        return _mock_requirement_plan(text)

    return {"keyPoints": key_points, "cases": cases}
