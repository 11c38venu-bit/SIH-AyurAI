import sys
import uuid
from datetime import date, datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.case import CaseSession, CaseStatus
from app.models.consultation import Consultation, ConsultationStatus
from app.models.ayurvedic_assessment import AgniType, AyurvedicAssessment, PrakritiType, VikritiType
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.prescription_item import PrescriptionItem
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.follow_up_visit import FollowUpVisit
from app.models.patient_progress import (
    AdherenceLevel,
    ClinicalOutcome,
    PatientProgress,
    ProgressTrend,
    SymptomSeverity,
)
from app.models.patient_progress_audit import PatientProgressAudit
from app.core.security import hash_password, create_access_token

client = TestClient(app)


def setup_test_environment():
    """Sets up isolated test users, patient, consultation, follow-up, and follow-up visits."""
    db = SessionLocal()
    try:
        suffix = uuid.uuid4().hex[:6]

        # 1. Admin user
        admin = User(
            email=f"admin_{suffix}@ayurai.com",
            username=f"admin_{suffix}",
            full_name="Admin Supervisor",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)

        # 2. Doctor user
        doctor = User(
            email=f"doctor_{suffix}@ayurai.com",
            username=f"dr_{suffix}",
            full_name="Vaidya Dr. Joshi",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=True
        )
        db.add(doctor)

        # 3. Staff user
        staff = User(
            email=f"staff_{suffix}@ayurai.com",
            username=f"staff_{suffix}",
            full_name="Care Coordinator",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.STAFF,
            is_active=True
        )
        db.add(staff)

        # 4. Inactive user
        inactive = User(
            email=f"inactive_{suffix}@ayurai.com",
            username=f"inactive_{suffix}",
            full_name="Inactive User",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=False
        )
        db.add(inactive)
        db.flush()

        # 5. Patients (Patient 1 and Patient 2 for cross-patient isolation)
        patient1 = Patient(
            patient_id=f"PID-PROG-{suffix}-1",
            full_name="Sunita Rao",
            gender="FEMALE",
            phone=f"98811{suffix[:5]}",
            email=f"sunita_{suffix}@example.com"
        )
        patient2 = Patient(
            patient_id=f"PID-PROG-{suffix}-2",
            full_name="Alok Verma",
            gender="MALE",
            phone=f"98822{suffix[:5]}",
            email=f"alok_{suffix}@example.com"
        )
        db.add(patient1)
        db.add(patient2)
        db.flush()

        # 6. Case Sessions
        case1 = CaseSession(patient_id=patient1.id, status=CaseStatus.COMPLETED)
        case2 = CaseSession(patient_id=patient2.id, status=CaseStatus.COMPLETED)
        db.add(case1)
        db.add(case2)
        db.flush()

        # 7. Initial Consultation & Assessment
        consultation1 = Consultation(
            patient_id=patient1.id,
            case_session_id=case1.id,
            doctor_id=doctor.id,
            consultation_status=ConsultationStatus.COMPLETED,
            chief_complaint="Amlapitta (Hyperacidity) and burning sensation in epigastrium",
            diagnosis="Amlapitta (Pitta vitiation)",
            treatment_plan="Avipattikar Churna 5g BD with warm water + Pathya diet",
            consultation_completed_at=datetime.now(timezone.utc)
        )
        assessment1 = AyurvedicAssessment(
            patient_id=patient1.id,
            case_session_id=case1.id,
            practitioner_id=doctor.id,
            prakriti=PrakritiType.PITTA,
            vikriti=VikritiType.PITTA,
            agni=AgniType.TIKSHNA,
            is_practitioner_verified=True
        )
        db.add(consultation1)
        db.add(assessment1)
        db.flush()

        # 8. Prescription
        prescription1 = Prescription(
            prescription_number=f"RX-2026-PROG-{suffix.upper()}",
            patient_id=patient1.id,
            case_session_id=case1.id,
            consultation_id=consultation1.id,
            doctor_id=doctor.id,
            prescription_status=PrescriptionStatus.FINALIZED,
            general_instructions="Take Avipattikar Churna with lukewarm water before meals.",
            finalized_at=datetime.now(timezone.utc)
        )
        db.add(prescription1)
        db.flush()

        rx_item = PrescriptionItem(
            prescription_id=prescription1.id,
            medicine_name_snapshot="Avipattikar Churna",
            formulation_snapshot="Churna",
            strength_snapshot="5 g",
            dosage="5 grams",
            frequency="Twice daily (BD)",
            timing="Before food",
            route="Oral",
            duration="21 days",
            quantity="150 grams",
            anupana="Warm water",
            item_order=1
        )
        db.add(rx_item)
        db.flush()

        # 9. Follow-Up 1 & Visit 1 (Patient 1)
        follow_up1 = FollowUp(
            patient_id=patient1.id,
            case_session_id=case1.id,
            consultation_id=consultation1.id,
            prescription_id=prescription1.id,
            doctor_id=doctor.id,
            follow_up_number=1,
            scheduled_date=date.today() - timedelta(days=14),
            reason="Review acidity and epigastric burning after 2 weeks",
            status=FollowUpStatus.COMPLETED,
            completed_at=datetime.now(timezone.utc) - timedelta(days=14)
        )
        db.add(follow_up1)
        db.flush()

        visit1 = FollowUpVisit(
            follow_up_id=follow_up1.id,
            patient_id=patient1.id,
            doctor_id=doctor.id,
            visit_date=date.today() - timedelta(days=14),
            symptom_progress="Heartburn reduced moderately from daily to 2-3 times a week.",
            medication_adherence="Good (took regularly before meals)",
            adverse_effects_reported="Mild loose stools on day 2, resolved spontaneously."
        )
        db.add(visit1)
        db.flush()

        # 10. Follow-Up 2 & Visit 2 (Patient 1)
        follow_up2 = FollowUp(
            patient_id=patient1.id,
            case_session_id=case1.id,
            consultation_id=consultation1.id,
            prescription_id=prescription1.id,
            doctor_id=doctor.id,
            follow_up_number=2,
            scheduled_date=date.today(),
            reason="1-month review of Amlapitta management",
            status=FollowUpStatus.COMPLETED,
            completed_at=datetime.now(timezone.utc)
        )
        db.add(follow_up2)
        db.flush()

        visit2 = FollowUpVisit(
            follow_up_id=follow_up2.id,
            patient_id=patient1.id,
            doctor_id=doctor.id,
            visit_date=date.today(),
            symptom_progress="Acidity completely absent during regular meals. Excellent digestion.",
            medication_adherence="Good (adhered strictly)",
            adverse_effects_reported="None"
        )
        db.add(visit2)
        db.flush()

        # 11. Follow-Up & Visit for Patient 2 (Isolation check)
        follow_up_p2 = FollowUp(
            patient_id=patient2.id,
            case_session_id=case2.id,
            consultation_id=consultation1.id,  # Will test cross-check
            doctor_id=doctor.id,
            follow_up_number=1,
            scheduled_date=date.today(),
            reason="Patient 2 follow up",
            status=FollowUpStatus.COMPLETED
        )
        db.add(follow_up_p2)
        db.flush()

        visit_p2 = FollowUpVisit(
            follow_up_id=follow_up_p2.id,
            patient_id=patient2.id,
            doctor_id=doctor.id,
            visit_date=date.today(),
            symptom_progress="Patient 2 initial review."
        )
        db.add(visit_p2)
        db.commit()

        # Generate tokens
        admin_token = create_access_token(subject=admin.username, role=admin.role.value, extra_claims={"id": admin.id})
        doctor_token = create_access_token(subject=doctor.username, role=doctor.role.value, extra_claims={"id": doctor.id})
        staff_token = create_access_token(subject=staff.username, role=staff.role.value, extra_claims={"id": staff.id})
        inactive_token = create_access_token(subject=inactive.username, role=inactive.role.value, extra_claims={"id": inactive.id})

        return {
            "admin_token": admin_token,
            "doctor_token": doctor_token,
            "staff_token": staff_token,
            "inactive_token": inactive_token,
            "patient1_id": patient1.id,
            "patient2_id": patient2.id,
            "follow_up1_id": follow_up1.id,
            "follow_up2_id": follow_up2.id,
            "follow_up_p2_id": follow_up_p2.id,
            "visit1_id": visit1.id,
            "visit2_id": visit2.id,
            "visit_p2_id": visit_p2.id,
            "doctor_id": doctor.id,
            "suffix": suffix
        }
    finally:
        db.close()


