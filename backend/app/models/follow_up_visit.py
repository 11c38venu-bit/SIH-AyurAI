from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class FollowUpVisit(Base):
    """
    Structured clinical observation and progress record for a follow-up encounter.
    Stores patient-reported changes and doctor observations for continuity of care.
    """
    __tablename__ = "follow_up_visits"

    id = Column(Integer, primary_key=True, index=True)
    follow_up_id = Column(
        Integer,
        ForeignKey("follow_ups.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    doctor_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    visit_date = Column(Date, server_default=func.current_date(), nullable=False)
    symptom_progress = Column(Text, nullable=True)
    patient_reported_changes = Column(Text, nullable=True)
    medication_adherence = Column(Text, nullable=True)  # Patient/doctor reported
    adverse_effects_reported = Column(Text, nullable=True)  # Patient reported
    lifestyle_adherence = Column(Text, nullable=True)  # Vihara adherence
    dietary_adherence = Column(Text, nullable=True)  # Pathya adherence
    doctor_observations = Column(Text, nullable=True)
    doctor_assessment = Column(Text, nullable=True)
    next_steps = Column(Text, nullable=True)

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
    follow_up = relationship("FollowUp", back_populates="visit")
    patient = relationship("Patient", lazy="joined")
    doctor = relationship("User", foreign_keys=[doctor_id], lazy="joined")
