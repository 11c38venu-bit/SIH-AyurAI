from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.ai_case_response import (
    AIProcessingStatus,
    PractitionerReviewStatus,
)


class AICaseSummary(Base):
    __tablename__ = "ai_case_summaries"

    id = Column(Integer, primary_key=True, index=True)
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="CASCADE"),
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

    summary_status = Column(
        Enum(AIProcessingStatus, name="ai_summary_status", native_enum=False),
        default=AIProcessingStatus.PENDING,
        nullable=False,
        index=True
    )
    summary_text = Column(Text, nullable=True)

    # Structured Summary Dimensions (JSON)
    key_symptoms = Column(JSON, nullable=True)
    relevant_history = Column(JSON, nullable=True)
    current_medications = Column(JSON, nullable=True)
    reported_allergies = Column(JSON, nullable=True)
    lifestyle_factors = Column(JSON, nullable=True)
    structured_summary = Column(JSON, nullable=True)  # Refined Module 18 multi-source dossier
    information_quality = Column(String(50), default="PARTIAL", nullable=True)  # SUFFICIENT | PARTIAL | LIMITED | NOT_AVAILABLE
    summary_version = Column(Integer, default=1, nullable=False)

    # Review & Audit
    practitioner_notes = Column(Text, nullable=True)
    generated_by_model = Column(String(100), default="MOCK-DEMO", nullable=False)
    model_version = Column(String(50), default="v1.0.0-stub", nullable=False)

    practitioner_review_status = Column(
        Enum(PractitionerReviewStatus, name="summary_review_status", native_enum=False),
        default=PractitionerReviewStatus.NOT_REVIEWED,
        nullable=False,
        index=True
    )
    reviewed_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

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
    case_session = relationship("CaseSession", backref="ai_summary", lazy="joined")
    patient = relationship("Patient", lazy="joined")
    reviewer = relationship("User", lazy="joined")
