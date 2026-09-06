from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.ayurvedic_assessment import AyurvedicAssessment
from app.models.consultation import Consultation
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.patient import Patient
from app.models.patient_progress import (
    AdherenceLevel,
    ClinicalOutcome,
    PatientProgress,
    ProgressTrend,
    SymptomSeverity,
)
from app.models.prescription import Prescription
from app.models.user import User
from app.schemas.patient_progress import (
    AdherenceHistoryItem,
    AdverseEffectItem,
    LongitudinalWorkspaceResponse,
    PatientOutcomeResponse,
    PatientProgressCreate,
    PatientProgressResponse,
    PatientProgressUpdate,
    ProgressComparisonResponse,
    ProgressSummaryResponse,
    ProgressTimelineItem,
    SymptomTrendItem,
)
from app.services.patient_progress_service import (
    build_progress_comparison,
    build_progress_summary,
    log_progress_audit,
    validate_progress_relationships,
)

router = APIRouter(prefix="/progress", tags=["Patient Progress & Outcome Tracking"])


@router.post(
    "/",
    response_model=PatientProgressResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record structured patient progress (Doctor, Admin)"
)
def create_patient_progress(
    progress_in: PatientProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Record a structured longitudinal progress observation linked 1:1 to a FollowUpVisit encounter.
    Restricted to DOCTOR or ADMIN.
    """
    # 1. Validate relationships and 1:1 visit mapping
    validate_progress_relationships(
        db=db,
        patient_id=progress_in.patient_id,
        follow_up_id=progress_in.follow_up_id,
        follow_up_visit_id=progress_in.follow_up_visit_id,
        is_new=True
    )

    # 2. Create PatientProgress record
    progress_dict = progress_in.model_dump()
    progress = PatientProgress(
        doctor_id=current_user.id,
        **progress_dict
    )
    db.add(progress)
    db.flush()

    # 3. Log Audit
    log_progress_audit(
        db=db,
        progress_id=progress.id,
        user_id=current_user.id,
        action="CREATED",
        changed_fields={
            "symptom_status": progress.symptom_status.value,
            "clinical_outcome": progress.clinical_outcome.value
        }
    )

    db.commit()
    db.refresh(progress)
    return progress


@router.get(
    "/{progress_id}",
    response_model=PatientProgressResponse,
    summary="Get single progress record by ID (Doctor, Staff, Admin)"
)
def get_progress_record(
    progress_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve structured progress record with nested patient, doctor, and audit logs.
    """
    progress = db.query(PatientProgress).filter(PatientProgress.id == progress_id).first()
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient progress record with ID {progress_id} not found."
        )
    return progress


