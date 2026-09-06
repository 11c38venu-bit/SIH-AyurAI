from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.ai_case_response import (
    AIProcessingStatus,
    PractitionerReviewStatus,
)


# ---------------- AI Case Response Schemas ---------------- #

class AICaseResponseBase(BaseModel):
    processing_status: AIProcessingStatus = AIProcessingStatus.PENDING
    detected_language: Optional[str] = None
    standardized_text: Optional[str] = None
    extracted_symptoms: Optional[list[dict[str, Any]]] = None
    extracted_duration: Optional[str] = None
    extracted_severity: Optional[str] = None
    extracted_frequency: Optional[str] = None
    extracted_triggers: Optional[list[dict[str, Any]]] = None
    extracted_associated_factors: Optional[list[dict[str, Any]]] = None
    extracted_medications: Optional[list[dict[str, Any]]] = None
    extracted_conditions: Optional[list[dict[str, Any]]] = None
    extracted_lifestyle_factors: Optional[list[dict[str, Any]]] = None
    ai_notes: Optional[str] = None


class AICaseResponseResponse(AICaseResponseBase):
    id: int
    case_response_id: int
    case_session_id: int
    patient_id: int
    original_response: str
    response_language: str
    practitioner_review_status: PractitionerReviewStatus
    practitioner_notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    model_name: str
    model_version: str
    processing_timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AICaseResponseReview(BaseModel):
    practitioner_review_status: PractitionerReviewStatus = Field(
        ...,
        description="REVIEWED, ACCEPTED, CORRECTED, or REJECTED"
    )
    practitioner_notes: Optional[str] = Field(None, description="Doctor corrections or clinical review notes")
    standardized_text: Optional[str] = Field(None, description="Doctor-corrected standardized interpretation")


# ---------------- AI Case Summary Schemas ---------------- #

class AICaseSummaryBase(BaseModel):
    summary_status: AIProcessingStatus = AIProcessingStatus.PENDING
    summary_text: Optional[str] = None
    key_symptoms: Optional[list[dict[str, Any]]] = None
    relevant_history: Optional[list[dict[str, Any]]] = None
    current_medications: Optional[list[dict[str, Any]]] = None
    reported_allergies: Optional[list[dict[str, Any]]] = None
    lifestyle_factors: Optional[list[dict[str, Any]]] = None
    structured_summary: Optional[dict[str, Any]] = None
    information_quality: Optional[str] = "PARTIAL"
    summary_version: int = 1


class AICaseSummaryResponse(AICaseSummaryBase):
    id: int
    case_session_id: int
    patient_id: int
    practitioner_notes: Optional[str] = None
    generated_by_model: str
    model_version: str
    practitioner_review_status: PractitionerReviewStatus
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    clinical_safety_note: str = (
        "AI-assisted summary — practitioner review required. "
        "AI output is informational and does not replace professional clinical judgment."
    )

    model_config = ConfigDict(from_attributes=True)


class AICaseSummaryReview(BaseModel):
    practitioner_review_status: PractitionerReviewStatus = Field(
        ...,
        description="REVIEWED, ACCEPTED, CORRECTED, or REJECTED"
    )
    practitioner_notes: Optional[str] = Field(None, description="Doctor review remarks or amendments")
    summary_text: Optional[str] = Field(None, description="Doctor-corrected clinical synthesis")
    structured_summary: Optional[dict[str, Any]] = Field(None, description="Doctor-amended structured summary")