def test_progress_creation_and_constraints(test_data):
    print("\n--- Testing Progress Record Creation, RBAC & 1:1 Constraints ---")
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}
    inactive_hdr = {"Authorization": f"Bearer {test_data['inactive_token']}"}

    # 1. Inactive user rejected -> 403 Forbidden
    res = client.post("/progress/", json={}, headers=inactive_hdr)
    assert res.status_code == 403
    print("  [PASS] Inactive user rejected (HTTP 403)")

    # 2. Staff user attempting to create progress record -> 403 Forbidden
    payload1 = {
        "patient_id": test_data["patient1_id"],
        "follow_up_id": test_data["follow_up1_id"],
        "follow_up_visit_id": test_data["visit1_id"],
        "symptom_status": "IMPROVING",
        "symptom_change": "Heartburn frequency reduced by ~60%",
        "symptom_severity": "MILD",
        "patient_reported_improvement": "Able to sleep flat without acid regurgitation",
        "medication_adherence": "GOOD",
        "adverse_effects": "Mild initial bowel looseness",
        "lifestyle_adherence": "GOOD",
        "dietary_adherence": "PARTIAL",
        "sleep_status": "Improved",
        "appetite_status": "Moderate (Sama)",
        "digestion_status": "Much improved",
        "energy_status": "Good",
        "bowel_habit_status": "Regular",
        "general_wellbeing": "Good",
        "doctor_observation": "Epigastric tenderness significantly reduced on palpation.",
        "doctor_assessment": "Pitta pacification underway. Positive therapeutic trajectory.",
        "clinical_outcome": "IMPROVED",
        "next_review_required": True,
        "next_review_notes": "Follow-up #2 in 2 weeks"
    }
    res = client.post("/progress/", json=payload1, headers=staff_hdr)
    assert res.status_code == 403
    print("  [PASS] Staff blocked from creating progress record (HTTP 403)")

    # 3. Cross-patient validation: Mismatched Patient and Follow-Up -> 400 Bad Request
    mismatched_payload = dict(payload1)
    mismatched_payload["patient_id"] = test_data["patient2_id"]  # Patient 2 with FollowUp 1!
    res = client.post("/progress/", json=mismatched_payload, headers=doctor_hdr)
    assert res.status_code == 400
    print(f"  [PASS] Cross-patient mismatch correctly rejected: {res.json()['detail']}")

    # 4. Doctor creates Progress Record #1 for Visit 1
    res = client.post("/progress/", json=payload1, headers=doctor_hdr)
    assert res.status_code == 201, f"Doctor create progress failed: {res.text}"
    prog1 = res.json()
    assert prog1["symptom_status"] == "IMPROVING"
    assert prog1["clinical_outcome"] == "IMPROVED"
    assert len(prog1["audit_logs"]) >= 1
    print(f"  [PASS] Doctor created Progress Record #1 (ID: {prog1['id']}) for Visit 1")

    # 5. 1:1 Visit Constraint: Creating second progress record on same follow_up_visit_id -> 400 Bad Request
    res = client.post("/progress/", json=payload1, headers=doctor_hdr)
    assert res.status_code == 400, f"Duplicate visit progress should fail: {res.status_code}"
    print(f"  [PASS] 1:1 Visit constraint enforced: {res.json()['detail']}")

    # 6. Doctor creates Progress Record #2 for Visit 2
    payload2 = {
        "patient_id": test_data["patient1_id"],
        "follow_up_id": test_data["follow_up2_id"],
        "follow_up_visit_id": test_data["visit2_id"],
        "symptom_status": "IMPROVING",
        "symptom_change": "No heartburn or acidity reported in last 10 days",
        "symptom_severity": "NONE",
        "patient_reported_improvement": "Feels completely normalized",
        "medication_adherence": "GOOD",
        "adverse_effects": None,
        "lifestyle_adherence": "GOOD",
        "dietary_adherence": "GOOD",
        "sleep_status": "Sound sleep 7-8 hrs",
        "appetite_status": "Normal healthy appetite",
        "digestion_status": "Optimal",
        "energy_status": "Excellent",
        "bowel_habit_status": "Regular daily",
        "general_wellbeing": "Significantly Improved",
        "doctor_observation": "Tongue clean, no epigastric discomfort, pulse balanced.",
        "doctor_assessment": "Pitta vitiation resolved. Agni stabilized.",
        "clinical_outcome": "IMPROVED",
        "next_review_required": False,
        "next_review_notes": "SOS only"
    }
    res = client.post("/progress/", json=payload2, headers=doctor_hdr)
    assert res.status_code == 201
    prog2 = res.json()
    print(f"  [PASS] Doctor created Progress Record #2 (ID: {prog2['id']}) for Visit 2")

    return prog1["id"], prog2["id"]


