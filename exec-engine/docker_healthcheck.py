"""Docker Compose healthcheck：探测 /health，避免 Nginx 反代 502。"""
import sys
import urllib.request

try:
    urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=2).read()
    sys.exit(0)
except Exception:
    sys.exit(1)
