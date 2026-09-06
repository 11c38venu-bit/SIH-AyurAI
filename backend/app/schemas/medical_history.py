from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MedicalHistoryBase(BaseModel):
    past_medical_conditions: Optional[str] = Field(None, description="Past diagnosed diseases/conditions")
    past_surgeries: Optional[str] = Field(None, description="Past surgical procedures & hospitalizations")
    allergies: Optional[str] = Field(None, description="Known drug, food, or environmental allergies")
    current_medications: Optional[str] = Field(None, description="Current allopathic/Ayurvedic medications")
    family_history: Optional[str] = Field(None, description="Familial/hereditary health conditions")
    previous_treatments: Optional[str] = Field(None, description="Prior treatments and therapeutic outcomes")
    lifestyle_history: Optional[str] = Field(None, description="Daily habits, sleep, physical activity")
    dietary_history: Optional[str] = Field(None, description="Dietary patterns, preferences, fasting habits")
    substance_use_history: Optional[str] = Field(None, description="Tobacco, alcohol, or other substance usage")
    other_history: Optional[str] = Field(None, description="Other pertinent medical/social history")
    notes: Optional[str] = Field(None, description="Clinical notes or provider remarks")


class MedicalHistoryCreate(MedicalHistoryBase):
    patient_id: int = Field(..., description="ID of the patient")
    case_session_id: Optional[int] = Field(None, description="Optional associated case session ID")


class MedicalHistoryUpdate(MedicalHistoryBase):
    pass


class MedicalHistoryResponse(MedicalHistoryBase):
    id: int
    patient_id: int
    case_session_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
