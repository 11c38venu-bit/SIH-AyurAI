from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class PatientProgressAudit(Base):
    """
    Append-only audit trail for tracking mutations and updates to patient progress records.
    """
    __tablename__ = "patient_progress_audits"

    id = Column(Integer, primary_key=True, index=True)
    progress_id = Column(
        Integer,
        ForeignKey("patient_progress.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action = Column(String(50), nullable=False)  # CREATED, UPDATED
    changed_fields = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    progress = relationship("PatientProgress", back_populates="audit_logs")
    user = relationship("User", lazy="joined")
