from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.case import CaseSession
from app.models.consultation import Consultation
from app.models.medicine import Medicine
from app.models.patient import Patient
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.prescription_audit import PrescriptionAudit
from app.models.prescription_item import PrescriptionItem
from app.models.user import User, UserRole
from app.schemas.prescription import PrescriptionCreate, PrescriptionItemCreate, PrescriptionUpdate


def generate_prescription_number(db: Session) -> str:
    """
    Generate a human-readable, unique, collision-proof prescription number.
    Format: RX-YYYY-NNNNNN (e.g. RX-2026-000001)
    """
    current_year = datetime.now(timezone.utc).year
    year_prefix = f"RX-{current_year}-"

    # Count existing prescriptions for this year to generate sequential suffix
    count = (
        db.query(func.count(Prescription.id))
        .filter(Prescription.prescription_number.like(f"{year_prefix}%"))
        .scalar()
        or 0
    )

    # Attempt sequential number; loop if collision exists
    candidate = f"{year_prefix}{count + 1:06d}"
    existing = db.query(Prescription).filter(Prescription.prescription_number == candidate).first()
    if not existing:
        return candidate

    # Fallback to random hex suffix to guarantee uniqueness without race conditions
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"{year_prefix}{unique_suffix}"


def resolve_prescription_item(
    db: Session,
    item_in: PrescriptionItemCreate,
    is_new: bool = True
) -> Dict[str, Any]:
    """
    Resolves and captures point-in-time immutable snapshots from medicine master catalog.
    Validates active status for new prescriptions.
    """
    item_dict = item_in.model_dump()
    medicine_id = item_dict.get("medicine_id")

    if medicine_id:
        medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
        if not medicine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medicine with ID {medicine_id} not found in catalog."
            )
        if is_new and not medicine.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot prescribe deactivated medicine '{medicine.name}' (Code: {medicine.medicine_code})."
            )

        # Snapshot resolution: use provided snapshot or capture from master data
        if not item_dict.get("medicine_name_snapshot"):
            item_dict["medicine_name_snapshot"] = medicine.name
        if not item_dict.get("formulation_snapshot"):
            item_dict["formulation_snapshot"] = medicine.formulation
        if not item_dict.get("strength_snapshot"):
            item_dict["strength_snapshot"] = medicine.strength
    else:
        # Custom item without master catalog link
        if not item_dict.get("medicine_name_snapshot"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'medicine_id' or 'medicine_name_snapshot' is required for prescription item."
            )

    return item_dict


def log_prescription_audit(
    db: Session,
    prescription_id: int,
    user_id: Optional[int],
    action: str,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    changed_fields: Optional[Dict[str, Any]] = None
) -> PrescriptionAudit:
    """
    Append-only audit trail logging for prescription lifecycle and modifications.
    """
    audit = PrescriptionAudit(
        prescription_id=prescription_id,
        user_id=user_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        changed_fields=changed_fields
    )
    db.add(audit)
    return audit


def validate_prescription_relationships(
    db: Session,
    patient_id: int,
    case_session_id: int,
    consultation_id: Optional[int] = None
) -> None:
    """
    Cross-checks patient, case session, and consultation to prevent data inconsistencies.
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

    if consultation_id:
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
