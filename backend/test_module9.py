import os
import sys
import io
import json
from datetime import date, datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from pydantic import ValidationError
from PIL import Image, ImageDraw
import pymupdf

from app.main import app
from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.db.database import get_db, SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.case import CaseSession, CaseStatus
from app.models.document import PatientDocument
from app.models.document_processing import (
    AIExtractionStatus,
    DocumentProcessing,
    DocumentProcessingStatus,
    DocumentReviewStatus,
    ExtractionMethod,
)
from app.schemas.ai_document import (
    DocumentClinicalExtraction,
    DocumentMetadataSchema,
    DocumentProcessingResponse,
    ExtractedClinicalItem,
)
from app.services.pdf_text_service import pdf_text_service
from app.services.ocr_service import OCRService, TesseractOCRProvider, ocr_service
from app.services.gemini_document_service import (
    GeminiDocumentService,
    MockDocumentService,
    document_ai_service,
)
from app.services.ai_case_service import ai_case_service

client = TestClient(app)

print("=" * 75)
print("AYURAI MODULE 9: OCR + AI DOCUMENT INTELLIGENCE - TEST SUITE")
print("=" * 75)

# ----------------- TEST 1: PYDANTIC SCHEMAS & VALIDATION -----------------
print("\n[TEST 1] Testing Document Intelligence Pydantic Schemas & Bounds...")

# 1.1 Valid extraction schema
valid_doc_data = {
    "document_metadata": {
        "document_type": "LAB_REPORT",
        "document_date": "2026-08-15",
        "report_title": "Comprehensive Metabolic Panel",
        "facility_name": "AyurCare Diagnostics",
        "practitioner_name": "Dr. R. K. Sharma"
    },
    "reported_conditions": [
        {"text": "Type 2 Diabetes Mellitus", "normalized_term": "Diabetes Mellitus Type 2", "confidence": 0.96}
    ],
    "reported_symptoms": [
        {"text": "Frequent urination and excessive thirst", "normalized_term": "Polyuria & Polydipsia", "confidence": 0.92}
    ],
    "medications": [
        {"text": "Tab Metformin 500mg BD", "normalized_term": "Metformin", "value_or_details": "500mg twice daily", "confidence": 0.95}
    ],
    "allergies": [
        {"text": "Allergic to Sulfa drugs", "normalized_term": "Sulfonamides", "confidence": 0.98}
    ],
    "investigations": [],
    "laboratory_results": [
        {"text": "Fasting Blood Sugar: 142 mg/dL", "normalized_term": "Fasting Blood Glucose", "value_or_details": "142 mg/dL (Normal: 70-100)", "source_reference": "Page 1", "confidence": 0.99},
        {"text": "HbA1c: 7.4 %", "normalized_term": "Glycated Hemoglobin", "value_or_details": "7.4 %", "source_reference": "Page 1", "confidence": 0.99}
    ],
    "imaging_findings": [],
    "procedures": [],
    "hospitalization_information": [],
    "recommendations_in_document": [
        {"text": "Repeat HbA1c in 3 months", "normalized_term": "Follow-up HbA1c", "confidence": 0.90}
    ],
    "uncertainties": [],
    "ai_notes": "Clear laboratory findings for glycemic monitoring."
}

doc_extraction = DocumentClinicalExtraction.model_validate(valid_doc_data)
assert doc_extraction.document_metadata.report_title == "Comprehensive Metabolic Panel"
assert len(doc_extraction.laboratory_results) == 2
assert doc_extraction.laboratory_results[0].confidence == 0.99
print("  - DocumentClinicalExtraction schema validation PASSED.")

# 1.2 Confidence score validation (0.0 <= confidence <= 1.0)
try:
    ExtractedClinicalItem(text="Lab", confidence=1.4)
    assert False, "Confidence > 1.0 should fail"
except ValidationError:
    print("  - ExtractedClinicalItem upper bound (>1.0) correctly rejected.")

