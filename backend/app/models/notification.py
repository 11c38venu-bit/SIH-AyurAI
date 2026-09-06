import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class NotificationType(str, enum.Enum):
    FOLLOW_UP_REMINDER = "FOLLOW_UP_REMINDER"
    FOLLOW_UP_SCHEDULED = "FOLLOW_UP_SCHEDULED"
    FOLLOW_UP_CONFIRMED = "FOLLOW_UP_CONFIRMED"
    FOLLOW_UP_CANCELLED = "FOLLOW_UP_CANCELLED"
    FOLLOW_UP_MISSED = "FOLLOW_UP_MISSED"
    MEDICINE_REMINDER = "MEDICINE_REMINDER"
    SYSTEM = "SYSTEM"
    STAFF_ALERT = "STAFF_ALERT"
    DOCTOR_ALERT = "DOCTOR_ALERT"


class NotificationChannel(str, enum.Enum):
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"
    SMS = "SMS"
    WHATSAPP = "WHATSAPP"


class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    READ = "READ"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class NotificationPriority(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"


class Notification(Base):
    """
    Notification record delivering system, follow-up, and reminder events to users.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=True,
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

    notification_type = Column(
        Enum(NotificationType, name="notification_type", native_enum=False),
        nullable=False,
        index=True
    )
    channel = Column(
        Enum(NotificationChannel, name="notification_channel", native_enum=False),
        default=NotificationChannel.IN_APP,
        nullable=False
    )
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    status = Column(
        Enum(NotificationStatus, name="notification_status", native_enum=False),
        default=NotificationStatus.PENDING,
        nullable=False,
        index=True
    )
    priority = Column(
        Enum(NotificationPriority, name="notification_priority", native_enum=False),
        default=NotificationPriority.NORMAL,
        nullable=False
    )

    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)

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
    recipient = relationship("User", foreign_keys=[recipient_user_id], lazy="joined")
    patient = relationship("Patient", lazy="joined")
    follow_up = relationship("FollowUp", lazy="joined")
    prescription = relationship("Prescription", lazy="joined")
    audit_logs = relationship(
        "NotificationAudit",
        back_populates="notification",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="NotificationAudit.created_at.desc()"
    )
