from datetime import date as DateType, datetime as DateTimeType
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.notification import (
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
    NotificationType,
)
from app.models.reminder import RecurrenceType, ReminderType


# ---------------------------------------------------------------------------
# Notification Schemas
# ---------------------------------------------------------------------------

class NotificationCreate(BaseModel):
    recipient_user_id: int
    patient_id: Optional[int] = None
    follow_up_id: Optional[int] = None
    prescription_id: Optional[int] = None
    notification_type: NotificationType
    channel: Optional[NotificationChannel] = NotificationChannel.IN_APP
    title: str = Field(..., max_length=255)
    message: str
    priority: Optional[NotificationPriority] = NotificationPriority.NORMAL
    scheduled_at: Optional[DateTimeType] = None


class NotificationResponse(BaseModel):
    id: int
    recipient_user_id: int
    patient_id: Optional[int] = None
    follow_up_id: Optional[int] = None
    prescription_id: Optional[int] = None
    notification_type: NotificationType
    channel: NotificationChannel
    title: str
    message: str
    status: NotificationStatus
    priority: NotificationPriority
    scheduled_at: Optional[DateTimeType] = None
    sent_at: Optional[DateTimeType] = None
    read_at: Optional[DateTimeType] = None
    failure_reason: Optional[str] = None
    retry_count: int = 0
    created_at: Optional[DateTimeType] = None
    updated_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)


class NotificationUnreadCountResponse(BaseModel):
    unread_count: int
    total_active: int


# ---------------------------------------------------------------------------
# Notification Preference Schemas
# ---------------------------------------------------------------------------

class NotificationPreferenceResponse(BaseModel):
    id: int
    user_id: int
    channel: NotificationChannel
    enabled: bool
    follow_up_reminders_enabled: bool
    medicine_reminders_enabled: bool
    system_notifications_enabled: bool
    created_at: Optional[DateTimeType] = None
    updated_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)


class NotificationPreferenceUpdate(BaseModel):
    channel: Optional[NotificationChannel] = None
    enabled: Optional[bool] = None
    follow_up_reminders_enabled: Optional[bool] = None
    medicine_reminders_enabled: Optional[bool] = None
    system_notifications_enabled: Optional[bool] = None


# ---------------------------------------------------------------------------
# Reminder Schemas
# ---------------------------------------------------------------------------

class ReminderCreate(BaseModel):
    patient_id: int
    follow_up_id: Optional[int] = None
    prescription_id: Optional[int] = None
    reminder_type: ReminderType
    title: str = Field(..., max_length=255)
    message: str
    scheduled_for: DateTimeType
    channel: Optional[NotificationChannel] = NotificationChannel.IN_APP
    recurrence_type: Optional[RecurrenceType] = RecurrenceType.NONE
    recurrence_end_date: Optional[DateType] = None


class ReminderResponse(BaseModel):
    id: int
    patient_id: int
    follow_up_id: Optional[int] = None
    prescription_id: Optional[int] = None
    created_by_user_id: Optional[int] = None
    reminder_type: ReminderType
    title: str
    message: str
    scheduled_for: DateTimeType
    channel: NotificationChannel
    status: NotificationStatus
    notification_id: Optional[int] = None
    recurrence_type: RecurrenceType
    recurrence_end_date: Optional[DateType] = None
    created_at: Optional[DateTimeType] = None
    updated_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Notification Audit Schemas
# ---------------------------------------------------------------------------

class NotificationAuditResponse(BaseModel):
    id: int
    notification_id: int
    user_id: Optional[int] = None
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    changed_fields: Optional[Dict[str, Any]] = None
    created_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)
