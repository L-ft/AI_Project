import os
import threading
import time
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.data_builder.routers import data_builder as data_builder_router
from app.data_builder.routers import data_builder_tasks
from app.routers import (
    api_import,
    dashboard,
    debug,
    environments,
    executor,
    folders,
    functional_test_cases,
    groups,
    interfaces,
    requirement_cases,
    scheduled_tasks,
    test_cases,
    test_scenarios,
)


load_dotenv()

root_path = os.getenv("ROOT_PATH", "").strip()
fastapi_kw: dict = {"title": "AI Execution Engine & Mock Service"}
if root_path:
    fastapi_kw["root_path"] = root_path

app = FastAPI(**fastapi_kw)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _scheduled_tasks_loop() -> None:
    time.sleep(20)
    from app.services.scheduled_task_runner import process_due_scheduled_tasks

    while True:
        try:
            process_due_scheduled_tasks()
        except Exception as exc:
            print(f"定时任务调度异常: {exc}")
        time.sleep(30)


@app.on_event("startup")
def startup_event():
    last_err: Optional[Exception] = None
    for attempt in range(1, 31):
        try:
            init_db()
            print("数据库初始化成功")
            threading.Thread(target=_scheduled_tasks_loop, daemon=True, name="scheduled-tasks").start()
            return
        except Exception as exc:
            last_err = exc
            print(f"数据库初始化失败 ({attempt}/30，2s 后重试): {exc}")
            time.sleep(2)
    print(f"数据库初始化在多次重试后仍失败: {last_err}")


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(folders.router)
app.include_router(interfaces.router)
app.include_router(test_cases.router)
app.include_router(executor.router)
app.include_router(environments.router)
app.include_router(test_scenarios.router)
app.include_router(dashboard.router)
app.include_router(requirement_cases.router)
app.include_router(groups.router)
app.include_router(functional_test_cases.router)
app.include_router(scheduled_tasks.router)
app.include_router(api_import.router)
app.include_router(debug.router)
app.include_router(data_builder_router.router, prefix="/api/v1", tags=["data-builder"])
app.include_router(data_builder_tasks.router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
