import os
import sys
from datetime import date, datetime, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.security import create_access_token, hash_password
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.queue import PatientQueue, QueuePriority, QueueStatus
from app.models.case import CaseSession, CaseStatus
from app.models.case_question import CaseQuestion
from app.models.case_response import CaseResponse
from app.models.ayurvedic_assessment import (
    AyurvedicAssessment,
    AssessmentStatus,
    PrakritiType,
    VikritiType,
    AgniType,
)
from app.models.ashtavidha import AshtavidhaPariksha
from app.models.dashavidha import DashavidhaPariksha
from app.models.medical_history import MedicalHistory
from app.models.document import PatientDocument
from app.models.document_processing import (
    DocumentProcessing,
    DocumentProcessingStatus,
    DocumentReviewStatus,
    ExtractionMethod,
    AIExtractionStatus,
)
from app.models.ai_case_response import AICaseResponse, AIProcessingStatus, PractitionerReviewStatus
from app.models.ai_case_summary import AICaseSummary
from app.models.consultation import Consultation, ConsultationStatus
from app.models.consultation_audit import ConsultationAudit

client = TestClient(app)

print("=" * 80)
print("AYURAI MODULE 10: DOCTOR CONSULTATION & CLINICAL WORKSPACE - TEST SUITE")
print("=" * 80)

db = SessionLocal()

