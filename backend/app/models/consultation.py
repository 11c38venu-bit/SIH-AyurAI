import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ConsultationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Consultation(Base):
    """
    Doctor Consultation & Clinical Decision record.
    The qualified practitioner is the final clinical authority.
    Fields `diagnosis` and `treatment_plan` can only be entered/modified by DOCTOR or ADMIN.
    """
    __tablename__ = "consultations"

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
        unique=True,
        index=True
    )
    doctor_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    queue_id = Column(
        Integer,
        ForeignKey("patient_queues.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    consultation_status = Column(
        Enum(ConsultationStatus, name="consultation_status", native_enum=False),
        default=ConsultationStatus.DRAFT,
        nullable=False,
        index=True
    )

    # Clinical Intake & Assessment
    chief_complaint = Column(Text, nullable=True)
    clinical_observations = Column(Text, nullable=True)
    doctor_assessment = Column(Text, nullable=True)

    # Doctor-Exclusive Clinical Decisions (AI NEVER writes these)
    diagnosis = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    doctor_notes = Column(Text, nullable=True)

    # Follow-up & Care Plan
    follow_up_required = Column(Boolean, default=False, nullable=False)
    follow_up_notes = Column(Text, nullable=True)

    # Cancellation Metadata
    cancellation_reason = Column(Text, nullable=True)

    # Timestamps
    consultation_started_at = Column(DateTime(timezone=True), nullable=True)
    consultation_completed_at = Column(DateTime(timezone=True), nullable=True)

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
    patient = relationship("Patient", backref="consultations", lazy="joined")
    case_session = relationship("CaseSession", backref="consultation", lazy="joined")
    doctor = relationship("User", foreign_keys=[doctor_id], lazy="joined")
    queue_entry = relationship("PatientQueue", lazy="joined")
