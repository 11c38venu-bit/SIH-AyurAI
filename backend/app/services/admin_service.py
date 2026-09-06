import math
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.admin_audit import AdminAudit
from app.models.ai_case_response import AICaseResponse, AIProcessingStatus
from app.models.consultation import Consultation
from app.models.document_processing import DocumentProcessing, DocumentProcessingStatus
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.notification import Notification, NotificationStatus
from app.models.patient import Patient
from app.models.queue import PatientQueue, QueueStatus
from app.models.user import User, UserRole
from app.schemas.admin import (
    AdminAuditListResponse,
    AdminAuditResponse,
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


# ---------------------------------------------------------------------------
# Administrative Audit Logger
# ---------------------------------------------------------------------------

def log_admin_audit(
    db: Session,
    admin_user_id: Optional[int],
    action: str,
    target_user_id: Optional[int] = None,
    target_type: str = "USER",
    details: Optional[Dict[str, Any]] = None,
) -> AdminAudit:
    """
    Creates an immutable administrative audit record.
    Never logs passwords, hashes, JWTs, or secrets.
    """
    audit = AdminAudit(
        admin_user_id=admin_user_id,
        action=action,
        target_user_id=target_user_id,
        target_type=target_type,
        details=details,
    )
    db.add(audit)
    db.flush()
    return audit


# ---------------------------------------------------------------------------
# User Management Services
# ---------------------------------------------------------------------------

def list_users(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
) -> AdminUserListResponse:
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page number must be greater than or equal to 1.",
        )
    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page size must be between 1 and 100.",
        )

    query = db.query(User)

    if role is not None:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.username.ilike(search_pattern),
            )
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    users = (
        query.order_by(User.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = [AdminUserResponse.model_validate(u) for u in users]

    return AdminUserListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found.",
        )
    return user


def create_operational_user(
    db: Session,
    user_in: AdminUserCreate,
    admin_user_id: int,
) -> User:
    # Restrict administrative creation to DOCTOR and STAFF
    if user_in.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrative user creation is restricted to DOCTOR and STAFF roles. New ADMIN accounts must be provisioned via setup bootstrap.",
        )

    # Check unique email
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A user with email '{user_in.email}' already exists.",
        )

    # Check unique username if supplied
    if user_in.username:
        existing_username = db.query(User).filter(User.username == user_in.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A user with username '{user_in.username}' already exists.",
            )

    new_user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        role=user_in.role,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    log_admin_audit(
        db=db,
        admin_user_id=admin_user_id,
        action="USER_CREATED",
        target_user_id=new_user.id,
        target_type="USER",
        details={
            "email": new_user.email,
            "username": new_user.username,
            "full_name": new_user.full_name,
            "role": new_user.role.value,
        },
    )

    db.commit()
    db.refresh(new_user)
    return new_user


def update_user_profile(
    db: Session,
    user_id: int,
    user_in: AdminUserUpdate,
    admin_user_id: int,
) -> User:
    user = get_user_by_id(db, user_id)
    changed_fields: Dict[str, Any] = {}

    if user_in.email and user_in.email != user.email:
        existing_email = db.query(User).filter(User.email == user_in.email, User.id != user.id).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A user with email '{user_in.email}' already exists.",
            )
        changed_fields["email"] = {"old": user.email, "new": user_in.email}
        user.email = user_in.email

    if user_in.username and user_in.username != user.username:
        existing_username = db.query(User).filter(User.username == user_in.username, User.id != user.id).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A user with username '{user_in.username}' already exists.",
            )
        changed_fields["username"] = {"old": user.username, "new": user_in.username}
        user.username = user_in.username

    if user_in.full_name and user_in.full_name != user.full_name:
        changed_fields["full_name"] = {"old": user.full_name, "new": user_in.full_name}
        user.full_name = user_in.full_name

    if changed_fields:
        log_admin_audit(
            db=db,
            admin_user_id=admin_user_id,
            action="USER_UPDATED",
            target_user_id=user.id,
            target_type="USER",
            details=changed_fields,
        )

    db.commit()
    db.refresh(user)
    return user


