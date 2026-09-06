import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.document import PatientDocument
from app.models.document_processing import (
    AIExtractionStatus,
    DocumentProcessing,
    DocumentProcessingStatus,
    DocumentReviewStatus,
    ExtractionMethod,
)
from app.models.patient import Patient
from app.models.user import User
from app.schemas.ai_document import (
    DocumentProcessingResponse,
    DocumentProcessingReviewRequest,
)
from app.services.gemini_document_service import document_ai_service
from app.services.ocr_service import ocr_service
from app.services.pdf_text_service import pdf_text_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/document-processing",
    tags=["Document Processing"]
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def _resolve_document_path(stored_path: str) -> Path:
    p = Path(stored_path)
    if p.is_absolute() and p.exists():
        return p
    return (BASE_DIR / stored_path).resolve()


def _format_processing_response(proc: DocumentProcessing) -> DocumentProcessingResponse:
    doc = proc.document
    return DocumentProcessingResponse(
        id=proc.id,
        document_id=proc.document_id,
        patient_id=proc.patient_id,
        case_session_id=proc.case_session_id,
        filename=doc.original_filename if doc else "unknown",
        document_type=doc.document_type if doc else "OTHER",
        processing_status=proc.processing_status,
        extraction_method=proc.extraction_method,
        ocr_provider=proc.ocr_provider,
        processing_error=proc.processing_error,
        processing_started_at=proc.processing_started_at,
        processing_completed_at=proc.processing_completed_at,
        extracted_text=proc.extracted_text,
        text_language=proc.text_language,
        ai_extraction_status=proc.ai_extraction_status,
        structured_data=proc.structured_data,
        ai_model_name=proc.ai_model_name,
        ai_model_version=proc.ai_model_version,
        ai_processing_timestamp=proc.ai_processing_timestamp,
        practitioner_review_status=proc.practitioner_review_status,
        practitioner_notes=proc.practitioner_notes,
        practitioner_corrected_data=proc.practitioner_corrected_data,
        reviewed_by=proc.reviewed_by,
        reviewed_at=proc.reviewed_at,
        disclaimer="AI-extracted preliminary information — practitioner review required.",
        created_at=proc.created_at,
        updated_at=proc.updated_at,
    )