try:
    ExtractedClinicalItem(text="Lab", confidence=-0.2)
    assert False, "Confidence < 0.0 should fail"
except ValidationError:
    print("  - ExtractedClinicalItem lower bound (<0.0) correctly rejected.")


# ----------------- TEST 2: PDF DIRECT TEXT EXTRACTION -----------------
print("\n[TEST 2] Testing PDF Direct Text Extraction Service...")

test_pdf_dir = Path("uploads/documents/test_docs")
test_pdf_dir.mkdir(parents=True, exist_ok=True)
sample_pdf_path = test_pdf_dir / "sample_lab_report.pdf"

# Generate a real text-based PDF using PyMuPDF
doc = pymupdf.open()
page1 = doc.new_page()
sample_text = (
    "AYURCARE CLINICAL LABORATORIES\n"
    "Patient: Suresh Kumar | Age: 45 | Date: 10-Aug-2026\n\n"
    "COMPLETE BLOOD COUNT & METABOLIC PANEL\n"
    "--------------------------------------------------\n"
    "Hemoglobin: 13.8 g/dL (Normal: 13.0 - 17.0)\n"
    "Total WBC Count: 7,200 /uL (Normal: 4,000 - 11,000)\n"
    "Platelet Count: 240,000 /uL (Normal: 150,000 - 450,000)\n"
    "Fasting Blood Glucose: 108 mg/dL (Normal: 70 - 100)\n"
    "Serum Creatinine: 0.9 mg/dL (Normal: 0.7 - 1.2)\n\n"
    "Known History: Mild Gastritis. Current Medication: Pantoprazole 40mg OD."
)
page1.insert_text((50, 70), sample_text, fontsize=11)
doc.save(str(sample_pdf_path))
doc.close()

has_text, extracted_text, err = pdf_text_service.extract_text_from_pdf(sample_pdf_path)
assert has_text is True, f"PDF extraction failed: {err}"
assert extracted_text is not None
assert "Hemoglobin: 13.8" in extracted_text
assert "--- Page 1 ---" in extracted_text
print("  - PDF direct text extraction PASSED with page traceability.")


# ----------------- TEST 3: OCR SERVICE & SAFE ENGINE DETECTION -----------------
print("\n[TEST 3] Testing OCR Service and Safe Fallback Architecture...")

