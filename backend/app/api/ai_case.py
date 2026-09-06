from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.ai_case_response import AICaseResponse
from app.models.ai_case_summary import AICaseSummary
from app.models.ayurvedic_assessment import AyurvedicAssessment
from app.models.case import CaseSession
from app.models.case_response import CaseResponse
from app.models.medical_history import MedicalHistory
from app.models.user import User
from app.schemas.ai_case import (
    AICaseResponseResponse,
    AICaseResponseReview,
    AICaseSummaryResponse,
    AICaseSummaryReview,
)
from app.services.ai_case_service import ai_case_service

router = APIRouter(
    prefix="/ai-case",
    tags=["AI Case Processing"]
)


def _format_ai_response_model(ai_record: AICaseResponse) -> AICaseResponseResponse:
    """Helper to assemble AICaseResponseResponse with original response context."""
    return AICaseResponseResponse(
        id=ai_record.id,
        case_response_id=ai_record.case_response_id,
        case_session_id=ai_record.case_session_id,
        patient_id=ai_record.patient_id,
        original_response=ai_record.case_response.original_response if ai_record.case_response else "",
        response_language=ai_record.case_response.response_language if ai_record.case_response else "en",
        processing_status=ai_record.processing_status,
        detected_language=ai_record.detected_language,
        standardized_text=ai_record.standardized_text,
        extracted_symptoms=ai_record.extracted_symptoms,
        extracted_duration=ai_record.extracted_duration,
        extracted_severity=ai_record.extracted_severity,
        extracted_frequency=ai_record.extracted_frequency,
        extracted_triggers=ai_record.extracted_triggers,
        extracted_associated_factors=ai_record.extracted_associated_factors,
        extracted_medications=ai_record.extracted_medications,
        extracted_conditions=ai_record.extracted_conditions,
        extracted_lifestyle_factors=ai_record.extracted_lifestyle_factors,
        ai_notes=ai_record.ai_notes,
        practitioner_review_status=ai_record.practitioner_review_status,
        practitioner_notes=ai_record.practitioner_notes,
        reviewed_by=ai_record.reviewed_by,
        reviewed_at=ai_record.reviewed_at,
        model_name=ai_record.model_name,
        model_version=ai_record.model_version,
        processing_timestamp=ai_record.processing_timestamp,
        created_at=ai_record.created_at,
        updated_at=ai_record.updated_at,
    )


# ---------------- Response-Level AI Processing Endpoints ---------------- #

@router.post("/responses/{case_response_id}/process", response_model=AICaseResponseResponse)
def process_case_response(
    case_response_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Trigger AI processing for a patient's case response.
    - Preserves original verbatim response text.
    - Generates standardized interpretation and structured extraction.
    - Accessible by DOCTOR and ADMIN roles.
    """
    # 1. Validate CaseResponse exists
    case_resp = db.query(CaseResponse).filter(CaseResponse.id == case_response_id).first()
    if not case_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case response with ID {case_response_id} not found"
        )

    case_session = db.query(CaseSession).filter(CaseSession.id == case_resp.case_session_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_resp.case_session_id} not found"
        )

    # 2. Run AI service processing
    ai_result = ai_case_service.process_case_response(
        case_response=case_resp,
        case_session=case_session
    )

    # 3. Create or update AICaseResponse record
    ai_record = db.query(AICaseResponse).filter(AICaseResponse.case_response_id == case_response_id).first()
    if not ai_record:
        ai_record = AICaseResponse(
            case_response_id=case_response_id,
            case_session_id=case_session.id,
            patient_id=case_session.patient_id,
            **ai_result
        )
        db.add(ai_record)
    else:
        for field, value in ai_result.items():
            setattr(ai_record, field, value)

    # Also set standardized_response on parent CaseResponse if available
    if ai_result.get("standardized_text"):
        case_resp.standardized_response = ai_result["standardized_text"]

    db.commit()
    db.refresh(ai_record)
    return _format_ai_response_model(ai_record)


@router.get("/responses/{case_response_id}", response_model=AICaseResponseResponse)
def get_ai_case_response(
    case_response_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve AI processing interpretation for a specific case response.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    ai_record = db.query(AICaseResponse).filter(AICaseResponse.case_response_id == case_response_id).first()
    if not ai_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI interpretation found for Case Response ID {case_response_id}"
        )
    return _format_ai_response_model(ai_record)


@router.patch("/responses/{case_response_id}/review", response_model=AICaseResponseResponse)
def review_ai_case_response(
    case_response_id: int,
    payload: AICaseResponseReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Practitioner review, approval, correction, or rejection of AI-extracted response.
    Accessible ONLY by DOCTOR and ADMIN roles.
    """
    ai_record = db.query(AICaseResponse).filter(AICaseResponse.case_response_id == case_response_id).first()
    if not ai_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI interpretation found for Case Response ID {case_response_id}"
        )

    ai_record.practitioner_review_status = payload.practitioner_review_status
    if payload.practitioner_notes is not None:
        ai_record.practitioner_notes = payload.practitioner_notes
    if payload.standardized_text is not None:
        ai_record.standardized_text = payload.standardized_text
        if ai_record.case_response:
            ai_record.case_response.standardized_response = payload.standardized_text

    ai_record.reviewed_by = current_user.id
    ai_record.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(ai_record)
    return _format_ai_response_model(ai_record)