def test_progress_retrieval_and_analytics(test_data, prog1_id, prog2_id):
    print("\n--- Testing Progress Retrieval, Timeline, Comparison & Analytics ---")
    admin_hdr = {"Authorization": f"Bearer {test_data['admin_token']}"}
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    # 1. Get Progress by ID (Staff can view)
    res = client.get(f"/progress/{prog1_id}", headers=staff_hdr)
    assert res.status_code == 200
    assert res.json()["id"] == prog1_id
    print(f"  [PASS] Retrieved Progress ID {prog1_id} via GET /progress/{prog1_id}")

    # 2. Chronological Progress Timeline (Oldest -> Newest)
    res = client.get(f"/progress/patient/{test_data['patient1_id']}/timeline", headers=staff_hdr)
    assert res.status_code == 200
    timeline = res.json()
    assert len(timeline) >= 2
    assert timeline[0]["progress_id"] == prog1_id
    assert timeline[1]["progress_id"] == prog2_id
    print(f"  [PASS] Timeline sorted chronologically (Count: {len(timeline)})")

    # 3. Latest Progress
    res = client.get(f"/progress/patient/{test_data['patient1_id']}/latest", headers=staff_hdr)
    assert res.status_code == 200
    latest = res.json()
    assert latest["id"] == prog2_id
    print(f"  [PASS] Latest progress record verified (ID: {latest['id']})")

    # 4. Filtered Progress History
    res = client.get(f"/progress/patient/{test_data['patient1_id']}?outcome=IMPROVED", headers=staff_hdr)
    assert res.status_code == 200
    assert len(res.json()) >= 2
    print("  [PASS] Filtered progress history by outcome=IMPROVED")

    # 5. Side-by-Side Comparison
    res = client.get(
        f"/progress/patient/{test_data['patient1_id']}/compare?from_progress_id={prog1_id}&to_progress_id={prog2_id}",
        headers=staff_hdr
    )
    assert res.status_code == 200, f"Comparison failed: {res.text}"
    comp = res.json()
    assert comp["changes"]["symptom_severity"]["from"] == "MILD"
    assert comp["changes"]["symptom_severity"]["to"] == "NONE"
    assert comp["changes"]["symptom_severity"]["changed"] is True
    print("  [PASS] Side-by-side comparison verified without automated clinical inferences")

    # 6. Cross-Patient Comparison Rejection -> 400 Bad Request
    # Create progress for patient 2
    payload_p2 = {
        "patient_id": test_data["patient2_id"],
        "follow_up_id": test_data["follow_up_p2_id"],
        "follow_up_visit_id": test_data["visit_p2_id"],
        "symptom_status": "STABLE",
        "symptom_severity": "MODERATE",
        "clinical_outcome": "STABLE"
    }
    res = client.post("/progress/", json=payload_p2, headers=doctor_hdr)
    assert res.status_code == 201
    prog_p2_id = res.json()["id"]

    res = client.get(
        f"/progress/patient/{test_data['patient1_id']}/compare?from_progress_id={prog1_id}&to_progress_id={prog_p2_id}",
        headers=staff_hdr
    )
    assert res.status_code == 400
    print("  [PASS] Cross-patient comparison correctly rejected (HTTP 400)")

    # 7. Descriptive Summary Statistics
    res = client.get(f"/progress/patient/{test_data['patient1_id']}/summary", headers=staff_hdr)
    assert res.status_code == 200
    summary = res.json()
    assert summary["total_recorded_progress"] == 2
    assert summary["improving_observations_count"] == 2
    print(f"  [PASS] Descriptive statistics: {summary['improving_observations_count']} visits marked IMPROVING")

    # 8. Clinical Outcome History
    res = client.get(f"/progress/patient/{test_data['patient1_id']}/outcome", headers=staff_hdr)
    assert res.status_code == 200
    outcome = res.json()
    assert outcome["latest_clinical_outcome"] == "IMPROVED"
    assert len(outcome["historical_outcomes"]) == 2
    print("  [PASS] Practitioner-entered clinical outcome history retrieved")

    # 9. Symptom Trend Tracking (Graph-Ready)
    res = client.get(f"/progress/patient/{test_data['patient1_id']}/symptom-trend", headers=staff_hdr)
    assert res.status_code == 200
    trends = res.json()
    assert len(trends) == 2
    assert trends[0]["status"] == "IMPROVING"
    assert trends[1]["severity"] == "NONE"
    print(f"  [PASS] Symptom trend data formatted for frontend charting (Data points: {len(trends)})")

    # 10. Adherence History
    res = client.get(f"/progress/patient/{test_data['patient1_id']}/adherence", headers=staff_hdr)
    assert res.status_code == 200
    adh = res.json()
    assert len(adh) == 2
    assert adh[0]["medication_adherence"] == "GOOD"
    print("  [PASS] Adherence history timeline verified")

    # 11. Adverse Effect History
    res = client.get(f"/progress/patient/{test_data['patient1_id']}/adverse-effects", headers=staff_hdr)
    assert res.status_code == 200
    adv = res.json()
    assert len(adv) == 1
    assert "Mild initial bowel looseness" in adv[0]["adverse_effects"]
    print("  [PASS] Historical patient-reported adverse effects retrieved")

    # 12. Longitudinal Progress Workspace
    res = client.get(f"/progress/workspace/patient/{test_data['patient1_id']}", headers=staff_hdr)
    assert res.status_code == 200, f"Workspace failed: {res.text}"
    ws = res.json()
    assert ws["patient"]["id"] == test_data["patient1_id"]
    assert ws["initial_consultation"] is not None
    assert ws["latest_assessment"] is not None
    assert ws["latest_prescription"] is not None
    assert ws["latest_progress"] is not None
    assert len(ws["progress_timeline"]) == 2
    assert len(ws["symptom_trend"]) == 2
    assert len(ws["adherence_history"]) == 2
    assert "disclaimer" in ws
    print("  [PASS] Longitudinal Progress Workspace aggregated successfully across all clinical dimensions")


