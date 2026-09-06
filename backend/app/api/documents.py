import os
import uuid
from datetime import date
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.core.deps import require_doctor, require_staff
from app.db.database import get_db
from app.models.case import CaseSession
from app.models.document import PatientDocument
from app.models.patient import Patient
from app.models.user import User
from app.schemas.document import DocumentResponse

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

# Base Upload Directory Configuration
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "documents"

# Allowed Extensions and MIME types
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/pjpeg",
    "application/octet-stream",  # Fallback often sent by some clients/browsers
}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit


def _sanitize_filename(filename: str) -> str:
    """Sanitize original filename to remove path components and unsafe characters."""
    return Path(filename).name.replace("..", "").replace("/", "").replace("\\", "")


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_patient_document(
    file: UploadFile = File(..., description="Document file (PDF, PNG, JPG, JPEG, max 15MB)"),
    patient_id: int = Form(..., description="ID of the patient"),
    document_type: str = Form(..., description="LAB_REPORT, PRESCRIPTION, MRI_REPORT, CT_REPORT, X_RAY_REPORT, DISCHARGE_SUMMARY, CONSULTATION_REPORT, OTHER"),
    document_title: str = Form(..., min_length=2, max_length=255),
    case_session_id: Optional[int] = Form(None, description="Optional associated consultation case ID"),
    document_date: Optional[date] = Form(None, description="Date on the document report"),
    description: Optional[str] = Form(None, description="Clinical summary or document notes"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Securely upload and store medical reports and patient documents.
    - Validates file type, MIME type, and size.
    - Stores file with UUID-based filename to prevent path traversal and overwrite risks.
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    # 1. Validate Patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )

    # 2. Validate optional CaseSession if provided
    if case_session_id:
        case_session = db.query(CaseSession).filter(CaseSession.id == case_session_id).first()
        if not case_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case session with ID {case_session_id} not found"
            )

    # 3. Validate File Extension
    raw_filename = file.filename or "uploaded_document"
    sanitized_original = _sanitize_filename(raw_filename)
    extension = Path(sanitized_original).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{extension}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # 4. Validate MIME Type
    content_type = file.content_type or ""
    if content_type and content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{content_type}'. Allowed types: PDF, PNG, JPEG"
        )

    # 5. Read file contents and check size
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)"
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB (Received: {file_size / (1024 * 1024):.2f} MB)"
        )

    # 6. Prepare secure destination path
    patient_folder = UPLOAD_DIR / str(patient_id)
    os.makedirs(patient_folder, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}{extension}"
    target_filepath = patient_folder / unique_filename

    # Path traversal check
    resolved_target = target_filepath.resolve()
    resolved_upload_dir = UPLOAD_DIR.resolve()
    if not str(resolved_target).startswith(str(resolved_upload_dir)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security error: Invalid path resolution"
        )

    # 7. Write file to disk
    with open(target_filepath, "wb") as f:
        f.write(file_bytes)

    # 8. Record in database
    relative_storage_path = f"uploads/documents/{patient_id}/{unique_filename}"
    doc_entry = PatientDocument(
        patient_id=patient_id,
        case_session_id=case_session_id,
        uploaded_by=current_user.id,
        document_type=document_type.upper(),
        document_title=document_title,
        original_filename=sanitized_original,
        stored_filename=unique_filename,
        file_path=relative_storage_path,
        mime_type=content_type or f"application/{extension.lstrip('.')}",
        file_size=file_size,
        description=description,
        document_date=document_date,
    )

    db.add(doc_entry)
    db.commit()
    db.refresh(doc_entry)
    return doc_entry


@router.get("/patient/{patient_id}", response_model=list[DocumentResponse])
def get_patient_documents(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve metadata for all documents uploaded for a patient.
    `patient_id` parameter can be integer database ID (e.g. 1) or code (e.g. PAT-2026-000001).
    - Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    target_patient_id: Optional[int] = None
    if patient_id.isdigit():
        target_patient_id = int(patient_id)
    else:
        patient_record = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if patient_record:
            target_patient_id = patient_record.id

    if not target_patient_id:
        patient_record = db.query(Patient).filter(Patient.id == int(patient_id) if patient_id.isdigit() else False).first()
        if not patient_record:
            patient_record = db.query(Patient).filter(Patient.patient_id == patient_id).first()
            if not patient_record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Patient '{patient_id}' not found"
                )
        target_patient_id = patient_record.id

    return (
        db.query(PatientDocument)
        .filter(PatientDocument.patient_id == target_patient_id)
        .order_by(PatientDocument.created_at.desc())
        .all()
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_by_id(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve document metadata by ID.
    Accessible by STAFF, DOCTOR, and ADMIN roles.
    """
    doc_entry = db.query(PatientDocument).filter(PatientDocument.id == document_id).first()
    if not doc_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found"
        )
    return doc_entry


@router.delete("/{document_id}")
def delete_patient_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Delete a document record from PostgreSQL and remove its physical file from storage.
    - Accessible ONLY by DOCTOR and ADMIN roles (Staff cannot delete).
    """
    doc_entry = db.query(PatientDocument).filter(PatientDocument.id == document_id).first()
    if not doc_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found"
        )

    # Safely remove physical file from disk if present
    physical_path = BASE_DIR / doc_entry.file_path
    if physical_path.exists() and physical_path.is_file():
        try:
            physical_path.unlink()
        except OSError:
            pass  # Non-blocking if file was already removed

    db.delete(doc_entry)
    db.commit()

    return {
        "message": "Document deleted successfully",
        "document_id": document_id
    }