@router.post("/{document_id}/process", response_model=DocumentProcessingResponse)
def process_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Trigger text extraction (PDF / OCR) and Gemini-assisted structured clinical intelligence.
    - Preserves the original document file as the source of truth.
    - Accessible by DOCTOR and ADMIN roles.
    """
    # 1. Retrieve document
    document = db.query(PatientDocument).filter(PatientDocument.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient document with ID {document_id} not found"
        )

    # 2. Get or initialize DocumentProcessing record
    proc = db.query(DocumentProcessing).filter(DocumentProcessing.document_id == document_id).first()
    if not proc:
        proc = DocumentProcessing(
            document_id=document_id,
            patient_id=document.patient_id,
            case_session_id=document.case_session_id,
            processing_status=DocumentProcessingStatus.PROCESSING,
            processing_started_at=datetime.now(timezone.utc),
        )
        db.add(proc)
    else:
        proc.processing_status = DocumentProcessingStatus.PROCESSING
        proc.processing_started_at = datetime.now(timezone.utc)
        proc.processing_error = None

    db.commit()
    db.refresh(proc)

    # 3. Locate physical file on disk
    file_path = _resolve_document_path(document.file_path)
    if not file_path.exists():
        proc.processing_status = DocumentProcessingStatus.FAILED
        proc.processing_error = f"Document file '{document.original_filename}' not found on storage."
        proc.processing_completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(proc)
        return _format_processing_response(proc)

    ext = file_path.suffix.lower()
    patient = db.query(Patient).filter(Patient.id == document.patient_id).first()
    preferred_lang = patient.preferred_language if patient else "en"

    # 4. Text Extraction Pipeline
    extracted_text: Optional[str] = None
    extraction_method = ExtractionMethod.NONE
    ocr_provider_name: Optional[str] = None
    extraction_error: Optional[str] = None

    if ext == ".pdf":
        # Step 4a: Try selectable text extraction
        has_text, direct_text, err = pdf_text_service.extract_text_from_pdf(file_path)
        if has_text and direct_text:
            extracted_text = direct_text
            extraction_method = ExtractionMethod.PDF_TEXT
        else:
            # Step 4b: Fallback to OCR for scanned PDF
            ocr_success, ocr_text, ocr_err, prov = ocr_service.extract_text(file_path, language=preferred_lang)
            ocr_provider_name = prov
            extraction_method = ExtractionMethod.OCR
            if ocr_success:
                extracted_text = ocr_text
            else:
                extraction_error = ocr_err or "Scanned PDF OCR failed."

    elif ext in (".png", ".jpg", ".jpeg"):
        # Step 4c: Run Image OCR
        ocr_success, ocr_text, ocr_err, prov = ocr_service.extract_text(file_path, language=preferred_lang)
        ocr_provider_name = prov
        extraction_method = ExtractionMethod.OCR
        if ocr_success:
            extracted_text = ocr_text
        else:
            extraction_error = ocr_err or "Image OCR failed."

    else:
        extraction_error = f"Unsupported file extension: {ext}"

    # 5. Evaluate Text Extraction Outcome
    proc.extraction_method = extraction_method
    proc.ocr_provider = ocr_provider_name
    proc.text_language = preferred_lang

    if extraction_error or not extracted_text:
        proc.processing_status = DocumentProcessingStatus.FAILED
        proc.processing_error = extraction_error or "No text could be extracted from document."
        proc.processing_completed_at = datetime.now(timezone.utc)
        proc.ai_extraction_status = AIExtractionStatus.NOT_PROCESSED
        db.commit()
        db.refresh(proc)
        return _format_processing_response(proc)

    # Text extraction succeeded
    proc.extracted_text = extracted_text
    proc.processing_status = DocumentProcessingStatus.COMPLETED
    proc.processing_completed_at = datetime.now(timezone.utc)

    # 6. Run Gemini Structured Clinical Extraction
    proc.ai_extraction_status = AIExtractionStatus.PROCESSING
    ai_result = document_ai_service.extract_structured_data(
        extracted_text=extracted_text,
        document_type=document.document_type
    )

    proc.ai_extraction_status = ai_result["ai_extraction_status"]
    proc.structured_data = ai_result.get("structured_data")
    proc.ai_model_name = ai_result.get("ai_model_name")
    proc.ai_model_version = ai_result.get("ai_model_version")
    proc.ai_processing_timestamp = ai_result.get("ai_processing_timestamp")

    db.commit()
    db.refresh(proc)
    return _format_processing_response(proc)


@router.get("/{document_id}", response_model=DocumentProcessingResponse)
def get_document_processing(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve document processing, raw extracted text, and AI clinical findings.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    proc = db.query(DocumentProcessing).filter(DocumentProcessing.document_id == document_id).first()
    if not proc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No document processing record found for Document ID {document_id}"
        )
    return _format_processing_response(proc)


@router.patch("/{document_id}/review", response_model=DocumentProcessingResponse)
def review_document_processing(
    document_id: int,
    payload: DocumentProcessingReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Practitioner review, approval, correction, or rejection of AI-extracted document information.
    - Preserves raw extracted text and original AI output for auditability.
    - Stores doctor-verified amendments in practitioner_corrected_data.
    - Accessible ONLY by DOCTOR and ADMIN roles.
    """
    proc = db.query(DocumentProcessing).filter(DocumentProcessing.document_id == document_id).first()
    if not proc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No document processing record found for Document ID {document_id}"
        )

    proc.practitioner_review_status = payload.practitioner_review_status
    if payload.practitioner_notes is not None:
        proc.practitioner_notes = payload.practitioner_notes
    if payload.practitioner_corrected_data is not None:
        proc.practitioner_corrected_data = payload.practitioner_corrected_data

    proc.reviewed_by = current_user.id
    proc.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(proc)
    return _format_processing_response(proc)
