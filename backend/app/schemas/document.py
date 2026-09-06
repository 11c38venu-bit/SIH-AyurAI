from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DocumentResponse(BaseModel):
    id: int
    patient_id: int
    case_session_id: Optional[int] = None
    uploaded_by: Optional[int] = None
    document_type: str = Field(..., description="LAB_REPORT, PRESCRIPTION, MRI_REPORT, CT_REPORT, X_RAY_REPORT, DISCHARGE_SUMMARY, CONSULTATION_REPORT, OTHER")
    document_title: str
    original_filename: str
    mime_type: str
    file_size: int
    description: Optional[str] = None
    document_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse

    model_config = ConfigDict(from_attributes=True)
