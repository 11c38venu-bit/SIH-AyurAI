from abc import ABC, abstractmethod
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Dict, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.follow_up import FollowUp
from app.models.notification import (
    Notification,
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
    NotificationType,
)
from app.models.notification_audit import NotificationAudit
from app.models.notification_preference import NotificationPreference
from app.models.reminder import RecurrenceType, Reminder, ReminderType


# ---------------------------------------------------------------------------
# Notification Provider Abstraction
# ---------------------------------------------------------------------------

class NotificationProvider(ABC):
    """
    Abstract interface for multi-channel notification dispatchers.
    """

    @abstractmethod
    def send(self, notification: Notification) -> Tuple[bool, Optional[str]]:
        """
        Sends the notification.
        Returns a tuple: (success: bool, error_message: Optional[str]).
        """
        pass


class InAppNotificationProvider(NotificationProvider):
    """
    In-App Notification Provider (always available and synchronous).
    """

    def send(self, notification: Notification) -> Tuple[bool, Optional[str]]:
        # In-app notifications are stored directly in PostgreSQL and delivered immediately
        return True, None


class EmailNotificationProvider(NotificationProvider):
    """
    Email notification provider placeholder. Safely falls back if SMTP is not configured.
    """

    def send(self, notification: Notification) -> Tuple[bool, Optional[str]]:
        if not getattr(settings, "SMTP_HOST", None):
            return False, "PROVIDER_NOT_CONFIGURED: Email provider (SMTP_HOST) is not configured."
        # If SMTP were configured, sending logic would happen here
        return True, None


class SMSNotificationProvider(NotificationProvider):
    """
    SMS notification provider placeholder. Safely falls back if SMS API is not configured.
    """

    def send(self, notification: Notification) -> Tuple[bool, Optional[str]]:
        if not getattr(settings, "SMS_API_KEY", None):
            return False, "PROVIDER_NOT_CONFIGURED: SMS provider (SMS_API_KEY) is not configured."
        return True, None


class WhatsAppNotificationProvider(NotificationProvider):
    """
    WhatsApp notification provider placeholder. Safely falls back if WhatsApp API is not configured.
    """

    def send(self, notification: Notification) -> Tuple[bool, Optional[str]]:
        if not getattr(settings, "WHATSAPP_API_KEY", None):
            return False, "PROVIDER_NOT_CONFIGURED: WhatsApp provider (WHATSAPP_API_KEY) is not configured."
        return True, None


def get_notification_provider(channel: NotificationChannel) -> NotificationProvider:
    """
    Factory to retrieve the appropriate notification provider based on the channel.
    """
    if channel == NotificationChannel.EMAIL:
        return EmailNotificationProvider()
    elif channel == NotificationChannel.SMS:
        return SMSNotificationProvider()
    elif channel == NotificationChannel.WHATSAPP:
        return WhatsAppNotificationProvider()
    return InAppNotificationProvider()


# ---------------------------------------------------------------------------
# Audit & Preference Helpers
# ---------------------------------------------------------------------------

def log_notification_audit(
    db: Session,
    notification_id: int,
    user_id: Optional[int],
    action: str,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    changed_fields: Optional[Dict[str, Any]] = None,
) -> NotificationAudit:
    """
    Creates an append-only audit trail record for notification lifecycle events.
    """
    audit = NotificationAudit(
        notification_id=notification_id,
        user_id=user_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        changed_fields=changed_fields,
    )
    db.add(audit)
    return audit


