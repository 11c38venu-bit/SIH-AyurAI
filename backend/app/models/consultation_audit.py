from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ConsultationAudit(Base):
    """
    Immutable audit trail for all doctor consultation state transitions and modifications.
    """
    __tablename__ = "consultation_audits"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(
        Integer,
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action = Column(String(50), nullable=False)  # CREATED, UPDATED, COMPLETED, CANCELLED
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    changed_fields = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    consultation = relationship("Consultation", backref="audits", lazy="joined")
    user = relationship("User", lazy="joined")
