from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PatientCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_language: str = "en"


class PatientResponse(BaseModel):
    id: int
    patient_id: str
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_language: str

    model_config = ConfigDict(from_attributes=True)