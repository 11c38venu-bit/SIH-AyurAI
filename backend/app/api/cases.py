from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import require_staff
from app.db.database import get_db
from app.models.case import CaseSession, CaseStatus
from app.models.case_question import CaseQuestion
from app.models.case_response import CaseResponse
from app.models.patient import Patient
from app.models.queue import PatientQueue
from app.models.user import User
from app.schemas.case import (
    CaseResponseCreate,
    CaseResponseResponse,
    CaseResponseUpdate,
    CaseSessionCreate,
    CaseSessionDetailResponse,
    CaseSessionResponse,
    CaseSessionStatusUpdate,
)

router = APIRouter(
    prefix="/cases",
    tags=["Case-Taking & Clinical Consultation"]
)


@router.post("/", response_model=CaseSessionResponse, status_code=status.HTTP_201_CREATED)
def create_case_session(
    payload: CaseSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Create a new case session for a patient.
    - Prevents multiple simultaneously active (IN_PROGRESS) case sessions for the same patient.
    - Accessible by STAFF, DOCTOR, and ADMIN.
    """
    # 1. Validate patient exists
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {payload.patient_id} not found"
        )

    # 2. Validate optional queue entry if supplied
    if payload.queue_id:
        queue_item = db.query(PatientQueue).filter(PatientQueue.id == payload.queue_id).first()
        if not queue_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Queue entry with ID {payload.queue_id} not found"
            )

    # 3. Prevent duplicate active case session for this patient
    active_case = (
        db.query(CaseSession)
        .filter(
            CaseSession.patient_id == payload.patient_id,
            CaseSession.status == CaseStatus.IN_PROGRESS
        )
        .first()
    )
    if active_case:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Patient {patient.full_name} already has an active case session in progress "
                f"(Case ID: {active_case.id}, Started: {active_case.started_at}). "
                f"Complete or cancel the active session before opening a new one."
            )
        )

    # 4. Create new case session
    case_session = CaseSession(
        patient_id=payload.patient_id,
        queue_id=payload.queue_id,
        status=CaseStatus.IN_PROGRESS,
    )

    db.add(case_session)
    db.commit()
    db.refresh(case_session)
    return case_session


@router.get("/{case_id}", response_model=CaseSessionDetailResponse)
def get_case_session_detail(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve full case session details with patient information and responses.
    Accessible by STAFF, DOCTOR, and ADMIN.
    """
    case_session = db.query(CaseSession).filter(CaseSession.id == case_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_id} not found"
        )

    # Order responses by question display_order
    ordered_responses = (
        db.query(CaseResponse)
        .join(CaseQuestion, CaseResponse.question_id == CaseQuestion.id)
        .filter(CaseResponse.case_session_id == case_id)
        .order_by(CaseQuestion.display_order.asc(), CaseResponse.id.asc())
        .all()
    )

    result = CaseSessionDetailResponse.model_validate(case_session)
    result.responses = [CaseResponseResponse.model_validate(r) for r in ordered_responses]
    return result


@router.patch("/{case_id}/status", response_model=CaseSessionResponse)
def update_case_status(
    case_id: int,
    payload: CaseSessionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Update case session status (IN_PROGRESS, COMPLETED, CANCELLED).
    Sets `completed_at` timestamp when marked COMPLETED.
    Accessible by STAFF, DOCTOR, and ADMIN.
    """
    case_session = db.query(CaseSession).filter(CaseSession.id == case_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_id} not found"
        )

    case_session.status = payload.status
    if payload.status == CaseStatus.COMPLETED and case_session.completed_at is None:
        case_session.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(case_session)
    return case_session


@router.post("/{case_id}/responses", response_model=CaseResponseResponse, status_code=status.HTTP_201_CREATED)
def add_or_update_case_response(
    case_id: int,
    payload: CaseResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Add or update a structured response for a question in a case session.
    - Preserves verbatim patient response in `original_response`.
    - Supports regional languages (en, ta, hi, ml, te, kn).
    - Accessible by STAFF, DOCTOR, and ADMIN.
    """
    # 1. Validate case exists
    case_session = db.query(CaseSession).filter(CaseSession.id == case_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_id} not found"
        )

    if case_session.status == CaseStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add responses to a CANCELLED case session"
        )

    # 2. Validate question exists and is active
    question = db.query(CaseQuestion).filter(CaseQuestion.id == payload.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {payload.question_id} not found"
        )
    if not question.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Question '{question.question_code}' is currently inactive"
        )

    # 3. Check if response for this question already exists in this case session
    existing_response = (
        db.query(CaseResponse)
        .filter(
            CaseResponse.case_session_id == case_id,
            CaseResponse.question_id == payload.question_id
        )
        .first()
    )

    if existing_response:
        existing_response.original_response = payload.original_response
        existing_response.response_language = payload.response_language
        if payload.notes is not None:
            existing_response.notes = payload.notes
        db.commit()
        db.refresh(existing_response)
        return existing_response

    # 4. Create new response
    new_response = CaseResponse(
        case_session_id=case_id,
        question_id=payload.question_id,
        original_response=payload.original_response,
        response_language=payload.response_language,
        notes=payload.notes,
    )

    db.add(new_response)
    db.commit()
    db.refresh(new_response)
    return new_response


@router.patch("/{case_id}/responses/{response_id}", response_model=CaseResponseResponse)
def update_case_response(
    case_id: int,
    response_id: int,
    payload: CaseResponseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Update an existing case response while preserving data integrity.
    Accessible by STAFF, DOCTOR, and ADMIN.
    """
    response_entry = (
        db.query(CaseResponse)
        .filter(
            CaseResponse.id == response_id,
            CaseResponse.case_session_id == case_id
        )
        .first()
    )
    if not response_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Response with ID {response_id} not found for case session {case_id}"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(response_entry, field, value)

    db.commit()
    db.refresh(response_entry)
    return response_entry


@router.get("/{case_id}/responses", response_model=list[CaseResponseResponse])
def get_case_responses(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all recorded responses for a case session ordered by question display_order.
    Accessible by STAFF, DOCTOR, and ADMIN.
    """
    case_session = db.query(CaseSession).filter(CaseSession.id == case_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_id} not found"
        )

    responses = (
        db.query(CaseResponse)
        .join(CaseQuestion, CaseResponse.question_id == CaseQuestion.id)
        .filter(CaseResponse.case_session_id == case_id)
        .order_by(CaseQuestion.display_order.asc(), CaseResponse.id.asc())
        .all()
    )

    return responses


@router.get("/patient/{patient_id}", response_model=list[CaseSessionResponse])
def get_patient_case_history(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve historical consultation case sessions for a patient.
    `patient_id` parameter can be either the integer database ID (e.g. 1)
    or the assigned patient code (e.g. PAT-2026-000001).
    - Preserves all historical completed cases.
    - Accessible by STAFF, DOCTOR, and ADMIN.
    """
    target_patient_id: Optional[int] = None
    if patient_id.isdigit():
        target_patient_id = int(patient_id)
    else:
        patient_record = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if patient_record:
            target_patient_id = patient_record.id

    if not target_patient_id:
        patient_record = db.query(Patient).filter(Patient.id == int(patient_id) if patient_id.isdigit() else False).first()
        if not patient_record:
            patient_record = db.query(Patient).filter(Patient.patient_id == patient_id).first()
            if not patient_record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Patient '{patient_id}' not found"
                )
        target_patient_id = patient_record.id

    return (
        db.query(CaseSession)
        .filter(CaseSession.patient_id == target_patient_id)
        .order_by(CaseSession.started_at.desc(), CaseSession.created_at.desc())
        .all()
    )
