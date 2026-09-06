from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.follow_up import FollowUp
from app.models.follow_up_visit import FollowUpVisit
from app.models.patient import Patient
from app.models.patient_progress import (
    AdherenceLevel,
    ClinicalOutcome,
    PatientProgress,
    ProgressTrend,
    SymptomSeverity,
)
from app.models.patient_progress_audit import PatientProgressAudit
from app.schemas.patient_progress import ProgressSummaryResponse


def validate_progress_relationships(
    db: Session,
    patient_id: int,
    follow_up_id: int,
    follow_up_visit_id: int,
    is_new: bool = True
) -> None:
    """
    Cross-checks patient, follow-up, and follow-up visit to ensure data integrity and 1:1 visit mapping.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    follow_up = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up with ID {follow_up_id} not found."
        )
    if follow_up.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Follow-up {follow_up_id} belongs to patient {follow_up.patient_id}, not patient {patient_id}."
        )

    visit = db.query(FollowUpVisit).filter(FollowUpVisit.id == follow_up_visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up visit with ID {follow_up_visit_id} not found."
        )
    if visit.follow_up_id != follow_up_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Follow-up visit {follow_up_visit_id} is linked to follow-up {visit.follow_up_id}, not {follow_up_id}."
        )
    if visit.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Follow-up visit {follow_up_visit_id} belongs to patient {visit.patient_id}, not patient {patient_id}."
        )

    if is_new:
        existing = db.query(PatientProgress).filter(PatientProgress.follow_up_visit_id == follow_up_visit_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A progress record (ID: {existing.id}) already exists for FollowUpVisit {follow_up_visit_id}. Use PATCH /progress/{existing.id} to modify."
            )


def log_progress_audit(
    db: Session,
    progress_id: int,
    user_id: Optional[int],
    action: str,
    changed_fields: Optional[Dict[str, Any]] = None
) -> PatientProgressAudit:
    """
    Append-only audit trail logging for patient progress record modifications.
    """
    audit = PatientProgressAudit(
        progress_id=progress_id,
        user_id=user_id,
        action=action,
        changed_fields=changed_fields
    )
    db.add(audit)
    return audit


def build_progress_comparison(from_record: PatientProgress, to_record: PatientProgress) -> Dict[str, Any]:
    """
    Computes purely objective field-by-field differences between two progress records
    without making autonomous clinical outcome inferences.
    """
    fields_to_compare = [
        "symptom_status",
        "symptom_change",
        "symptom_severity",
        "medication_adherence",
        "lifestyle_adherence",
        "dietary_adherence",
        "sleep_status",
        "appetite_status",
        "digestion_status",
        "energy_status",
        "bowel_habit_status",
        "general_wellbeing",
        "clinical_outcome",
        "next_review_required"
    ]

    changes = {}
    for field in fields_to_compare:
        v1 = getattr(from_record, field)
        v2 = getattr(to_record, field)

        # Handle enums
        v1_str = v1.value if hasattr(v1, "value") else v1
        v2_str = v2.value if hasattr(v2, "value") else v2

        changes[field] = {
            "from": v1_str,
            "to": v2_str,
            "changed": v1_str != v2_str
        }

    return changes


def build_progress_summary(db: Session, patient_id: int) -> ProgressSummaryResponse:
    """
    Computes descriptive statistical counts of patient progress records without inferring clinical efficacy.
    """
    records = (
        db.query(PatientProgress)
        .filter(PatientProgress.patient_id == patient_id)
        .order_by(PatientProgress.recorded_at.asc())
        .all()
    )

    if not records:
        return ProgressSummaryResponse(
            total_recorded_progress=0,
            first_progress_date=None,
            latest_progress_date=None,
            latest_symptom_status=ProgressTrend.NOT_ASSESSED,
            latest_symptom_severity=SymptomSeverity.NOT_ASSESSED,
            latest_adherence=AdherenceLevel.NOT_REPORTED,
            latest_clinical_outcome=ClinicalOutcome.NOT_ASSESSED,
            improving_observations_count=0,
            stable_observations_count=0,
            worsening_observations_count=0,
            fluctuating_observations_count=0,
            not_assessed_observations_count=0
        )

    improving = sum(1 for r in records if r.symptom_status == ProgressTrend.IMPROVING)
    stable = sum(1 for r in records if r.symptom_status == ProgressTrend.STABLE)
    worsening = sum(1 for r in records if r.symptom_status == ProgressTrend.WORSENING)
    fluctuating = sum(1 for r in records if r.symptom_status == ProgressTrend.FLUCTUATING)
    not_assessed = sum(1 for r in records if r.symptom_status == ProgressTrend.NOT_ASSESSED)

    first_rec = records[0]
    latest_rec = records[-1]

    first_date = first_rec.follow_up_visit.visit_date if first_rec.follow_up_visit else first_rec.recorded_at.date()
    latest_date = latest_rec.follow_up_visit.visit_date if latest_rec.follow_up_visit else latest_rec.recorded_at.date()

    return ProgressSummaryResponse(
        total_recorded_progress=len(records),
        first_progress_date=first_date,
        latest_progress_date=latest_date,
        latest_symptom_status=latest_rec.symptom_status,
        latest_symptom_severity=latest_rec.symptom_severity,
        latest_adherence=latest_rec.medication_adherence,
        latest_clinical_outcome=latest_rec.clinical_outcome,
        improving_observations_count=improving,
        stable_observations_count=stable,
        worsening_observations_count=worsening,
        fluctuating_observations_count=fluctuating,
        not_assessed_observations_count=not_assessed
    )
