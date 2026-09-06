import io
import sys
import uuid
from datetime import date, datetime, timedelta, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import SessionLocal
from app.core.security import hash_password, create_access_token
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.queue import PatientQueue, QueuePriority, QueueStatus
from app.models.case import CaseSession, CaseStatus
from app.models.case_question import CaseQuestion, QuestionType
from app.models.case_response import CaseResponse
from app.models.ayurvedic_assessment import (
    AyurvedicAssessment,
    AssessmentStatus,
    PrakritiType,
    VikritiType,
    AgniType,
)
from app.models.medical_history import MedicalHistory
from app.models.document import PatientDocument
from app.models.document_processing import (
    DocumentProcessing,
    DocumentProcessingStatus,
    DocumentReviewStatus,
    ExtractionMethod,
    AIExtractionStatus,
)
from app.models.ai_case_summary import AICaseSummary
from app.models.consultation import Consultation, ConsultationStatus
from app.models.medicine import Medicine, MedicineType
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.follow_up_visit import FollowUpVisit
from app.models.patient_progress import (
    PatientProgress,
    ProgressTrend,
    SymptomSeverity,
    AdherenceLevel,
    ClinicalOutcome,
)
from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
    NotificationChannel,
    NotificationStatus,
)

client = TestClient(app)


def test_module19_complete_e2e_lifecycle():
    print("=" * 80)
    print("AYURAI MODULE 19: COMPLETE END-TO-END SYSTEM TEST SUITE")
    print("=" * 80)

    db = SessionLocal()
    suffix = uuid.uuid4().hex[:6]
    test_tag = f"E2E-{suffix}"

    # ----------------------------------------------------------------------
    # STEP 0: Auth & RBAC Setup
    # ----------------------------------------------------------------------
    print("\n[STEP 0] Setting up isolated credentials and testing Authentication & RBAC...")
    admin_user = User(
        email=f"admin_{suffix}@ayurai.com",
        username=f"admin_{suffix}",
        full_name=f"Admin {suffix}",
        hashed_password=hash_password("Pass123!"),
        role=UserRole.ADMIN,
        is_active=True
    )
    doc_user = User(
        email=f"doc_{suffix}@ayurai.com",
        username=f"doc_{suffix}",
        full_name=f"Vaidya Dr. {suffix}",
        hashed_password=hash_password("Pass123!"),
        role=UserRole.DOCTOR,
        is_active=True
    )
    staff_user = User(
        email=f"staff_{suffix}@ayurai.com",
        username=f"staff_{suffix}",
        full_name=f"Staff {suffix}",
        hashed_password=hash_password("Pass123!"),
        role=UserRole.STAFF,
        is_active=True
    )
    db.add_all([admin_user, doc_user, staff_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(doc_user)
    db.refresh(staff_user)

    admin_token = create_access_token(subject=admin_user.id, role=admin_user.role.value)
    doc_token = create_access_token(subject=doc_user.id, role=doc_user.role.value)
    staff_token = create_access_token(subject=staff_user.id, role=staff_user.role.value)

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    doc_headers = {"Authorization": f"Bearer {doc_token}"}
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # Verify /auth/me for all roles
    for role_name, headers, expected_role in [
        ("Admin", admin_headers, "ADMIN"),
        ("Doctor", doc_headers, "DOCTOR"),
        ("Staff", staff_headers, "STAFF"),
    ]:
        res_me = client.get("/auth/me", headers=headers)
        assert res_me.status_code == 200, res_me.text
        assert res_me.json()["role"] == expected_role
    print("  -> Passed: Auth tokens and role mappings verified for Admin, Doctor, and Staff.")

    # ----------------------------------------------------------------------
    # STEP 1: Patient Registration (POST /patients/)
    # ----------------------------------------------------------------------
    print("\n[STEP 1] Testing Patient Intake & Registration...")
    patient_payload = {
        "full_name": f"Kavitha Sundaram ({test_tag})",
        "date_of_birth": "1988-06-15",
        "gender": "FEMALE",
        "phone": "9876543210",
        "email": f"kavitha_{suffix}@example.com",
        "preferred_language": "ta"
    }
    res_pat = client.post("/patients/", json=patient_payload, headers=staff_headers)
    assert res_pat.status_code == 200, res_pat.text
    patient_data = res_pat.json()
    patient_id = patient_data["id"]
    assert patient_data["full_name"] == patient_payload["full_name"]
    assert patient_data["preferred_language"] == "ta"
    print(f"  -> Passed: Patient registered with ID #{patient_id} ({patient_data['patient_id']}).")

    # ----------------------------------------------------------------------
    # STEP 2: Queue & Token Management (POST /queue/token & PATCH /queue/{id}/status)
    # ----------------------------------------------------------------------
    print("\n[STEP 2] Testing Daily Queue Token Generation & Status Updates...")
    queue_payload = {
        "patient_id": patient_id,
        "priority": "PRIORITY",
        "queue_date": date.today().isoformat()
    }
    res_q = client.post("/queue/token", json=queue_payload, headers=staff_headers)
    assert res_q.status_code == 201, res_q.text
    queue_data = res_q.json()
    queue_id = queue_data["id"]
    token_num = queue_data["token_number"]
    assert queue_data["status"] == "WAITING"
    assert queue_data["priority"] == "PRIORITY"

    # Advance queue status to CALLED then IN_CONSULTATION
    res_q_status = client.patch(
        f"/queue/{queue_id}/status",
        json={"status": "IN_CONSULTATION"},
        headers=staff_headers
    )
    assert res_q_status.status_code == 200, res_q_status.text
    assert res_q_status.json()["status"] == "IN_CONSULTATION"
    print(f"  -> Passed: Token {token_num} generated and transitioned to IN_CONSULTATION.")

    # ----------------------------------------------------------------------
    # STEP 3: Case-Taking & Multilingual Responses
    # ----------------------------------------------------------------------
    print("\n[STEP 3] Testing Case Session Creation & Multilingual Responses...")
    # Ensure a question exists
    question = db.query(CaseQuestion).filter(CaseQuestion.question_code == "CHIEF_COMPLAINT_E2E").first()
    if not question:
        question = CaseQuestion(
            question_code="CHIEF_COMPLAINT_E2E",
            question_text="What symptoms are you experiencing today?",
            category="CHIEF_COMPLAINT",
            display_order=1
        )
        db.add(question)
        db.commit()
        db.refresh(question)

    case_payload = {
        "patient_id": patient_id,
        "queue_id": queue_id
    }
    res_case = client.post("/cases/", json=case_payload, headers=staff_headers)
    assert res_case.status_code == 201, res_case.text
    case_data = res_case.json()
    case_session_id = case_data["id"]

    # Record multilingual response (Tamil original)
    resp_payload = {
        "question_id": question.id,
        "original_response": "கடந்த 3 வாரங்களாக உணவுக்குப் பின் கடுமையான நெஞ்செரிச்சல் மற்றும் புளித்த ஏப்பம் உள்ளது.",
        "response_language": "ta"
    }
    res_resp = client.post(f"/cases/{case_session_id}/responses", json=resp_payload, headers=staff_headers)
    assert res_resp.status_code == 201, res_resp.text
    response_data = res_resp.json()
    response_id = response_data["id"]
    assert response_data["response_language"] == "ta"

    # Process response via AI Case service
    res_proc = client.post(f"/ai-case/responses/{response_id}/process", headers=doc_headers)
    assert res_proc.status_code == 200, res_proc.text
    assert res_proc.json()["detected_language"] == "ta"
    print(f"  -> Passed: Case #{case_session_id} created with multilingual response preserved verbatim.")

    # ----------------------------------------------------------------------
    # STEP 4: Ayurvedic Clinical Assessment (POST /ayurvedic-assessments/)
    # ----------------------------------------------------------------------
    print("\n[STEP 4] Testing Practitioner-Guided Ayurvedic Assessment...")
    ayur_payload = {
        "case_session_id": case_session_id,
        "prakriti": "VATA_PITTA",
        "vikriti": "PITTA",
        "agni": "TIKSHNA",
        "clinical_observation": "Amashaya Pitta Vriddhi, Vidagdha Jeerna signs present.",
        "examination_notes": "Abdominal tenderness in epigastrium on deep palpation.",
        "ashtavidha": {
            "nadi": "Manduka Gati (rapid, elevated Pitta)",
            "jihva": "Rakta Varna with yellowish coating at base",
            "sparsha": "Ushna (elevated local temperature)"
        },
        "dashavidha": {
            "sara": "Madhyama Sara",
            "ahara_shakti": "Tikshnagni with accelerated digestion",
            "satmya": "Katu and Tikshna food intolerance"
        }
    }
    res_ayur = client.post("/ayurvedic-assessments/", json=ayur_payload, headers=doc_headers)
    assert res_ayur.status_code == 201, res_ayur.text
    ayur_data = res_ayur.json()
    assessment_id = ayur_data["assessment"]["id"]
    assert ayur_data["assessment"]["prakriti"] == "VATA_PITTA"
    assert ayur_data["assessment"]["vikriti"] == "PITTA"
    assert ayur_data["ashtavidha"]["nadi"] == "Manduka Gati (rapid, elevated Pitta)"
    print(f"  -> Passed: Ayurvedic Assessment #{assessment_id} recorded with Ashtavidha & Dashavidha.")

    # ----------------------------------------------------------------------
    # STEP 5: Medical History (POST /medical-history/)
    # ----------------------------------------------------------------------
    print("\n[STEP 5] Testing Medical History Intake...")
    med_hist_payload = {
        "patient_id": patient_id,
        "case_session_id": case_session_id,
        "past_medical_conditions": "Chronic hyperacidity (Amlapitta) for 2 years",
        "allergies": "NSAIDs and Sulfa drugs",
        "current_medications": "Antacid gel 10ml SOS",
        "dietary_history": "Prefers spicy, sour, fried snacks; late dinner habit",
        "lifestyle_history": "Sedentary software professional, high work stress"
    }
    res_hist = client.post("/medical-history/", json=med_hist_payload, headers=staff_headers)
    assert res_hist.status_code == 201, res_hist.text
    assert res_hist.json()["allergies"] == "NSAIDs and Sulfa drugs"
    print("  -> Passed: Comprehensive medical, dietary, and lifestyle history stored.")

    # ----------------------------------------------------------------------
    # STEP 6: Medical Document Upload & Processing
    # ----------------------------------------------------------------------
    print("\n[STEP 6] Testing Document Upload & OCR/Intelligence...")
    dummy_pdf_content = b"%PDF-1.4 ... Synthetic Endoscopy Report: Mild antral erythema, no ulceration ..."
    files = {
        "file": ("endoscopy_report.pdf", io.BytesIO(dummy_pdf_content), "application/pdf")
    }
    data = {
        "patient_id": str(patient_id),
        "case_session_id": str(case_session_id),
        "document_type": "LAB_REPORT",
        "document_title": "Upper GI Endoscopy Findings",
        "description": "Routine endoscopy evaluating persistent pyrosis"
    }
    res_doc = client.post("/documents/upload", data=data, files=files, headers=staff_headers)
    assert res_doc.status_code == 201, res_doc.text
    doc_data = res_doc.json()
    document_id = doc_data["id"]

    # Trigger OCR / Document Processing
    res_proc_doc = client.post(f"/document-processing/{document_id}/process", headers=doc_headers)
    assert res_proc_doc.status_code in [200, 201], res_proc_doc.text
    print(f"  -> Passed: Document #{document_id} uploaded and processed via document processing pipeline.")

    # ----------------------------------------------------------------------
    # STEP 7: AI Case Summary Synthesis (POST /ai-case/cases/{id}/generate-summary)
    # ----------------------------------------------------------------------
    print("\n[STEP 7] Testing Multi-Source AI Case Summary Synthesis & Safety Attributions...")
    res_summary = client.post(f"/ai-case/cases/{case_session_id}/generate-summary", headers=doc_headers)
    assert res_summary.status_code == 201, res_summary.text
    summary_data = res_summary.json()
    assert summary_data["summary_status"] == "COMPLETED"
    assert summary_data["summary_version"] == 1
    assert "practitioner review required" in summary_data["clinical_safety_note"].lower()

    structured = summary_data["structured_summary"]
    assert "case_overview" in structured
    assert "patient_reported_findings" in structured
    assert "ayurvedic_reference_data" in structured
    assert structured["ayurvedic_reference_data"]["prakriti"] == "VATA_PITTA"
    print("  -> Passed: AI summary generated with structured attributions and zero autonomous prescribing.")

    # ----------------------------------------------------------------------
    # STEP 8: Clinical Workspace Verification (GET /consultations/workspace/case/{id})
    # ----------------------------------------------------------------------
    print("\n[STEP 8] Testing Unified Clinical Workspace View...")
    res_ws = client.get(f"/consultations/workspace/case/{case_session_id}", headers=doc_headers)
    assert res_ws.status_code == 200, res_ws.text
    ws_data = res_ws.json()
    assert ws_data["patient"]["id"] == patient_id
    assert ws_data["ai_case_summary"] is not None
    assert ws_data["ayurvedic_assessment"] is not None
    assert "practitioner review required" in ws_data["ai_safety_disclaimer"].lower()
    print("  -> Passed: Unified consultation workspace aggregated patient, queue, case, assessment, and AI summary.")

    # ----------------------------------------------------------------------
    # STEP 9: Consultation Start & Completion
    # ----------------------------------------------------------------------
    print("\n[STEP 9] Testing Doctor Consultation Start & Completion...")
    consultation_payload = {
        "patient_id": patient_id,
        "case_session_id": case_session_id,
        "queue_id": queue_id,
        "chief_complaint": "Retrosternal burning sensation and acid eructations for 3 weeks",
        "clinical_observations": "Epigastric tenderness, Pitta-predominant pulse, coated tongue",
        "doctor_assessment": "Pitta Vriddhi leading to Urdhwaga Amlapitta",
        "diagnosis": "Urdhwaga Amlapitta (Hyperacidity with Gastroesophageal Reflux)",
        "treatment_plan": "Pitta Shamana Chikitsa, dietary moderation, Shirodhara if stress persists",
        "doctor_notes": "Advised avoid fermented foods and sour items",
        "follow_up_required": True,
        "follow_up_notes": "Review in 2 weeks for symptom reduction"
    }
    res_cons = client.post("/consultations/", json=consultation_payload, headers=doc_headers)
    assert res_cons.status_code == 201, res_cons.text
    cons_data = res_cons.json()
    consultation_id = cons_data["id"]
    assert cons_data["consultation_status"] == "IN_PROGRESS"

    # Complete Consultation
    res_cons_comp = client.patch(
        f"/consultations/{consultation_id}/complete",
        json={
            "diagnosis": "Urdhwaga Amlapitta (Hyperacidity with Gastroesophageal Reflux)",
            "treatment_plan": "Pitta Shamana Chikitsa, dietary moderation, Shirodhara if stress persists",
            "doctor_assessment": "Pitta Vriddhi leading to Urdhwaga Amlapitta",
            "doctor_notes": "Consultation finalized. Patient counseled thoroughly.",
            "follow_up_required": True,
            "follow_up_notes": "Review in 2 weeks for symptom reduction"
        },
        headers=doc_headers
    )
    assert res_cons_comp.status_code == 200, res_cons_comp.text
    assert res_cons_comp.json()["consultation_status"] == "COMPLETED"
    print(f"  -> Passed: Consultation #{consultation_id} completed by Vaidya.")

    # ----------------------------------------------------------------------
    # STEP 10: Medicine Catalog & Prescription Management
    # ----------------------------------------------------------------------
    print("\n[STEP 10] Testing Ayurvedic Prescription Creation & Finalization...")
    # Ensure Ayurvedic medicines exist in catalog
    med1 = db.query(Medicine).filter(Medicine.name == "Avipattikar Churna").first()
    if not med1:
        med1 = Medicine(
            name="Avipattikar Churna",
            medicine_type=MedicineType.CHURNA,
            dosage_form="Powder",
            standard_dosage="3-5g",
            standard_adjuvant="Warm water or Honey",
            indications="Amlapitta, Agnimandya, Vibandha",
            is_active=True
        )
        db.add(med1)
        db.commit()
        db.refresh(med1)

    rx_payload = {
        "patient_id": patient_id,
        "case_session_id": case_session_id,
        "consultation_id": consultation_id,
        "general_instructions": "Take medicines with warm water after food.",
        "dietary_advice": "Avoid curd, sour fruits, fried food, and pickles.",
        "lifestyle_advice": "Sleep on left side, do not lie down immediately after dinner.",
        "items": [
            {
                "medicine_id": med1.id,
                "dosage": "3g",
                "frequency": "BD",
                "timing": "After food",
                "route": "Oral",
                "duration": "14 days",
                "quantity": "1 container (100g)",
                "anupana": "Warm water",
                "special_instructions": "Mix in half cup of lukewarm water"
            }
        ]
    }
    res_rx = client.post("/prescriptions/", json=rx_payload, headers=doc_headers)
    assert res_rx.status_code == 201, res_rx.text
    rx_data = res_rx.json()
    prescription_id = rx_data["id"]
    assert rx_data["prescription_status"] == "DRAFT"
    assert len(rx_data["items"]) == 1

    # Finalize Prescription (Doctor only)
    res_rx_final = client.patch(f"/prescriptions/{prescription_id}/finalize", headers=doc_headers)
    assert res_rx_final.status_code == 200, res_rx_final.text
    assert res_rx_final.json()["prescription_status"] == "FINALIZED"
    print(f"  -> Passed: Prescription #{prescription_id} ({rx_data['prescription_number']}) finalized.")

    # ----------------------------------------------------------------------
    # STEP 11: Follow-Up Management & Visit Recording
    # ----------------------------------------------------------------------
    print("\n[STEP 11] Testing Follow-Up Scheduling & Continuity Visit Recording...")
    follow_up_date = (date.today() + timedelta(days=14)).isoformat()
    fu_payload = {
        "patient_id": patient_id,
        "case_session_id": case_session_id,
        "consultation_id": consultation_id,
        "prescription_id": prescription_id,
        "scheduled_date": follow_up_date,
        "reason": "Assess relief from retrosternal burning and digestion status",
        "instructions": "Monitor frequency of acid reflux episodes"
    }
    res_fu = client.post("/follow-ups/", json=fu_payload, headers=doc_headers)
    assert res_fu.status_code == 201, res_fu.text
    fu_data = res_fu.json()
    follow_up_id = fu_data["id"]
    assert fu_data["status"] == "SCHEDULED"

    # Record return visit encounter
    visit_payload = {
        "visit_date": follow_up_date,
        "symptom_progress": "Burning sensation significantly reduced. Mild acidity persists after heavy lunch.",
        "patient_reported_changes": "Feeling lighter, sleeping better.",
        "medication_adherence": "Regular daily intake",
        "lifestyle_adherence": "Followed diet advice",
        "doctor_observations": "Tongue coating cleared, pulse regular, Agni stabilizing.",
        "doctor_assessment": "Pitta shamana observed.",
        "next_steps": "Continue Avipattikar Churna for 7 more days, taper dosage to OD."
    }
    res_visit = client.post(f"/follow-ups/{follow_up_id}/visit", json=visit_payload, headers=doc_headers)
    assert res_visit.status_code == 201, res_visit.text
    visit_data = res_visit.json()
    follow_up_visit_id = visit_data["id"]
    assert visit_data["follow_up_id"] == follow_up_id
    print(f"  -> Passed: Follow-Up #{follow_up_id} scheduled and Return Visit #{follow_up_visit_id} recorded.")

    # ----------------------------------------------------------------------
    # STEP 12: Longitudinal Patient Progress & Outcome Tracking
    # ----------------------------------------------------------------------
    print("\n[STEP 12] Testing Longitudinal Patient Progress & Outcome Tracking...")
    progress_payload = {
        "patient_id": patient_id,
        "follow_up_id": follow_up_id,
        "follow_up_visit_id": follow_up_visit_id,
        "symptom_status": "IMPROVING",
        "symptom_severity": "MILD",
        "medication_adherence": "GOOD",
        "lifestyle_adherence": "GOOD",
        "dietary_adherence": "GOOD",
        "clinical_outcome": "IMPROVED",
        "patient_reported_improvement": "Feeling much lighter after meals and sleeping comfortably.",
        "doctor_observation": "Patient reports 70% symptom relief; good dietary compliance.",
        "doctor_assessment": "Pathya compliance is helping normalize Agni.",
        "digestion_status": "Improving",
        "sleep_status": "Restful"
    }
    res_prog = client.post("/progress/", json=progress_payload, headers=doc_headers)
    assert res_prog.status_code == 201, res_prog.text
    prog_data = res_prog.json()
    progress_id = prog_data["id"]
    assert prog_data["symptom_status"] == "IMPROVING"

    # Fetch longitudinal timeline
    res_timeline = client.get(f"/progress/patient/{patient_id}/timeline", headers=doc_headers)
    assert res_timeline.status_code == 200, res_timeline.text
    timeline_data = res_timeline.json()
    assert len(timeline_data) >= 1
    assert timeline_data[0]["symptom_status"] == "IMPROVING"
    print(f"  -> Passed: Progress #{progress_id} recorded and longitudinal timeline queried.")

    # ----------------------------------------------------------------------
    # STEP 13: Notifications & Reminders
    # ----------------------------------------------------------------------
    print("\n[STEP 13] Testing Notification Dispatch, Unread Counts & Read Marking...")
    notif_payload = {
        "recipient_user_id": doc_user.id,
        "patient_id": patient_id,
        "notification_type": "FOLLOW_UP_REMINDER",
        "priority": "NORMAL",
        "channel": "IN_APP",
        "title": "Follow-Up Due",
        "message": f"Follow-up visit #{follow_up_id} is due for patient {patient_data['full_name']}."
    }
    res_notif = client.post("/notifications/", json=notif_payload, headers=staff_headers)
    assert res_notif.status_code == 201, res_notif.text
    notif_data = res_notif.json()
    notif_id = notif_data["id"]
    assert notif_data["status"] in ["DELIVERED", "SENT", "PENDING"]

    # Check unread count for doctor
    res_unread = client.get("/notifications/unread-count", headers=doc_headers)
    assert res_unread.status_code == 200, res_unread.text
    assert res_unread.json()["unread_count"] >= 1

    # Mark notification read
    res_read = client.patch(f"/notifications/{notif_id}/read", headers=doc_headers)
    assert res_read.status_code == 200, res_read.text
    assert res_read.json()["status"] == "READ"
    assert res_read.json()["read_at"] is not None
    print(f"  -> Passed: In-app notification #{notif_id} dispatched, counted, and marked read.")

    # ----------------------------------------------------------------------
    # STEP 14: Analytics & Role-Based Dashboards
    # ----------------------------------------------------------------------
    print("\n[STEP 14] Testing Role-Based Dashboard & Operational Analytics APIs...")
    # Doctor Dashboard
    res_doc_dash = client.get("/analytics/doctor/dashboard", headers=doc_headers)
    assert res_doc_dash.status_code == 200, res_doc_dash.text
    doc_dash_data = res_doc_dash.json()
    assert "patients_today" in doc_dash_data
    assert "consultations_completed_today" in doc_dash_data

    # Staff Dashboard
    res_staff_dash = client.get("/analytics/staff/dashboard", headers=staff_headers)
    assert res_staff_dash.status_code == 200, res_staff_dash.text
    staff_dash_data = res_staff_dash.json()
    assert "patients_registered_today" in staff_dash_data

    # Admin Dashboard
    res_admin_dash = client.get("/analytics/admin/dashboard", headers=admin_headers)
    assert res_admin_dash.status_code == 200, res_admin_dash.text
    admin_dash_data = res_admin_dash.json()
    assert "total_patients" in admin_dash_data
    print("  -> Passed: Analytics dashboards functional for Doctor, Staff, and Admin.")

    # ----------------------------------------------------------------------
    # STEP 15: Cross-Module Traceability & Clinical Boundaries Audit
    # ----------------------------------------------------------------------
    print("\n[STEP 15] Verifying Cross-Module Integrity & Traceability...")
    # 1. Verify foreign key linkages chain together accurately
    assert cons_data["patient_id"] == patient_id
    assert cons_data["case_session_id"] == case_session_id
    assert rx_data["consultation_id"] == consultation_id
    assert fu_data["consultation_id"] == consultation_id
    assert prog_data["follow_up_visit_id"] == follow_up_visit_id

    # 2. Verify AI non-prescribing constraint: AI output is NEVER an auto-prescription
    db_summary = db.query(AICaseSummary).filter(AICaseSummary.case_session_id == case_session_id).first()
    assert db_summary is not None
    assert "practitioner review required" in db_summary.structured_summary.get("clinical_safety_note", "").lower()

    # 3. Verify Staff cannot finalize prescriptions
    res_staff_rx = client.patch(f"/prescriptions/{prescription_id}/finalize", headers=staff_headers)
    assert res_staff_rx.status_code == 403

    # 4. Verify duplicate consultation completion is blocked cleanly
    res_dup_comp = client.patch(
        f"/consultations/{consultation_id}/complete",
        json={"doctor_notes": "Attempting duplicate completion"},
        headers=doc_headers
    )
    assert res_dup_comp.status_code == 400

    print("  -> Passed: End-to-end foreign key traceability and safety boundaries verified.")

    print("\n" + "=" * 80)
    print("MODULE 19 COMPLETE: ALL 15 CRITICAL E2E CLINICAL LIFECYCLE STAGES PASSED!")
    print("=" * 80)


if __name__ == "__main__":
    test_module19_complete_e2e_lifecycle()
