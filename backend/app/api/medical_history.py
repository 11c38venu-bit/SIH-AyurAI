from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.case import CaseSession
from app.models.medical_history import MedicalHistory
from app.models.patient import Patient
from app.models.user import User
from app.schemas.medical_history import (
    MedicalHistoryCreate,
    MedicalHistoryResponse,
    MedicalHistoryUpdate,
)

router = APIRouter(
    prefix="/medical-history",
    tags=["Medical History"]
)


@router.post("/", response_model=MedicalHistoryResponse, status_code=status.HTTP_201_CREATED)
def create_medical_history(
    payload: MedicalHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Record medical history for a patient.
    - Captures past conditions, surgeries, allergies, medications, family, and lifestyle history.
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    # 1. Validate Patient exists
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {payload.patient_id} not found"
        )

    # 2. Validate optional CaseSession if provided
    if payload.case_session_id:
        case_session = db.query(CaseSession).filter(CaseSession.id == payload.case_session_id).first()
        if not case_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case session with ID {payload.case_session_id} not found"
            )

    history_entry = MedicalHistory(
        patient_id=payload.patient_id,
        case_session_id=payload.case_session_id,
        past_medical_conditions=payload.past_medical_conditions,
        past_surgeries=payload.past_surgeries,
        allergies=payload.allergies,
        current_medications=payload.current_medications,
        family_history=payload.family_history,
        previous_treatments=payload.previous_treatments,
        lifestyle_history=payload.lifestyle_history,
        dietary_history=payload.dietary_history,
        substance_use_history=payload.substance_use_history,
        other_history=payload.other_history,
        notes=payload.notes,
    )

    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    return history_entry


@router.get("/patient/{patient_id}", response_model=list[MedicalHistoryResponse])
def get_patient_medical_history(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all medical history records for a patient.
    `patient_id` parameter can be integer database ID (e.g. 1) or code (e.g. PAT-2026-000001).
    - Preserves historical records without deletion.
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
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
        db.query(MedicalHistory)
        .filter(MedicalHistory.patient_id == target_patient_id)
        .order_by(MedicalHistory.created_at.desc())
        .all()
    )


@router.get("/{history_id}", response_model=MedicalHistoryResponse)
def get_medical_history_by_id(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve a specific medical history record by ID.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    history_entry = db.query(MedicalHistory).filter(MedicalHistory.id == history_id).first()
    if not history_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical history record with ID {history_id} not found"
        )
    return history_entry


@router.patch("/{history_id}", response_model=MedicalHistoryResponse)
def update_medical_history(
    history_id: int,
    payload: MedicalHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Update an existing medical history record.
    - Accessible ONLY by DOCTOR and ADMIN roles (Staff cannot modify).
    """
    history_entry = db.query(MedicalHistory).filter(MedicalHistory.id == history_id).first()
    if not history_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical history record with ID {history_id} not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(history_entry, field, value)

    db.commit()
    db.refresh(history_entry)
    return history_entry
