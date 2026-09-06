from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.queue import QueuePriority, QueueStatus


class PatientSummary(BaseModel):
    id: int
    patient_id: str
    full_name: str
    gender: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    preferred_language: Optional[str] = "en"

    model_config = ConfigDict(from_attributes=True)


class QueueCreate(BaseModel):
    patient_id: int = Field(..., description="Database ID (primary key) of the patient")
    priority: QueuePriority = Field(
        default=QueuePriority.NORMAL,
        description="Queue priority: NORMAL or PRIORITY"
    )
    queue_date: Optional[date] = Field(
        default=None,
        description="Date for the queue entry (defaults to today if not provided)"
    )


class QueueStatusUpdate(BaseModel):
    status: QueueStatus = Field(
        ...,
        description="New status: WAITING, CALLED, IN_CONSULTATION, COMPLETED, CANCELLED"
    )


class QueuePriorityUpdate(BaseModel):
    priority: QueuePriority = Field(
        ...,
        description="New priority: NORMAL or PRIORITY"
    )


class QueueResponse(BaseModel):
    id: int
    patient_id: int
    token_number: str
    queue_date: date
    status: QueueStatus
    priority: QueuePriority
    created_at: Optional[datetime] = None
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    patient: Optional[PatientSummary] = None

    model_config = ConfigDict(from_attributes=True)
