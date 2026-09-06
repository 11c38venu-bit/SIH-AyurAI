from datetime import datetime, timezone
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.ai_case_response import AICaseResponse
from app.models.ai_case_summary import AICaseSummary
from app.models.ashtavidha import AshtavidhaPariksha
from app.models.ayurvedic_assessment import AyurvedicAssessment
from app.models.case import CaseSession, CaseStatus
from app.models.case_response import CaseResponse
from app.models.consultation import Consultation, ConsultationStatus
from app.models.consultation_audit import ConsultationAudit
from app.models.dashavidha import DashavidhaPariksha
from app.models.document import PatientDocument
from app.models.document_processing import DocumentProcessing
from app.models.medical_history import MedicalHistory
from app.models.patient import Patient
from app.models.queue import PatientQueue, QueueStatus
from app.models.user import User, UserRole
from app.schemas.consultation import (
    ConsultationCancel,
    ConsultationComplete,
    ConsultationCreate,
    ConsultationResponse,
    ConsultationUpdate,
    ConsultationWorkspaceResponse,
)

router = APIRouter(
    prefix="/consultations",
    tags=["Doctor Consultation & Clinical Decision Support"]
)


def _format_consultation_response(c: Consultation) -> ConsultationResponse:
    """Helper to assemble clean ConsultationResponse with doctor and patient names."""
    return ConsultationResponse(
        id=c.id,
        patient_id=c.patient_id,
        case_session_id=c.case_session_id,
        doctor_id=c.doctor_id,
        doctor_name=c.doctor.full_name if c.doctor else None,
        patient_name=c.patient.full_name if c.patient else None,
        queue_id=c.queue_id,
        consultation_status=c.consultation_status,
        chief_complaint=c.chief_complaint,
        clinical_observations=c.clinical_observations,
        doctor_assessment=c.doctor_assessment,
        diagnosis=c.diagnosis,
        treatment_plan=c.treatment_plan,
        doctor_notes=c.doctor_notes,
        follow_up_required=c.follow_up_required,
        follow_up_notes=c.follow_up_notes,
        cancellation_reason=c.cancellation_reason,
        consultation_started_at=c.consultation_started_at,
        consultation_completed_at=c.consultation_completed_at,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


# ----------------- 1. START CONSULTATION ----------------- #

@router.post("/", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def start_consultation(
    payload: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Start a doctor consultation for an active case session.
    - Validates patient, case, and queue relationships.
    - Transitions consultation status to IN_PROGRESS.
    - Accessible by DOCTOR and ADMIN roles.
    """
    # 1. Validate Patient exists
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {payload.patient_id} not found"
        )

    # 2. Validate CaseSession exists
    case_session = db.query(CaseSession).filter(CaseSession.id == payload.case_session_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {payload.case_session_id} not found"
        )

    # 3. Validate Case belongs to Patient (Prevent cross-patient contamination)
    if case_session.patient_id != patient.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case session does not belong to the specified patient"
        )

    # 4. Validate Queue entry if supplied
    queue_entry = None
    if payload.queue_id:
        queue_entry = db.query(PatientQueue).filter(PatientQueue.id == payload.queue_id).first()
        if not queue_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Queue entry with ID {payload.queue_id} not found"
            )
        if queue_entry.patient_id != patient.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue token does not belong to the specified patient"
            )

    # 5. Determine assigning doctor
    assigned_doctor_id = current_user.id
    if current_user.role == UserRole.ADMIN and payload.doctor_id:
        target_doc = db.query(User).filter(
            User.id == payload.doctor_id,
            User.role.in_([UserRole.DOCTOR, UserRole.ADMIN]),
            User.is_active == True
        ).first()
        if not target_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target doctor user ID {payload.doctor_id} is not an active doctor"
            )
        assigned_doctor_id = target_doc.id

    # 6. Check if consultation already exists for this case session
    existing_consultation = db.query(Consultation).filter(Consultation.case_session_id == payload.case_session_id).first()
    if existing_consultation:
        if existing_consultation.consultation_status in (ConsultationStatus.DRAFT, ConsultationStatus.IN_PROGRESS):
            return _format_consultation_response(existing_consultation)
        elif existing_consultation.consultation_status == ConsultationStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Consultation for Case #{payload.case_session_id} is already completed"
            )

    now = datetime.now(timezone.utc)
    consultation = Consultation(
        patient_id=patient.id,
        case_session_id=case_session.id,
        doctor_id=assigned_doctor_id,
        queue_id=payload.queue_id or case_session.queue_id,
        consultation_status=ConsultationStatus.IN_PROGRESS,
        chief_complaint=payload.chief_complaint,
        clinical_observations=payload.clinical_observations,
        doctor_assessment=payload.doctor_assessment,
        doctor_notes=payload.doctor_notes,
        consultation_started_at=now,
    )
    db.add(consultation)

    # Update linked queue token status if currently waiting/called
    if queue_entry and queue_entry.status in (QueueStatus.WAITING, QueueStatus.CALLED):
        queue_entry.status = QueueStatus.IN_CONSULTATION

    db.commit()
    db.refresh(consultation)

    # Record Audit
    audit = ConsultationAudit(
        consultation_id=consultation.id,
        user_id=current_user.id,
        action="CREATED",
        previous_status=None,
        new_status=ConsultationStatus.IN_PROGRESS.value,
        changed_fields={"consultation_started_at": str(now)}
    )
    db.add(audit)
    db.commit()

    return _format_consultation_response(consultation)


# ----------------- 2. GET CONSULTATION BY ID ----------------- #

@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve doctor consultation by ID.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with ID {consultation_id} not found"
        )
    return _format_consultation_response(consultation)


# ----------------- 3. GET PATIENT CONSULTATION HISTORY ----------------- #

@router.get("/patient/{patient_id}", response_model=list[ConsultationResponse])
def get_patient_consultations(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all consultations for a patient ordered by newest first.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    patient = None
    if patient_id.isdigit():
        patient = db.query(Patient).filter(Patient.id == int(patient_id)).first()
    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{patient_id}' not found"
        )

    consultations = (
        db.query(Consultation)
        .filter(Consultation.patient_id == patient.id)
        .order_by(Consultation.created_at.desc())
        .all()
    )
    return [_format_consultation_response(c) for c in consultations]


# ----------------- 4. GET CASE CONSULTATION ----------------- #

@router.get("/case/{case_id}", response_model=ConsultationResponse)
def get_case_consultation(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve the consultation associated with a specific case session.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    consultation = db.query(Consultation).filter(Consultation.case_session_id == case_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No consultation found for Case Session ID {case_id}"
        )
    return _format_consultation_response(consultation)


# ----------------- 5. UPDATE CONSULTATION ----------------- #

@router.patch("/{consultation_id}", response_model=ConsultationResponse)
def update_consultation(
    consultation_id: int,
    payload: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Doctor enters or updates clinical findings, diagnosis, and treatment plan.
    - Blocks updates if consultation is COMPLETED or CANCELLED.
    - AI cannot write or overwrite these clinical decisions.
    - Accessible ONLY by DOCTOR and ADMIN roles.
    """
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with ID {consultation_id} not found"
        )

    if consultation.consultation_status == ConsultationStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed consultations cannot be edited directly. Finalized clinical decisions are locked."
        )

    if consultation.consultation_status == ConsultationStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelled consultations cannot be edited."
        )

    changed_fields = {}
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        old_val = getattr(consultation, field, None)
        if old_val != value:
            setattr(consultation, field, value)
            changed_fields[field] = {"old": old_val, "new": value}

    if changed_fields:
        audit = ConsultationAudit(
            consultation_id=consultation.id,
            user_id=current_user.id,
            action="UPDATED",
            previous_status=consultation.consultation_status.value,
            new_status=consultation.consultation_status.value,
            changed_fields=changed_fields
        )
        db.add(audit)

    db.commit()
    db.refresh(consultation)
    return _format_consultation_response(consultation)


