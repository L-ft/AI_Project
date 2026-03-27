# Step 3: FastAPI JWT Verification
import jwt
from fastapi import HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "ai_platform_secret")
ALGORITHM = "HS256"

def get_current_user(auth: HTTPAuthorizationCredentials = Security(security)):
    """
    依赖项：解析并验证 Node.js 签发的 JWT Token
    """
    try:
        payload = jwt.decode(auth.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        # 确保 payload 结构与 Node.js 保持一致 (uid, role, tenantId)
        user_info = {
            "uid": payload.get("uid"),
            "role": payload.get("role"),
            "tenant_id": payload.get("tenantId")
        }
        if not user_info["uid"]:
            raise HTTPException(status_code=401, detail="Invalid token claims")
        return user_info
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token validation failed")

# 使用示例:
# @app.get("/engine/stats")
# def get_stats(current_user: dict = Depends(get_current_user)):
#     return {"status": "ok", "tenant": current_user["tenant_id"]}