# ---------------- Case-Level AI Summary Endpoints ---------------- #

@router.post("/cases/{case_id}/generate-summary", response_model=AICaseSummaryResponse, status_code=status.HTTP_201_CREATED)
def generate_case_summary(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Generate an AI clinical summary for an entire consultation case session.
    - Aggregates case responses, medical history, Ayurvedic observations, and document intelligence.
    - Increments summary version if regenerating.
    - Accessible by DOCTOR and ADMIN roles.
    """
    case_session = db.query(CaseSession).filter(CaseSession.id == case_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_id} not found"
        )

    responses = db.query(CaseResponse).filter(CaseResponse.case_session_id == case_id).all()
    med_history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == case_session.patient_id).order_by(MedicalHistory.created_at.desc()).first()
    assessment = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.case_session_id == case_id).first()

    from app.models.document_processing import DocumentProcessing

    doc_processings = (
        db.query(DocumentProcessing)
        .filter(
            (DocumentProcessing.patient_id == case_session.patient_id) |
            (DocumentProcessing.case_session_id == case_id)
        )
        .all()
    )

    summary_data = ai_case_service.generate_case_summary(
        case_session=case_session,
        responses=responses,
        medical_history=med_history,
        assessment=assessment,
        documents=doc_processings
    )

    summary_record = db.query(AICaseSummary).filter(AICaseSummary.case_session_id == case_id).first()
    if not summary_record:
        summary_record = AICaseSummary(
            case_session_id=case_id,
            patient_id=case_session.patient_id,
            summary_version=1,
            **summary_data
        )
        db.add(summary_record)
    else:
        new_version = (summary_record.summary_version or 1) + 1
        for field, value in summary_data.items():
            setattr(summary_record, field, value)
        summary_record.summary_version = new_version

    db.commit()
    db.refresh(summary_record)
    return summary_record


@router.get("/cases/{case_id}/summary", response_model=AICaseSummaryResponse)
def get_case_summary(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve the AI-generated clinical summary for a consultation case session.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    summary_record = db.query(AICaseSummary).filter(AICaseSummary.case_session_id == case_id).first()
    if not summary_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI summary generated for Case Session ID {case_id}"
        )
    return summary_record


@router.patch("/cases/{case_id}/summary/review", response_model=AICaseSummaryResponse)
@router.patch("/cases/{case_id}/review-summary", response_model=AICaseSummaryResponse)
def review_case_summary(
    case_id: int,
    payload: AICaseSummaryReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Practitioner review, approval, correction, or rejection of the case-level AI summary.
    Accessible ONLY by DOCTOR and ADMIN roles.
    """
    summary_record = db.query(AICaseSummary).filter(AICaseSummary.case_session_id == case_id).first()
    if not summary_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI summary generated for Case Session ID {case_id}"
        )

    summary_record.practitioner_review_status = payload.practitioner_review_status
    if payload.practitioner_notes is not None:
        summary_record.practitioner_notes = payload.practitioner_notes
    if payload.summary_text is not None:
        summary_record.summary_text = payload.summary_text
    if payload.structured_summary is not None:
        summary_record.structured_summary = payload.structured_summary

    summary_record.reviewed_by = current_user.id
    summary_record.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(summary_record)
    return summary_record