@router.patch(
    "/{progress_id}",
    response_model=PatientProgressResponse,
    summary="Update progress record observations (Doctor, Admin)"
)
def update_patient_progress(
    progress_id: int,
    progress_in: PatientProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Update or correct practitioner-entered progress observations.
    Restricted to DOCTOR or ADMIN. Creates an append-only audit trail record.
    """
    progress = db.query(PatientProgress).filter(PatientProgress.id == progress_id).first()
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient progress record with ID {progress_id} not found."
        )

    update_dict = progress_in.model_dump(exclude_unset=True)
    changed_fields = {}

    for field, val in update_dict.items():
        setattr(progress, field, val)
        changed_fields[field] = val.value if hasattr(val, "value") else val

    log_progress_audit(
        db=db,
        progress_id=progress.id,
        user_id=current_user.id,
        action="UPDATED",
        changed_fields=changed_fields
    )

    db.commit()
    db.refresh(progress)
    return progress


@router.get(
    "/patient/{patient_id}",
    response_model=List[PatientProgressResponse],
    summary="List patient progress records (Doctor, Staff, Admin)"
)
def list_patient_progress(
    patient_id: int,
    date_from: Optional[date] = Query(None, description="Filter records on/after date"),
    date_to: Optional[date] = Query(None, description="Filter records on/before date"),
    outcome: Optional[ClinicalOutcome] = Query(None, description="Filter by clinical outcome"),
    symptom_status: Optional[ProgressTrend] = Query(None, description="Filter by symptom progression trend"),
    follow_up_id: Optional[int] = Query(None, description="Filter by follow-up ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all structured progress records for a patient (newest recorded first).
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    query = db.query(PatientProgress).filter(PatientProgress.patient_id == patient_id)

    if date_from:
        query = query.filter(PatientProgress.recorded_at >= date_from)
    if date_to:
        query = query.filter(PatientProgress.recorded_at <= date_to)
    if outcome:
        query = query.filter(PatientProgress.clinical_outcome == outcome)
    if symptom_status:
        query = query.filter(PatientProgress.symptom_status == symptom_status)
    if follow_up_id:
        query = query.filter(PatientProgress.follow_up_id == follow_up_id)

    records = query.order_by(PatientProgress.recorded_at.desc()).offset(skip).limit(limit).all()
    return records


@router.get(
    "/patient/{patient_id}/timeline",
    response_model=List[ProgressTimelineItem],
    summary="Patient chronological progress timeline (Doctor, Staff, Admin)"
)
def get_patient_progress_timeline(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve chronological progress timeline sorted oldest to newest for visual graph tracking.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    records = (
        db.query(PatientProgress)
        .filter(PatientProgress.patient_id == patient_id)
        .order_by(PatientProgress.recorded_at.asc())
        .all()
    )

    timeline = []
    for r in records:
        f = r.follow_up
        v = r.follow_up_visit
        timeline.append(
            ProgressTimelineItem(
                progress_id=r.id,
                follow_up_id=r.follow_up_id,
                follow_up_number=f.follow_up_number if f else 0,
                visit_id=r.follow_up_visit_id,
                visit_date=v.visit_date if v else None,
                symptom_status=r.symptom_status,
                symptom_change=r.symptom_change,
                severity=r.symptom_severity,
                medication_adherence=r.medication_adherence,
                lifestyle_adherence=r.lifestyle_adherence,
                dietary_adherence=r.dietary_adherence,
                adverse_effects=r.adverse_effects,
                general_wellbeing=r.general_wellbeing,
                doctor_assessment=r.doctor_assessment,
                clinical_outcome=r.clinical_outcome,
                recorded_at=r.recorded_at
            )
        )
    return timeline


@router.get(
    "/patient/{patient_id}/latest",
    response_model=PatientProgressResponse,
    summary="Get latest progress record (Doctor, Staff, Admin)"
)
def get_latest_patient_progress(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve the most recently recorded progress entry for a patient.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    latest = (
        db.query(PatientProgress)
        .filter(PatientProgress.patient_id == patient_id)
        .order_by(PatientProgress.recorded_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No progress records found for patient ID {patient_id}."
        )
    return latest


@router.get(
    "/patient/{patient_id}/compare",
    response_model=ProgressComparisonResponse,
    summary="Compare two progress records side-by-side (Doctor, Staff, Admin)"
)
def compare_patient_progress(
    patient_id: int,
    from_progress_id: int = Query(..., description="Source/earlier progress record ID"),
    to_progress_id: int = Query(..., description="Target/later progress record ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Compare two progress records side-by-side without automated clinical inferences.
    Both records must belong to the specified patient.
    """
    from_rec = db.query(PatientProgress).filter(PatientProgress.id == from_progress_id).first()
    if not from_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source progress record with ID {from_progress_id} not found."
        )
    if from_rec.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Source progress record {from_progress_id} belongs to patient {from_rec.patient_id}, not patient {patient_id}."
        )

    to_rec = db.query(PatientProgress).filter(PatientProgress.id == to_progress_id).first()
    if not to_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target progress record with ID {to_progress_id} not found."
        )
    if to_rec.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target progress record {to_progress_id} belongs to patient {to_rec.patient_id}, not patient {patient_id}."
        )

    changes = build_progress_comparison(from_rec, to_rec)
    return ProgressComparisonResponse(
        from_record=from_rec,
        to_record=to_rec,
        changes=changes
    )


