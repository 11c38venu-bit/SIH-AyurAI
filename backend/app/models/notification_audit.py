from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class NotificationAudit(Base):
    """
    Append-only audit trail for tracking notification delivery and read status actions.
    """
    __tablename__ = "notification_audits"

    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(
        Integer,
        ForeignKey("notifications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action = Column(String(50), nullable=False)  # CREATED, SENT, DELIVERED, READ, FAILED, CANCELLED, RETRIED
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    changed_fields = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    notification = relationship("Notification", back_populates="audit_logs")
    user = relationship("User", lazy="joined")
