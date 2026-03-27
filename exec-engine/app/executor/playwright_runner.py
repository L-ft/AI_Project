from playwright.async_api import async_playwright
import time

async def run_api_test(api_def):
    """
    使用 Playwright API Request Context 执行接口测试
    """
    async with async_playwright() as p:
        # 启动浏览器不是必须的，可以直接使用 request context
        request_context = await p.request.new_context(base_url=api_def.get("base_url"))
        
        method = api_def.get("method", "GET").upper()
        url = api_def.get("url")
        headers = api_def.get("headers", {})
        params = api_def.get("params", {})
        data = api_def.get("body")
        
        start_time = time.time()
        try:
            response = await request_context.fetch(
                url,
                method=method,
                headers=headers,
                params=params,
                data=data if method in ["POST", "PUT", "PATCH"] else None
            )
            
            elapsed = (time.time() - start_time) * 1000
            status = response.status
            body = await response.text()
            
            # 断言逻辑
            assertions_results = []
            success = True
            if api_def.get("assertions"):
                for assertion in api_def["assertions"]:
                    # 简单状态码断言示例
                    if assertion["type"] == "status_code":
                        actual = status
                        expected = int(assertion["value"])
                        pass_assertion = actual == expected
                        assertions_results.append({
                            "type": "status_code",
                            "expected": expected,
                            "actual": actual,
                            "pass": pass_assertion
                        })
                        if not pass_assertion:
                            success = False
            
            return {
                "success": success,
                "status_code": status,
                "response_body": body,
                "elapsed": elapsed,
                "assertions": assertions_results,
                "log": f"API {method} {url} executed with status {status}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error_log": str(e),
                "elapsed": (time.time() - start_time) * 1000
            }
        finally:
            await request_context.dispose()
