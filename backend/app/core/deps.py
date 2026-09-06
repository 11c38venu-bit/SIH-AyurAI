from typing import Sequence
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=True
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Validate JWT token, verify user exists, and check if user is active."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    subject = payload.get("sub")
    if not subject:
        raise credentials_exception

    # Subject can be user email, username, or id
    user = (
        db.query(User)
        .filter(
            (User.email == subject)
            | (User.username == subject)
            | (User.id == int(subject) if str(subject).isdigit() else False)
        )
        .first()
    )

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    return user


class RoleChecker:
    """Dependency for checking whether the authenticated user has one of the required roles."""

    def __init__(self, allowed_roles: Sequence[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {', '.join([r.value for r in self.allowed_roles])}"
            )
        return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user has ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def require_doctor(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user has DOCTOR or ADMIN role."""
    if current_user.role not in (UserRole.ADMIN, UserRole.DOCTOR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor or Admin privileges required"
        )
    return current_user


def require_staff(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user has STAFF, DOCTOR, or ADMIN role."""
    if current_user.role not in (UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff, Doctor, or Admin privileges required"
        )
    return current_user
