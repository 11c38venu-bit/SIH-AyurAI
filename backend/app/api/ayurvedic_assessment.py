from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.ashtavidha import AshtavidhaPariksha
from app.models.ayurvedic_assessment import (
    AssessmentStatus,
    AyurvedicAssessment,
)
from app.models.case import CaseSession, CaseStatus
from app.models.dashavidha import DashavidhaPariksha
from app.models.patient import Patient
from app.models.user import User
from app.schemas.ayurvedic_assessment import (
    AshtavidhaCreate,
    AshtavidhaResponse,
    AshtavidhaUpdate,
    AyurvedicAssessmentCreate,
    AyurvedicAssessmentResponse,
    AyurvedicAssessmentUpdate,
    CompleteAyurvedicAssessmentResponse,
    DashavidhaCreate,
    DashavidhaResponse,
    DashavidhaUpdate,
)

router = APIRouter(
    prefix="/ayurvedic-assessments",
    tags=["Ayurvedic Clinical Assessment"]
)


def _format_complete_assessment(assessment: AyurvedicAssessment) -> CompleteAyurvedicAssessmentResponse:
    """Helper to build unified CompleteAyurvedicAssessmentResponse."""
    ashtavidha_res = (
        AshtavidhaResponse.model_validate(assessment.ashtavidha)
        if assessment.ashtavidha else None
    )
    dashavidha_res = (
        DashavidhaResponse.model_validate(assessment.dashavidha)
        if assessment.dashavidha else None
    )
    return CompleteAyurvedicAssessmentResponse(
        assessment=AyurvedicAssessmentResponse.model_validate(assessment),
        ashtavidha=ashtavidha_res,
        dashavidha=dashavidha_res
    )


@router.post("/", response_model=CompleteAyurvedicAssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_ayurvedic_assessment(
    payload: AyurvedicAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Create a new structured Ayurvedic assessment for a case session.
    - Captures practitioner-recorded Prakriti, Vikriti, Agni, and clinical observations.
    - Accessible by DOCTOR and ADMIN roles.
    """
    # 1. Validate CaseSession exists
    case_session = db.query(CaseSession).filter(CaseSession.id == payload.case_session_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {payload.case_session_id} not found"
        )

    if case_session.status == CaseStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create an Ayurvedic assessment for a CANCELLED case session"
        )

    # 2. Check for duplicate assessment for this case session
    existing_assessment = (
        db.query(AyurvedicAssessment)
        .filter(AyurvedicAssessment.case_session_id == payload.case_session_id)
        .first()
    )
    if existing_assessment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"An Ayurvedic assessment already exists for Case Session ID {payload.case_session_id} "
                f"(Assessment ID: {existing_assessment.id}, Status: {existing_assessment.status.value})."
            )
        )

    # 3. Create assessment
    assessment = AyurvedicAssessment(
        case_session_id=payload.case_session_id,
        patient_id=case_session.patient_id,
        practitioner_id=current_user.id,
        status=AssessmentStatus.DRAFT,
        prakriti=payload.prakriti,
        vikriti=payload.vikriti,
        agni=payload.agni,
        clinical_observation=payload.clinical_observation,
        examination_notes=payload.examination_notes,
        assessment_notes=payload.assessment_notes,
        practitioner_observations=payload.practitioner_observations,
        is_practitioner_verified=False,
    )
    db.add(assessment)
    db.flush()  # Obtain assessment.id

    # 4. Create Ashtavidha if provided
    if payload.ashtavidha:
        ashtavidha_entry = AshtavidhaPariksha(
            assessment_id=assessment.id,
            **payload.ashtavidha.model_dump(exclude_unset=True)
        )
        db.add(ashtavidha_entry)

    # 5. Create Dashavidha if provided
    if payload.dashavidha:
        dashavidha_entry = DashavidhaPariksha(
            assessment_id=assessment.id,
            **payload.dashavidha.model_dump(exclude_unset=True)
        )
        db.add(dashavidha_entry)

    db.commit()
    db.refresh(assessment)
    return _format_complete_assessment(assessment)


@router.get("/{assessment_id}", response_model=CompleteAyurvedicAssessmentResponse)
def get_ayurvedic_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve complete Ayurvedic assessment by ID with Ashtavidha and Dashavidha Pariksha.
    Accessible by DOCTOR, STAFF, and ADMIN.
    """
    assessment = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ayurvedic assessment with ID {assessment_id} not found"
        )
    return _format_complete_assessment(assessment)


@router.get("/case/{case_id}", response_model=CompleteAyurvedicAssessmentResponse)
def get_assessment_by_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve Ayurvedic assessment associated with a specific case session.
    Accessible by DOCTOR, STAFF, and ADMIN.
    """
    assessment = (
        db.query(AyurvedicAssessment)
        .filter(AyurvedicAssessment.case_session_id == case_id)
        .first()
    )
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No Ayurvedic assessment found for Case Session ID {case_id}"
        )
    return _format_complete_assessment(assessment)


@router.patch("/{assessment_id}", response_model=CompleteAyurvedicAssessmentResponse)
def update_ayurvedic_assessment(
    assessment_id: int,
    payload: AyurvedicAssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Update practitioner assessment details.
    - If previously VERIFIED, major edits safely reset status to DRAFT to require re-verification.
    - Accessible by DOCTOR and ADMIN roles.
    """
    assessment = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ayurvedic assessment with ID {assessment_id} not found"
        )

    update_data = payload.model_dump(exclude_unset=True)

    # If already verified and edited, require re-verification
    if assessment.is_practitioner_verified and update_data:
        if "status" not in update_data or update_data["status"] != AssessmentStatus.VERIFIED:
            assessment.status = AssessmentStatus.DRAFT
            assessment.is_practitioner_verified = False
            assessment.verified_at = None

    for field, value in update_data.items():
        setattr(assessment, field, value)

    assessment.practitioner_id = current_user.id
    db.commit()
    db.refresh(assessment)
    return _format_complete_assessment(assessment)