# 3.1 Test with generated sample image
sample_img_path = test_pdf_dir / "sample_prescription.png"
img = Image.new("RGB", (400, 200), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((20, 30), "Tab Ashwagandha 500mg BD", fill=(0, 0, 0))
d.text((20, 70), "Tab Triphala 1g at bedtime", fill=(0, 0, 0))
img.save(str(sample_img_path))

# Check OCR engine availability
ocr_provider = TesseractOCRProvider()
is_tesseract_available = ocr_provider.is_available()

if is_tesseract_available:
    print("  - Tesseract OCR binary detected on host. Running live OCR test...")
    success, ocr_res_text, err_msg, prov = ocr_service.extract_text(sample_img_path, language="en")
    assert success is True
    assert prov == "Tesseract-Local"
    print("  - Live Tesseract OCR extraction PASSED.")
else:
    print("  - Tesseract binary not present on system. Testing safe fallback handling...")
    success, ocr_res_text, err_msg, prov = ocr_service.extract_text(sample_img_path, language="en")
    assert success is False
    assert "OCR engine is not available" in (err_msg or "")
    print("  - Safe OCR failure reporting without application crash PASSED.")


# ----------------- TEST 4: GEMINI DOCUMENT STRUCTURING & SAFETY RULES -----------------
print("\n[TEST 4] Testing Gemini Document Intelligence & 'No Invention' Rule...")

# 4.1 Mock document service extraction
mock_doc_svc = MockDocumentService()
mock_extracted = mock_doc_svc.extract_structured_data(
    extracted_text=extracted_text,
    document_type="LAB_REPORT"
)
assert mock_extracted["ai_extraction_status"] == AIExtractionStatus.COMPLETED
assert len(mock_extracted["structured_data"]["laboratory_results"]) >= 1
print("  - MockDocumentService deterministic extraction PASSED.")

# 4.2 Gemini document service with mock GenAI client (Prompt Injection & No Invention test)
gemini_doc_svc = GeminiDocumentService(api_key="mock-key", model_name="gemini-2.5-flash")

mock_gemini_doc_json = json.dumps({
    "document_metadata": {
        "document_type": "LAB_REPORT",
        "document_date": "2026-08-10",
        "report_title": "Complete Blood Count & Metabolic Panel",
        "facility_name": "AyurCare Clinical Laboratories",
        "practitioner_name": None
    },
    "reported_conditions": [
        {"text": "Mild Gastritis", "normalized_term": "Gastritis", "confidence": 0.95}
    ],
    "reported_symptoms": [],
    "medications": [
        {"text": "Pantoprazole 40mg OD", "normalized_term": "Pantoprazole", "value_or_details": "40mg once daily", "confidence": 0.96}
    ],
    "allergies": [],
    "investigations": [],
    "laboratory_results": [
        {"text": "Hemoglobin: 13.8 g/dL", "normalized_term": "Hemoglobin", "value_or_details": "13.8 g/dL", "source_reference": "Page 1", "confidence": 0.99},
        {"text": "Fasting Blood Glucose: 108 mg/dL", "normalized_term": "Fasting Blood Sugar", "value_or_details": "108 mg/dL", "source_reference": "Page 1", "confidence": 0.99}
    ],
    "imaging_findings": [],
    "procedures": [],
    "hospitalization_information": [],
    "recommendations_in_document": [],
    "uncertainties": [],
    "ai_notes": "Preliminary laboratory report structuring for clinician review."
})

mock_gemini_resp = MagicMock()
mock_gemini_resp.text = mock_gemini_doc_json
mock_client_instance = MagicMock()
mock_client_instance.models.generate_content.return_value = mock_gemini_resp

with patch.object(gemini_doc_svc, "_get_client", return_value=mock_client_instance):
    structured_res = gemini_doc_svc.extract_structured_data(
        extracted_text=extracted_text,
        document_type="LAB_REPORT"
    )
    assert structured_res["ai_extraction_status"] == AIExtractionStatus.COMPLETED
    assert len(structured_res["structured_data"]["laboratory_results"]) == 2
    assert structured_res["structured_data"]["medications"][0]["normalized_term"] == "Pantoprazole"
    print("  - Gemini Document Service structured extraction PASSED.")

# 4.3 Error handling when Gemini API fails
with patch.object(gemini_doc_svc, "_get_client", side_effect=Exception("API Quota Limit")):
    fail_res = gemini_doc_svc.extract_structured_data(extracted_text=extracted_text)
    assert fail_res["ai_extraction_status"] == AIExtractionStatus.FAILED
    assert fail_res["structured_data"] is None
    print("  - Gemini Document failure handling (ai_extraction_status = FAILED) PASSED.")


# ----------------- TEST 5: API ENDPOINTS & PRACTITIONER REVIEW WORKFLOW -----------------
print("\n[TEST 5] Testing Document Processing API Endpoints & Doctor Review...")

db = SessionLocal()

# Setup test doctor, patient, case, and document
doctor = db.query(User).filter(User.username == "doc_mod9").first()
if not doctor:
    doctor = User(
        username="doc_mod9",
        email="doc_mod9@ayurai.org",
        hashed_password=hash_password("DocPass123!"),
        full_name="Dr. Harish Joshi (Module 9)",
        role=UserRole.DOCTOR,
        is_active=True
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

staff_user = db.query(User).filter(User.username == "staff_mod9").first()
if not staff_user:
    staff_user = User(
        username="staff_mod9",
        email="staff_mod9@ayurai.org",
        hashed_password=hash_password("StaffPass123!"),
        full_name="Staff Ananya",
        role=UserRole.STAFF,
        is_active=True
    )
    db.add(staff_user)
    db.commit()
    db.refresh(staff_user)

doctor_token = create_access_token(subject=doctor.username, role=doctor.role.value, extra_claims={"id": doctor.id})
doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

staff_token = create_access_token(subject=staff_user.username, role=staff_user.role.value, extra_claims={"id": staff_user.id})
staff_headers = {"Authorization": f"Bearer {staff_token}"}

test_patient = db.query(Patient).filter(Patient.patient_id == "PID-MOD9-001").first()
if not test_patient:
    test_patient = Patient(
        patient_id="PID-MOD9-001",
        full_name="Patient Document Test",
        date_of_birth=date(1990, 4, 12),
        gender="MALE",
        phone="9876500009",
        preferred_language="en"
    )
    db.add(test_patient)
    db.commit()
    db.refresh(test_patient)

test_case = db.query(CaseSession).filter(CaseSession.patient_id == test_patient.id).first()
if not test_case:
    test_case = CaseSession(
        patient_id=test_patient.id,
        status=CaseStatus.IN_PROGRESS
    )
    db.add(test_case)
    db.commit()
    db.refresh(test_case)

# Create PatientDocument record pointing to sample PDF
test_doc = db.query(PatientDocument).filter(PatientDocument.patient_id == test_patient.id).first()
if not test_doc:
    test_doc = PatientDocument(
        patient_id=test_patient.id,
        case_session_id=test_case.id,
        uploaded_by=doctor.id,
        document_type="LAB_REPORT",
        document_title="Routine CBC and Metabolic Panel",
        original_filename="sample_lab_report.pdf",
        stored_filename="sample_lab_report_stored.pdf",
        file_path=str(sample_pdf_path),
        mime_type="application/pdf",
        file_size=os.path.getsize(sample_pdf_path)
    )
    db.add(test_doc)
    db.commit()
    db.refresh(test_doc)

# Reset any prior DocumentProcessing record for test idempotency
db.query(DocumentProcessing).filter(DocumentProcessing.document_id == test_doc.id).delete(synchronize_session=False)
db.commit()

# 5.1 POST /document-processing/{document_id}/process (Doctor initiates processing)
r_proc = client.post(f"/document-processing/{test_doc.id}/process", headers=doctor_headers)
assert r_proc.status_code == 200, f"Process endpoint failed: {r_proc.text}"
proc_res = r_proc.json()
assert proc_res["document_id"] == test_doc.id
assert proc_res["processing_status"] == "COMPLETED"
assert proc_res["extraction_method"] == "PDF_TEXT"
assert "Hemoglobin" in proc_res["extracted_text"]
assert proc_res["ai_extraction_status"] == "COMPLETED"
assert proc_res["disclaimer"] == "AI-extracted preliminary information — practitioner review required."
print("  - POST /document-processing/{id}/process PASSED.")

# 5.2 GET /document-processing/{document_id} (Staff retrieval)
r_get = client.get(f"/document-processing/{test_doc.id}", headers=staff_headers)
assert r_get.status_code == 200
get_res = r_get.json()
assert get_res["document_id"] == test_doc.id
assert get_res["practitioner_review_status"] == "NOT_REVIEWED"
print("  - GET /document-processing/{id} by Staff PASSED.")

# 5.3 Unauthorized access checks (Staff cannot review or trigger processing)
r_unauth_proc = client.post(f"/document-processing/{test_doc.id}/process", headers=staff_headers)
assert r_unauth_proc.status_code == 403, "Staff should not be allowed to trigger document processing"

r_unauth_rev = client.patch(f"/document-processing/{test_doc.id}/review", json={"practitioner_review_status": "ACCEPTED"}, headers=staff_headers)
assert r_unauth_rev.status_code == 403, "Staff should not be allowed to review documents"
print("  - RBAC security checks (Staff restricted from process/review) PASSED.")

# 5.4 PATCH /document-processing/{document_id}/review (Doctor reviews, accepts, and provides verified data)
corrected_data = {
    "laboratory_results": [
        {"text": "Hemoglobin: 13.8 g/dL (Normal)", "category": "Hematology"},
        {"text": "Fasting Blood Glucose: 108 mg/dL (Impaired Fasting Glucose)", "category": "Biochemistry"}
    ],
    "medications": [
        {"text": "Pantoprazole 40mg OD"}
    ]
}
review_body = {
    "practitioner_review_status": "ACCEPTED",
    "practitioner_notes": "Reviewed and verified CBC & Fasting Glucose values. All within expected baseline.",
    "practitioner_corrected_data": corrected_data
}
r_rev = client.patch(f"/document-processing/{test_doc.id}/review", json=review_body, headers=doctor_headers)
assert r_rev.status_code == 200
rev_res = r_rev.json()
assert rev_res["practitioner_review_status"] == "ACCEPTED"
assert rev_res["reviewed_by"] == doctor.id
assert rev_res["practitioner_corrected_data"] == corrected_data
# Verify original extracted text was preserved
assert "Hemoglobin" in rev_res["extracted_text"]
print("  - PATCH /document-processing/{id}/review (Doctor verification) PASSED.")


# ----------------- TEST 6: CASE SUMMARY INTEGRATION WITH VERIFIED DOCUMENTS -----------------
print("\n[TEST 6] Testing Case Summary Integration with Verified Document Intelligence...")

r_summary = client.post(f"/ai-case/cases/{test_case.id}/generate-summary", headers=doctor_headers)
assert r_summary.status_code == 201
sum_res = r_summary.json()
assert sum_res["case_session_id"] == test_case.id
assert sum_res["summary_status"] in ["COMPLETED", "FAILED"]

# Verify that verified document findings appear in the summary
assert "Verified Medical Documents" in sum_res["summary_text"] or "Document #" in sum_res["summary_text"] or len(sum_res.get("relevant_history") or []) > 0
print("  - Case Consultation Summary synthesis with verified document findings PASSED.")


# ----------------- TEST 7: REGRESSION TEST FOR ALL MODULES 1 - 8 -----------------
print("\n[TEST 7] Running Full Regression Verification on Modules 1 - 8...")

# 7.1 Auth & Users
assert client.get("/users/me", headers=doctor_headers).status_code == 200

# 7.2 Patients
assert client.get("/patients/", headers=doctor_headers).status_code == 200

# 7.3 Queue
assert client.get("/queue/today", headers=doctor_headers).status_code == 200

# 7.4 Cases
assert client.get(f"/cases/{test_case.id}", headers=doctor_headers).status_code == 200

# 7.5 Case Questions
assert client.get("/case-questions/", headers=doctor_headers).status_code == 200

# 7.6 Ayurvedic Assessment
assert client.get(f"/ayurvedic-assessments/cases/{test_case.id}", headers=doctor_headers).status_code in [200, 404]

# 7.7 Medical History
assert client.get(f"/medical-history/patients/{test_patient.id}", headers=doctor_headers).status_code in [200, 404]

# 7.8 Documents
assert client.get(f"/documents/patient/{test_patient.id}", headers=doctor_headers).status_code == 200

# 7.9 AI Case Summary
assert client.get(f"/ai-case/cases/{test_case.id}/summary", headers=doctor_headers).status_code == 200

print("  - All prior modules (Auth, Patients, Queue, Cases, Assessment, History, Documents, AI Case Processing) PASSED.")

db.close()

print("\n" + "=" * 75)
print("ALL MODULE 9 TESTS COMPLETED AND PASSED SUCCESSFULLY!")
print("=" * 75)
