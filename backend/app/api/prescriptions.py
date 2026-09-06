from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.prescription_audit import PrescriptionAudit
from app.models.prescription_item import PrescriptionItem
from app.models.user import User, UserRole
from app.schemas.prescription import (
    PrescriptionCancel,
    PrescriptionCreate,
    PrescriptionResponse,
    PrescriptionUpdate,
)
from app.services.prescription_service import (
    generate_prescription_number,
    log_prescription_audit,
    resolve_prescription_item,
    validate_prescription_relationships,
)

router = APIRouter(prefix="/prescriptions", tags=["Prescription Management"])


@router.post(
    "/",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create draft prescription (Doctor, Admin)"
)
def create_prescription(
    prescription_in: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Create a new structured clinical prescription in DRAFT status.
    Resolves immutable snapshots for each medicine item and records creation audit.
    Restricted to DOCTOR or ADMIN.
    """
    # 1. Determine treating doctor ID
    doctor_id = current_user.id
    if current_user.role == UserRole.ADMIN and prescription_in.doctor_id:
        target_doctor = db.query(User).filter(User.id == prescription_in.doctor_id).first()
        if not target_doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor user with ID {prescription_in.doctor_id} not found."
            )
        doctor_id = target_doctor.id

    # 2. Validate clinical relationships
    validate_prescription_relationships(
        db=db,
        patient_id=prescription_in.patient_id,
        case_session_id=prescription_in.case_session_id,
        consultation_id=prescription_in.consultation_id
    )

    # 3. Generate unique prescription identifier
    rx_number = generate_prescription_number(db)

    # 4. Create Prescription instance
    prescription = Prescription(
        prescription_number=rx_number,
        patient_id=prescription_in.patient_id,
        case_session_id=prescription_in.case_session_id,
        consultation_id=prescription_in.consultation_id,
        doctor_id=doctor_id,
        prescription_status=PrescriptionStatus.DRAFT,
        general_instructions=prescription_in.general_instructions,
        dietary_advice=prescription_in.dietary_advice,
        lifestyle_advice=prescription_in.lifestyle_advice,
        follow_up_instructions=prescription_in.follow_up_instructions
    )
    db.add(prescription)
    db.flush()  # Allocate prescription.id for items

    # 5. Process & attach prescription items with snapshots
    for idx, item_in in enumerate(prescription_in.items, start=1):
        item_data = resolve_prescription_item(db, item_in, is_new=True)
        if not item_data.get("item_order"):
            item_data["item_order"] = idx
        
        rx_item = PrescriptionItem(
            prescription_id=prescription.id,
            **item_data
        )
        db.add(rx_item)

    # 6. Audit Trail
    log_prescription_audit(
        db=db,
        prescription_id=prescription.id,
        user_id=current_user.id,
        action="CREATED",
        previous_status=None,
        new_status=PrescriptionStatus.DRAFT.value,
        changed_fields={"item_count": len(prescription_in.items)}
    )

    db.commit()
    db.refresh(prescription)
    return prescription


@router.get(
    "/{prescription_id}",
    response_model=PrescriptionResponse,
    summary="Get prescription details by ID (Doctor, Staff, Admin)"
)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve comprehensive prescription details including all items, snapshots, and audit trail.
    """
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID {prescription_id} not found."
        )
    return prescription


@router.get(
    "/patient/{patient_id}",
    response_model=List[PrescriptionResponse],
    summary="Get patient's prescription history (Doctor, Staff, Admin)"
)
def get_patient_prescriptions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all prescriptions for a specific patient, ordered by creation date descending.
    """
    prescriptions = (
        db.query(Prescription)
        .filter(Prescription.patient_id == patient_id)
        .order_by(Prescription.created_at.desc())
        .all()
    )
    return prescriptions


@router.get(
    "/consultation/{consultation_id}",
    response_model=List[PrescriptionResponse],
    summary="Get prescriptions by consultation ID (Doctor, Staff, Admin)"
)
def get_consultation_prescriptions(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all prescriptions associated with a specific consultation.
    """
    prescriptions = (
        db.query(Prescription)
        .filter(Prescription.consultation_id == consultation_id)
        .order_by(Prescription.created_at.desc())
        .all()
    )
    return prescriptions


