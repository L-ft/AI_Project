import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import data_builder as data_builder_router
from app.routers import health as health_router

load_dotenv()

settings = get_settings()
root_path = os.getenv("ROOT_PATH", "").strip()
fastapi_kw: dict = {"title": "LLM Data Builder Service", "version": "0.1.0"}
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

app.include_router(health_router.router, prefix=settings.api_v1_prefix, tags=["meta"])
app.include_router(data_builder_router.router, prefix=settings.api_v1_prefix, tags=["data-builder"])


@app.get("/health")
def root_health():
    return {"status": "ok", "service": "data-builder"}
