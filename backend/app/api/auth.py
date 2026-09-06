from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def authenticate_user(db: Session, identifier: str, password: str) -> User:
    """Find user by email or username, verify password and active status."""
    user = (
        db.query(User)
        .filter(
            (User.email == identifier) | (User.username == identifier)
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    Accepts form-data with `username` (email or username) and `password`.
    """
    user = authenticate_user(db, identifier=form_data.username, password=form_data.password)
    access_token = create_access_token(
        subject=user.email,
        role=user.role.value,
        extra_claims={"user_id": user.id, "full_name": user.full_name}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        role=user.role
    )


@router.post("/login/json", response_model=TokenResponse)
def login_json(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    JSON payload login endpoint for frontend client applications.
    Accepts JSON body with `username` (email or username) and `password`.
    """
    user = authenticate_user(db, identifier=credentials.username, password=credentials.password)
    access_token = create_access_token(
        subject=user.email,
        role=user.role.value,
        extra_claims={"user_id": user.id, "full_name": user.full_name}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        role=user.role
    )


@router.get("/me", response_model=UserResponse)
def get_auth_me(current_user: User = Depends(get_current_user)):
    """Convenience endpoint to get current authenticated user profile."""
    return current_user