def update_user_role(
    db: Session,
    user_id: int,
    role_in: AdminUserRoleUpdate,
    admin_user_id: int,
) -> User:
    user = get_user_by_id(db, user_id)

    # Final Active Admin protection: cannot downgrade last active ADMIN
    if user.role == UserRole.ADMIN and role_in.role != UserRole.ADMIN:
        active_admins_count = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN, User.is_active == True)
            .count()
        )
        if active_admins_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot downgrade the final active administrator in the system.",
            )

    prev_role = user.role.value
    user.role = role_in.role

    log_admin_audit(
        db=db,
        admin_user_id=admin_user_id,
        action="ROLE_CHANGED",
        target_user_id=user.id,
        target_type="USER",
        details={"previous_role": prev_role, "new_role": user.role.value},
    )

    db.commit()
    db.refresh(user)
    return user


def activate_user_account(
    db: Session,
    user_id: int,
    admin_user_id: int,
) -> User:
    user = get_user_by_id(db, user_id)
    user.is_active = True

    log_admin_audit(
        db=db,
        admin_user_id=admin_user_id,
        action="USER_ACTIVATED",
        target_user_id=user.id,
        target_type="USER",
        details={"status": "ACTIVATED"},
    )

    db.commit()
    db.refresh(user)
    return user


def deactivate_user_account(
    db: Session,
    user_id: int,
    admin_user_id: int,
) -> User:
    user = get_user_by_id(db, user_id)

    # Self-deactivation protection
    if user.id == admin_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate their own active account.",
        )

    # Final Active Admin protection
    if user.role == UserRole.ADMIN:
        active_admins_count = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN, User.is_active == True)
            .count()
        )
        if active_admins_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate the final active administrator in the system.",
            )

    user.is_active = False

    log_admin_audit(
        db=db,
        admin_user_id=admin_user_id,
        action="USER_DEACTIVATED",
        target_user_id=user.id,
        target_type="USER",
        details={"status": "DEACTIVATED"},
    )

    db.commit()
    db.refresh(user)
    return user


def reset_user_password_by_admin(
    db: Session,
    user_id: int,
    pass_in: AdminPasswordReset,
    admin_user_id: int,
) -> AdminPasswordResetResponse:
    user = get_user_by_id(db, user_id)
    user.hashed_password = hash_password(pass_in.new_password)

    # Log audit WITHOUT passwords or hashes
    log_admin_audit(
        db=db,
        admin_user_id=admin_user_id,
        action="PASSWORD_RESET",
        target_user_id=user.id,
        target_type="USER",
        details={"email": user.email, "username": user.username},
    )

    db.commit()
    return AdminPasswordResetResponse(
        message="Password reset successfully",
        user_id=user.id,
    )


# ---------------------------------------------------------------------------
# Specialized Doctor & Staff Listings
# ---------------------------------------------------------------------------

def list_doctors_admin(db: Session) -> List[DoctorListItemResponse]:
    doctors = (
        db.query(User)
        .filter(User.role == UserRole.DOCTOR)
        .order_by(User.full_name.asc())
        .all()
    )

    results = []
    for doc in doctors:
        consult_count = (
            db.query(Consultation)
            .filter(Consultation.doctor_id == doc.id)
            .count()
        )
        results.append(
            DoctorListItemResponse(
                id=doc.id,
                full_name=doc.full_name,
                email=doc.email,
                username=doc.username,
                is_active=doc.is_active,
                created_at=doc.created_at,
                consultation_count=consult_count,
            )
        )
    return results


def list_staff_admin(db: Session) -> List[StaffListItemResponse]:
    staff_members = (
        db.query(User)
        .filter(User.role == UserRole.STAFF)
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        StaffListItemResponse(
            id=s.id,
            full_name=s.full_name,
            email=s.email,
            username=s.username,
            is_active=s.is_active,
            created_at=s.created_at,
        )
        for s in staff_members
    ]


# ---------------------------------------------------------------------------
# User Statistics & Admin Dashboard Summary
# ---------------------------------------------------------------------------