# ----------------- 6. COMPLETE CONSULTATION ----------------- #

@router.patch("/{consultation_id}/complete", response_model=ConsultationResponse)
def complete_consultation(
    consultation_id: int,
    payload: Optional[ConsultationComplete] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Finalize and complete a doctor consultation.
    - Validates mandatory clinical decisions (Diagnosis, Treatment Plan, Doctor Assessment).
    - Transitions Consultation to COMPLETED and locks normal edits.
    - Synchronizes CaseSession status = COMPLETED and linked Queue token = COMPLETED.
    - Accessible ONLY by DOCTOR and ADMIN roles.
    """
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with ID {consultation_id} not found"
        )

    if consultation.consultation_status == ConsultationStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consultation is already completed."
        )

    if consultation.consultation_status == ConsultationStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot complete a cancelled consultation."
        )

    # Apply completion payload if provided
    if payload:
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            if value is not None:
                setattr(consultation, field, value)

    # Validate essential clinical decisions are documented by doctor
    diag = (consultation.diagnosis or "").strip()
    plan = (consultation.treatment_plan or "").strip()
    assessment = (consultation.doctor_assessment or consultation.clinical_observations or "").strip()

    if not diag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Diagnosis must be entered and confirmed by the doctor before completing consultation."
        )

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Treatment plan must be entered and confirmed by the doctor before completing consultation."
        )

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor assessment or clinical observations must be documented before completing consultation."
        )

    now = datetime.now(timezone.utc)
    prev_status = consultation.consultation_status.value
    consultation.consultation_status = ConsultationStatus.COMPLETED
    consultation.consultation_completed_at = now

    # Synchronize linked CaseSession status
    case_session = db.query(CaseSession).filter(CaseSession.id == consultation.case_session_id).first()
    if case_session:
        case_session.status = CaseStatus.COMPLETED
        case_session.completed_at = now

    # Synchronize linked PatientQueue status
    if consultation.queue_id:
        queue_entry = db.query(PatientQueue).filter(PatientQueue.id == consultation.queue_id).first()
        if queue_entry:
            queue_entry.status = QueueStatus.COMPLETED
            queue_entry.completed_at = now

    # Log Audit
    audit = ConsultationAudit(
        consultation_id=consultation.id,
        user_id=current_user.id,
        action="COMPLETED",
        previous_status=prev_status,
        new_status=ConsultationStatus.COMPLETED.value,
        changed_fields={"completed_at": str(now)}
    )
    db.add(audit)

    db.commit()
    db.refresh(consultation)
    return _format_consultation_response(consultation)


# ----------------- 7. CANCEL CONSULTATION ----------------- #

@router.patch("/{consultation_id}/cancel", response_model=ConsultationResponse)
def cancel_consultation(
    consultation_id: int,
    payload: ConsultationCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Cancel an active consultation with mandatory reason documentation.
    Accessible ONLY by DOCTOR and ADMIN roles.
    """
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with ID {consultation_id} not found"
        )

    if consultation.consultation_status == ConsultationStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed consultations cannot be cancelled."
        )

    if consultation.consultation_status == ConsultationStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consultation is already cancelled."
        )

    prev_status = consultation.consultation_status.value
    consultation.consultation_status = ConsultationStatus.CANCELLED
    consultation.cancellation_reason = payload.cancellation_reason

    audit = ConsultationAudit(
        consultation_id=consultation.id,
        user_id=current_user.id,
        action="CANCELLED",
        previous_status=prev_status,
        new_status=ConsultationStatus.CANCELLED.value,
        changed_fields={"cancellation_reason": payload.cancellation_reason}
    )
    db.add(audit)

    db.commit()
    db.refresh(consultation)
    return _format_consultation_response(consultation)