def test_progress_updates_and_audit(test_data, prog1_id):
    print("\n--- Testing Progress Updates, Audit Trail & Safety Guardrails ---")
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    # 1. Staff attempts to update progress -> 403 Forbidden
    res = client.patch(f"/progress/{prog1_id}", json={"general_wellbeing": "Staff change"}, headers=staff_hdr)
    assert res.status_code == 403
    print("  [PASS] Staff blocked from updating progress record (HTTP 403)")

    # 2. Doctor updates progress record
    update_payload = {
        "dietary_adherence": "GOOD",
        "doctor_observation": "Corrected observation: Epigastric tenderness completely absent.",
        "general_wellbeing": "Very Good"
    }
    res = client.patch(f"/progress/{prog1_id}", json=update_payload, headers=doctor_hdr)
    assert res.status_code == 200
    updated_prog = res.json()
    assert updated_prog["dietary_adherence"] == "GOOD"
    assert "Corrected observation" in updated_prog["doctor_observation"]
    assert len(updated_prog["audit_logs"]) >= 2
    assert updated_prog["audit_logs"][0]["action"] == "UPDATED"
    print(f"  [PASS] Doctor updated progress record. Audit logs count: {len(updated_prog['audit_logs'])}")


def main():
    print("=" * 70)
    print("AYURAI MODULE 13: PATIENT PROGRESS & OUTCOME TRACKING VERIFICATION")
    print("=" * 70)

    test_data = setup_test_environment()
    prog1_id, prog2_id = test_progress_creation_and_constraints(test_data)
    test_progress_retrieval_and_analytics(test_data, prog1_id, prog2_id)
    test_progress_updates_and_audit(test_data, prog1_id)

    print("\n" + "=" * 70)
    print("ALL MODULE 13 TESTS PASSED SUCCESSFULLY (100% PASS RATE)!")
    print("=" * 70)


if __name__ == "__main__":
    main()
