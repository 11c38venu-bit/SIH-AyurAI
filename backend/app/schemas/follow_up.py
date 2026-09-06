from datetime import date, datetime, time
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.follow_up import FollowUpStatus


class FollowUpBase(BaseModel):
    scheduled_date: date = Field(..., description="Scheduled appointment date (must be today or in future)")
    scheduled_time: Optional[time] = Field(None, description="Optional appointment time of day")
    reason: str = Field(..., min_length=3, description="Clinical reason for follow-up")
    instructions: Optional[str] = Field(None, description="Instructions given to patient for the follow-up")
    doctor_notes: Optional[str] = Field(None, description="Doctor internal notes or care objectives")


class FollowUpCreate(FollowUpBase):
    patient_id: int = Field(..., description="Target patient ID")
    case_session_id: int = Field(..., description="Linked case session ID")
    consultation_id: int = Field(..., description="Linked initial/prior consultation ID")
    prescription_id: Optional[int] = Field(None, description="Optional linked prescription ID")
    doctor_id: Optional[int] = Field(None, description="Doctor user ID (Admin only; defaults to current doctor)")


class FollowUpUpdate(BaseModel):
    scheduled_date: Optional[date] = Field(None, description="Updated scheduled date")
    scheduled_time: Optional[time] = Field(None, description="Updated scheduled time")
    reason: Optional[str] = Field(None, min_length=3, description="Updated reason")
    instructions: Optional[str] = Field(None, description="Updated patient instructions")
    doctor_notes: Optional[str] = Field(None, description="Updated doctor notes")


class FollowUpConfirm(BaseModel):
    notes: Optional[str] = Field(None, description="Optional notes upon appointment confirmation")


class FollowUpCompleteRequest(BaseModel):
    completion_notes: Optional[str] = Field(None, description="Doctor summary of follow-up outcome")
    doctor_notes: Optional[str] = Field(None, description="Internal clinical remarks")
    patient_notes: Optional[str] = Field(None, description="Patient feedback or comments during follow-up")


class FollowUpCancelRequest(BaseModel):
    cancellation_reason: str = Field(..., min_length=3, description="Mandatory clinical explanation for cancellation")


class FollowUpMissedRequest(BaseModel):
    notes: Optional[str] = Field(None, description="Optional remarks regarding missed appointment")


class FollowUpVisitCreate(BaseModel):
    visit_date: Optional[date] = Field(None, description="Date of follow-up encounter (defaults to current date)")
    symptom_progress: Optional[str] = Field(None, description="Progress or changes in symptoms since last visit")
    patient_reported_changes: Optional[str] = Field(None, description="Patient self-reported subjective improvements or issues")
    medication_adherence: Optional[str] = Field(None, description="Patient-reported adherence to prescribed medicines")
    adverse_effects_reported: Optional[str] = Field(None, description="Any discomfort or adverse effects reported by patient")
    lifestyle_adherence: Optional[str] = Field(None, description="Adherence to recommended Vihara and daily routine")
    dietary_adherence: Optional[str] = Field(None, description="Adherence to recommended Pathya/Apathya dietary advice")
    doctor_observations: Optional[str] = Field(None, description="Doctor clinical physical and observational findings")
    doctor_assessment: Optional[str] = Field(None, description="Doctor clinical evaluation of progress")
    next_steps: Optional[str] = Field(None, description="Care plan, treatment continuation, or subsequent follow-up plan")


class FollowUpVisitResponse(BaseModel):
    id: int
    follow_up_id: int
    patient_id: int
    doctor_id: int
    visit_date: date
    symptom_progress: Optional[str] = None
    patient_reported_changes: Optional[str] = None
    medication_adherence: Optional[str] = None
    adverse_effects_reported: Optional[str] = None
    lifestyle_adherence: Optional[str] = None
    dietary_adherence: Optional[str] = None
    doctor_observations: Optional[str] = None
    doctor_assessment: Optional[str] = None
    next_steps: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FollowUpAuditResponse(BaseModel):
    id: int
    follow_up_id: int
    user_id: Optional[int] = None
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    changed_fields: Optional[Any] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FollowUpPatientSummary(BaseModel):
    id: int
    patient_id: str
    full_name: str
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FollowUpDoctorSummary(BaseModel):
    id: int
    full_name: str
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class FollowUpConsultationSummary(BaseModel):
    id: int
    chief_complaint: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    consultation_status: str

    model_config = ConfigDict(from_attributes=True)


class FollowUpPrescriptionSummary(BaseModel):
    id: int
    prescription_number: str
    prescription_status: str

    model_config = ConfigDict(from_attributes=True)


class FollowUpResponse(BaseModel):
    id: int
    patient_id: int
    case_session_id: int
    consultation_id: int
    prescription_id: Optional[int] = None
    doctor_id: int
    follow_up_number: int
    scheduled_date: date
    scheduled_time: Optional[time] = None
    reason: str
    instructions: Optional[str] = None
    status: FollowUpStatus
    doctor_notes: Optional[str] = None
    patient_notes: Optional[str] = None
    completion_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    patient: Optional[FollowUpPatientSummary] = None
    doctor: Optional[FollowUpDoctorSummary] = None
    consultation: Optional[FollowUpConsultationSummary] = None
    prescription: Optional[FollowUpPrescriptionSummary] = None
    visit: Optional[FollowUpVisitResponse] = None
    audit_logs: List[FollowUpAuditResponse] = []

    model_config = ConfigDict(from_attributes=True)


class PatientProgressItem(BaseModel):
    follow_up_id: int
    follow_up_number: int
    visit_id: Optional[int] = None
    visit_date: Optional[date] = None
    symptom_progress: Optional[str] = None
    patient_reported_changes: Optional[str] = None
    medication_adherence: Optional[str] = None
    adverse_effects_reported: Optional[str] = None
    lifestyle_adherence: Optional[str] = None
    dietary_adherence: Optional[str] = None
    doctor_observations: Optional[str] = None
    doctor_assessment: Optional[str] = None
    next_steps: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class ContinuityOfCareWorkspaceResponse(BaseModel):
    patient: FollowUpPatientSummary
    original_consultation: Optional[FollowUpConsultationSummary] = None
    current_prescription: Optional[Any] = None
    follow_ups: List[FollowUpResponse] = []
    progress_history: List[PatientProgressItem] = []
    upcoming_follow_ups: List[FollowUpResponse] = []
    disclaimer: str = (
        "Continuity of care records reflect verified clinical entries. "
        "Clinical decisions and treatment adjustments must be evaluated and confirmed by a qualified Ayurveda practitioner."
    )

    model_config = ConfigDict(from_attributes=True)
