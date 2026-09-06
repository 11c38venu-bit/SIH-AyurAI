from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin, require_doctor, require_staff
from app.db.database import get_db
from app.models.notification import (
    Notification,
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
    NotificationType,
)
from app.models.notification_audit import NotificationAudit
from app.models.notification_preference import NotificationPreference
from app.models.patient import Patient
from app.models.reminder import Reminder, ReminderType
from app.models.user import User, UserRole
from app.schemas.notification import (
    NotificationAuditResponse,
    NotificationCreate,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
    NotificationResponse,
    NotificationUnreadCountResponse,
    ReminderCreate,
    ReminderResponse,
)
from app.services.notification_service import (
    dispatch_notification,
    get_or_create_preference,
    log_notification_audit,
)

router = APIRouter(prefix="/notifications", tags=["Notifications & Reminders"])


# ---------------------------------------------------------------------------
# Notification Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and dispatch notification (Staff, Doctor, Admin)"
)
def create_notification(
    notification_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Create a new notification and attempt immediate delivery through the configured channel.
    """
    recipient = db.query(User).filter(User.id == notification_in.recipient_user_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipient user with ID {notification_in.recipient_user_id} not found."
        )

    if notification_in.patient_id:
        patient = db.query(Patient).filter(Patient.id == notification_in.patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient with ID {notification_in.patient_id} not found."
            )

    notification = Notification(
        recipient_user_id=notification_in.recipient_user_id,
        patient_id=notification_in.patient_id,
        follow_up_id=notification_in.follow_up_id,
        prescription_id=notification_in.prescription_id,
        notification_type=notification_in.notification_type,
        channel=notification_in.channel or NotificationChannel.IN_APP,
        title=notification_in.title,
        message=notification_in.message,
        priority=notification_in.priority or NotificationPriority.NORMAL,
        scheduled_at=notification_in.scheduled_at,
        status=NotificationStatus.PENDING
    )
    db.add(notification)
    db.flush()

    log_notification_audit(
        db=db,
        notification_id=notification.id,
        user_id=current_user.id,
        action="CREATED",
        previous_status=None,
        new_status=NotificationStatus.PENDING.value
    )

    # Dispatch notification immediately
    notification = dispatch_notification(db, notification, actor_user_id=current_user.id)
    return notification


@router.post(
    "/reminders",
    response_model=ReminderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create scheduled reminder (Staff, Doctor, Admin)"
)
def create_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Schedule an appointment or medicine reminder for a patient.
    """
    patient = db.query(Patient).filter(Patient.id == reminder_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {reminder_in.patient_id} not found."
        )

    reminder = Reminder(
        patient_id=reminder_in.patient_id,
        follow_up_id=reminder_in.follow_up_id,
        prescription_id=reminder_in.prescription_id,
        created_by_user_id=current_user.id,
        reminder_type=reminder_in.reminder_type,
        title=reminder_in.title,
        message=reminder_in.message,
        scheduled_for=reminder_in.scheduled_for,
        channel=reminder_in.channel or NotificationChannel.IN_APP,
        status=NotificationStatus.PENDING,
        recurrence_type=reminder_in.recurrence_type,
        recurrence_end_date=reminder_in.recurrence_end_date
    )
    db.add(reminder)
    db.flush()

    # Automatically create linked in-app notification for the user
    notification = Notification(
        recipient_user_id=current_user.id,
        patient_id=reminder_in.patient_id,
        follow_up_id=reminder_in.follow_up_id,
        prescription_id=reminder_in.prescription_id,
        notification_type=NotificationType.MEDICINE_REMINDER if reminder_in.reminder_type == ReminderType.MEDICINE else NotificationType.FOLLOW_UP_REMINDER,
        channel=reminder_in.channel or NotificationChannel.IN_APP,
        title=reminder_in.title,
        message=reminder_in.message,
        priority=NotificationPriority.NORMAL,
        scheduled_at=reminder_in.scheduled_for,
        status=NotificationStatus.PENDING
    )
    db.add(notification)
    db.flush()

    reminder.notification_id = notification.id
    log_notification_audit(
        db=db,
        notification_id=notification.id,
        user_id=current_user.id,
        action="CREATED",
        previous_status=None,
        new_status=NotificationStatus.PENDING.value,
        changed_fields={"reminder_id": reminder.id}
    )

    db.commit()
    db.refresh(reminder)
    return reminder


@router.get(
    "/",
    response_model=List[NotificationResponse],
    summary="List notifications with filters and pagination"
)
def list_notifications(
    recipient_user_id: Optional[int] = Query(None, description="Filter by recipient (Admin only)"),
    patient_id: Optional[int] = Query(None, description="Filter by patient"),
    status_filter: Optional[NotificationStatus] = Query(None, alias="status", description="Filter by status"),
    notification_type: Optional[NotificationType] = Query(None, description="Filter by notification type"),
    channel: Optional[NotificationChannel] = Query(None, description="Filter by channel"),
    unread_only: bool = Query(False, description="Filter for unread notifications only"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve notifications for current user (or any user if Admin).
    """
    query = db.query(Notification)

    # Access control: Non-admins can only see their own notifications
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Notification.recipient_user_id == current_user.id)
    elif recipient_user_id:
        query = query.filter(Notification.recipient_user_id == recipient_user_id)

    if patient_id:
        query = query.filter(Notification.patient_id == patient_id)
    if status_filter:
        query = query.filter(Notification.status == status_filter)
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    if channel:
        query = query.filter(Notification.channel == channel)
    if unread_only:
        query = query.filter(Notification.status != NotificationStatus.READ)

    notifications = (
        query.order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return notifications


@router.get(
    "/unread-count",
    response_model=NotificationUnreadCountResponse,
    summary="Get unread notification count for current user"
)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Count unread notifications for badge display.
    """
    unread_count = (
        db.query(Notification)
        .filter(
            Notification.recipient_user_id == current_user.id,
            Notification.status.in_([
                NotificationStatus.PENDING,
                NotificationStatus.SENT,
                NotificationStatus.DELIVERED,
            ])
        )
        .count()
    )

    total_active = (
        db.query(Notification)
        .filter(
            Notification.recipient_user_id == current_user.id,
            Notification.status != NotificationStatus.CANCELLED
        )
        .count()
    )

    return NotificationUnreadCountResponse(
        unread_count=unread_count,
        total_active=total_active
    )


@router.get(
    "/preferences/me",
    response_model=NotificationPreferenceResponse,
    summary="Get notification preferences for current user"
)
def get_my_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve or initialize notification preferences for the authenticated user.
    """
    return get_or_create_preference(db, current_user.id)


@router.patch(
    "/preferences/me",
    response_model=NotificationPreferenceResponse,
    summary="Update notification preferences for current user"
)
def update_my_preferences(
    pref_in: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update channel and category notification preferences for current user.
    """
    pref = get_or_create_preference(db, current_user.id)

    update_dict = pref_in.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if val is not None:
            setattr(pref, field, val)

    db.commit()
    db.refresh(pref)
    return pref


@router.patch(
    "/read-all",
    summary="Mark all unread notifications as read for current user"
)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk update all unread notifications to READ for the authenticated user.
    """
    unread_notifications = (
        db.query(Notification)
        .filter(
            Notification.recipient_user_id == current_user.id,
            Notification.status != NotificationStatus.READ,
            Notification.status != NotificationStatus.CANCELLED
        )
        .all()
    )

    now_utc = datetime.now(timezone.utc)
    updated_count = len(unread_notifications)

    for notif in unread_notifications:
        prev_status = notif.status.value
        notif.status = NotificationStatus.READ
        notif.read_at = now_utc
        log_notification_audit(
            db=db,
            notification_id=notif.id,
            user_id=current_user.id,
            action="READ_ALL",
            previous_status=prev_status,
            new_status=NotificationStatus.READ.value
        )

    db.commit()
    return {"message": "All notifications marked as read.", "count": updated_count}


@router.get(
    "/reminders/",
    response_model=List[ReminderResponse],
    summary="List reminders with filters (Staff, Doctor, Admin)"
)
def list_reminders(
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    follow_up_id: Optional[int] = Query(None, description="Filter by follow-up ID"),
    status_filter: Optional[NotificationStatus] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    List reminders with optional filters by patient, follow-up, or status.
    """
    query = db.query(Reminder)
    if patient_id:
        query = query.filter(Reminder.patient_id == patient_id)
    if follow_up_id:
        query = query.filter(Reminder.follow_up_id == follow_up_id)
    if status_filter:
        query = query.filter(Reminder.status == status_filter)

    reminders = (
        query.order_by(Reminder.scheduled_for.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return reminders


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
    summary="Get notification details by ID"
)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve single notification by ID. Non-admins may only view their own notifications.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID {notification_id} not found."
        )

    if current_user.role != UserRole.ADMIN and notification.recipient_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You may only view your own notifications."
        )

    return notification


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark single notification as read"
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a notification as READ.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID {notification_id} not found."
        )

    if current_user.role != UserRole.ADMIN and notification.recipient_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You may only update your own notifications."
        )

    if notification.status != NotificationStatus.READ:
        prev_status = notification.status.value
        notification.status = NotificationStatus.READ
        notification.read_at = datetime.now(timezone.utc)
        log_notification_audit(
            db=db,
            notification_id=notification.id,
            user_id=current_user.id,
            action="READ",
            previous_status=prev_status,
            new_status=NotificationStatus.READ.value
        )
        db.commit()
        db.refresh(notification)

    return notification


@router.patch(
    "/{notification_id}/cancel",
    response_model=NotificationResponse,
    summary="Cancel notification"
)
def cancel_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a pending or active notification.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID {notification_id} not found."
        )

    if current_user.role != UserRole.ADMIN and notification.recipient_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You may only cancel your own notifications."
        )

    prev_status = notification.status.value
    notification.status = NotificationStatus.CANCELLED
    log_notification_audit(
        db=db,
        notification_id=notification.id,
        user_id=current_user.id,
        action="CANCELLED",
        previous_status=prev_status,
        new_status=NotificationStatus.CANCELLED.value
    )
    db.commit()
    db.refresh(notification)
    return notification


@router.get(
    "/{notification_id}/audits",
    response_model=List[NotificationAuditResponse],
    summary="Get delivery and status audit logs for a notification"
)
def get_notification_audits(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve audit history for a specific notification.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID {notification_id} not found."
        )

    if current_user.role != UserRole.ADMIN and notification.recipient_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You may only view audits for your own notifications."
        )

    audits = (
        db.query(NotificationAudit)
        .filter(NotificationAudit.notification_id == notification_id)
        .order_by(NotificationAudit.created_at.desc())
        .all()
    )
    return audits
