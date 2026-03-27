from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "ai_platform_secret")
ALGORITHM = "HS256"

async def verify_token(auth: HTTPAuthorizationCredentials = Security(security)):
    """
    FastAPI 安全中间件：验证来自 mgmt-api 的 JWT Token
    """
    token = auth.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        # 验证 Token 负载中是否包含必要字段
        if "uid" not in payload or "tenantId" not in payload:
            raise HTTPException(status_code=403, detail="Invalid token payload")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")

# 在路由中使用示例:
# @app.post("/execute")
# async def run_test(request: Request, user_data: dict = Depends(verify_token)):
#     ...