@router.get(
    "/case/{case_id}",
    response_model=List[PrescriptionResponse],
    summary="Get prescriptions by case session ID (Doctor, Staff, Admin)"
)
def get_case_prescriptions(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all prescriptions linked to a specific case session.
    """
    prescriptions = (
        db.query(Prescription)
        .filter(Prescription.case_session_id == case_id)
        .order_by(Prescription.created_at.desc())
        .all()
    )
    return prescriptions


@router.patch(
    "/{prescription_id}",
    response_model=PrescriptionResponse,
    summary="Update draft prescription (Doctor, Admin)"
)
def update_prescription(
    prescription_id: int,
    prescription_in: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Update clinical directions or prescribed items on a DRAFT prescription.
    Rejected if prescription is already FINALIZED or CANCELLED.
    """
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID {prescription_id} not found."
        )

    # Immutability Check
    if prescription.prescription_status != PrescriptionStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update prescription in '{prescription.prescription_status.value}' status. Only DRAFT prescriptions can be edited."
        )

    changed_fields = {}

    # Update general fields
    for field in ["general_instructions", "dietary_advice", "lifestyle_advice", "follow_up_instructions"]:
        val = getattr(prescription_in, field)
        if val is not None:
            setattr(prescription, field, val)
            changed_fields[field] = val

    # Update items if provided
    if prescription_in.items is not None:
        # Remove existing items
        db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == prescription.id).delete()
        db.flush()

        # Add replacement items
        for idx, item_in in enumerate(prescription_in.items, start=1):
            item_data = resolve_prescription_item(db, item_in, is_new=True)
            if not item_data.get("item_order"):
                item_data["item_order"] = idx

            rx_item = PrescriptionItem(
                prescription_id=prescription.id,
                **item_data
            )
            db.add(rx_item)
        
        changed_fields["items_updated"] = len(prescription_in.items)

    log_prescription_audit(
        db=db,
        prescription_id=prescription.id,
        user_id=current_user.id,
        action="UPDATED",
        previous_status=PrescriptionStatus.DRAFT.value,
        new_status=PrescriptionStatus.DRAFT.value,
        changed_fields=changed_fields
    )

    db.commit()
    db.refresh(prescription)
    return prescription


@router.patch(
    "/{prescription_id}/finalize",
    response_model=PrescriptionResponse,
    summary="Finalize prescription (Doctor, Admin)"
)
def finalize_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Finalize and sign the prescription.
    Transitions status to FINALIZED and locks record permanently against further modifications.
    Requires at least one prescribed medicine item.
    """
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID {prescription_id} not found."
        )

    if prescription.prescription_status == PrescriptionStatus.FINALIZED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prescription is already FINALIZED."
        )

    if prescription.prescription_status == PrescriptionStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot finalize a CANCELLED prescription."
        )

    if not prescription.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot finalize prescription with no prescribed medicine items."
        )

    previous_status = prescription.prescription_status.value
    prescription.prescription_status = PrescriptionStatus.FINALIZED
    prescription.finalized_at = datetime.now(timezone.utc)

    log_prescription_audit(
        db=db,
        prescription_id=prescription.id,
        user_id=current_user.id,
        action="FINALIZED",
        previous_status=previous_status,
        new_status=PrescriptionStatus.FINALIZED.value,
        changed_fields={"finalized_at": str(prescription.finalized_at)}
    )

    db.commit()
    db.refresh(prescription)
    return prescription


@router.patch(
    "/{prescription_id}/cancel",
    response_model=PrescriptionResponse,
    summary="Cancel prescription (Doctor, Admin)"
)
def cancel_prescription(
    prescription_id: int,
    cancel_in: PrescriptionCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Cancel an existing prescription with mandatory clinical explanation.
    Transitions status to CANCELLED and locks record.
    """
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID {prescription_id} not found."
        )

    if prescription.prescription_status == PrescriptionStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prescription is already CANCELLED."
        )

    previous_status = prescription.prescription_status.value
    prescription.prescription_status = PrescriptionStatus.CANCELLED
    prescription.cancellation_reason = cancel_in.cancellation_reason
    prescription.cancelled_at = datetime.now(timezone.utc)

    log_prescription_audit(
        db=db,
        prescription_id=prescription.id,
        user_id=current_user.id,
        action="CANCELLED",
        previous_status=previous_status,
        new_status=PrescriptionStatus.CANCELLED.value,
        changed_fields={"cancellation_reason": cancel_in.cancellation_reason}
    )

    db.commit()
    db.refresh(prescription)
    return prescription
