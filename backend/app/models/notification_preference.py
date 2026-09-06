from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.notification import NotificationChannel


class NotificationPreference(Base):
    """
    User-configurable notification channel preferences.
    """
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    channel = Column(
        Enum(NotificationChannel, name="notification_channel_pref", native_enum=False),
        default=NotificationChannel.IN_APP,
        nullable=False
    )
    enabled = Column(Boolean, default=True, nullable=False)
    follow_up_reminders_enabled = Column(Boolean, default=True, nullable=False)
    medicine_reminders_enabled = Column(Boolean, default=True, nullable=False)
    system_notifications_enabled = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    user = relationship("User", lazy="joined")
