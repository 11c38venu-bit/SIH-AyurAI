import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from app.db.database import Base


class DocumentProcessingStatus(str, enum.Enum):
    NOT_PROCESSED = "NOT_PROCESSED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ExtractionMethod(str, enum.Enum):
    PDF_TEXT = "PDF_TEXT"
    OCR = "OCR"
    NONE = "NONE"


class AIExtractionStatus(str, enum.Enum):
    NOT_PROCESSED = "NOT_PROCESSED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class DocumentReviewStatus(str, enum.Enum):
    NOT_REVIEWED = "NOT_REVIEWED"
    REVIEWED = "REVIEWED"
    ACCEPTED = "ACCEPTED"
    CORRECTED = "CORRECTED"
    REJECTED = "REJECTED"


class DocumentProcessing(Base):
    """
    Tracks text extraction (PDF / OCR) and Gemini-assisted structured clinical intelligence
    for uploaded medical documents. The original PatientDocument file remains immutable.
    """
    __tablename__ = "document_processings"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(
        Integer,
        ForeignKey("patient_documents.id", ondelete="CASCADE"),
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
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Text Extraction Pipeline
    processing_status = Column(
        Enum(DocumentProcessingStatus, name="doc_processing_status", native_enum=False),
        default=DocumentProcessingStatus.NOT_PROCESSED,
        nullable=False,
        index=True
    )
    extraction_method = Column(
        Enum(ExtractionMethod, name="doc_extraction_method", native_enum=False),
        default=ExtractionMethod.NONE,
        nullable=False
    )
    ocr_provider = Column(String(100), nullable=True)
    processing_error = Column(Text, nullable=True)
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)

    # Raw Extracted Text
    extracted_text = Column(Text, nullable=True)
    text_language = Column(String(10), nullable=True)

    # AI Clinical Structuring
    ai_extraction_status = Column(
        Enum(AIExtractionStatus, name="doc_ai_extraction_status", native_enum=False),
        default=AIExtractionStatus.NOT_PROCESSED,
        nullable=False,
        index=True
    )
    structured_data = Column(JSON, nullable=True)
    ai_model_name = Column(String(100), nullable=True)
    ai_model_version = Column(String(50), nullable=True)
    ai_processing_timestamp = Column(DateTime(timezone=True), nullable=True)

    # Practitioner Review Workflow
    practitioner_review_status = Column(
        Enum(DocumentReviewStatus, name="doc_review_status", native_enum=False),
        default=DocumentReviewStatus.NOT_REVIEWED,
        nullable=False,
        index=True
    )
    practitioner_notes = Column(Text, nullable=True)
    practitioner_corrected_data = Column(JSON, nullable=True)
    reviewed_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    # Audit Timestamps
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
    document = relationship(
        "PatientDocument",
        backref=backref("processing", uselist=False, cascade="all, delete-orphan"),
        lazy="joined"
    )
    patient = relationship("Patient", lazy="joined")
    case_session = relationship("CaseSession", lazy="joined")
    reviewer = relationship("User", lazy="joined")