@router.post("/{assessment_id}/ashtavidha", response_model=AshtavidhaResponse)
def create_or_update_ashtavidha(
    assessment_id: int,
    payload: AshtavidhaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Record or update Ashtavidha Pariksha (8 components) for an assessment.
    Accessible by DOCTOR and ADMIN roles.
    """
    assessment = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ayurvedic assessment with ID {assessment_id} not found"
        )

    ashtavidha = db.query(AshtavidhaPariksha).filter(AshtavidhaPariksha.assessment_id == assessment_id).first()
    update_data = payload.model_dump(exclude_unset=True)

    if ashtavidha:
        for field, value in update_data.items():
            setattr(ashtavidha, field, value)
    else:
        ashtavidha = AshtavidhaPariksha(assessment_id=assessment_id, **update_data)
        db.add(ashtavidha)

    # Re-open verification if updated
    if assessment.is_practitioner_verified:
        assessment.status = AssessmentStatus.DRAFT
        assessment.is_practitioner_verified = False
        assessment.verified_at = None

    db.commit()
    db.refresh(ashtavidha)
    return ashtavidha


@router.post("/{assessment_id}/dashavidha", response_model=DashavidhaResponse)
def create_or_update_dashavidha(
    assessment_id: int,
    payload: DashavidhaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Record or update Dashavidha Pariksha (10 dimensions) for an assessment.
    Accessible by DOCTOR and ADMIN roles.
    """
    assessment = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ayurvedic assessment with ID {assessment_id} not found"
        )

    dashavidha = db.query(DashavidhaPariksha).filter(DashavidhaPariksha.assessment_id == assessment_id).first()
    update_data = payload.model_dump(exclude_unset=True)

    if dashavidha:
        for field, value in update_data.items():
            setattr(dashavidha, field, value)
    else:
        dashavidha = DashavidhaPariksha(assessment_id=assessment_id, **update_data)
        db.add(dashavidha)

    # Re-open verification if updated
    if assessment.is_practitioner_verified:
        assessment.status = AssessmentStatus.DRAFT
        assessment.is_practitioner_verified = False
        assessment.verified_at = None

    db.commit()
    db.refresh(dashavidha)
    return dashavidha


@router.patch("/{assessment_id}/verify", response_model=CompleteAyurvedicAssessmentResponse)
def verify_ayurvedic_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Mark an Ayurvedic assessment as clinically verified by a practitioner.
    - Sets assessment_status = VERIFIED
    - Sets is_practitioner_verified = True
    - Records verified_at timestamp and verifying practitioner_id
    - Accessible ONLY by DOCTOR and ADMIN roles (Staff rejected with 403 Forbidden).
    """
    assessment = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ayurvedic assessment with ID {assessment_id} not found"
        )

    assessment.status = AssessmentStatus.VERIFIED
    assessment.is_practitioner_verified = True
    assessment.verified_at = datetime.now(timezone.utc)
    assessment.practitioner_id = current_user.id

    db.commit()
    db.refresh(assessment)
    return _format_complete_assessment(assessment)
