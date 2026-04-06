from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional

import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


security = HTTPBearer(auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET", "ai_platform_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
AUTH_REQUIRED = os.getenv("EXEC_AUTH_REQUIRED", "true").strip().lower() not in (
    "0",
    "false",
    "no",
    "off",
)


@dataclass
class AuthContext:
    uid: Optional[int] = None
    tenant_id: Optional[int] = None
    role: Optional[str] = None
    token: Optional[str] = None

    @property
    def is_authenticated(self) -> bool:
        return self.uid is not None


def require_auth(
    auth: HTTPAuthorizationCredentials = Security(security),
) -> AuthContext:
    if auth is None:
        if AUTH_REQUIRED:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing bearer token",
            )
        return AuthContext()

    token = auth.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        ) from exc

    uid = payload.get("uid")
    if uid is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token payload",
        )

    return AuthContext(
        uid=uid,
        tenant_id=payload.get("tenantId"),
        role=payload.get("role"),
        token=token,
    )

