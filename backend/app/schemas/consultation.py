from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.consultation import ConsultationStatus


class ConsultationBase(BaseModel):
    patient_id: int
    case_session_id: int
    queue_id: Optional[int] = None
    chief_complaint: Optional[str] = None
    clinical_observations: Optional[str] = None
    doctor_assessment: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    doctor_notes: Optional[str] = None
    follow_up_required: bool = False
    follow_up_notes: Optional[str] = None


class ConsultationCreate(BaseModel):
    patient_id: int = Field(..., description="Database ID of the patient")
    case_session_id: int = Field(..., description="Database ID of the active consultation case session")
    queue_id: Optional[int] = Field(None, description="Optional daily queue entry ID")
    doctor_id: Optional[int] = Field(None, description="Target doctor user ID (Admin only; defaults to authenticated doctor)")
    chief_complaint: Optional[str] = Field(None, description="Patient's primary presenting complaint")
    clinical_observations: Optional[str] = Field(None, description="Physical examination and clinical observations")
    doctor_assessment: Optional[str] = Field(None, description="Doctor's clinical synthesis and assessment")
    doctor_notes: Optional[str] = Field(None, description="Internal doctor clinical remarks")


class ConsultationUpdate(BaseModel):
    chief_complaint: Optional[str] = Field(None, description="Patient's chief complaint")
    clinical_observations: Optional[str] = Field(None, description="Physical examination and clinical observations")
    doctor_assessment: Optional[str] = Field(None, description="Doctor's clinical assessment")
    diagnosis: Optional[str] = Field(None, description="Doctor-entered clinical diagnosis (Modern / Ayurvedic)")
    treatment_plan: Optional[str] = Field(None, description="Doctor-entered treatment plan & lifestyle guidance")
    doctor_notes: Optional[str] = Field(None, description="Doctor clinical remarks")
    follow_up_required: Optional[bool] = Field(None, description="Whether follow-up consultation is needed")
    follow_up_notes: Optional[str] = Field(None, description="Follow-up advice or timeline")


class ConsultationComplete(BaseModel):
    diagnosis: Optional[str] = Field(None, description="Final clinical diagnosis")
    treatment_plan: Optional[str] = Field(None, description="Final clinical treatment plan")
    doctor_assessment: Optional[str] = Field(None, description="Final doctor assessment")
    doctor_notes: Optional[str] = Field(None, description="Final notes")
    follow_up_required: Optional[bool] = Field(None, description="Follow-up flag")
    follow_up_notes: Optional[str] = Field(None, description="Follow-up guidance")


class ConsultationCancel(BaseModel):
    cancellation_reason: str = Field(..., min_length=3, description="Reason for cancelling consultation")


class ConsultationResponse(BaseModel):
    id: int
    patient_id: int
    case_session_id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    queue_id: Optional[int] = None
    consultation_status: ConsultationStatus
    chief_complaint: Optional[str] = None
    clinical_observations: Optional[str] = None
    doctor_assessment: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    doctor_notes: Optional[str] = None
    follow_up_required: bool
    follow_up_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    consultation_started_at: Optional[datetime] = None
    consultation_completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ConsultationWorkspaceResponse(BaseModel):
    """
    Unified read-only clinical workspace presenting patient intake, multilingual responses,
    medical history, documents, AI synthesis, and Ayurvedic observations to the doctor.
    """
    patient: Optional[dict[str, Any]] = None
    queue: Optional[dict[str, Any]] = None
    case: Optional[dict[str, Any]] = None
    case_responses: list[dict[str, Any]] = Field(default_factory=list)
    medical_history: Optional[dict[str, Any]] = None
    documents: list[dict[str, Any]] = Field(default_factory=list)
    document_intelligence: list[dict[str, Any]] = Field(default_factory=list)
    ai_case_summary: Optional[dict[str, Any]] = None
    ayurvedic_assessment: Optional[dict[str, Any]] = None
    consultation: Optional[ConsultationResponse] = None
    ai_safety_disclaimer: str = (
        "AI-generated preliminary information — practitioner review required. "
        "Clinical decisions, diagnoses, and treatment plans must be independently determined "
        "and finalized by a qualified practitioner."
    )
