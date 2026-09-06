from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.deps import require_staff
from app.db.database import get_db
from app.models.patient import Patient
from app.models.queue import QueueStatus
from app.models.user import User
from app.schemas.queue import (
    QueueCreate,
    QueuePriorityUpdate,
    QueueResponse,
    QueueStatusUpdate,
)
from app.services.queue_service import (
    create_patient_queue_token,
    get_patient_queue_history,
    get_today_queue_list,
    update_queue_entry_priority,
    update_queue_entry_status,
)

router = APIRouter(
    prefix="/queue",
    tags=["Queue & Token Management"]
)


@router.post("/token", response_model=QueueResponse, status_code=status.HTTP_201_CREATED)
def generate_queue_token(
    payload: QueueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Generate a new daily queue token (e.g., A001, A002) for a patient.
    - Prevents duplicate active tokens for the same patient today.
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    return create_patient_queue_token(
        db=db,
        patient_id=payload.patient_id,
        priority=payload.priority,
        queue_date=payload.queue_date
    )


@router.get("/today", response_model=list[QueueResponse])
def get_today_queue(
    status_filter: Optional[QueueStatus] = Query(
        None,
        alias="status",
        description="Optional filter by status (WAITING, CALLED, IN_CONSULTATION, COMPLETED, CANCELLED)"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Get today's patient queue.
    - Ordered with PRIORITY patients first, then NORMAL patients.
    - Within each priority, sorted by arrival time (earliest first).
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    return get_today_queue_list(
        db=db,
        status_filter=status_filter
    )


@router.get("/patient/{patient_id}", response_model=list[QueueResponse])
def get_patient_queue(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Get queue history for a specific patient.
    `patient_id` parameter can be either the integer database ID (e.g., 1)
    or the assigned patient code (e.g., PAT-2026-000001).
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    # Resolve numeric patient ID
    target_patient_id: Optional[int] = None
    if patient_id.isdigit():
        target_patient_id = int(patient_id)
    else:
        patient_record = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if patient_record:
            target_patient_id = patient_record.id

    if not target_patient_id:
        # Check if patient exists by integer ID
        patient_record = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient '{patient_id}' not found"
            )
        target_patient_id = patient_record.id

    return get_patient_queue_history(db=db, patient_id=target_patient_id)


@router.patch("/{queue_id}/status", response_model=QueueResponse)
def update_queue_status(
    queue_id: int,
    payload: QueueStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Update queue entry status (e.g. WAITING -> CALLED -> IN_CONSULTATION -> COMPLETED).
    Automatically records timestamps (`called_at`, `completed_at`).
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    return update_queue_entry_status(
        db=db,
        queue_id=queue_id,
        new_status=payload.status
    )


@router.patch("/{queue_id}/priority", response_model=QueueResponse)
def update_queue_priority(
    queue_id: int,
    payload: QueuePriorityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Update queue priority (NORMAL vs PRIORITY).
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    return update_queue_entry_priority(
        db=db,
        queue_id=queue_id,
        new_priority=payload.priority
    )
