from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

http_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise credentials_exception

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise credentials_exception

    subject = payload.get("sub")
    if not subject:
        raise credentials_exception

    user = db.query(User).filter(User.email == subject).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_admin_or_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in {"admin", "manager"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or manager access required",
        )
    return current_user
