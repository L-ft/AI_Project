# Reuse the non-Docker-Hub Python base already used by exec-engine to
# avoid flaky Docker Hub mirror metadata lookups during local builds.
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
