from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.case import CaseStatus
from app.models.case_question import QuestionType
from app.schemas.queue import PatientSummary


# ---------------- Question Schemas ---------------- #

class CaseQuestionBase(BaseModel):
    question_code: str = Field(..., min_length=2, max_length=50)
    category: str = Field(..., min_length=2, max_length=50)
    question_text: str = Field(..., min_length=2)
    question_type: QuestionType = QuestionType.TEXT
    options: Optional[list[str]] = None
    language: str = Field(default="en", max_length=10)
    is_required: bool = False
    display_order: int = 0
    is_active: bool = True


class CaseQuestionCreate(CaseQuestionBase):
    pass


class CaseQuestionUpdate(BaseModel):
    question_code: Optional[str] = Field(None, min_length=2, max_length=50)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    question_text: Optional[str] = Field(None, min_length=2)
    question_type: Optional[QuestionType] = None
    options: Optional[list[str]] = None
    language: Optional[str] = Field(None, max_length=10)
    is_required: Optional[bool] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CaseQuestionResponse(CaseQuestionBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Case Response Schemas ---------------- #

class CaseResponseCreate(BaseModel):
    question_id: int = Field(..., description="ID of the question being answered")
    original_response: str = Field(..., min_length=1, description="Original verbatim patient response")
    response_language: str = Field(default="en", max_length=10, description="Language code (en, ta, hi, ml, te, kn)")
    notes: Optional[str] = Field(None, description="Optional clinical/intake notes")


class CaseResponseUpdate(BaseModel):
    original_response: Optional[str] = Field(None, min_length=1)
    response_language: Optional[str] = Field(None, max_length=10)
    notes: Optional[str] = None


class CaseResponseResponse(BaseModel):
    id: int
    case_session_id: int
    question_id: int
    original_response: str
    response_language: str
    standardized_response: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    question: Optional[CaseQuestionResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Case Session Schemas ---------------- #

class CaseSessionCreate(BaseModel):
    patient_id: int = Field(..., description="Database ID of the patient")
    queue_id: Optional[int] = Field(None, description="Optional associated queue entry ID")


class CaseSessionStatusUpdate(BaseModel):
    status: CaseStatus = Field(..., description="IN_PROGRESS, COMPLETED, CANCELLED")


class CaseSessionResponse(BaseModel):
    id: int
    patient_id: int
    queue_id: Optional[int] = None
    status: CaseStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CaseSessionDetailResponse(CaseSessionResponse):
    patient: Optional[PatientSummary] = None
    responses: list[CaseResponseResponse] = []

    model_config = ConfigDict(from_attributes=True)
