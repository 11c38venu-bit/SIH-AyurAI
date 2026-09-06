from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class AdminAudit(Base):
    """
    Append-only administrative audit log tracking user management, role changes,
    account status transitions, and administrative password resets.
    """
    __tablename__ = "admin_audits"

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action = Column(String(50), nullable=False, index=True)
    target_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    target_type = Column(String(50), default="USER", nullable=False)
    details = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # Relationships
    admin_user = relationship("User", foreign_keys=[admin_user_id], lazy="joined")
    target_user = relationship("User", foreign_keys=[target_user_id], lazy="joined")
