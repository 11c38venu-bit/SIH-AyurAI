from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class FollowUpAudit(Base):
    """
    Append-only audit trail for tracking follow-up appointment lifecycle actions.
    """
    __tablename__ = "follow_up_audits"

    id = Column(Integer, primary_key=True, index=True)
    follow_up_id = Column(
        Integer,
        ForeignKey("follow_ups.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action = Column(String(50), nullable=False)  # CREATED, UPDATED, CONFIRMED, COMPLETED, MISSED, CANCELLED, VISIT_RECORDED
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    changed_fields = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    follow_up = relationship("FollowUp", back_populates="audit_logs")
    user = relationship("User", lazy="joined")