# ----------------- 8. UNIFIED CLINICAL WORKSPACE ----------------- #

@router.get("/workspace/case/{case_id}", response_model=ConsultationWorkspaceResponse)
def get_consultation_workspace(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Unified read-only clinical decision support workspace.
    Aggregates:
    - Patient demographics & active queue token
    - Multilingual patient responses + AI preliminary translations
    - Medical history & allergies
    - Uploaded documents & verified OCR/AI document findings
    - AI case consultation summary (clearly marked as preliminary)
    - Ayurvedic assessment observations (Prakriti, Vikriti, Agni, Ashtavidha, Dashavidha)
    - Active or finalized doctor consultation record
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    # 1. Validate CaseSession
    case_session = db.query(CaseSession).filter(CaseSession.id == case_id).first()
    if not case_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case session with ID {case_id} not found"
        )

    patient = db.query(Patient).filter(Patient.id == case_session.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient associated with case not found"
        )

    # 2. Queue Info
    queue_data = None
    queue_entry = None
    if case_session.queue_id:
        queue_entry = db.query(PatientQueue).filter(PatientQueue.id == case_session.queue_id).first()
    if not queue_entry:
        queue_entry = db.query(PatientQueue).filter(PatientQueue.patient_id == patient.id).order_by(PatientQueue.created_at.desc()).first()

    if queue_entry:
        queue_data = {
            "id": queue_entry.id,
            "token_number": queue_entry.token_number,
            "priority": queue_entry.priority.value,
            "status": queue_entry.status.value,
            "queue_date": str(queue_entry.queue_date),
            "created_at": queue_entry.created_at.isoformat() if queue_entry.created_at else None,
        }

    # 3. Patient Info
    patient_data = {
        "id": patient.id,
        "patient_id": patient.patient_id,
        "full_name": patient.full_name,
        "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
        "gender": patient.gender,
        "phone": patient.phone,
        "email": patient.email,
        "preferred_language": patient.preferred_language,
    }

    # 4. Case Responses + AI Interpretation
    responses = db.query(CaseResponse).filter(CaseResponse.case_session_id == case_id).all()
    formatted_responses = []
    for r in responses:
        ai_interp = db.query(AICaseResponse).filter(AICaseResponse.case_response_id == r.id).first()
        formatted_responses.append({
            "response_id": r.id,
            "question_id": r.question_id,
            "question_code": r.question.question_code if r.question else None,
            "question_text": r.question.question_text if r.question else f"Question #{r.question_id}",
            "original_response": r.original_response,
            "response_language": r.response_language,
            "standardized_response": r.standardized_response,
            "ai_interpretation": {
                "detected_language": ai_interp.detected_language if ai_interp else None,
                "standardized_text": ai_interp.standardized_text if ai_interp else None,
                "extracted_symptoms": ai_interp.extracted_symptoms if ai_interp else None,
                "extracted_duration": ai_interp.extracted_duration if ai_interp else None,
                "extracted_severity": ai_interp.extracted_severity if ai_interp else None,
                "practitioner_review_status": ai_interp.practitioner_review_status.value if ai_interp else "NOT_PROCESSED",
                "ai_notes": ai_interp.ai_notes if ai_interp else None,
                "disclaimer": "AI-generated preliminary interpretation — practitioner review required."
            } if ai_interp else None
        })

    # 5. Medical History
    med_history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient.id).order_by(MedicalHistory.created_at.desc()).first()
    history_data = None
    if med_history:
        history_data = {
            "id": med_history.id,
            "past_medical_conditions": med_history.past_medical_conditions,
            "past_surgeries": med_history.past_surgeries,
            "family_history": med_history.family_history,
            "current_medications": med_history.current_medications,
            "allergies": med_history.allergies,
            "lifestyle_history": med_history.lifestyle_history,
            "dietary_history": med_history.dietary_history,
            "substance_use_history": med_history.substance_use_history,
            "notes": med_history.notes,
            "updated_at": med_history.updated_at.isoformat() if med_history.updated_at else None,
        }

    # 6. Patient Documents & Document Intelligence
    docs = db.query(PatientDocument).filter(PatientDocument.patient_id == patient.id).all()
    formatted_docs = []
    doc_intelligence_list = []
    for d in docs:
        formatted_docs.append({
            "document_id": d.id,
            "document_type": d.document_type,
            "document_title": d.document_title,
            "original_filename": d.original_filename,
            "mime_type": d.mime_type,
            "file_size_bytes": d.file_size,
            "document_date": str(d.document_date) if d.document_date else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
        proc = db.query(DocumentProcessing).filter(DocumentProcessing.document_id == d.id).first()
        if proc:
            doc_intelligence_list.append({
                "document_id": d.id,
                "document_title": d.document_title,
                "document_type": d.document_type,
                "processing_status": proc.processing_status.value,
                "extraction_method": proc.extraction_method.value,
                "extracted_text_preview": (proc.extracted_text[:300] + "...") if proc.extracted_text and len(proc.extracted_text) > 300 else proc.extracted_text,
                "ai_extraction_status": proc.ai_extraction_status.value,
                "structured_data": proc.structured_data,
                "practitioner_review_status": proc.practitioner_review_status.value,
                "practitioner_notes": proc.practitioner_notes,
                "practitioner_corrected_data": proc.practitioner_corrected_data,
                "disclaimer": "AI-extracted preliminary information — practitioner review required."
            })

    # 7. AI Case Summary
    summary_record = db.query(AICaseSummary).filter(AICaseSummary.case_session_id == case_id).first()
    ai_summary_data = None
    if summary_record:
        ai_summary_data = {
            "id": summary_record.id,
            "summary_status": summary_record.summary_status.value,
            "summary_text": summary_record.summary_text,
            "key_symptoms": summary_record.key_symptoms,
            "relevant_history": summary_record.relevant_history,
            "current_medications": summary_record.current_medications,
            "reported_allergies": summary_record.reported_allergies,
            "lifestyle_factors": summary_record.lifestyle_factors,
            "structured_summary": summary_record.structured_summary,
            "information_quality": summary_record.information_quality,
            "summary_version": summary_record.summary_version,
            "practitioner_review_status": summary_record.practitioner_review_status.value,
            "practitioner_notes": summary_record.practitioner_notes,
            "disclaimer": "AI-generated preliminary synthesis — practitioner review required."
        }

    # 8. Ayurvedic Assessment
    assessment = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.case_session_id == case_id).first()
    ayur_data = None
    if assessment:
        ashtavidha = db.query(AshtavidhaPariksha).filter(AshtavidhaPariksha.assessment_id == assessment.id).first()
        dashavidha = db.query(DashavidhaPariksha).filter(DashavidhaPariksha.assessment_id == assessment.id).first()

        ayur_data = {
            "assessment_id": assessment.id,
            "status": assessment.status.value,
            "prakriti": assessment.prakriti.value,
            "vikriti": assessment.vikriti.value,
            "agni": assessment.agni.value,
            "clinical_observation": assessment.clinical_observation,
            "examination_notes": assessment.examination_notes,
            "is_practitioner_verified": assessment.is_practitioner_verified,
            "verified_at": assessment.verified_at.isoformat() if assessment.verified_at else None,
            "ashtavidha_pariksha": {
                "nadi": ashtavidha.nadi,
                "mutra": ashtavidha.mutra,
                "mala": ashtavidha.mala,
                "jihva": ashtavidha.jihva,
                "shabda": ashtavidha.shabda,
                "sparsha": ashtavidha.sparsha,
                "druk": ashtavidha.druk,
                "akriti": ashtavidha.akriti,
            } if ashtavidha else None,
            "dashavidha_pariksha": {
                "prakriti": dashavidha.prakriti,
                "vikriti": dashavidha.vikriti,
                "sara": dashavidha.sara,
                "samhana": dashavidha.samhana,
                "pramana": dashavidha.pramana,
                "satmya": dashavidha.satmya,
                "sattva": dashavidha.sattva,
                "ahara_shakti": dashavidha.ahara_shakti,
                "vyayama_shakti": dashavidha.vyayama_shakti,
                "vaya": dashavidha.vaya,
            } if dashavidha else None
        }

    # 9. Consultation Record
    consultation = db.query(Consultation).filter(Consultation.case_session_id == case_id).first()
    consultation_data = _format_consultation_response(consultation) if consultation else None

    # Assemble Case Detail
    case_data = {
        "id": case_session.id,
        "patient_id": case_session.patient_id,
        "status": case_session.status.value,
        "started_at": case_session.started_at.isoformat() if case_session.started_at else None,
        "completed_at": case_session.completed_at.isoformat() if case_session.completed_at else None,
        "created_at": case_session.created_at.isoformat() if case_session.created_at else None,
    }

    return ConsultationWorkspaceResponse(
        patient=patient_data,
        queue=queue_data,
        case=case_data,
        case_responses=formatted_responses,
        medical_history=history_data,
        documents=formatted_docs,
        document_intelligence=doc_intelligence_list,
        ai_case_summary=ai_summary_data,
        ayurvedic_assessment=ayur_data,
        consultation=consultation_data,
    )
