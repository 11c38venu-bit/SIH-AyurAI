from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.document_processing import (
    AIExtractionStatus,
    DocumentProcessingStatus,
    DocumentReviewStatus,
    ExtractionMethod,
)


class DocumentMetadataSchema(BaseModel):
    document_type: Optional[str] = Field(None, description="Type of document (e.g. LAB_REPORT, DISCHARGE_SUMMARY, PRESCRIPTION)")
    document_date: Optional[str] = Field(None, description="Explicit date mentioned on the report")
    report_title: Optional[str] = Field(None, description="Title or header of the document")
    facility_name: Optional[str] = Field(None, description="Hospital, clinic, or laboratory name")
    practitioner_name: Optional[str] = Field(None, description="Doctor or authoring practitioner name if present")


class ExtractedClinicalItem(BaseModel):
    text: str = Field(..., description="Verbatim statement or finding extracted from document")
    normalized_term: Optional[str] = Field(None, description="Standard clinical nomenclature or standardized term")
    category: Optional[str] = Field(None, description="Category (e.g. Hematology, Biochemistry, Vitals)")
    value_or_details: Optional[str] = Field(None, description="Quantitative value, reference range, or dosage")
    source_reference: Optional[str] = Field(None, description="Page number or document section reference")
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Extraction confidence score between 0.0 and 1.0"
    )


class DocumentClinicalExtraction(BaseModel):
    """
    Strict schema for AI structured extraction from clinical documents.
    Adheres strictly to the 'No Invention' rule.
    """
    document_metadata: DocumentMetadataSchema = Field(
        default_factory=DocumentMetadataSchema,
        description="Metadata extracted from the document header"
    )
    reported_conditions: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Explicit medical conditions mentioned in document"
    )
    reported_symptoms: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Symptoms or complaints explicitly documented"
    )
    medications: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Medications, dosages, or regimens documented"
    )
    allergies: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Allergies explicitly noted in report"
    )
    investigations: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Diagnostic tests ordered or performed"
    )
    laboratory_results: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Lab test parameters, measured values, units, reference intervals"
    )
    imaging_findings: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Radiology / ultrasound / MRI / X-ray findings as stated"
    )
    procedures: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Surgical or clinical procedures documented"
    )
    hospitalization_information: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Admission, discharge, or ICU details if present"
    )
    recommendations_in_document: list[ExtractedClinicalItem] = Field(
        default_factory=list,
        description="Follow-up advice or instructions already written in document"
    )
    uncertainties: list[str] = Field(
        default_factory=list,
        description="Unclear, faded, or ambiguous items requiring practitioner review"
    )
    ai_notes: Optional[str] = Field(
        None,
        description="Preliminary extraction summary notes for the practitioner"
    )


# ---------------- API Request / Response Models ---------------- #

class DocumentProcessingResponse(BaseModel):
    id: int
    document_id: int
    patient_id: int
    case_session_id: Optional[int] = None
    filename: str
    document_type: str
    processing_status: DocumentProcessingStatus
    extraction_method: ExtractionMethod
    ocr_provider: Optional[str] = None
    processing_error: Optional[str] = None
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    extracted_text: Optional[str] = None
    text_language: Optional[str] = None
    ai_extraction_status: AIExtractionStatus
    structured_data: Optional[dict[str, Any]] = None
    ai_model_name: Optional[str] = None
    ai_model_version: Optional[str] = None
    ai_processing_timestamp: Optional[datetime] = None
    practitioner_review_status: DocumentReviewStatus
    practitioner_notes: Optional[str] = None
    practitioner_corrected_data: Optional[dict[str, Any]] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    disclaimer: str = "AI-extracted preliminary information — practitioner review required."
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentProcessingReviewRequest(BaseModel):
    practitioner_review_status: DocumentReviewStatus = Field(
        ...,
        description="REVIEWED, ACCEPTED, CORRECTED, or REJECTED"
    )
    practitioner_notes: Optional[str] = Field(
        None,
        description="Doctor review notes, remarks, or observations"
    )
    practitioner_corrected_data: Optional[dict[str, Any]] = Field(
        None,
        description="Doctor-verified and amended structured clinical information"
    )