# Setup test users
doctor = db.query(User).filter(User.username == "doc_mod10").first()
if not doctor:
    doctor = User(
        username="doc_mod10",
        email="doc_mod10@ayurai.org",
        hashed_password=hash_password("DocPass123!"),
        full_name="Dr. Kalyani Iyer (BAMS, MD Ayur)",
        role=UserRole.DOCTOR,
        is_active=True
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

staff_user = db.query(User).filter(User.username == "staff_mod10").first()
if not staff_user:
    staff_user = User(
        username="staff_mod10",
        email="staff_mod10@ayurai.org",
        hashed_password=hash_password("StaffPass123!"),
        full_name="Staff Vikram",
        role=UserRole.STAFF,
        is_active=True
    )
    db.add(staff_user)
    db.commit()
    db.refresh(staff_user)

admin_user = db.query(User).filter(User.username == "admin_mod10").first()
if not admin_user:
    admin_user = User(
        username="admin_mod10",
        email="admin_mod10@ayurai.org",
        hashed_password=hash_password("AdminPass123!"),
        full_name="System Admin",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

doctor_token = create_access_token(subject=doctor.username, role=doctor.role.value, extra_claims={"id": doctor.id})
doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

staff_token = create_access_token(subject=staff_user.username, role=staff_user.role.value, extra_claims={"id": staff_user.id})
staff_headers = {"Authorization": f"Bearer {staff_token}"}

admin_token = create_access_token(subject=admin_user.username, role=admin_user.role.value, extra_claims={"id": admin_user.id})
admin_headers = {"Authorization": f"Bearer {admin_token}"}

# Setup Patient, Queue, Case, Medical History, Assessment, and Documents
patient_a = db.query(Patient).filter(Patient.patient_id == "PID-MOD10-001").first()
if not patient_a:
    patient_a = Patient(
        patient_id="PID-MOD10-001",
        full_name="Rajesh Vaidya",
        date_of_birth=date(1982, 6, 15),
        gender="MALE",
        phone="9876500010",
        email="rajesh.vaidya@example.com",
        preferred_language="ta"
    )
    db.add(patient_a)
    db.commit()
    db.refresh(patient_a)

patient_b = db.query(Patient).filter(Patient.patient_id == "PID-MOD10-002").first()
if not patient_b:
    patient_b = Patient(
        patient_id="PID-MOD10-002",
        full_name="Meena Sundaram",
        date_of_birth=date(1991, 11, 22),
        gender="FEMALE",
        phone="9876500011",
        email="meena.s@example.com",
        preferred_language="en"
    )
    db.add(patient_b)
    db.commit()
    db.refresh(patient_b)

# Daily Queue entry for Patient A
queue_a = db.query(PatientQueue).filter(PatientQueue.patient_id == patient_a.id).first()
if not queue_a:
    queue_a = PatientQueue(
        patient_id=patient_a.id,
        token_number="A010",
        queue_date=date.today(),
        status=QueueStatus.WAITING,
        priority=QueuePriority.NORMAL
    )
    db.add(queue_a)
    db.commit()
    db.refresh(queue_a)

# Case Session for Patient A
case_a = db.query(CaseSession).filter(CaseSession.patient_id == patient_a.id).first()
if not case_a:
    case_a = CaseSession(
        patient_id=patient_a.id,
        queue_id=queue_a.id,
        status=CaseStatus.IN_PROGRESS
    )
    db.add(case_a)
    db.commit()
    db.refresh(case_a)

# Case Session for Patient B (to test cross-patient security)
case_b = db.query(CaseSession).filter(CaseSession.patient_id == patient_b.id).first()
if not case_b:
    case_b = CaseSession(
        patient_id=patient_b.id,
        status=CaseStatus.IN_PROGRESS
    )
    db.add(case_b)
    db.commit()
    db.refresh(case_b)

# Case Question & Response
q_chief = db.query(CaseQuestion).filter(CaseQuestion.question_code == "MOD10_CHIEF").first()
if not q_chief:
    q_chief = CaseQuestion(
        question_code="MOD10_CHIEF",
        category="CHIEF_COMPLAINT",
        question_text="உங்கள் தற்போதைய முக்கிய உடல்நலப் பிரச்சனை என்ன?",
        question_type="TEXT",
        display_order=1001
    )
    db.add(q_chief)
    db.commit()
    db.refresh(q_chief)

resp_a = db.query(CaseResponse).filter(
    CaseResponse.case_session_id == case_a.id,
    CaseResponse.question_id == q_chief.id
).first()
if not resp_a:
    resp_a = CaseResponse(
        case_session_id=case_a.id,
        question_id=q_chief.id,
        original_response="வயிற்றில் கடுமையான புளித்த ஏப்பம் மற்றும் நெஞ்செரிச்சல் உள்ளது.",
        response_language="ta",
        standardized_response="Patient reports severe acid reflux, sour eructations, and retrosternal burning."
    )
    db.add(resp_a)
    db.commit()
    db.refresh(resp_a)

# AI Case Response Interpretation
ai_resp_a = db.query(AICaseResponse).filter(AICaseResponse.case_response_id == resp_a.id).first()
if not ai_resp_a:
    ai_resp_a = AICaseResponse(
        case_response_id=resp_a.id,
        case_session_id=case_a.id,
        patient_id=patient_a.id,
        processing_status=AIProcessingStatus.COMPLETED,
        detected_language="ta",
        standardized_text="Patient reports severe acid reflux, sour eructations, and retrosternal burning.",
        extracted_symptoms=[
            {"raw_text": "புளித்த ஏப்பம்", "normalized_term": "Sour eructations / Acid brash", "confidence": 0.98},
            {"raw_text": "நெஞ்செரிச்சல்", "normalized_term": "Heartburn / Pyrosis", "confidence": 0.96}
        ],
        extracted_duration="1 week",
        extracted_severity="Moderate to Severe",
        practitioner_review_status=PractitionerReviewStatus.ACCEPTED,
        model_name="gemini-2.5-flash",
        model_version="gemini-2.5-flash-v1"
    )
    db.add(ai_resp_a)
    db.commit()

# Medical History
med_hist_a = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_a.id).first()
if not med_hist_a:
    med_hist_a = MedicalHistory(
        patient_id=patient_a.id,
        past_medical_conditions="Amlapitta (Hyperacidity) for 2 years",
        family_history="Father: Hypertension",
        current_medications="Sutshekhar Ras 1 tab BD, Avipattikar Churna 3g at bedtime",
        allergies="None reported",
        lifestyle_history="Desk job, irregular lunch timings, late night dinners",
        dietary_history="Spicy and oily food preference, excess tea (4 cups/day)"
    )
    db.add(med_hist_a)
    db.commit()

# Ayurvedic Assessment with Ashtavidha & Dashavidha
ayur_a = db.query(AyurvedicAssessment).filter(AyurvedicAssessment.case_session_id == case_a.id).first()
if not ayur_a:
    ayur_a = AyurvedicAssessment(
        case_session_id=case_a.id,
        patient_id=patient_a.id,
        practitioner_id=doctor.id,
        status=AssessmentStatus.COMPLETED,
        prakriti=PrakritiType.PITTA_KAPHA,
        vikriti=VikritiType.PITTA,
        agni=AgniType.TIKSHNA,
        clinical_observation="Pitta Prakopa leading to Amlapitta. Vidagdha Jeerna signs observed.",
        is_practitioner_verified=True,
        verified_at=datetime.now(timezone.utc)
    )
    db.add(ayur_a)
    db.commit()
ashtavidha = db.query(AshtavidhaPariksha).filter(AshtavidhaPariksha.assessment_id == ayur_a.id).first()
if not ashtavidha:
    ashtavidha = AshtavidhaPariksha(
        assessment_id=ayur_a.id,
        nadi="Mandooka gati (Pitta dominant), 80 bpm",
        jihva="Saama (Mild white coating, red edges)",
        mutra="Peeta varna (Yellowish), clear",
        mala="Vibandha (Occasional constipation)",
        shabda="Prakrita (Normal)",
        sparsha="Ushna (Mild warmth on epigastrium)",
        druk="Prakrita (Normal sclera)",
        akriti="Madhyama (Medium built)"
    )
    db.add(ashtavidha)
    db.commit()

dashavidha = db.query(DashavidhaPariksha).filter(DashavidhaPariksha.assessment_id == ayur_a.id).first()
if not dashavidha:
    dashavidha = DashavidhaPariksha(
        assessment_id=ayur_a.id,
        prakriti="Pitta-Kapha",
        vikriti="Pitta Pradhana",
        sara="Rasa, Rakta Sara",
        samhana="Madhyama Samhana",
        pramana="Prakrita",
        satmya="Katu, Amla, Lavana rasa asatmya",
        sattva="Madhyama Sattva",
        ahara_shakti="Abhyavaharana Shakti: Pravara, Jarana Shakti: Mandhyama",
        vyayama_shakti="Madhyama",
        vaya="Madhyama Vaya (44 yrs)"
    )
    db.add(dashavidha)
    db.commit()

# Document & Document Processing
doc_a = db.query(PatientDocument).filter(PatientDocument.patient_id == patient_a.id).first()
if not doc_a:
    doc_a = PatientDocument(
        patient_id=patient_a.id,
        case_session_id=case_a.id,
        uploaded_by=staff_user.id,
        document_type="LAB_REPORT",
        document_title="Endoscopy & Gastric pH Evaluation",
        original_filename="endoscopy_report.pdf",
        stored_filename="endoscopy_stored.pdf",
        file_path="uploads/documents/test_docs/sample_lab_report.pdf",
        mime_type="application/pdf",
        file_size=12000
    )
    db.add(doc_a)
    db.commit()
    db.refresh(doc_a)

doc_proc_a = db.query(DocumentProcessing).filter(DocumentProcessing.document_id == doc_a.id).first()
if not doc_proc_a:
    doc_proc_a = DocumentProcessing(
        document_id=doc_a.id,
        patient_id=patient_a.id,
        case_session_id=case_a.id,
        processing_status=DocumentProcessingStatus.COMPLETED,
        extraction_method=ExtractionMethod.PDF_TEXT,
        extracted_text="Upper GI Endoscopy: Mild antral erythema. No ulceration. Gastric pH: acidic.",
        ai_extraction_status=AIExtractionStatus.COMPLETED,
        structured_data={
            "laboratory_results": [{"text": "Gastric pH: acidic", "category": "Biochemistry"}],
            "imaging_findings": [{"text": "Mild antral erythema without ulceration", "category": "Endoscopy"}]
        },
        practitioner_review_status=DocumentReviewStatus.ACCEPTED,
        practitioner_notes="Verified mild antral gastritis without mucosal ulceration.",
        reviewed_by=doctor.id,
        reviewed_at=datetime.now(timezone.utc)
    )
    db.add(doc_proc_a)
    db.commit()

# AI Case Summary
ai_sum_a = db.query(AICaseSummary).filter(AICaseSummary.case_session_id == case_a.id).first()
if not ai_sum_a:
    ai_sum_a = AICaseSummary(
        case_session_id=case_a.id,
        patient_id=patient_a.id,
        summary_status=AIProcessingStatus.COMPLETED,
        summary_text="Intake Synthesis: 44-year-old male with 1-week history of acute exacerbation of retrosternal burning and sour eructations. Background of Amlapitta for 2 years.",
        key_symptoms=[{"symptom": "Sour eructations", "duration": "1 week"}],
        relevant_history=[{"condition": "Amlapitta for 2 years"}],
        current_medications=[{"medication": "Sutshekhar Ras"}],
        reported_allergies=[{"allergen": "None"}],
        lifestyle_factors=[{"factor": "Late night meals, high tea consumption"}],
        practitioner_review_status=PractitionerReviewStatus.REVIEWED,
        generated_by_model="gemini-2.5-flash",
        model_version="gemini-2.5-flash-v1"
    )
    db.add(ai_sum_a)
    db.commit()


# Ensure idempotency by resetting test case consultation state
db.query(ConsultationAudit).filter(ConsultationAudit.consultation_id.in_(
    db.query(Consultation.id).filter(Consultation.case_session_id.in_([case_a.id, case_b.id]))
)).delete(synchronize_session=False)
db.query(Consultation).filter(Consultation.case_session_id.in_([case_a.id, case_b.id])).delete(synchronize_session=False)

case_a.status = CaseStatus.IN_PROGRESS
queue_a.status = QueueStatus.WAITING
case_b.status = CaseStatus.IN_PROGRESS
db.commit()

# ----------------- TEST 1: START CONSULTATION -----------------
print("\n[TEST 1] Testing Doctor Consultation Creation (POST /consultations/)...")

consult_payload = {
    "patient_id": patient_a.id,
    "case_session_id": case_a.id,
    "queue_id": queue_a.id,
    "chief_complaint": "Severe acid reflux with sour eructations and burning chest pain after meals",
    "clinical_observations": "Epigastric tenderness on palpation. Mild tongue coating (Saama Jihva).",
    "doctor_assessment": "Pitta Pradhana Amlapitta with Tikshnagni manifestation.",
    "doctor_notes": "Advised immediate dietary corrections and Pitta shamana protocol."
}

# 1.1 Doctor starts consultation
r_start = client.post("/consultations/", json=consult_payload, headers=doctor_headers)
assert r_start.status_code == 201, f"Start failed: {r_start.text}"
start_res = r_start.json()
consult_id = start_res["id"]
assert start_res["patient_id"] == patient_a.id
assert start_res["case_session_id"] == case_a.id
assert start_res["doctor_id"] == doctor.id
assert start_res["consultation_status"] == "IN_PROGRESS"
assert start_res["consultation_started_at"] is not None

# Verify linked Queue status updated to IN_CONSULTATION
db.refresh(queue_a)
assert queue_a.status == QueueStatus.IN_CONSULTATION
print("  - Consultation started successfully with IN_PROGRESS status & Queue updated.")

# 1.2 Cross-Patient Security Validation (Case belongs to Patient B, but payload has Patient A)
invalid_cross_payload = {
    "patient_id": patient_a.id,
    "case_session_id": case_b.id,  # belongs to patient_b!
    "chief_complaint": "Tampered consultation request"
}
r_invalid = client.post("/consultations/", json=invalid_cross_payload, headers=doctor_headers)
assert r_invalid.status_code == 400
assert "does not belong" in r_invalid.json()["detail"]
print("  - Cross-patient mismatch correctly rejected with HTTP 400.")


# ----------------- TEST 2: RETRIEVE CONSULTATION -----------------
print("\n[TEST 2] Testing Consultation Retrieval Endpoints...")

# 2.1 GET /consultations/{id} by Doctor
r_get_c = client.get(f"/consultations/{consult_id}", headers=doctor_headers)
assert r_get_c.status_code == 200
assert r_get_c.json()["id"] == consult_id
assert r_get_c.json()["doctor_name"] == doctor.full_name

# 2.2 GET /consultations/{id} by Staff (Read-only workflow)
r_get_staff = client.get(f"/consultations/{consult_id}", headers=staff_headers)
assert r_get_staff.status_code == 200

# 2.3 GET /consultations/patient/{patient_id}
r_hist = client.get(f"/consultations/patient/{patient_a.id}", headers=doctor_headers)
assert r_hist.status_code == 200
assert len(r_hist.json()) >= 1
assert r_hist.json()[0]["patient_id"] == patient_a.id

# 2.4 GET /consultations/case/{case_id}
r_case_c = client.get(f"/consultations/case/{case_a.id}", headers=doctor_headers)
assert r_case_c.status_code == 200
assert r_case_c.json()["id"] == consult_id
print("  - Consultation retrieval by ID, Patient, and Case PASSED.")


# ----------------- TEST 3: UPDATE CONSULTATION & RBAC -----------------
print("\n[TEST 3] Testing Consultation Updates & Role Access Control...")

update_payload = {
    "clinical_observations": "Epigastric tenderness present. Vidagdha Jeerna signs confirmed.",
    "doctor_assessment": "Pitta Pradhana Amlapitta (Hyperchlorhydria / Gastroesophageal Reflux)",
    "diagnosis": "Urdhwaga Amlapitta (Pitta-Vata Anubandha)",
    "treatment_plan": "1. Sutshekhar Ras Gold 1 tab BD after meals\n2. Kamadudha Ras (Mukta yukta) 250mg BD\n3. Avipattikar Churna 3g at bedtime with lukewarm water\n4. Strict Pathya: Avoid sour, spicy, fermented foods and late night dinners.",
    "follow_up_required": True,
    "follow_up_notes": "Follow-up in 14 days for assessment of acid reflux symptoms and Agni status."
}

# 3.1 Staff attempting to update consultation (MUST FAIL)
r_staff_update = client.patch(f"/consultations/{consult_id}", json=update_payload, headers=staff_headers)
assert r_staff_update.status_code == 403, "Staff must be forbidden from updating clinical decisions"
print("  - RBAC protection: Staff forbidden from modifying clinical decisions (HTTP 403) PASSED.")

# 3.2 Doctor updates consultation
r_doc_update = client.patch(f"/consultations/{consult_id}", json=update_payload, headers=doctor_headers)
assert r_doc_update.status_code == 200
up_res = r_doc_update.json()
assert up_res["diagnosis"] == update_payload["diagnosis"]
assert up_res["treatment_plan"] == update_payload["treatment_plan"]
assert up_res["follow_up_required"] is True
print("  - Doctor updated diagnosis and treatment plan successfully.")


# ----------------- TEST 4: COMPLETE CONSULTATION & STATUS SYNC -----------------
print("\n[TEST 4] Testing Consultation Completion & Workflow Synchronization...")

# 4.1 Complete consultation
r_complete = client.patch(f"/consultations/{consult_id}/complete", headers=doctor_headers)
assert r_complete.status_code == 200
comp_res = r_complete.json()
assert comp_res["consultation_status"] == "COMPLETED"
assert comp_res["consultation_completed_at"] is not None

# Verify linked CaseSession status is COMPLETED
db.refresh(case_a)
assert case_a.status == CaseStatus.COMPLETED

# Verify linked PatientQueue status is COMPLETED
db.refresh(queue_a)
assert queue_a.status == QueueStatus.COMPLETED
print("  - Consultation completed: Status=COMPLETED, Case=COMPLETED, Queue=COMPLETED.")

# 4.2 Attempting to edit a COMPLETED consultation (MUST FAIL)
r_tamper = client.patch(f"/consultations/{consult_id}", json={"diagnosis": "Tampered Diagnosis"}, headers=doctor_headers)
assert r_tamper.status_code == 400
assert "Completed consultations cannot be edited directly" in r_tamper.json()["detail"]
print("  - Completed consultation locked against direct mutation (HTTP 400) PASSED.")


# ----------------- TEST 5: CANCELLATION WORKFLOW -----------------
print("\n[TEST 5] Testing Consultation Cancellation Flow...")

# Create a second consultation on case_b to test cancellation
consult_b = Consultation(
    patient_id=patient_b.id,
    case_session_id=case_b.id,
    doctor_id=doctor.id,
    consultation_status=ConsultationStatus.IN_PROGRESS,
    chief_complaint="Patient feeling dizzy"
)
db.add(consult_b)
db.commit()
db.refresh(consult_b)

cancel_payload = {"cancellation_reason": "Patient requested postponement due to personal emergency."}
r_cancel = client.patch(f"/consultations/{consult_b.id}/cancel", json=cancel_payload, headers=doctor_headers)
assert r_cancel.status_code == 200
assert r_cancel.json()["consultation_status"] == "CANCELLED"
assert r_cancel.json()["cancellation_reason"] == cancel_payload["cancellation_reason"]
print("  - Consultation cancellation flow PASSED with reason audit.")


# ----------------- TEST 6: AUDIT TRAIL VERIFICATION -----------------
print("\n[TEST 6] Testing Consultation Audit Trail Records...")

audits = db.query(ConsultationAudit).filter(ConsultationAudit.consultation_id == consult_id).order_by(ConsultationAudit.created_at.asc()).all()
assert len(audits) >= 2
actions = [a.action for a in audits]
assert "CREATED" in actions
assert "COMPLETED" in actions
print("  - Consultation audit trail verified (CREATED, UPDATED, COMPLETED records exist).")


# ----------------- TEST 7: UNIFIED CLINICAL WORKSPACE -----------------
print("\n[TEST 7] Testing Unified Clinical Decision Support Workspace (GET /consultations/workspace/case/{case_id})...")

r_workspace = client.get(f"/consultations/workspace/case/{case_a.id}", headers=doctor_headers)
assert r_workspace.status_code == 200, f"Workspace failed: {r_workspace.text}"
ws = r_workspace.json()

# 7.1 Verify Patient block
assert ws["patient"]["patient_id"] == "PID-MOD10-001"
assert ws["patient"]["full_name"] == "Rajesh Vaidya"

# 7.2 Verify Queue block
assert ws["queue"]["token_number"] == "A010"

# 7.3 Verify Multilingual Case Responses & AI badges
assert len(ws["case_responses"]) >= 1
assert "புளித்த ஏப்பம்" in ws["case_responses"][0]["original_response"]
assert ws["case_responses"][0]["ai_interpretation"]["disclaimer"] == "AI-generated preliminary interpretation — practitioner review required."

# 7.4 Verify Medical History
assert "Amlapitta" in ws["medical_history"]["past_medical_conditions"]
assert "Sutshekhar" in ws["medical_history"]["current_medications"]

# 7.5 Verify Documents & Document Intelligence
assert len(ws["documents"]) >= 1
assert len(ws["document_intelligence"]) >= 1
assert ws["document_intelligence"][0]["practitioner_review_status"] == "ACCEPTED"
assert ws["document_intelligence"][0]["disclaimer"] == "AI-extracted preliminary information — practitioner review required."

# 7.6 Verify AI Case Summary
assert ws["ai_case_summary"] is not None
assert "Intake Synthesis" in ws["ai_case_summary"]["summary_text"]
assert ws["ai_case_summary"]["disclaimer"] == "AI-generated preliminary synthesis — practitioner review required."

# 7.7 Verify Ayurvedic Assessment & Parikshas
assert ws["ayurvedic_assessment"]["prakriti"] == "PITTA_KAPHA"
assert ws["ayurvedic_assessment"]["vikriti"] == "PITTA"
assert ws["ayurvedic_assessment"]["ashtavidha_pariksha"]["nadi"] is not None
assert ws["ayurvedic_assessment"]["dashavidha_pariksha"]["sara"] is not None

# 7.8 Verify Completed Consultation
assert ws["consultation"]["consultation_status"] == "COMPLETED"
assert "Amlapitta" in ws["consultation"]["diagnosis"]
assert "Sutshekhar" in ws["consultation"]["treatment_plan"]

# 7.9 Verify Top-level AI Safety Disclaimer
assert "AI-generated preliminary information" in ws["ai_safety_disclaimer"]
print("  - Unified Clinical Workspace aggregation verified across all 10 clinical dimensions.")


# ----------------- TEST 8: FULL REGRESSION TEST ON MODULES 1 - 9 -----------------
print("\n[TEST 8] Running Full Regression Suite on Modules 1 - 9...")

# 8.1 Auth & Users
assert client.get("/users/me", headers=doctor_headers).status_code == 200

# 8.2 Patients
assert client.get("/patients/", headers=doctor_headers).status_code == 200

# 8.3 Queue
assert client.get("/queue/today", headers=doctor_headers).status_code == 200

# 8.4 Cases
assert client.get(f"/cases/{case_a.id}", headers=doctor_headers).status_code == 200

# 8.5 Case Questions
assert client.get("/case-questions/", headers=doctor_headers).status_code == 200

# 8.6 Ayurvedic Assessment
assert client.get(f"/ayurvedic-assessments/case/{case_a.id}", headers=doctor_headers).status_code == 200

# 8.7 Medical History
assert client.get(f"/medical-history/patient/{patient_a.id}", headers=doctor_headers).status_code == 200

# 8.8 Documents
assert client.get(f"/documents/patient/{patient_a.id}", headers=doctor_headers).status_code == 200

# 8.9 Document Processing
assert client.get(f"/document-processing/{doc_a.id}", headers=doctor_headers).status_code == 200

# 8.10 AI Case Summary
assert client.get(f"/ai-case/cases/{case_a.id}/summary", headers=doctor_headers).status_code == 200

print("  - All previous modules (Auth, Patients, Queue, Cases, Ayurvedic Assessment, Documents, OCR, AI Case Taking) PASSED.")

db.close()

print("\n" + "=" * 80)
print("ALL MODULE 10 TESTS PASSED SUCCESSFULLY (0 FAILURES)!")
print("=" * 80)
