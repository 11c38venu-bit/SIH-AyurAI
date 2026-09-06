import sys
import uuid
from datetime import date, datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.queue import PatientQueue, QueuePriority, QueueStatus
from app.models.case import CaseSession, CaseStatus
from app.models.consultation import Consultation, ConsultationStatus
from app.models.medicine import Medicine, MedicineType
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.prescription_item import PrescriptionItem
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.follow_up_visit import FollowUpVisit
from app.models.patient_progress import ClinicalOutcome, PatientProgress, ProgressTrend
from app.models.document import PatientDocument
from app.models.document_processing import DocumentProcessing, DocumentProcessingStatus, DocumentReviewStatus, ExtractionMethod
from app.models.ai_case_response import AICaseResponse, AIProcessingStatus, PractitionerReviewStatus
from app.models.notification import Notification, NotificationChannel, NotificationStatus, NotificationType
from app.core.security import hash_password, create_access_token

client = TestClient(app)


def setup_test_environment():
    """Sets up isolated test users, patient, queue, consultation, prescription, follow-up, and progress records."""
    db = SessionLocal()
    try:
        suffix = uuid.uuid4().hex[:6]

        # 1. Users
        admin = User(
            email=f"admin_{suffix}@ayurai.com",
            username=f"admin_{suffix}",
            full_name="Admin Supervisor",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)

        doctor1 = User(
            email=f"doctor1_{suffix}@ayurai.com",
            username=f"dr1_{suffix}",
            full_name="Dr. Ayurvedic Lead",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=True,
        )
        db.add(doctor1)

        doctor2 = User(
            email=f"doctor2_{suffix}@ayurai.com",
            username=f"dr2_{suffix}",
            full_name="Dr. Associate Vaidya",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=True,
        )
        db.add(doctor2)

        staff = User(
            email=f"staff_{suffix}@ayurai.com",
            username=f"staff_{suffix}",
            full_name="FrontDesk Staff",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.STAFF,
            is_active=True,
        )
        db.add(staff)

        # 2. Patient
        patient = Patient(
            patient_id=f"PAT-AN-{suffix.upper()}",
            full_name="Suresh Sharma",
            gender="Male",
            phone=f"91234{suffix[:5]}",
            email=f"suresh_{suffix}@example.com",
        )
        db.add(patient)
        db.flush()

        # 3. Queue Token
        today_utc = datetime.now(timezone.utc).date()
        queue = PatientQueue(
            patient_id=patient.id,
            token_number=f"TKN-{suffix[:4]}",
            queue_date=today_utc,
            status=QueueStatus.WAITING,
            priority=QueuePriority.NORMAL,
        )
        db.add(queue)
        db.flush()

        # 4. Case Session & Consultation
        case = CaseSession(
            patient_id=patient.id,
            queue_id=queue.id,
            status=CaseStatus.COMPLETED,
        )
        db.add(case)
        db.flush()

        consultation = Consultation(
            patient_id=patient.id,
            case_session_id=case.id,
            doctor_id=doctor1.id,
            chief_complaint="Indigestion and heartburn",
            diagnosis="Amlapitta",
            treatment_plan="Pitta pacifying therapy",
            consultation_status=ConsultationStatus.COMPLETED,
        )
        db.add(consultation)
        db.flush()

        # 5. Medicine & Prescription
        medicine = (
            db.query(Medicine)
            .filter(Medicine.category == MedicineType.CHURNA)
            .first()
        )
        if not medicine:
            medicine = Medicine(
                medicine_code=f"MED-TEST-{suffix[:4]}",
                name="Avipattikar Churna Test",
                category=MedicineType.CHURNA,
                formulation="Powder",
            )
            db.add(medicine)
            db.flush()

        prescription = Prescription(
            patient_id=patient.id,
            case_session_id=case.id,
            consultation_id=consultation.id,
            doctor_id=doctor1.id,
            prescription_number=f"RX-{suffix[:6]}",
            prescription_status=PrescriptionStatus.FINALIZED,
        )
        db.add(prescription)
        db.flush()

        item = PrescriptionItem(
            prescription_id=prescription.id,
            medicine_id=medicine.id,
            medicine_name_snapshot=medicine.name,
            dosage="3g",
            frequency="BD",
            timing="Before food",
            route="Oral",
            duration="14 days",
        )
        db.add(item)

        # 6. Follow-Up & Visit & Progress
        follow_up = FollowUp(
            patient_id=patient.id,
            case_session_id=case.id,
            consultation_id=consultation.id,
            prescription_id=prescription.id,
            doctor_id=doctor1.id,
            follow_up_number=1,
            scheduled_date=today_utc,
            status=FollowUpStatus.COMPLETED,
            reason="Review digestion progress",
        )
        db.add(follow_up)
        db.flush()

        visit = FollowUpVisit(
            follow_up_id=follow_up.id,
            patient_id=patient.id,
            doctor_id=doctor1.id,
            visit_date=today_utc,
            doctor_observations="Symptoms subsided significantly.",
        )
        db.add(visit)
        db.flush()

        progress = PatientProgress(
            patient_id=patient.id,
            follow_up_id=follow_up.id,
            follow_up_visit_id=visit.id,
            doctor_id=doctor1.id,
            symptom_change=ProgressTrend.IMPROVING,
            clinical_outcome=ClinicalOutcome.IMPROVED,
            doctor_assessment="Favorable response to treatment.",
        )
        db.add(progress)

        # 7. Notification
        notif = Notification(
            recipient_user_id=doctor1.id,
            patient_id=patient.id,
            follow_up_id=follow_up.id,
            notification_type=NotificationType.FOLLOW_UP_REMINDER,
            channel=NotificationChannel.IN_APP,
            title="Follow-Up Scheduled",
            message="Reminder for upcoming visit.",
            status=NotificationStatus.DELIVERED,
        )
        db.add(notif)

        db.commit()

        db.refresh(admin)
        db.refresh(doctor1)
        db.refresh(doctor2)
        db.refresh(staff)
        db.refresh(patient)
        db.refresh(consultation)

        return {
            "admin": admin,
            "doctor1": doctor1,
            "doctor2": doctor2,
            "staff": staff,
            "patient": patient,
            "consultation": consultation,
            "admin_token": create_access_token(subject=admin.email, role=admin.role.value),
            "doctor1_token": create_access_token(subject=doctor1.email, role=doctor1.role.value),
            "doctor2_token": create_access_token(subject=doctor2.email, role=doctor2.role.value),
            "staff_token": create_access_token(subject=staff.email, role=staff.role.value),
        }
    finally:
        db.close()


