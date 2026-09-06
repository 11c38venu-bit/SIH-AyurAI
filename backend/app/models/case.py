import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class CaseStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class CaseSession(Base):
    __tablename__ = "case_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    queue_id = Column(
        Integer,
        ForeignKey("patient_queues.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    status = Column(
        Enum(CaseStatus, name="case_status", native_enum=False),
        default=CaseStatus.IN_PROGRESS,
        nullable=False,
        index=True
    )
    started_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
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
    patient = relationship("Patient", backref="case_sessions", lazy="joined")
    queue_entry = relationship("PatientQueue", backref="case_sessions", lazy="joined")
    responses = relationship(
        "CaseResponse",
        back_populates="case_session",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