def get_user_statistics(db: Session) -> UserStatisticsResponse:
    today_utc = datetime.now(timezone.utc).date()
    month_start = today_utc - timedelta(days=30)

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = db.query(User).filter(User.is_active == False).count()

    total_admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    total_doctors = db.query(User).filter(User.role == UserRole.DOCTOR).count()
    total_staff = db.query(User).filter(User.role == UserRole.STAFF).count()

    created_today = db.query(User).filter(func.date(User.created_at) == today_utc).count()
    created_this_month = db.query(User).filter(func.date(User.created_at) >= month_start).count()

    return UserStatisticsResponse(
        total_users=total_users,
        active_users=active_users,
        inactive_users=inactive_users,
        total_admins=total_admins,
        total_doctors=total_doctors,
        total_staff=total_staff,
        users_created_today=created_today,
        users_created_this_month=created_this_month,
    )


def get_admin_dashboard_summary(db: Session) -> AdminDashboardSummaryResponse:
    today_utc = datetime.now(timezone.utc).date()

    # User Metrics
    user_stats = get_user_statistics(db).model_dump()

    # Operational Metrics
    patients_today = db.query(Patient).filter(func.date(Patient.created_at) == today_utc).count()
    total_patients = db.query(Patient).count()
    consultations_today = db.query(Consultation).filter(func.date(Consultation.created_at) == today_utc).count()
    queue_waiting = (
        db.query(PatientQueue)
        .filter(PatientQueue.queue_date == today_utc, PatientQueue.status == QueueStatus.WAITING)
        .count()
    )
    follow_ups_today = db.query(FollowUp).filter(FollowUp.scheduled_date == today_utc).count()
    missed_follow_ups = (
        db.query(FollowUp)
        .filter(FollowUp.status == FollowUpStatus.MISSED)
        .count()
    )

    operational_metrics = {
        "total_patients": total_patients,
        "patients_today": patients_today,
        "consultations_today": consultations_today,
        "waiting_queue": queue_waiting,
        "follow_ups_today": follow_ups_today,
        "missed_follow_ups": missed_follow_ups,
    }

    # System Metrics
    docs_pending = (
        db.query(DocumentProcessing)
        .filter(
            DocumentProcessing.processing_status.in_([
                DocumentProcessingStatus.NOT_PROCESSED,
                DocumentProcessingStatus.PROCESSING,
            ])
        )
        .count()
    )
    ai_pending = (
        db.query(AICaseResponse)
        .filter(
            AICaseResponse.processing_status.in_([
                AIProcessingStatus.PENDING,
                AIProcessingStatus.PROCESSING,
            ])
        )
        .count()
    )
    failed_notifs = (
        db.query(Notification)
        .filter(Notification.status == NotificationStatus.FAILED)
        .count()
    )

    system_metrics = {
        "documents_pending_processing": docs_pending,
        "ai_processing_pending": ai_pending,
        "failed_notifications": failed_notifs,
    }

    return AdminDashboardSummaryResponse(
        user_metrics=user_stats,
        operational_metrics=operational_metrics,
        system_metrics=system_metrics,
    )


# ---------------------------------------------------------------------------
# Admin Audit Query Service
# ---------------------------------------------------------------------------

def list_admin_audits(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    action: Optional[str] = None,
    target_user_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> AdminAuditListResponse:
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page number must be greater than or equal to 1.",
        )
    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page size must be between 1 and 100.",
        )
    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date range: 'date_from' ({date_from}) cannot be after 'date_to' ({date_to}).",
        )

    query = db.query(AdminAudit)

    if action:
        query = query.filter(AdminAudit.action == action.strip().upper())
    if target_user_id:
        query = query.filter(AdminAudit.target_user_id == target_user_id)
    if date_from:
        query = query.filter(func.date(AdminAudit.created_at) >= date_from)
    if date_to:
        query = query.filter(func.date(AdminAudit.created_at) <= date_to)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    audits = (
        query.order_by(AdminAudit.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []
    for a in audits:
        items.append(
            AdminAuditResponse(
                id=a.id,
                admin_user_id=a.admin_user_id,
                admin_username=a.admin_user.username if a.admin_user else None,
                action=a.action,
                target_user_id=a.target_user_id,
                target_username=a.target_user.username if a.target_user else None,
                target_type=a.target_type,
                details=a.details,
                created_at=a.created_at,
            )
        )

    return AdminAuditListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