def get_or_create_preference(db: Session, user_id: int) -> NotificationPreference:
    """
    Retrieves or initializes default notification preferences for a user.
    """
    pref = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.user_id == user_id)
        .first()
    )
    if not pref:
        pref = NotificationPreference(
            user_id=user_id,
            channel=NotificationChannel.IN_APP,
            enabled=True,
            follow_up_reminders_enabled=True,
            medicine_reminders_enabled=True,
            system_notifications_enabled=True,
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


# ---------------------------------------------------------------------------
# Core Notification Dispatcher
# ---------------------------------------------------------------------------

def dispatch_notification(
    db: Session,
    notification: Notification,
    actor_user_id: Optional[int] = None,
) -> Notification:
    """
    Dispatches a notification through its designated channel provider,
    checking user preferences and recording audit transitions.
    """
    # 1. Check user preferences
    pref = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.user_id == notification.recipient_user_id)
        .first()
    )

    if pref and not pref.enabled:
        prev_status = notification.status.value
        notification.status = NotificationStatus.CANCELLED
        notification.failure_reason = "Notification suppressed by user preferences (All notifications disabled)."
        log_notification_audit(
            db=db,
            notification_id=notification.id,
            user_id=actor_user_id,
            action="SUPPRESSED_BY_PREFERENCE",
            previous_status=prev_status,
            new_status=NotificationStatus.CANCELLED.value,
        )
        db.commit()
        db.refresh(notification)
        return notification

    if pref:
        is_category_disabled = (
            (
                notification.notification_type in [
                    NotificationType.FOLLOW_UP_REMINDER,
                    NotificationType.FOLLOW_UP_SCHEDULED,
                    NotificationType.FOLLOW_UP_CONFIRMED,
                    NotificationType.FOLLOW_UP_CANCELLED,
                    NotificationType.FOLLOW_UP_MISSED,
                ]
                and not pref.follow_up_reminders_enabled
            )
            or (
                notification.notification_type == NotificationType.MEDICINE_REMINDER
                and not pref.medicine_reminders_enabled
            )
            or (
                notification.notification_type in [
                    NotificationType.SYSTEM,
                    NotificationType.STAFF_ALERT,
                    NotificationType.DOCTOR_ALERT,
                ]
                and not pref.system_notifications_enabled
            )
        )

        if is_category_disabled:
            prev_status = notification.status.value
            notification.status = NotificationStatus.CANCELLED
            notification.failure_reason = f"Notification category '{notification.notification_type.value}' suppressed by user preferences."
            log_notification_audit(
                db=db,
                notification_id=notification.id,
                user_id=actor_user_id,
                action="SUPPRESSED_BY_CATEGORY_PREFERENCE",
                previous_status=prev_status,
                new_status=NotificationStatus.CANCELLED.value,
            )
            db.commit()
            db.refresh(notification)
            return notification

    # 2. Select provider and attempt delivery
    provider = get_notification_provider(notification.channel)
    prev_status = notification.status.value
    success, error_msg = provider.send(notification)

    if success:
        notification.status = NotificationStatus.DELIVERED
        notification.sent_at = datetime.now(timezone.utc)
        notification.failure_reason = None
        log_notification_audit(
            db=db,
            notification_id=notification.id,
            user_id=actor_user_id,
            action="DELIVERED",
            previous_status=prev_status,
            new_status=NotificationStatus.DELIVERED.value,
        )
    else:
        notification.retry_count += 1
        notification.failure_reason = error_msg
        max_retries = getattr(settings, "NOTIFICATION_MAX_RETRIES", 3)
        if notification.retry_count >= max_retries:
            notification.status = NotificationStatus.FAILED
            log_notification_audit(
                db=db,
                notification_id=notification.id,
                user_id=actor_user_id,
                action="FAILED",
                previous_status=prev_status,
                new_status=NotificationStatus.FAILED.value,
                changed_fields={"error": error_msg, "retry_count": notification.retry_count},
            )
        else:
            # Remains pending for retry
            log_notification_audit(
                db=db,
                notification_id=notification.id,
                user_id=actor_user_id,
                action="RETRY_ATTEMPTED",
                previous_status=prev_status,
                new_status=notification.status.value,
                changed_fields={"error": error_msg, "retry_count": notification.retry_count},
            )

    db.commit()
    db.refresh(notification)
    return notification


# ---------------------------------------------------------------------------
# Automated Follow-Up Reminder & Status Notification Workflows
# ---------------------------------------------------------------------------

