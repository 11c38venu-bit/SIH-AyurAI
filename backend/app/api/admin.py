from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.admin import (
    AdminAuditListResponse,
    AdminDashboardSummaryResponse,
    AdminPasswordReset,
    AdminPasswordResetResponse,
    AdminUserCreate,
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserRoleUpdate,
    AdminUserUpdate,
    DoctorListItemResponse,
    StaffListItemResponse,
    UserStatisticsResponse,
)
from app.services.admin_service import (
    activate_user_account,
    create_operational_user,
    deactivate_user_account,
    get_admin_dashboard_summary,
    get_user_by_id,
    get_user_statistics,
    list_admin_audits,
    list_doctors_admin,
    list_staff_admin,
    list_users,
    reset_user_password_by_admin,
    update_user_profile,
    update_user_role,
)

router = APIRouter(prefix="/admin", tags=["Admin Management"])


# ---------------------------------------------------------------------------
# 1. User Management Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/users",
    response_model=AdminUserListResponse,
    summary="List all users with pagination, filters, and search (Admin)"
)
def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by full name, email, or username"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Retrieve a paginated list of operational users.
    Password hashes and sensitive security parameters are never returned.
    """
    return list_users(
        db=db,
        page=page,
        page_size=page_size,
        role=role,
        is_active=is_active,
        search=search
    )


@router.post(
    "/users",
    response_model=AdminUserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Doctor or Staff user account (Admin)"
)
def create_user(
    user_in: AdminUserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Create a new operational user (DOCTOR or STAFF).
    The plaintext password is immediately hashed with bcrypt and never stored or returned.
    """
    new_user = create_operational_user(
        db=db,
        user_in=user_in,
        admin_user_id=current_admin.id
    )
    return AdminUserResponse.model_validate(new_user)


@router.get(
    "/users/statistics",
    response_model=UserStatisticsResponse,
    summary="Get user account statistics and role breakdown (Admin)"
)
def get_user_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Returns high-level user statistics aggregated via SQL.
    """
    return get_user_statistics(db)


@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Get user details by ID (Admin)"
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Retrieve administrative user details by ID.
    """
    user = get_user_by_id(db, user_id)
    return AdminUserResponse.model_validate(user)


@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Update user profile information (Admin)"
)
def update_user(
    user_id: int,
    user_in: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Update non-sensitive user profile metadata (full_name, email, username).
    """
    updated_user = update_user_profile(
        db=db,
        user_id=user_id,
        user_in=user_in,
        admin_user_id=current_admin.id
    )
    return AdminUserResponse.model_validate(updated_user)


@router.patch(
    "/users/{user_id}/role",
    response_model=AdminUserResponse,
    summary="Change user role with final-admin protection (Admin)"
)
def change_role(
    user_id: int,
    role_in: AdminUserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Change user role (ADMIN, DOCTOR, STAFF).
    Safeguarded against downgrading the final active administrator.
    """
    updated_user = update_user_role(
        db=db,
        user_id=user_id,
        role_in=role_in,
        admin_user_id=current_admin.id
    )
    return AdminUserResponse.model_validate(updated_user)


@router.patch(
    "/users/{user_id}/activate",
    response_model=AdminUserResponse,
    summary="Activate user account (Admin)"
)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Reactivate a disabled user account.
    """
    activated_user = activate_user_account(
        db=db,
        user_id=user_id,
        admin_user_id=current_admin.id
    )
    return AdminUserResponse.model_validate(activated_user)


@router.patch(
    "/users/{user_id}/deactivate",
    response_model=AdminUserResponse,
    summary="Deactivate user account with safeguards (Admin)"
)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Deactivate a user account.
    Rejects self-deactivation and deactivation of the final active administrator.
    Historical records and foreign keys are preserved intact.
    """
    deactivated_user = deactivate_user_account(
        db=db,
        user_id=user_id,
        admin_user_id=current_admin.id
    )
    return AdminUserResponse.model_validate(deactivated_user)


@router.post(
    "/users/{user_id}/reset-password",
    response_model=AdminPasswordResetResponse,
    summary="Reset user password by Admin (Admin)"
)
def reset_password(
    user_id: int,
    pass_in: AdminPasswordReset,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Sets a new password for a user.
    The new password is encrypted immediately with bcrypt; plaintext is never stored or returned.
    """
    return reset_user_password_by_admin(
        db=db,
        user_id=user_id,
        pass_in=pass_in,
        admin_user_id=current_admin.id
    )


# ---------------------------------------------------------------------------
# 2. Specialized Doctor & Staff Roster Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/doctors",
    response_model=List[DoctorListItemResponse],
    summary="List all doctors with consultation counts (Admin)"
)
def get_doctors(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    List all clinical doctors registered in the system along with active consultation counts.
    """
    return list_doctors_admin(db)


@router.get(
    "/staff",
    response_model=List[StaffListItemResponse],
    summary="List all staff members (Admin)"
)
def get_staff(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    List all triage and front-desk staff members registered in the system.
    """
    return list_staff_admin(db)


# ---------------------------------------------------------------------------
# 3. Admin Dashboard Summary
# ---------------------------------------------------------------------------

@router.get(
    "/dashboard",
    response_model=AdminDashboardSummaryResponse,
    summary="Administrative Operational & System Dashboard (Admin)"
)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Comprehensive administrative overview consolidating user statistics,
    operational throughput, and system health metrics without duplicating logic.
    """
    return get_admin_dashboard_summary(db)


# ---------------------------------------------------------------------------
# 4. Administrative Audit Trail
# ---------------------------------------------------------------------------

@router.get(
    "/audits",
    response_model=AdminAuditListResponse,
    summary="List administrative audit logs with pagination and filters (Admin)"
)
def get_admin_audits(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    action: Optional[str] = Query(None, description="Filter by action (e.g. USER_CREATED, ROLE_CHANGED)"),
    target_user_id: Optional[int] = Query(None, description="Filter by target user ID"),
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Retrieve paginated immutable audit records for all administrative user lifecycle events.
    """
    return list_admin_audits(
        db=db,
        page=page,
        page_size=page_size,
        action=action,
        target_user_id=target_user_id,
        date_from=date_from,
        date_to=date_to
    )
