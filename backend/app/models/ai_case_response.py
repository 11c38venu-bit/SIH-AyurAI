import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class AIProcessingStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    NOT_PROCESSED = "NOT_PROCESSED"


class PractitionerReviewStatus(str, enum.Enum):
    NOT_REVIEWED = "NOT_REVIEWED"
    REVIEWED = "REVIEWED"
    ACCEPTED = "ACCEPTED"
    CORRECTED = "CORRECTED"
    REJECTED = "REJECTED"


class AICaseResponse(Base):
    __tablename__ = "ai_case_responses"

    id = Column(Integer, primary_key=True, index=True)
    case_response_id = Column(
        Integer,
        ForeignKey("case_responses.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # AI Processing Attributes
    processing_status = Column(
        Enum(AIProcessingStatus, name="ai_processing_status", native_enum=False),
        default=AIProcessingStatus.PENDING,
        nullable=False,
        index=True
    )
    detected_language = Column(String(10), nullable=True)
    standardized_text = Column(Text, nullable=True)

    # Structured Extractions (JSON)
    extracted_symptoms = Column(JSON, nullable=True)
    extracted_duration = Column(String(100), nullable=True)
    extracted_severity = Column(String(50), nullable=True)
    extracted_frequency = Column(String(100), nullable=True)
    extracted_triggers = Column(JSON, nullable=True)
    extracted_associated_factors = Column(JSON, nullable=True)
    extracted_medications = Column(JSON, nullable=True)
    extracted_conditions = Column(JSON, nullable=True)
    extracted_lifestyle_factors = Column(JSON, nullable=True)
    ai_notes = Column(Text, nullable=True)

    # Practitioner Review Workflow
    practitioner_review_status = Column(
        Enum(PractitionerReviewStatus, name="practitioner_review_status", native_enum=False),
        default=PractitionerReviewStatus.NOT_REVIEWED,
        nullable=False,
        index=True
    )
    practitioner_notes = Column(Text, nullable=True)
    reviewed_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    # Model & Audit Metadata
    model_name = Column(String(100), default="MOCK-DEMO", nullable=False)
    model_version = Column(String(50), default="v1.0.0-stub", nullable=False)
    processing_timestamp = Column(DateTime(timezone=True), nullable=True)

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
    case_response = relationship("CaseResponse", backref="ai_interpretation", lazy="joined")
    case_session = relationship("CaseSession", lazy="joined")
    patient = relationship("Patient", lazy="joined")
    reviewer = relationship("User", lazy="joined")
