import enum
from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.notification import NotificationChannel, NotificationStatus


class ReminderType(str, enum.Enum):
    FOLLOW_UP = "FOLLOW_UP"
    MEDICINE = "MEDICINE"
    SYSTEM = "SYSTEM"


class RecurrenceType(str, enum.Enum):
    NONE = "NONE"
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"


class Reminder(Base):
    """
    Scheduled reminder entity for appointments and structured medicine reminders.
    """
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    follow_up_id = Column(
        Integer,
        ForeignKey("follow_ups.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    created_by_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    reminder_type = Column(
        Enum(ReminderType, name="reminder_type", native_enum=False),
        nullable=False,
        index=True
    )
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    scheduled_for = Column(DateTime(timezone=True), nullable=False, index=True)

    channel = Column(
        Enum(NotificationChannel, name="reminder_channel", native_enum=False),
        default=NotificationChannel.IN_APP,
        nullable=False
    )
    status = Column(
        Enum(NotificationStatus, name="reminder_status", native_enum=False),
        default=NotificationStatus.PENDING,
        nullable=False,
        index=True
    )

    notification_id = Column(
        Integer,
        ForeignKey("notifications.id", ondelete="SET NULL"),
        nullable=True
    )

    recurrence_type = Column(
        Enum(RecurrenceType, name="recurrence_type", native_enum=False),
        default=RecurrenceType.NONE,
        nullable=False
    )
    recurrence_end_date = Column(Date, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    patient = relationship("Patient", lazy="joined")
    follow_up = relationship("FollowUp", lazy="joined")
    prescription = relationship("Prescription", lazy="joined")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id], lazy="joined")
    notification = relationship("Notification", lazy="joined")
