from datetime import date, datetime, timezone
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.case import CaseSession
from app.models.consultation import Consultation
from app.models.follow_up import FollowUp
from app.models.follow_up_audit import FollowUpAudit
from app.models.patient import Patient
from app.models.prescription import Prescription


def get_next_patient_follow_up_number(db: Session, patient_id: int) -> int:
    """
    Computes the next sequential follow-up number scoped to a specific patient.
    Format: 1, 2, 3...
    """
    max_number = (
        db.query(func.max(FollowUp.follow_up_number))
        .filter(FollowUp.patient_id == patient_id)
        .scalar()
    )
    return (max_number or 0) + 1


def validate_follow_up_date(scheduled_date: date) -> None:
    """
    Validates that a scheduled follow-up appointment date is not in the past.
    Allows today's date for same-day follow-ups and all future dates.
    """
    today_utc = datetime.now(timezone.utc).date()
    if scheduled_date < today_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Scheduled follow-up date ({scheduled_date}) cannot be in the past (Current server date: {today_utc})."
        )


def validate_follow_up_relationships(
    db: Session,
    patient_id: int,
    case_session_id: int,
    consultation_id: int,
    prescription_id: Optional[int] = None
) -> None:
    """
    Cross-checks patient, case session, consultation, and prescription to prevent data inconsistencies.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    case_session = db.query(CaseSession).filter(CaseSession.id == case_session_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_session_id} not found."
        )
    if case_session.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Case session {case_session_id} belongs to patient {case_session.patient_id}, not patient {patient_id}."
        )

    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with ID {consultation_id} not found."
        )
    if consultation.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Consultation {consultation_id} belongs to patient {consultation.patient_id}, not patient {patient_id}."
        )
    if consultation.case_session_id != case_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Consultation {consultation_id} is linked to case session {consultation.case_session_id}, not {case_session_id}."
        )

    if prescription_id:
        prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
        if not prescription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prescription with ID {prescription_id} not found."
            )
        if prescription.patient_id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Prescription {prescription_id} belongs to patient {prescription.patient_id}, not patient {patient_id}."
            )
        if prescription.consultation_id and prescription.consultation_id != consultation_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Prescription {prescription_id} is linked to consultation {prescription.consultation_id}, not {consultation_id}."
            )


def log_follow_up_audit(
    db: Session,
    follow_up_id: int,
    user_id: Optional[int],
    action: str,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    changed_fields: Optional[Dict[str, Any]] = None
) -> FollowUpAudit:
    """
    Append-only audit trail logging for follow-up appointment lifecycle actions.
    """
    audit = FollowUpAudit(
        follow_up_id=follow_up_id,
        user_id=user_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        changed_fields=changed_fields
    )
    db.add(audit)
    return audit
