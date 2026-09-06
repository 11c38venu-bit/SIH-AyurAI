from datetime import date as DateType, datetime as DateTimeType
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


# ---------------------------------------------------------------------------
# User Administration Schemas
# ---------------------------------------------------------------------------

class AdminUserCreate(BaseModel):
    email: EmailStr
    username: Optional[str] = Field(None, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=150)
    password: str = Field(..., min_length=6, description="Initial plaintext password")
    role: UserRole = Field(..., description="Role must be DOCTOR or STAFF for administrative creation")


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, max_length=50)
    full_name: Optional[str] = Field(None, min_length=1, max_length=150)


class AdminUserRoleUpdate(BaseModel):
    role: UserRole = Field(..., description="New role for the target user")


class AdminPasswordReset(BaseModel):
    new_password: str = Field(..., min_length=6, description="New plaintext password for user")


class AdminPasswordResetResponse(BaseModel):
    message: str = "Password reset successfully"
    user_id: int


class AdminUserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    full_name: str
    role: UserRole
    is_active: bool
    created_at: Optional[DateTimeType] = None
    updated_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)


class AdminUserListResponse(BaseModel):
    items: List[AdminUserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DoctorListItemResponse(BaseModel):
    id: int
    full_name: str
    email: str
    username: Optional[str] = None
    is_active: bool
    created_at: Optional[DateTimeType] = None
    consultation_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class StaffListItemResponse(BaseModel):
    id: int
    full_name: str
    email: str
    username: Optional[str] = None
    is_active: bool
    created_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# User Statistics & Dashboard Schemas
# ---------------------------------------------------------------------------

class UserStatisticsResponse(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    total_admins: int
    total_doctors: int
    total_staff: int
    users_created_today: int
    users_created_this_month: int


class AdminDashboardSummaryResponse(BaseModel):
    user_metrics: Dict[str, Any]
    operational_metrics: Dict[str, Any]
    system_metrics: Dict[str, Any]


# ---------------------------------------------------------------------------
# Audit Schemas
# ---------------------------------------------------------------------------

class AdminAuditResponse(BaseModel):
    id: int
    admin_user_id: Optional[int] = None
    admin_username: Optional[str] = None
    action: str
    target_user_id: Optional[int] = None
    target_username: Optional[str] = None
    target_type: str
    details: Optional[Dict[str, Any]] = None
    created_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)


class AdminAuditListResponse(BaseModel):
    items: List[AdminAuditResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
