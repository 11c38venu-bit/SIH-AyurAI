import enum
from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class FollowUpStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    MISSED = "MISSED"
    CANCELLED = "CANCELLED"


class FollowUp(Base):
    """
    Relational clinical follow-up appointment record for patient continuity of care.
    Scoped sequentially per patient.
    """
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    consultation_id = Column(
        Integer,
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    doctor_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    follow_up_number = Column(Integer, nullable=False, index=True)
    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(Time, nullable=True)
    reason = Column(Text, nullable=False)
    instructions = Column(Text, nullable=True)

    status = Column(
        Enum(FollowUpStatus, name="follow_up_status", native_enum=False),
        default=FollowUpStatus.SCHEDULED,
        nullable=False,
        index=True
    )

    doctor_notes = Column(Text, nullable=True)
    patient_notes = Column(Text, nullable=True)
    completion_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    completed_at = Column(DateTime(timezone=True), nullable=True)

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
    patient = relationship("Patient", backref="follow_ups", lazy="joined")
    case_session = relationship("CaseSession", backref="follow_ups", lazy="joined")
    consultation = relationship("Consultation", backref="follow_ups", lazy="joined")
    prescription = relationship("Prescription", backref="follow_ups", lazy="joined")
    doctor = relationship("User", foreign_keys=[doctor_id], lazy="joined")
    visit = relationship(
        "FollowUpVisit",
        back_populates="follow_up",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined"
    )
    audit_logs = relationship(
        "FollowUpAudit",
        back_populates="follow_up",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="FollowUpAudit.created_at.desc()"
    )