@router.get(
    "/patient/{patient_id}/summary",
    response_model=ProgressSummaryResponse,
    summary="Get descriptive progress statistics (Doctor, Staff, Admin)"
)
def get_patient_progress_summary(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve descriptive statistical counts of progress observations across all follow-up visits.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    return build_progress_summary(db, patient_id)


@router.get(
    "/patient/{patient_id}/outcome",
    response_model=PatientOutcomeResponse,
    summary="Get patient clinical outcome history (Doctor, Staff, Admin)"
)
def get_patient_outcome_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve historical and latest practitioner-entered clinical outcomes.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    records = (
        db.query(PatientProgress)
        .filter(PatientProgress.patient_id == patient_id)
        .order_by(PatientProgress.recorded_at.asc())
        .all()
    )

    if not records:
        return PatientOutcomeResponse(
            latest_clinical_outcome=ClinicalOutcome.NOT_ASSESSED,
            historical_outcomes=[],
            latest_symptom_status=ProgressTrend.NOT_ASSESSED,
            latest_severity=SymptomSeverity.NOT_ASSESSED,
            latest_adherence=AdherenceLevel.NOT_REPORTED,
            total_follow_ups=0,
            last_recorded_date=None,
            next_review_required=False,
            next_review_notes=None
        )

    latest_rec = records[-1]
    history = [
        {
            "progress_id": r.id,
            "follow_up_number": r.follow_up.follow_up_number if r.follow_up else 0,
            "recorded_at": str(r.recorded_at),
            "clinical_outcome": r.clinical_outcome.value,
            "doctor_assessment": r.doctor_assessment
        }
        for r in records
    ]

    return PatientOutcomeResponse(
        latest_clinical_outcome=latest_rec.clinical_outcome,
        historical_outcomes=history,
        latest_symptom_status=latest_rec.symptom_status,
        latest_severity=latest_rec.symptom_severity,
        latest_adherence=latest_rec.medication_adherence,
        total_follow_ups=len(records),
        last_recorded_date=latest_rec.recorded_at,
        next_review_required=latest_rec.next_review_required,
        next_review_notes=latest_rec.next_review_notes
    )


@router.get(
    "/patient/{patient_id}/symptom-trend",
    response_model=List[SymptomTrendItem],
    summary="Get symptom trends formatted for charting (Doctor, Staff, Admin)"
)
def get_symptom_trend(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve structured symptom trend data suitable for visual chart plotting.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    records = (
        db.query(PatientProgress)
        .filter(PatientProgress.patient_id == patient_id)
        .order_by(PatientProgress.recorded_at.asc())
        .all()
    )

    trends = []
    for r in records:
        f = r.follow_up
        v = r.follow_up_visit
        trends.append(
            SymptomTrendItem(
                date=v.visit_date if v else r.recorded_at.date(),
                follow_up_number=f.follow_up_number if f else 0,
                status=r.symptom_status,
                severity=r.symptom_severity,
                symptom_change=r.symptom_change
            )
        )
    return trends


@router.get(
    "/patient/{patient_id}/adherence",
    response_model=List[AdherenceHistoryItem],
    summary="Get adherence history timeline (Doctor, Staff, Admin)"
)
def get_adherence_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve historical medication, lifestyle, and dietary adherence entries.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    records = (
        db.query(PatientProgress)
        .filter(PatientProgress.patient_id == patient_id)
        .order_by(PatientProgress.recorded_at.asc())
        .all()
    )

    adherence_list = []
    for r in records:
        f = r.follow_up
        v = r.follow_up_visit
        adherence_list.append(
            AdherenceHistoryItem(
                date=v.visit_date if v else r.recorded_at.date(),
                follow_up_number=f.follow_up_number if f else 0,
                medication_adherence=r.medication_adherence,
                lifestyle_adherence=r.lifestyle_adherence,
                dietary_adherence=r.dietary_adherence
            )
        )
    return adherence_list


@router.get(
    "/patient/{patient_id}/adverse-effects",
    response_model=List[AdverseEffectItem],
    summary="Get patient-reported adverse effects history (Doctor, Staff, Admin)"
)
def get_adverse_effects_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve historical patient-reported adverse effects.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    records = (
        db.query(PatientProgress)
        .filter(
            PatientProgress.patient_id == patient_id,
            PatientProgress.adverse_effects.isnot(None),
            PatientProgress.adverse_effects != ""
        )
        .order_by(PatientProgress.recorded_at.asc())
        .all()
    )

    effects = []
    for r in records:
        f = r.follow_up
        v = r.follow_up_visit
        effects.append(
            AdverseEffectItem(
                date=v.visit_date if v else r.recorded_at.date(),
                follow_up_number=f.follow_up_number if f else 0,
                adverse_effects=r.adverse_effects
            )
        )
    return effects


@router.get(
    "/workspace/patient/{patient_id}",
    response_model=LongitudinalWorkspaceResponse,
    summary="Unified Longitudinal Progress & Outcome Workspace (Doctor, Staff, Admin)"
)
def get_longitudinal_workspace(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Unified longitudinal progress workspace aggregating patient demographics, initial consultation,
    latest assessment, latest prescription, timeline, symptom trends, adherence, and outcomes.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    today_utc = datetime.now(timezone.utc).date()

    # Initial consultation
    consultation = (
        db.query(Consultation)
        .filter(Consultation.patient_id == patient_id)
        .order_by(Consultation.created_at.asc())
        .first()
    )

    # Latest Ayurvedic assessment
    assessment = (
        db.query(AyurvedicAssessment)
        .filter(AyurvedicAssessment.patient_id == patient_id)
        .order_by(AyurvedicAssessment.created_at.desc())
        .first()
    )

    # Latest prescription
    prescription = (
        db.query(Prescription)
        .filter(Prescription.patient_id == patient_id)
        .order_by(Prescription.created_at.desc())
        .first()
    )

    # All progress records
    progress_records = (
        db.query(PatientProgress)
        .filter(PatientProgress.patient_id == patient_id)
        .order_by(PatientProgress.recorded_at.asc())
        .all()
    )

    # Upcoming follow-ups
    upcoming = (
        db.query(FollowUp)
        .filter(
            FollowUp.patient_id == patient_id,
            FollowUp.status.in_([FollowUpStatus.SCHEDULED, FollowUpStatus.CONFIRMED]),
            FollowUp.scheduled_date >= today_utc
        )
        .order_by(FollowUp.scheduled_date.asc())
        .all()
    )

    timeline = []
    trends = []
    adherence = []
    outcomes = []

    for r in progress_records:
        f = r.follow_up
        v = r.follow_up_visit
        v_date = v.visit_date if v else r.recorded_at.date()
        f_num = f.follow_up_number if f else 0

        timeline.append(
            ProgressTimelineItem(
                progress_id=r.id,
                follow_up_id=r.follow_up_id,
                follow_up_number=f_num,
                visit_id=r.follow_up_visit_id,
                visit_date=v_date,
                symptom_status=r.symptom_status,
                symptom_change=r.symptom_change,
                severity=r.symptom_severity,
                medication_adherence=r.medication_adherence,
                lifestyle_adherence=r.lifestyle_adherence,
                dietary_adherence=r.dietary_adherence,
                adverse_effects=r.adverse_effects,
                general_wellbeing=r.general_wellbeing,
                doctor_assessment=r.doctor_assessment,
                clinical_outcome=r.clinical_outcome,
                recorded_at=r.recorded_at
            )
        )

        trends.append(
            SymptomTrendItem(
                date=v_date,
                follow_up_number=f_num,
                status=r.symptom_status,
                severity=r.symptom_severity,
                symptom_change=r.symptom_change
            )
        )

        adherence.append(
            AdherenceHistoryItem(
                date=v_date,
                follow_up_number=f_num,
                medication_adherence=r.medication_adherence,
                lifestyle_adherence=r.lifestyle_adherence,
                dietary_adherence=r.dietary_adherence
            )
        )

        outcomes.append({
            "progress_id": r.id,
            "follow_up_number": f_num,
            "recorded_at": str(r.recorded_at),
            "clinical_outcome": r.clinical_outcome.value,
            "doctor_assessment": r.doctor_assessment
        })

    consultation_summary = None
    if consultation:
        consultation_summary = {
            "id": consultation.id,
            "chief_complaint": consultation.chief_complaint,
            "diagnosis": consultation.diagnosis,
            "treatment_plan": consultation.treatment_plan,
            "consultation_status": consultation.consultation_status.value
        }

    assessment_summary = None
    if assessment:
        assessment_summary = {
            "id": assessment.id,
            "prakriti": assessment.prakriti.value if hasattr(assessment.prakriti, "value") else str(assessment.prakriti),
            "vikriti": assessment.vikriti.value if hasattr(assessment.vikriti, "value") else str(assessment.vikriti),
            "agni": assessment.agni.value if hasattr(assessment.agni, "value") else str(assessment.agni),
            "is_practitioner_verified": assessment.is_practitioner_verified
        }

    prescription_summary = None
    if prescription:
        prescription_summary = {
            "id": prescription.id,
            "prescription_number": prescription.prescription_number,
            "prescription_status": prescription.prescription_status.value
        }

    latest_progress = progress_records[-1] if progress_records else None

    return LongitudinalWorkspaceResponse(
        patient=patient,
        initial_consultation=consultation_summary,
        latest_assessment=assessment_summary,
        latest_prescription=prescription_summary,
        latest_progress=latest_progress,
        progress_timeline=timeline,
        symptom_trend=trends,
        adherence_history=adherence,
        outcome_history=outcomes,
        upcoming_follow_ups=upcoming
    )
