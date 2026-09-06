import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ProgressTrend(str, enum.Enum):
    IMPROVING = "IMPROVING"
    STABLE = "STABLE"
    WORSENING = "WORSENING"
    FLUCTUATING = "FLUCTUATING"
    NOT_ASSESSED = "NOT_ASSESSED"


class SymptomSeverity(str, enum.Enum):
    NONE = "NONE"
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    NOT_ASSESSED = "NOT_ASSESSED"


class AdherenceLevel(str, enum.Enum):
    GOOD = "GOOD"
    PARTIAL = "PARTIAL"
    POOR = "POOR"
    NOT_REPORTED = "NOT_REPORTED"


class ClinicalOutcome(str, enum.Enum):
    IMPROVED = "IMPROVED"
    STABLE = "STABLE"
    NOT_IMPROVED = "NOT_IMPROVED"
    WORSENED = "WORSENED"
    INCONCLUSIVE = "INCONCLUSIVE"
    NOT_ASSESSED = "NOT_ASSESSED"


class PatientProgress(Base):
    """
    Longitudinal Patient Progress and Outcome Tracking Record.
    Anchored 1:1 to a FollowUpVisit clinical encounter.
    """
    __tablename__ = "patient_progress"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    follow_up_id = Column(
        Integer,
        ForeignKey("follow_ups.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    follow_up_visit_id = Column(
        Integer,
        ForeignKey("follow_up_visits.id", ondelete="CASCADE"),
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

    # Symptom Dynamics
    symptom_status = Column(
        Enum(ProgressTrend, name="progress_trend", native_enum=False),
        default=ProgressTrend.NOT_ASSESSED,
        nullable=False,
        index=True
    )
    symptom_change = Column(Text, nullable=True)
    symptom_severity = Column(
        Enum(SymptomSeverity, name="symptom_severity", native_enum=False),
        default=SymptomSeverity.NOT_ASSESSED,
        nullable=False,
        index=True
    )

    # Patient-Reported Feedback
    patient_reported_improvement = Column(Text, nullable=True)
    patient_reported_concerns = Column(Text, nullable=True)
    adverse_effects = Column(Text, nullable=True)

    # Adherence Dimensions
    medication_adherence = Column(
        Enum(AdherenceLevel, name="adherence_level", native_enum=False),
        default=AdherenceLevel.NOT_REPORTED,
        nullable=False
    )
    lifestyle_adherence = Column(
        Enum(AdherenceLevel, name="lifestyle_adherence_level", native_enum=False),
        default=AdherenceLevel.NOT_REPORTED,
        nullable=False
    )
    dietary_adherence = Column(
        Enum(AdherenceLevel, name="dietary_adherence_level", native_enum=False),
        default=AdherenceLevel.NOT_REPORTED,
        nullable=False
    )

    # Functional Well-being Indicators
    sleep_status = Column(String(100), nullable=True)
    appetite_status = Column(String(100), nullable=True)
    digestion_status = Column(String(100), nullable=True)
    energy_status = Column(String(100), nullable=True)
    bowel_habit_status = Column(String(100), nullable=True)
    general_wellbeing = Column(String(100), nullable=True)

    # Doctor Clinical Synthesis & Assessment
    doctor_observation = Column(Text, nullable=True)
    doctor_assessment = Column(Text, nullable=True)
    clinical_outcome = Column(
        Enum(ClinicalOutcome, name="clinical_outcome", native_enum=False),
        default=ClinicalOutcome.NOT_ASSESSED,
        nullable=False,
        index=True
    )

    # Next Review
    next_review_required = Column(Boolean, default=False, nullable=False)
    next_review_notes = Column(Text, nullable=True)

    # Timestamps
    recorded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
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
    patient = relationship("Patient", backref="progress_records", lazy="joined")
    follow_up = relationship("FollowUp", backref="progress_records", lazy="joined")
    follow_up_visit = relationship("FollowUpVisit", backref="progress_record", lazy="joined")
    doctor = relationship("User", foreign_keys=[doctor_id], lazy="joined")
    audit_logs = relationship(
        "PatientProgressAudit",
        back_populates="progress",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="PatientProgressAudit.created_at.desc()"
    )