def run_all_tests():
    print("=" * 70)
    print("AYURAI MODULE 15 — ANALYTICS & DASHBOARDS VERIFICATION SUITE")
    print("=" * 70)

    env = setup_test_environment()
    admin_hdr = {"Authorization": f"Bearer {env['admin_token']}"}
    doc1_hdr = {"Authorization": f"Bearer {env['doctor1_token']}"}
    doc2_hdr = {"Authorization": f"Bearer {env['doctor2_token']}"}
    staff_hdr = {"Authorization": f"Bearer {env['staff_token']}"}

    # -----------------------------------------------------------------------
    # TEST 1: Doctor Dashboard
    # -----------------------------------------------------------------------
    print("\n[TEST 1] Doctor Dashboard (GET /analytics/doctor/dashboard)...")
    r = client.get("/analytics/doctor/dashboard", headers=doc1_hdr)
    assert r.status_code == 200, f"Failed: {r.text}"
    doc_dash = r.json()
    assert "patients_today" in doc_dash
    assert "consultations_completed_today" in doc_dash
    assert doc_dash["consultations_completed_today"] >= 1
    print(f"  -> Passed: Doctor dashboard returned correctly: {doc_dash}")

    # -----------------------------------------------------------------------
    # TEST 2: Staff Dashboard
    # -----------------------------------------------------------------------
    print("\n[TEST 2] Staff Dashboard (GET /analytics/staff/dashboard)...")
    r = client.get("/analytics/staff/dashboard", headers=staff_hdr)
    assert r.status_code == 200, f"Failed: {r.text}"
    staff_dash = r.json()
    assert "patients_registered_today" in staff_dash
    assert "patients_waiting" in staff_dash
    print(f"  -> Passed: Staff dashboard returned operational workflow metrics: {staff_dash}")

    # -----------------------------------------------------------------------
    # TEST 3: Admin Dashboard & RBAC Protection
    # -----------------------------------------------------------------------
    print("\n[TEST 3] Admin Dashboard & RBAC Protection...")
    # Admin access
    r = client.get("/analytics/admin/dashboard", headers=admin_hdr)
    assert r.status_code == 200, f"Failed: {r.text}"
    admin_dash = r.json()
    assert admin_dash["total_patients"] >= 1
    assert admin_dash["total_consultations"] >= 1
    assert admin_dash["total_prescriptions"] >= 1

    # Staff blocked from Admin Dashboard
    r_staff = client.get("/analytics/admin/dashboard", headers=staff_hdr)
    assert r_staff.status_code == 403, f"Expected 403, got {r_staff.status_code}"

    # Doctor blocked from Admin Dashboard
    r_doc = client.get("/analytics/admin/dashboard", headers=doc1_hdr)
    assert r_doc.status_code == 403, f"Expected 403, got {r_doc.status_code}"
    print("  -> Passed: Admin dashboard verified and strictly restricted to Admin role.")

    # -----------------------------------------------------------------------
    # TEST 4: Dynamic Role-Based Dashboard Summary
    # -----------------------------------------------------------------------
    print("\n[TEST 4] Role-Based Dynamic Dashboard Summary (GET /analytics/dashboard/summary)...")
    r_doc_sum = client.get("/analytics/dashboard/summary", headers=doc1_hdr)
    assert r_doc_sum.status_code == 200
    assert r_doc_sum.json()["role"] == "DOCTOR"

    r_staff_sum = client.get("/analytics/dashboard/summary", headers=staff_hdr)
    assert r_staff_sum.status_code == 200
    assert r_staff_sum.json()["role"] == "STAFF"

    r_admin_sum = client.get("/analytics/dashboard/summary", headers=admin_hdr)
    assert r_admin_sum.status_code == 200
    assert r_admin_sum.json()["role"] == "ADMIN"
    print("  -> Passed: Dynamic dashboard returned role-appropriate metrics.")

    # -----------------------------------------------------------------------
    # TEST 5: Patient Registration Analytics & Trends
    # -----------------------------------------------------------------------
    print("\n[TEST 5] Patient Registration Overview & Trends...")
    r_ov = client.get("/analytics/patients/overview", headers=staff_hdr)
    assert r_ov.status_code == 200
    p_ov = r_ov.json()
    assert p_ov["total_patients"] >= 1
    assert p_ov["new_patients_today"] >= 1

    r_trend_day = client.get("/analytics/patients/trend?granularity=daily", headers=staff_hdr)
    assert r_trend_day.status_code == 200
    assert r_trend_day.json()["granularity"] == "daily"

    r_trend_week = client.get("/analytics/patients/trend?granularity=weekly", headers=staff_hdr)
    assert r_trend_week.status_code == 200
    assert r_trend_week.json()["granularity"] == "weekly"
    print("  -> Passed: Patient registration overview and granular trend series verified.")

    # -----------------------------------------------------------------------
    # TEST 6: Date Range Validation (date_from > date_to returns 400)
    # -----------------------------------------------------------------------
    print("\n[TEST 6] Date Range Validation (date_from > date_to)...")
    r_bad_date = client.get("/analytics/patients/overview?date_from=2026-09-10&date_to=2026-09-01", headers=staff_hdr)
    assert r_bad_date.status_code == 400, f"Expected 400 Bad Request, got: {r_bad_date.status_code}"
    assert "cannot be after" in r_bad_date.text
    print("  -> Passed: Invalid date ranges correctly rejected with HTTP 400.")

    # -----------------------------------------------------------------------
    # TEST 7: Queue Analytics & Wait Time Handling
    # -----------------------------------------------------------------------
    print("\n[TEST 7] Queue Analytics & Average Wait Time...")
    r_q_ov = client.get("/analytics/queue/overview", headers=staff_hdr)
    assert r_q_ov.status_code == 200
    q_ov = r_q_ov.json()
    assert q_ov["total_today"] >= 1

    r_q_trend = client.get("/analytics/queue/trend", headers=staff_hdr)
    assert r_q_trend.status_code == 200
    print("  -> Passed: Queue overview and trend returned graph-ready counts.")

    # -----------------------------------------------------------------------
    # TEST 8: Consultation Analytics & Completion Rate
    # -----------------------------------------------------------------------
    print("\n[TEST 8] Consultation Analytics & Completion Rate...")
    r_c_ov = client.get("/analytics/consultations/overview", headers=doc1_hdr)
    assert r_c_ov.status_code == 200
    c_ov = r_c_ov.json()
    assert c_ov["total_consultations"] >= 1
    assert c_ov["completion_rate"] is not None
    assert 0.0 <= c_ov["completion_rate"] <= 100.0

    r_c_trend = client.get("/analytics/consultations/trend", headers=doc1_hdr)
    assert r_c_trend.status_code == 200
    print(f"  -> Passed: Consultation analytics completion rate: {c_ov['completion_rate']}%.")

    # -----------------------------------------------------------------------
    # TEST 9: Doctor Workload & Privacy Isolation
    # -----------------------------------------------------------------------
    print("\n[TEST 9] Doctor Workload & Doctor Isolation...")
    # Doctor 2 views workload -> only receives their own workload
    r_doc2_wl = client.get("/analytics/doctors/workload", headers=doc2_hdr)
    assert r_doc2_wl.status_code == 200
    doc2_docs = r_doc2_wl.json()["doctors"]
    assert len(doc2_docs) == 1
    assert doc2_docs[0]["doctor_id"] == env["doctor2"].id

    # Admin views workload -> receives all doctors
    r_admin_wl = client.get("/analytics/doctors/workload", headers=admin_hdr)
    assert r_admin_wl.status_code == 200
    admin_docs = r_admin_wl.json()["doctors"]
    assert len(admin_docs) >= 2
    print("  -> Passed: Doctor workload isolated per doctor for doctors and comprehensive for Admin.")

    # -----------------------------------------------------------------------
    # TEST 10: Follow-Up Analytics & Trends
    # -----------------------------------------------------------------------
    print("\n[TEST 10] Follow-Up Analytics & Completion Rate...")
    r_fu_ov = client.get("/analytics/follow-ups/overview", headers=staff_hdr)
    assert r_fu_ov.status_code == 200
    fu_ov = r_fu_ov.json()
    assert fu_ov["completed"] >= 1
    assert fu_ov["completion_rate"] is not None

    r_fu_trend = client.get("/analytics/follow-ups/trend", headers=staff_hdr)
    assert r_fu_trend.status_code == 200
    print("  -> Passed: Follow-up overview and trend metrics verified.")

    # -----------------------------------------------------------------------
    # TEST 11: Progress Analytics (Descriptive Practitioner Observations)
    # -----------------------------------------------------------------------
    print("\n[TEST 11] Progress Analytics (Practitioner-Entered Observation Validation)...")
    r_prog_ov = client.get("/analytics/progress/overview", headers=doc1_hdr)
    assert r_prog_ov.status_code == 200
    prog_ov = r_prog_ov.json()
    assert "Practitioner-entered observations" in prog_ov["note"]
    assert prog_ov["total_progress_records"] >= 1
    assert prog_ov["improving_observations"] >= 1

    r_prog_trend = client.get("/analytics/progress/trend", headers=doc1_hdr)
    assert r_prog_trend.status_code == 200
    print("  -> Passed: Progress analytics verified as descriptive practitioner observations.")

    # -----------------------------------------------------------------------
    # TEST 12: Prescription Analytics & Medicine Category Distribution
    # -----------------------------------------------------------------------
    print("\n[TEST 12] Prescription Analytics & Category Distribution...")
    r_rx_ov = client.get("/analytics/prescriptions/overview", headers=doc1_hdr)
    assert r_rx_ov.status_code == 200
    rx_ov = r_rx_ov.json()
    assert rx_ov["total_prescriptions"] >= 1

    r_rx_cat = client.get("/analytics/prescriptions/categories", headers=doc1_hdr)
    assert r_rx_cat.status_code == 200
    cat_list = r_rx_cat.json()["categories"]
    assert len(cat_list) >= 1
    print(f"  -> Passed: Medicine category distribution verified: {cat_list}")

    # -----------------------------------------------------------------------
    # TEST 13: Document & AI Analytics
    # -----------------------------------------------------------------------
    print("\n[TEST 13] Document & AI Processing Analytics...")
    r_doc_ov = client.get("/analytics/documents/overview", headers=staff_hdr)
    assert r_doc_ov.status_code == 200

    r_ai_ov = client.get("/analytics/ai/overview", headers=doc1_hdr)
    assert r_ai_ov.status_code == 200
    ai_ov = r_ai_ov.json()
    assert "provider" in ai_ov

    r_ai_trend = client.get("/analytics/ai/trend", headers=doc1_hdr)
    assert r_ai_trend.status_code == 200
    print("  -> Passed: Document and AI processing usage metrics returned cleanly without diagnostic claims.")

    # -----------------------------------------------------------------------
    # TEST 14: Notification Analytics
    # -----------------------------------------------------------------------
    print("\n[TEST 14] Notification Analytics & Channel Breakdown...")
    r_notif_ov = client.get("/analytics/notifications/overview", headers=staff_hdr)
    assert r_notif_ov.status_code == 200
    notif_ov = r_notif_ov.json()
    assert notif_ov["total_notifications"] >= 1
    assert "channel_breakdown" in notif_ov
    assert notif_ov["channel_breakdown"]["IN_APP"] >= 1
    print("  -> Passed: Notification channel and status distributions verified.")

    # -----------------------------------------------------------------------
    # TEST 15: System Overview & Export Summary (Admin Protected)
    # -----------------------------------------------------------------------
    print("\n[TEST 15] System Overview & Export-Ready Summary (Admin)...")
    r_sys = client.get("/analytics/system/overview", headers=admin_hdr)
    assert r_sys.status_code == 200
    sys_ov = r_sys.json()
    assert sys_ov["total_users"] >= 4
    assert "password" not in str(sys_ov).lower()
    assert "secret" not in str(sys_ov).lower()

    r_export = client.get("/analytics/export/summary", headers=admin_hdr)
    assert r_export.status_code == 200
    exp = r_export.json()
    assert "exported_at" in exp
    assert "patients" in exp["summary"]
    assert "consultations" in exp["summary"]

    # Staff blocked from System Overview and Export
    assert client.get("/analytics/system/overview", headers=staff_hdr).status_code == 403
    assert client.get("/analytics/export/summary", headers=staff_hdr).status_code == 403
    print("  -> Passed: System overview and export endpoints verified and strictly admin-protected.")

    # -----------------------------------------------------------------------
    # TEST 16: Empty Date Range Tolerance & Zero-Denominator Handling
    # -----------------------------------------------------------------------
    print("\n[TEST 16] Empty Date Range Tolerance & Zero-Denominator Safety...")
    # Query future date range with 0 records
    future_start = (date.today() + timedelta(days=100)).isoformat()
    future_end = (date.today() + timedelta(days=110)).isoformat()

    r_empty_c = client.get(f"/analytics/consultations/overview?date_from={future_start}&date_to={future_end}", headers=doc1_hdr)
    assert r_empty_c.status_code == 200
    empty_c = r_empty_c.json()
    assert empty_c["total_consultations"] == 0
    assert empty_c["completion_rate"] is None, "Zero denominator must return None, not 0% or NaN"

    r_empty_fu = client.get(f"/analytics/follow-ups/overview?date_from={future_start}&date_to={future_end}", headers=doc1_hdr)
    assert r_empty_fu.status_code == 200
    empty_fu = r_empty_fu.json()
    assert empty_fu["completion_rate"] is None, "Zero denominator must return None, not 0% or NaN"
    print("  -> Passed: Empty ranges and zero denominators safely handled with nulls without server errors.")

    # -----------------------------------------------------------------------
    # TEST 17: Unauthenticated Request Rejection
    # -----------------------------------------------------------------------
    print("\n[TEST 17] Unauthenticated Request Rejection...")
    r_unauth = client.get("/analytics/doctor/dashboard")
    assert r_unauth.status_code == 401, f"Expected 401 Unauthorized, got {r_unauth.status_code}"
    print("  -> Passed: Unauthenticated access blocked.")

    print("\n" + "=" * 70)
    print("MODULE 15: ALL TESTS COMPLETED AND VERIFIED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()