def create_follow_up_reminder_idempotent(
    db: Session,
    follow_up: FollowUp,
    hours_before: Optional[int] = None,
    user_id: Optional[int] = None,
) -> Optional[Reminder]:
    """
    Idempotently creates a scheduled Reminder and linked in-app Notification
    for a scheduled follow-up appointment.
    """
    # Check if a follow-up reminder already exists for this follow_up_id
    existing_reminder = (
        db.query(Reminder)
        .filter(
            Reminder.follow_up_id == follow_up.id,
            Reminder.reminder_type == ReminderType.FOLLOW_UP,
        )
        .first()
    )
    if existing_reminder:
        return existing_reminder

    # Calculate scheduled time
    lead_hours = (
        hours_before
        if hours_before is not None
        else getattr(settings, "FOLLOW_UP_REMINDER_HOURS_BEFORE", 24)
    )

    follow_up_time = follow_up.scheduled_time or time(9, 0)
    scheduled_dt = datetime.combine(
        follow_up.scheduled_date,
        follow_up_time,
        tzinfo=timezone.utc,
    )
    reminder_dt = scheduled_dt - timedelta(hours=lead_hours)

    now_utc = datetime.now(timezone.utc)
    if reminder_dt < now_utc:
        reminder_dt = now_utc

    # Create Reminder
    reminder = Reminder(
        patient_id=follow_up.patient_id,
        follow_up_id=follow_up.id,
        prescription_id=follow_up.prescription_id,
        created_by_user_id=user_id or follow_up.doctor_id,
        reminder_type=ReminderType.FOLLOW_UP,
        title=f"Upcoming Follow-Up: Visit #{follow_up.follow_up_number}",
        message=f"Reminder for scheduled follow-up visit on {follow_up.scheduled_date} at {follow_up.scheduled_time or '09:00:00'}.",
        scheduled_for=reminder_dt,
        channel=NotificationChannel.IN_APP,
        status=NotificationStatus.PENDING,
        recurrence_type=RecurrenceType.NONE,
    )
    db.add(reminder)

    # Determine recipient (the doctor or user who created/assigned the follow-up)
    recipient_id = follow_up.doctor_id
    if not recipient_id and user_id:
        recipient_id = user_id

    if recipient_id:
        # Create corresponding Notification
        notification = Notification(
            recipient_user_id=recipient_id,
            patient_id=follow_up.patient_id,
            follow_up_id=follow_up.id,
            prescription_id=follow_up.prescription_id,
            notification_type=NotificationType.FOLLOW_UP_REMINDER,
            channel=NotificationChannel.IN_APP,
            title=f"Follow-Up Reminder: Patient #{follow_up.patient_id}",
            message=f"Follow-up visit #{follow_up.follow_up_number} is scheduled for {follow_up.scheduled_date}.",
            priority=NotificationPriority.NORMAL,
            scheduled_at=reminder_dt,
            status=NotificationStatus.PENDING,
        )
        db.add(notification)
        db.flush()

        reminder.notification_id = notification.id
        log_notification_audit(
            db=db,
            notification_id=notification.id,
            user_id=user_id,
            action="CREATED",
            previous_status=None,
            new_status=NotificationStatus.PENDING.value,
            changed_fields={"follow_up_id": follow_up.id},
        )

        # If reminder is immediate (due now), dispatch immediately
        if reminder_dt <= now_utc:
            dispatch_notification(db, notification, actor_user_id=user_id)

    db.commit()
    db.refresh(reminder)
    return reminder


def trigger_follow_up_status_notification(
    db: Session,
    follow_up: FollowUp,
    event_status: str,
    actor_user_id: Optional[int] = None,
) -> Optional[Notification]:
    """
    Creates and dispatches an immediate notification when a follow-up status changes
    (CONFIRMED, CANCELLED, MISSED).
    """
    recipient_id = follow_up.doctor_id
    if not recipient_id and actor_user_id:
        recipient_id = actor_user_id

    if not recipient_id:
        return None

    status_type_map = {
        "CONFIRMED": NotificationType.FOLLOW_UP_CONFIRMED,
        "CANCELLED": NotificationType.FOLLOW_UP_CANCELLED,
        "MISSED": NotificationType.FOLLOW_UP_MISSED,
    }

    notification_type = status_type_map.get(event_status, NotificationType.SYSTEM)
    priority = (
        NotificationPriority.HIGH
        if event_status == "MISSED"
        else NotificationPriority.NORMAL
    )

    notification = Notification(
        recipient_user_id=recipient_id,
        patient_id=follow_up.patient_id,
        follow_up_id=follow_up.id,
        prescription_id=follow_up.prescription_id,
        notification_type=notification_type,
        channel=NotificationChannel.IN_APP,
        title=f"Follow-Up #{follow_up.follow_up_number} {event_status.capitalize()}",
        message=f"Follow-up appointment for patient #{follow_up.patient_id} scheduled on {follow_up.scheduled_date} has been marked as {event_status}.",
        priority=priority,
        status=NotificationStatus.PENDING,
    )
    db.add(notification)
    db.flush()

    log_notification_audit(
        db=db,
        notification_id=notification.id,
        user_id=actor_user_id,
        action="CREATED",
        previous_status=None,
        new_status=NotificationStatus.PENDING.value,
        changed_fields={"event_status": event_status, "follow_up_id": follow_up.id},
    )

    # Dispatch notification immediately
    notification = dispatch_notification(db, notification, actor_user_id=actor_user_id)
    return notification
