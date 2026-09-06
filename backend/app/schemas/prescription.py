from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.prescription import PrescriptionStatus


class PrescriptionItemBase(BaseModel):
    dosage: str = Field(..., max_length=100, description="Dose amount (e.g. '1 tablet', '5 g', '15 ml')")
    frequency: str = Field(..., max_length=100, description="Administration frequency (e.g. 'Twice daily', 'BD', 'TDS')")
    timing: Optional[str] = Field(None, max_length=100, description="Meal relation (e.g. 'Before food', 'After food', 'Bedtime')")
    route: str = Field("Oral", max_length=100, description="Route of administration (e.g. 'Oral', 'External application')")
    duration: str = Field(..., max_length=100, description="Treatment course duration (e.g. '14 days', '1 month')")
    quantity: Optional[str] = Field(None, max_length=100, description="Total quantity to dispense (e.g. '60 tablets', '1 bottle')")
    anupana: Optional[str] = Field(None, max_length=255, description="Ayurvedic vehicle/carrier medium (e.g. 'Warm water', 'Honey', 'Warm milk')")
    special_instructions: Optional[str] = Field(None, description="Specific instructions for this item")
    item_order: int = Field(1, description="Ordering index of the item on the prescription")


class PrescriptionItemCreate(PrescriptionItemBase):
    medicine_id: Optional[int] = Field(None, description="Optional link to master medicine catalog")
    medicine_name_snapshot: Optional[str] = Field(None, max_length=255, description="Medicine name snapshot (auto-populated from medicine_id if omitted)")
    formulation_snapshot: Optional[str] = Field(None, max_length=100, description="Formulation snapshot (auto-populated if omitted)")
    strength_snapshot: Optional[str] = Field(None, max_length=100, description="Strength snapshot (auto-populated if omitted)")


class PrescriptionItemUpdate(BaseModel):
    medicine_id: Optional[int] = None
    medicine_name_snapshot: Optional[str] = Field(None, max_length=255)
    formulation_snapshot: Optional[str] = Field(None, max_length=100)
    strength_snapshot: Optional[str] = Field(None, max_length=100)
    dosage: Optional[str] = Field(None, max_length=100)
    frequency: Optional[str] = Field(None, max_length=100)
    timing: Optional[str] = Field(None, max_length=100)
    route: Optional[str] = Field(None, max_length=100)
    duration: Optional[str] = Field(None, max_length=100)
    quantity: Optional[str] = Field(None, max_length=100)
    anupana: Optional[str] = Field(None, max_length=255)
    special_instructions: Optional[str] = None
    item_order: Optional[int] = None


class PrescriptionItemResponse(PrescriptionItemBase):
    id: int
    prescription_id: int
    medicine_id: Optional[int] = None
    medicine_name_snapshot: str
    formulation_snapshot: Optional[str] = None
    strength_snapshot: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PrescriptionCreate(BaseModel):
    patient_id: int = Field(..., description="Target patient ID")
    case_session_id: int = Field(..., description="Target case session ID")
    consultation_id: Optional[int] = Field(None, description="Optional linked consultation ID")
    doctor_id: Optional[int] = Field(None, description="Target doctor user ID (Admin only; defaults to current doctor)")
    general_instructions: Optional[str] = Field(None, description="General intake directions")
    dietary_advice: Optional[str] = Field(None, description="Pathya and Apathya dietary guidelines")
    lifestyle_advice: Optional[str] = Field(None, description="Vihara and Dinacharya lifestyle guidelines")
    follow_up_instructions: Optional[str] = Field(None, description="Follow-up advice")
    items: List[PrescriptionItemCreate] = Field(default_factory=list, description="Prescribed medicine items")


class PrescriptionUpdate(BaseModel):
    general_instructions: Optional[str] = Field(None, description="General intake directions")
    dietary_advice: Optional[str] = Field(None, description="Pathya and Apathya dietary guidelines")
    lifestyle_advice: Optional[str] = Field(None, description="Vihara and Dinacharya lifestyle guidelines")
    follow_up_instructions: Optional[str] = Field(None, description="Follow-up advice")
    items: Optional[List[PrescriptionItemCreate]] = Field(None, description="Updated list of prescribed medicine items")


class PrescriptionCancel(BaseModel):
    cancellation_reason: str = Field(..., min_length=3, description="Mandatory clinical explanation for cancellation")


class PrescriptionAuditResponse(BaseModel):
    id: int
    prescription_id: int
    user_id: Optional[int] = None
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    changed_fields: Optional[Any] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PrescriptionDoctorSummary(BaseModel):
    id: int
    full_name: str
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class PrescriptionPatientSummary(BaseModel):
    id: int
    patient_id: str
    full_name: str
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PrescriptionResponse(BaseModel):
    id: int
    prescription_number: str
    patient_id: int
    case_session_id: int
    consultation_id: Optional[int] = None
    doctor_id: int
    prescription_status: PrescriptionStatus
    general_instructions: Optional[str] = None
    dietary_advice: Optional[str] = None
    lifestyle_advice: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    cancellation_reason: Optional[str] = None
    finalized_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    doctor: Optional[PrescriptionDoctorSummary] = None
    patient: Optional[PrescriptionPatientSummary] = None
    items: List[PrescriptionItemResponse] = []
    audit_logs: List[PrescriptionAuditResponse] = []

    model_config = ConfigDict(from_attributes=True)
