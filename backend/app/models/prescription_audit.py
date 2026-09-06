from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class PrescriptionAudit(Base):
    """
    Append-only audit log for tracking all prescription lifecycle actions.
    """
    __tablename__ = "prescription_audits"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action = Column(String(50), nullable=False)  # CREATED, UPDATED, FINALIZED, CANCELLED, ITEM_ADDED, etc.
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    changed_fields = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    prescription = relationship("Prescription", back_populates="audit_logs")
    user = relationship("User", lazy="joined")
