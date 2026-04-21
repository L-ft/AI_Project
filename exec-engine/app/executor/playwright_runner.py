import time

from playwright.async_api import async_playwright

from .api_contract import ApiExecutionRequest, evaluate_assertions


async def run_api_test(api_def):
    """Run an HTTP API test through Playwright request context."""
    start_time = time.time()
    request_context = None
    try:
        request = ApiExecutionRequest.from_mapping(api_def)
        async with async_playwright() as p:
            request_context = await p.request.new_context(base_url=request.base_url)
            response = await request_context.fetch(
                request.url,
                method=request.method,
                headers=request.headers,
                params=request.params,
                data=request.fetch_body(),
            )

            elapsed = (time.time() - start_time) * 1000
            status = response.status
            body = await response.text()

            assertions_results = evaluate_assertions(
                request.assertions,
                status_code=status,
                response_text=body,
            )
            success = (
                all(item.get("pass") is True for item in assertions_results)
                if request.assertions
                else True
            )

            return {
                "success": success,
                "status_code": status,
                "response_body": body,
                "elapsed": elapsed,
                "assertions": assertions_results,
                "log": f"API {request.method} {request.url} executed with status {status}",
            }

    except Exception as e:
        return {
            "success": False,
            "error_log": str(e),
            "elapsed": (time.time() - start_time) * 1000,
        }
    finally:
        if request_context is not None:
            await request_context.dispose()
