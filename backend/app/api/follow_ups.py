from datetime import date, datetime, time, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.consultation import Consultation
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.follow_up_audit import FollowUpAudit
from app.models.follow_up_visit import FollowUpVisit
from app.models.patient import Patient
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.user import User, UserRole
from app.schemas.follow_up import (
    ContinuityOfCareWorkspaceResponse,
    FollowUpCancelRequest,
    FollowUpCompleteRequest,
    FollowUpConfirm,
    FollowUpCreate,
    FollowUpMissedRequest,
    FollowUpResponse,
    FollowUpUpdate,
    FollowUpVisitCreate,
    FollowUpVisitResponse,
    PatientProgressItem,
)
from app.services.follow_up_service import (
    get_next_patient_follow_up_number,
    log_follow_up_audit,
    validate_follow_up_date,
    validate_follow_up_relationships,
)
from app.services.notification_service import (
    create_follow_up_reminder_idempotent,
    trigger_follow_up_status_notification,
)

router = APIRouter(prefix="/follow-ups", tags=["Follow-Up Management & Continuity of Care"])



@router.post(
    "/",
    response_model=FollowUpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule new follow-up (Doctor, Admin)"
)
def create_follow_up(
    follow_up_in: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Schedule a new sequential follow-up appointment for a patient linked to an existing consultation encounter.
    Restricted to DOCTOR or ADMIN.
    """
    # 1. Determine treating doctor ID
    doctor_id = current_user.id
    if current_user.role == UserRole.ADMIN and follow_up_in.doctor_id:
        target_doctor = db.query(User).filter(User.id == follow_up_in.doctor_id).first()
        if not target_doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor user with ID {follow_up_in.doctor_id} not found."
            )
        doctor_id = target_doctor.id

    # 2. Validate scheduled appointment date (cannot be in past)
    validate_follow_up_date(follow_up_in.scheduled_date)

    # 3. Validate cross-patient clinical relationships
    validate_follow_up_relationships(
        db=db,
        patient_id=follow_up_in.patient_id,
        case_session_id=follow_up_in.case_session_id,
        consultation_id=follow_up_in.consultation_id,
        prescription_id=follow_up_in.prescription_id
    )

    # 4. Generate sequential follow-up number for this patient
    follow_up_num = get_next_patient_follow_up_number(db, follow_up_in.patient_id)

    # 5. Create FollowUp record
    follow_up = FollowUp(
        patient_id=follow_up_in.patient_id,
        case_session_id=follow_up_in.case_session_id,
        consultation_id=follow_up_in.consultation_id,
        prescription_id=follow_up_in.prescription_id,
        doctor_id=doctor_id,
        follow_up_number=follow_up_num,
        scheduled_date=follow_up_in.scheduled_date,
        scheduled_time=follow_up_in.scheduled_time,
        reason=follow_up_in.reason,
        instructions=follow_up_in.instructions,
        doctor_notes=follow_up_in.doctor_notes,
        status=FollowUpStatus.SCHEDULED
    )
    db.add(follow_up)
    db.flush()

    # 6. Audit Trail
    log_follow_up_audit(
        db=db,
        follow_up_id=follow_up.id,
        user_id=current_user.id,
        action="CREATED",
        previous_status=None,
        new_status=FollowUpStatus.SCHEDULED.value,
        changed_fields={
            "follow_up_number": follow_up_num,
            "scheduled_date": str(follow_up_in.scheduled_date),
            "reason": follow_up_in.reason
        }
    )

    db.commit()
    db.refresh(follow_up)

    # Automated reminder creation for scheduled follow-up
    create_follow_up_reminder_idempotent(db=db, follow_up=follow_up, user_id=current_user.id)

    return follow_up



@router.get(
    "/upcoming",
    response_model=List[FollowUpResponse],
    summary="List upcoming scheduled & confirmed follow-ups (Doctor, Staff, Admin)"
)
def list_upcoming_follow_ups(
    date_from: Optional[datetime] = Query(None, description="Start date filter (defaults to today)"),
    date_to: Optional[datetime] = Query(None, description="End date filter"),
    doctor_id: Optional[int] = Query(None, description="Filter by assigned doctor"),
    status_filter: Optional[FollowUpStatus] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve upcoming follow-up appointments. Doctors default to viewing their assigned appointments.
    """
    today_utc = datetime.now(timezone.utc).date()
    query = db.query(FollowUp)

    if status_filter:
        query = query.filter(FollowUp.status == status_filter)
    else:
        query = query.filter(FollowUp.status.in_([FollowUpStatus.SCHEDULED, FollowUpStatus.CONFIRMED]))

    if date_from:
        query = query.filter(FollowUp.scheduled_date >= date_from.date() if isinstance(date_from, datetime) else date_from)
    else:
        query = query.filter(FollowUp.scheduled_date >= today_utc)

    if date_to:
        query = query.filter(FollowUp.scheduled_date <= (date_to.date() if isinstance(date_to, datetime) else date_to))

    if current_user.role == UserRole.DOCTOR:
        # Doctor views their assigned appointments
        query = query.filter(FollowUp.doctor_id == current_user.id)
    elif doctor_id:
        query = query.filter(FollowUp.doctor_id == doctor_id)

    follow_ups = (
        query.order_by(FollowUp.scheduled_date.asc(), FollowUp.scheduled_time.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return follow_ups


@router.get(
    "/{follow_up_id}",
    response_model=FollowUpResponse,
    summary="Get follow-up details by ID (Doctor, Staff, Admin)"
)
def get_follow_up(
    follow_up_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve full follow-up record including linked consultation, prescription, visit, and audit logs.
    """
    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )
    return follow_up


@router.get(
    "/patient/{patient_id}",
    response_model=List[FollowUpResponse],
    summary="Get patient's follow-up history (Doctor, Staff, Admin)"
)
def get_patient_follow_ups(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all follow-up records for a patient ordered by scheduled date descending.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    follow_ups = (
        db.query(FollowUp)
        .filter(FollowUp.patient_id == patient_id)
        .order_by(FollowUp.scheduled_date.desc(), FollowUp.follow_up_number.desc())
        .all()
    )
    return follow_ups


@router.get(
    "/consultation/{consultation_id}",
    response_model=List[FollowUpResponse],
    summary="Get follow-ups created from a consultation (Doctor, Staff, Admin)"
)
def get_consultation_follow_ups(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all follow-up records originating from a specific consultation encounter.
    """
    follow_ups = (
        db.query(FollowUp)
        .filter(FollowUp.consultation_id == consultation_id)
        .order_by(FollowUp.scheduled_date.desc(), FollowUp.follow_up_number.desc())
        .all()
    )
    return follow_ups


@router.patch(
    "/{follow_up_id}",
    response_model=FollowUpResponse,
    summary="Update scheduled follow-up details (Doctor, Admin)"
)
def update_follow_up(
    follow_up_id: int,
    follow_up_in: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Update appointment details on a SCHEDULED or CONFIRMED follow-up.
    Rejects modifications on COMPLETED, CANCELLED, or MISSED records.
    """
    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )

    if follow_up.status not in (FollowUpStatus.SCHEDULED, FollowUpStatus.CONFIRMED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit follow-up in '{follow_up.status.value}' status. Only SCHEDULED or CONFIRMED appointments can be modified."
        )

    update_dict = follow_up_in.model_dump(exclude_unset=True)
    if "scheduled_date" in update_dict and update_dict["scheduled_date"]:
        validate_follow_up_date(update_dict["scheduled_date"])

    changed_fields = {}
    for field, val in update_dict.items():
        setattr(follow_up, field, val)
        changed_fields[field] = str(val) if isinstance(val, (datetime, date)) else val

    log_follow_up_audit(
        db=db,
        follow_up_id=follow_up.id,
        user_id=current_user.id,
        action="UPDATED",
        previous_status=follow_up.status.value,
        new_status=follow_up.status.value,
        changed_fields=changed_fields
    )

    db.commit()
    db.refresh(follow_up)
    return follow_up


@router.patch(
    "/{follow_up_id}/confirm",
    response_model=FollowUpResponse,
    summary="Confirm follow-up appointment (Doctor, Admin)"
)
def confirm_follow_up(
    follow_up_id: int,
    confirm_in: Optional[FollowUpConfirm] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Confirm scheduled appointment. Transitions status from SCHEDULED to CONFIRMED.
    """
    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )

    if follow_up.status == FollowUpStatus.CONFIRMED:
        return follow_up

    if follow_up.status != FollowUpStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot confirm follow-up in '{follow_up.status.value}' status. Only SCHEDULED appointments can be confirmed."
        )

    previous_status = follow_up.status.value
    follow_up.status = FollowUpStatus.CONFIRMED

    changed_fields = {}
    if confirm_in and confirm_in.notes:
        follow_up.doctor_notes = f"{follow_up.doctor_notes or ''}\n[Confirmation Note]: {confirm_in.notes}".strip()
        changed_fields["confirmation_notes"] = confirm_in.notes

    log_follow_up_audit(
        db=db,
        follow_up_id=follow_up.id,
        user_id=current_user.id,
        action="CONFIRMED",
        previous_status=previous_status,
        new_status=FollowUpStatus.CONFIRMED.value,
        changed_fields=changed_fields
    )

    db.commit()
    db.refresh(follow_up)

    # Automated status notification for confirmed follow-up
    trigger_follow_up_status_notification(db=db, follow_up=follow_up, event_status="CONFIRMED", actor_user_id=current_user.id)

    return follow_up



@router.patch(
    "/{follow_up_id}/complete",
    response_model=FollowUpResponse,
    summary="Complete follow-up encounter (Doctor, Admin)"
)
def complete_follow_up(
    follow_up_id: int,
    complete_in: FollowUpCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Mark follow-up encounter as COMPLETED. Records completion timestamps and locks record.
    """
    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )

    if follow_up.status == FollowUpStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Follow-up is already COMPLETED."
        )

    if follow_up.status in (FollowUpStatus.CANCELLED, FollowUpStatus.MISSED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete a {follow_up.status.value} follow-up."
        )

    previous_status = follow_up.status.value
    follow_up.status = FollowUpStatus.COMPLETED
    follow_up.completed_at = datetime.now(timezone.utc)

    if complete_in.completion_notes:
        follow_up.completion_notes = complete_in.completion_notes
    if complete_in.doctor_notes:
        follow_up.doctor_notes = complete_in.doctor_notes
    if complete_in.patient_notes:
        follow_up.patient_notes = complete_in.patient_notes

    log_follow_up_audit(
        db=db,
        follow_up_id=follow_up.id,
        user_id=current_user.id,
        action="COMPLETED",
        previous_status=previous_status,
        new_status=FollowUpStatus.COMPLETED.value,
        changed_fields={
            "completed_at": str(follow_up.completed_at),
            "completion_notes": complete_in.completion_notes
        }
    )

    db.commit()
    db.refresh(follow_up)
    return follow_up


@router.patch(
    "/{follow_up_id}/missed",
    response_model=FollowUpResponse,
    summary="Mark follow-up as missed (Doctor, Admin)"
)
def mark_follow_up_missed(
    follow_up_id: int,
    missed_in: Optional[FollowUpMissedRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Mark follow-up appointment as MISSED if patient did not attend. Locks record.
    """
    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )

    if follow_up.status in (FollowUpStatus.COMPLETED, FollowUpStatus.CANCELLED, FollowUpStatus.MISSED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark a {follow_up.status.value} follow-up as MISSED."
        )

    previous_status = follow_up.status.value
    follow_up.status = FollowUpStatus.MISSED

    changed_fields = {}
    if missed_in and missed_in.notes:
        follow_up.doctor_notes = f"{follow_up.doctor_notes or ''}\n[Missed Note]: {missed_in.notes}".strip()
        changed_fields["missed_notes"] = missed_in.notes

    log_follow_up_audit(
        db=db,
        follow_up_id=follow_up.id,
        user_id=current_user.id,
        action="MISSED",
        previous_status=previous_status,
        new_status=FollowUpStatus.MISSED.value,
        changed_fields=changed_fields
    )

    db.commit()
    db.refresh(follow_up)

    # Automated status notification for missed follow-up
    trigger_follow_up_status_notification(db=db, follow_up=follow_up, event_status="MISSED", actor_user_id=current_user.id)

    return follow_up


@router.patch(
    "/{follow_up_id}/cancel",
    response_model=FollowUpResponse,
    summary="Cancel follow-up appointment (Doctor, Admin)"
)
def cancel_follow_up(
    follow_up_id: int,
    cancel_in: FollowUpCancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Cancel follow-up appointment with mandatory explanation. Locks record.
    """
    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )

    if follow_up.status in (FollowUpStatus.COMPLETED, FollowUpStatus.CANCELLED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a {follow_up.status.value} follow-up."
        )

    previous_status = follow_up.status.value
    follow_up.status = FollowUpStatus.CANCELLED
    follow_up.cancellation_reason = cancel_in.cancellation_reason

    log_follow_up_audit(
        db=db,
        follow_up_id=follow_up.id,
        user_id=current_user.id,
        action="CANCELLED",
        previous_status=previous_status,
        new_status=FollowUpStatus.CANCELLED.value,
        changed_fields={"cancellation_reason": cancel_in.cancellation_reason}
    )

    db.commit()
    db.refresh(follow_up)

    # Automated status notification for cancelled follow-up
    trigger_follow_up_status_notification(db=db, follow_up=follow_up, event_status="CANCELLED", actor_user_id=current_user.id)

    return follow_up



@router.post(
    "/{follow_up_id}/visit",
    response_model=FollowUpVisitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record follow-up visit observations (Doctor, Admin)"
)
def record_follow_up_visit(
    follow_up_id: int,
    visit_in: FollowUpVisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Record clinical progress observations for a follow-up encounter.
    Stores patient-reported changes, medication adherence, adverse effects, and doctor observations.
    """
    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )

    if follow_up.status in (FollowUpStatus.CANCELLED, FollowUpStatus.MISSED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot record clinical visit observations for a {follow_up.status.value} follow-up."
        )

    # Check if a visit already exists for this follow-up
    existing_visit = db.query(FollowUpVisit).filter(FollowUpVisit.follow_up_id == follow_up_id).first()
    if existing_visit:
        # Update existing visit
        update_data = visit_in.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            setattr(existing_visit, field, val)
        visit_record = existing_visit
    else:
        visit_dict = visit_in.model_dump()
        visit_record = FollowUpVisit(
            follow_up_id=follow_up.id,
            patient_id=follow_up.patient_id,
            doctor_id=current_user.id,
            **visit_dict
        )
        db.add(visit_record)

    log_follow_up_audit(
        db=db,
        follow_up_id=follow_up.id,
        user_id=current_user.id,
        action="VISIT_RECORDED",
        previous_status=follow_up.status.value,
        new_status=follow_up.status.value,
        changed_fields={"visit_date": str(visit_record.visit_date)}
    )

    db.commit()
    db.refresh(visit_record)
    return visit_record


@router.get(
    "/{follow_up_id}/visit",
    response_model=FollowUpVisitResponse,
    summary="Get clinical visit observations for a follow-up (Doctor, Staff, Admin)"
)
def get_follow_up_visit(
    follow_up_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve clinical observations and progress recorded during a follow-up visit.
    """
    visit = db.query(FollowUpVisit).filter(FollowUpVisit.follow_up_id == follow_up_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No clinical visit record found for follow-up ID {follow_up_id}."
        )
    return visit


@router.get(
    "/patient/{patient_id}/progress",
    response_model=List[PatientProgressItem],
    summary="Get chronological patient progress history (Doctor, Staff, Admin)"
)
def get_patient_progress_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve chronological follow-up progress entries showing clinical observations across encounters.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    follow_ups = (
        db.query(FollowUp)
        .filter(FollowUp.patient_id == patient_id)
        .order_by(FollowUp.follow_up_number.asc(), FollowUp.scheduled_date.asc())
        .all()
    )

    progress_list = []
    for f in follow_ups:
        v = f.visit
        progress_list.append(
            PatientProgressItem(
                follow_up_id=f.id,
                follow_up_number=f.follow_up_number,
                visit_id=v.id if v else None,
                visit_date=v.visit_date if v else None,
                symptom_progress=v.symptom_progress if v else None,
                patient_reported_changes=v.patient_reported_changes if v else None,
                medication_adherence=v.medication_adherence if v else None,
                adverse_effects_reported=v.adverse_effects_reported if v else None,
                lifestyle_adherence=v.lifestyle_adherence if v else None,
                dietary_adherence=v.dietary_adherence if v else None,
                doctor_observations=v.doctor_observations if v else None,
                doctor_assessment=v.doctor_assessment if v else None,
                next_steps=v.next_steps if v else None,
                status=f.status.value
            )
        )

    return progress_list


@router.get(
    "/workspace/patient/{patient_id}",
    response_model=ContinuityOfCareWorkspaceResponse,
    summary="Unified Continuity of Care Workspace (Doctor, Staff, Admin)"
)
def get_continuity_of_care_workspace(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Unified continuity-of-care workspace aggregating patient demographics, initial consultation,
    active prescription, follow-ups timeline, progress history, and upcoming visits.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    today_utc = datetime.now(timezone.utc).date()

    # Initial / latest consultation
    consultation = (
        db.query(Consultation)
        .filter(Consultation.patient_id == patient_id)
        .order_by(Consultation.created_at.desc())
        .first()
    )

    # Active / latest prescription
    prescription = (
        db.query(Prescription)
        .filter(Prescription.patient_id == patient_id)
        .order_by(Prescription.created_at.desc())
        .first()
    )

    # All follow-ups
    all_follow_ups = (
        db.query(FollowUp)
        .filter(FollowUp.patient_id == patient_id)
        .order_by(FollowUp.scheduled_date.desc(), FollowUp.follow_up_number.desc())
        .all()
    )

    # Upcoming follow-ups
    upcoming = [
        f for f in all_follow_ups
        if f.status in (FollowUpStatus.SCHEDULED, FollowUpStatus.CONFIRMED)
        and f.scheduled_date >= today_utc
    ]

    # Progress history
    progress_history = []
    for f in sorted(all_follow_ups, key=lambda x: (x.follow_up_number, x.scheduled_date)):
        v = f.visit
        progress_history.append(
            PatientProgressItem(
                follow_up_id=f.id,
                follow_up_number=f.follow_up_number,
                visit_id=v.id if v else None,
                visit_date=v.visit_date if v else None,
                symptom_progress=v.symptom_progress if v else None,
                patient_reported_changes=v.patient_reported_changes if v else None,
                medication_adherence=v.medication_adherence if v else None,
                adverse_effects_reported=v.adverse_effects_reported if v else None,
                lifestyle_adherence=v.lifestyle_adherence if v else None,
                dietary_adherence=v.dietary_adherence if v else None,
                doctor_observations=v.doctor_observations if v else None,
                doctor_assessment=v.doctor_assessment if v else None,
                next_steps=v.next_steps if v else None,
                status=f.status.value
            )
        )

    consultation_summary = None
    if consultation:
        consultation_summary = {
            "id": consultation.id,
            "chief_complaint": consultation.chief_complaint,
            "diagnosis": consultation.diagnosis,
            "treatment_plan": consultation.treatment_plan,
            "consultation_status": consultation.consultation_status.value
        }

    prescription_summary = None
    if prescription:
        prescription_summary = {
            "id": prescription.id,
            "prescription_number": prescription.prescription_number,
            "prescription_status": prescription.prescription_status.value
        }

    return ContinuityOfCareWorkspaceResponse(
        patient=patient,
        original_consultation=consultation_summary,
        current_prescription=prescription_summary,
        follow_ups=all_follow_ups,
        progress_history=progress_history,
        upcoming_follow_ups=upcoming
    )
