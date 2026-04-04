# 使用官方 Playwright Python 镜像：已含 Chromium 与系统库，避免构建时 apt 拉取 deb.debian.org 失败（502）
# 版本需与 requirements.txt 中 playwright 主版本大致对齐；若拉取失败可改 tag 或配置镜像加速
FROM mcr.microsoft.com/playwright/python:v1.49.0-noble

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PYTHONIOENCODING=utf-8
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
