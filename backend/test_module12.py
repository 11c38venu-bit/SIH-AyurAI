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
from app.models.medicine import Medicine, MedicineType
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.prescription_item import PrescriptionItem
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.follow_up_visit import FollowUpVisit
from app.models.follow_up_audit import FollowUpAudit
from app.core.security import hash_password, create_access_token

client = TestClient(app)


def setup_test_data():
    """Sets up isolated test users, patients, case sessions, consultations, and prescriptions."""
    db = SessionLocal()
    try:
        suffix = uuid.uuid4().hex[:6]

        # 1. Admin user
        admin = User(
            email=f"admin_{suffix}@ayurai.com",
            username=f"admin_{suffix}",
            full_name="Admin Test User",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)

        # 2. Doctor user
        doctor = User(
            email=f"doctor_{suffix}@ayurai.com",
            username=f"dr_{suffix}",
            full_name="Vaidya Dr. Kulkarni",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=True
        )
        db.add(doctor)

        # 3. Staff user
        staff = User(
            email=f"staff_{suffix}@ayurai.com",
            username=f"staff_{suffix}",
            full_name="Clinic Coordinator",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.STAFF,
            is_active=True
        )
        db.add(staff)

        # 4. Inactive user for security tests
        inactive_user = User(
            email=f"inactive_{suffix}@ayurai.com",
            username=f"inactive_{suffix}",
            full_name="Inactive User",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=False
        )
        db.add(inactive_user)
        db.flush()

        # 5. Patients
        patient1 = Patient(
            patient_id=f"PID-FUP-{suffix}-1",
            full_name="Ananya Sen",
            gender="FEMALE",
            phone=f"98711{suffix[:5]}",
            email=f"ananya_{suffix}@example.com"
        )
        patient2 = Patient(
            patient_id=f"PID-FUP-{suffix}-2",
            full_name="Vikram Seth",
            gender="MALE",
            phone=f"98722{suffix[:5]}",
            email=f"vikram_{suffix}@example.com"
        )
        db.add(patient1)
        db.add(patient2)
        db.flush()

        # 6. Case Sessions
        case1 = CaseSession(
            patient_id=patient1.id,
            status=CaseStatus.IN_PROGRESS
        )
        case2 = CaseSession(
            patient_id=patient2.id,
            status=CaseStatus.IN_PROGRESS
        )
        db.add(case1)
        db.add(case2)
        db.flush()

        # 7. Consultations
        consultation1 = Consultation(
            patient_id=patient1.id,
            case_session_id=case1.id,
            doctor_id=doctor.id,
            consultation_status=ConsultationStatus.COMPLETED,
            chief_complaint="Recurrent migraine and Pitta imbalance",
            diagnosis="Ardhavabhedaka (Migraine / Pitta vitiation)",
            treatment_plan="Pathya diet, Brahmi Ghrita, and follow-up in 2 weeks",
            consultation_completed_at=datetime.now(timezone.utc)
        )
        consultation2 = Consultation(
            patient_id=patient2.id,
            case_session_id=case2.id,
            doctor_id=doctor.id,
            consultation_status=ConsultationStatus.COMPLETED,
            chief_complaint="Lower back stiffness",
            diagnosis="Kati Shula (Vata vyadhi)",
            treatment_plan="Mahanarayana Taila Abhyanga",
            consultation_completed_at=datetime.now(timezone.utc)
        )
        db.add(consultation1)
        db.add(consultation2)
        db.flush()

        # 8. Prescription for Patient 1
        prescription1 = Prescription(
            prescription_number=f"RX-2026-{suffix.upper()}",
            patient_id=patient1.id,
            case_session_id=case1.id,
            consultation_id=consultation1.id,
            doctor_id=doctor.id,
            prescription_status=PrescriptionStatus.FINALIZED,
            general_instructions="Take Brahmi Ghrita with warm milk on empty stomach.",
            finalized_at=datetime.now(timezone.utc)
        )
        db.add(prescription1)
        db.flush()

        rx_item = PrescriptionItem(
            prescription_id=prescription1.id,
            medicine_name_snapshot="Brahmi Ghrita",
            formulation_snapshot="Medicated Ghee",
            strength_snapshot="5 g",
            dosage="5 grams",
            frequency="Once daily morning",
            timing="Early morning empty stomach",
            route="Oral",
            duration="14 days",
            quantity="150 grams",
            anupana="Warm milk",
            item_order=1
        )
        db.add(rx_item)
        db.commit()

        # Generate tokens
        admin_token = create_access_token(subject=admin.username, role=admin.role.value, extra_claims={"id": admin.id})
        doctor_token = create_access_token(subject=doctor.username, role=doctor.role.value, extra_claims={"id": doctor.id})
        staff_token = create_access_token(subject=staff.username, role=staff.role.value, extra_claims={"id": staff.id})
        inactive_token = create_access_token(subject=inactive_user.username, role=inactive_user.role.value, extra_claims={"id": inactive_user.id})

        return {
            "admin_token": admin_token,
            "doctor_token": doctor_token,
            "staff_token": staff_token,
            "inactive_token": inactive_token,
            "admin_id": admin.id,
            "doctor_id": doctor.id,
            "staff_id": staff.id,
            "patient1_id": patient1.id,
            "patient2_id": patient2.id,
            "case1_id": case1.id,
            "case2_id": case2.id,
            "consultation1_id": consultation1.id,
            "consultation2_id": consultation2.id,
            "prescription1_id": prescription1.id,
            "suffix": suffix
        }
    finally:
        db.close()


def test_follow_up_creation_and_validation(test_data):
    print("\n--- Testing Follow-Up Creation, Sequential Numbering & Validation ---")
    admin_hdr = {"Authorization": f"Bearer {test_data['admin_token']}"}
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}
    inactive_hdr = {"Authorization": f"Bearer {test_data['inactive_token']}"}

    today = datetime.now(timezone.utc).date()
    future_date_1 = today + timedelta(days=14)
    past_date = today - timedelta(days=3)

    # 1. Inactive user authentication -> 403 Forbidden
    res = client.post("/follow-ups/", json={}, headers=inactive_hdr)
    assert res.status_code == 403, f"Inactive user must be rejected: {res.status_code}"
    print("  [PASS] Inactive user rejected (HTTP 403)")

    # 2. Staff user attempting to create follow-up -> 403 Forbidden
    payload_valid = {
        "patient_id": test_data["patient1_id"],
        "case_session_id": test_data["case1_id"],
        "consultation_id": test_data["consultation1_id"],
        "prescription_id": test_data["prescription1_id"],
        "scheduled_date": str(future_date_1),
        "reason": "Evaluate headache frequency and digestive response after 14 days of Brahmi Ghrita",
        "instructions": "Maintain headache diary recording time and intensity of any episodes",
        "doctor_notes": "Check for reduction in Pitta symptoms and Pitta-related sleep disturbances"
    }
    res = client.post("/follow-ups/", json=payload_valid, headers=staff_hdr)
    assert res.status_code == 403, f"Staff should not be able to schedule follow-up: {res.status_code}"
    print("  [PASS] Staff blocked from creating follow-up (HTTP 403)")

    # 3. Past Date Validation -> 400 Bad Request
    past_payload = dict(payload_valid)
    past_payload["scheduled_date"] = str(past_date)
    res = client.post("/follow-ups/", json=past_payload, headers=doctor_hdr)
    assert res.status_code == 400, f"Past date should be rejected: {res.status_code}"
    print(f"  [PASS] Past scheduled date correctly rejected: {res.json()['detail']}")

    # 4. Cross-Patient Validation: Mismatched Patient and Consultation -> 400 Bad Request
    mismatched_consult_payload = dict(payload_valid)
    mismatched_consult_payload["consultation_id"] = test_data["consultation2_id"]  # Belongs to Patient 2!
    res = client.post("/follow-ups/", json=mismatched_consult_payload, headers=doctor_hdr)
    assert res.status_code == 400, f"Mismatched consultation should fail: {res.status_code}"
    print(f"  [PASS] Cross-patient consultation mismatch rejected: {res.json()['detail']}")

    # 5. Cross-Patient Validation: Mismatched Patient and Case Session -> 400 Bad Request
    mismatched_case_payload = dict(payload_valid)
    mismatched_case_payload["case_session_id"] = test_data["case2_id"]  # Belongs to Patient 2!
    res = client.post("/follow-ups/", json=mismatched_case_payload, headers=doctor_hdr)
    assert res.status_code == 400, f"Mismatched case session should fail: {res.status_code}"
    print(f"  [PASS] Cross-patient case session mismatch rejected: {res.json()['detail']}")

    # 6. Non-existent Patient Validation -> 404 Not Found
    non_existent_patient_payload = dict(payload_valid)
    non_existent_patient_payload["patient_id"] = 999999
    res = client.post("/follow-ups/", json=non_existent_patient_payload, headers=doctor_hdr)
    assert res.status_code == 404
    print("  [PASS] Non-existent patient rejected with HTTP 404")

    # 7. Doctor creates Follow-Up #1 for Patient 1
    res = client.post("/follow-ups/", json=payload_valid, headers=doctor_hdr)
    assert res.status_code == 201, f"Doctor follow-up creation failed: {res.text}"
    fup1 = res.json()
    assert fup1["follow_up_number"] == 1, f"First follow-up must be #1, got {fup1['follow_up_number']}"
    assert fup1["status"] == "SCHEDULED"
    assert fup1["scheduled_date"] == str(future_date_1)
    assert len(fup1["audit_logs"]) >= 1
    assert fup1["audit_logs"][0]["action"] == "CREATED"
    print(f"  [PASS] Doctor created Follow-Up #1 (ID: {fup1['id']}) in SCHEDULED status")

    # 8. Doctor creates Follow-Up #2 for Patient 1 (Verifies Sequential Numbering)
    future_date_2 = today + timedelta(days=28)
    payload_fup2 = dict(payload_valid)
    payload_fup2["scheduled_date"] = str(future_date_2)
    payload_fup2["reason"] = "Second monthly review for chronic Pitta balancing"
    res = client.post("/follow-ups/", json=payload_fup2, headers=doctor_hdr)
    assert res.status_code == 201
    fup2 = res.json()
    assert fup2["follow_up_number"] == 2, f"Second follow-up must be #2, got {fup2['follow_up_number']}"
    print(f"  [PASS] Sequential numbering verified: Patient 1 Follow-Up #2 (ID: {fup2['id']})")

    # 9. Admin creates Follow-Up #1 for Patient 2 (Verifies Patient-Scoped Numbering)
    payload_p2 = {
        "patient_id": test_data["patient2_id"],
        "case_session_id": test_data["case2_id"],
        "consultation_id": test_data["consultation2_id"],
        "doctor_id": test_data["doctor_id"],
        "scheduled_date": str(today + timedelta(days=7)),
        "reason": "Check lumbar spine range of motion and pain reduction"
    }
    res = client.post("/follow-ups/", json=payload_p2, headers=admin_hdr)
    assert res.status_code == 201
    fup_p2 = res.json()
    assert fup_p2["follow_up_number"] == 1, f"Patient 2 first follow-up must be #1, got {fup_p2['follow_up_number']}"
    print(f"  [PASS] Scoped numbering verified: Patient 2 starts at Follow-Up #1 (ID: {fup_p2['id']})")

    return fup1["id"], fup2["id"], fup_p2["id"]


def test_follow_up_lifecycle_and_immutability(test_data, fup1_id, fup2_id):
    print("\n--- Testing Follow-Up Lifecycle Transitions, Immutability & Protection ---")
    admin_hdr = {"Authorization": f"Bearer {test_data['admin_token']}"}
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    # 1. Update scheduled follow-up
    update_payload = {
        "instructions": "Updated: Please bring headache journal and avoid spicy/fermented food on morning of visit.",
        "doctor_notes": "Updated: Plan to assess pulse (Nadi) for Pitta-Vata balance."
    }
    res = client.patch(f"/follow-ups/{fup1_id}", json=update_payload, headers=doctor_hdr)
    assert res.status_code == 200, f"Update follow-up failed: {res.text}"
    updated_fup = res.json()
    assert "Updated: Please bring headache journal" in updated_fup["instructions"]
    print(f"  [PASS] Updated SCHEDULED follow-up ID {fup1_id}")

    # 2. Staff views follow-up details -> 200 OK
    res = client.get(f"/follow-ups/{fup1_id}", headers=staff_hdr)
    assert res.status_code == 200
    assert res.json()["id"] == fup1_id
    print("  [PASS] Staff successfully retrieved follow-up details (HTTP 200)")

    # 3. Staff attempts to confirm -> 403 Forbidden
    res = client.patch(f"/follow-ups/{fup1_id}/confirm", headers=staff_hdr)
    assert res.status_code == 403
    print("  [PASS] Staff blocked from confirming follow-up (HTTP 403)")

    # 4. Doctor confirms follow-up
    res = client.patch(f"/follow-ups/{fup1_id}/confirm", json={"notes": "Patient phoned in and confirmed time"}, headers=doctor_hdr)
    assert res.status_code == 200, f"Confirm follow-up failed: {res.text}"
    confirmed_fup = res.json()
    assert confirmed_fup["status"] == "CONFIRMED"
    print(f"  [PASS] Follow-Up ID {fup1_id} confirmed: Status = CONFIRMED")

    # 5. Record Clinical Visit Observation (FollowUpVisit)
    visit_payload = {
        "symptom_progress": "Headache intensity decreased from 8/10 to 3/10. Episode frequency reduced from daily to once weekly.",
        "patient_reported_changes": "Sleep quality improved significantly. No morning burning sensation in stomach.",
        "medication_adherence": "Patient took Brahmi Ghrita daily for 13 out of 14 days with warm milk.",
        "adverse_effects_reported": "None reported. Tolerated Ghrita without nausea.",
        "lifestyle_adherence": "Avoided late-night screen time and heavy dinners as advised.",
        "dietary_adherence": "Strictly adhered to Pathya diet; avoided curd and sour items.",
        "doctor_observations": "Nadi: Pitta calmed; tongue clean without coating (Niram); pulse steady.",
        "doctor_assessment": "Significant therapeutic response. Pitta-pacifying protocol is effective.",
        "next_steps": "Continue current regimen for 2 more weeks. Schedule Follow-Up #2."
    }
    # Staff attempts to record visit -> 403
    res = client.post(f"/follow-ups/{fup1_id}/visit", json=visit_payload, headers=staff_hdr)
    assert res.status_code == 403
    print("  [PASS] Staff blocked from recording clinical visit (HTTP 403)")

    # Doctor records visit
    res = client.post(f"/follow-ups/{fup1_id}/visit", json=visit_payload, headers=doctor_hdr)
    assert res.status_code == 201, f"Record visit failed: {res.text}"
    visit_data = res.json()
    assert visit_data["follow_up_id"] == fup1_id
    assert "Headache intensity decreased" in visit_data["symptom_progress"]
    print(f"  [PASS] Doctor recorded structured FollowUpVisit (ID: {visit_data['id']})")

    # Retrieve visit
    res = client.get(f"/follow-ups/{fup1_id}/visit", headers=staff_hdr)
    assert res.status_code == 200
    assert res.json()["id"] == visit_data["id"]
    print("  [PASS] Retrieved FollowUpVisit via GET /follow-ups/{id}/visit")

    # 6. Doctor completes follow-up
    complete_payload = {
        "completion_notes": "Encounter successfully completed. Excellent symptom alleviation.",
        "doctor_notes": "Patient in good spirits. Continue Rasayana support.",
        "patient_notes": "Feeling much lighter and energetic."
    }
    res = client.patch(f"/follow-ups/{fup1_id}/complete", json=complete_payload, headers=doctor_hdr)
    assert res.status_code == 200, f"Complete follow-up failed: {res.text}"
    completed_fup = res.json()
    assert completed_fup["status"] == "COMPLETED"
    assert completed_fup["completed_at"] is not None
    print(f"  [PASS] Follow-Up ID {fup1_id} marked COMPLETED at {completed_fup['completed_at']}")

    # 7. Immutability: Attempting to edit completed follow-up -> 400 Bad Request
    res = client.patch(f"/follow-ups/{fup1_id}", json={"reason": "Try edit completed"}, headers=doctor_hdr)
    assert res.status_code == 400, f"Editing completed follow-up should fail: {res.status_code}"
    print(f"  [PASS] Attempt to edit COMPLETED follow-up rejected: {res.json()['detail']}")

    # 8. Immutability: Attempting to cancel completed follow-up -> 400 Bad Request
    res = client.patch(f"/follow-ups/{fup1_id}/cancel", json={"cancellation_reason": "Try cancel completed"}, headers=doctor_hdr)
    assert res.status_code == 400
    print("  [PASS] Attempt to cancel COMPLETED follow-up rejected (HTTP 400)")

    # 9. Immutability: Attempting to mark missed on completed follow-up -> 400 Bad Request
    res = client.patch(f"/follow-ups/{fup1_id}/missed", headers=doctor_hdr)
    assert res.status_code == 400
    print("  [PASS] Attempt to mark COMPLETED follow-up as MISSED rejected (HTTP 400)")

    # 10. Cancellation Flow on Follow-Up #2
    cancel_payload = {"cancellation_reason": "Patient relocated temporarily; requested postponement."}
    res = client.patch(f"/follow-ups/{fup2_id}/cancel", json=cancel_payload, headers=doctor_hdr)
    assert res.status_code == 200, f"Cancel follow-up failed: {res.text}"
    cancelled_fup = res.json()
    assert cancelled_fup["status"] == "CANCELLED"
    assert cancelled_fup["cancellation_reason"] == cancel_payload["cancellation_reason"]
    print(f"  [PASS] Follow-Up #2 (ID: {fup2_id}) CANCELLED with audit trail")

    # 11. Attempting to complete or edit cancelled follow-up -> 400 Bad Request
    res = client.patch(f"/follow-ups/{fup2_id}", json={"reason": "Edit cancelled"}, headers=doctor_hdr)
    assert res.status_code == 400
    res = client.patch(f"/follow-ups/{fup2_id}/complete", json={"completion_notes": "Try complete cancelled"}, headers=doctor_hdr)
    assert res.status_code == 400
    print("  [PASS] Attempt to edit/complete CANCELLED follow-up strictly rejected (HTTP 400)")


def test_missed_appointment_and_queries(test_data):
    print("\n--- Testing Missed Appointment Flow & Query Endpoints ---")
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    today = datetime.now(timezone.utc).date()

    # 1. Create a third follow-up to test MISSED status
    payload_fup3 = {
        "patient_id": test_data["patient1_id"],
        "case_session_id": test_data["case1_id"],
        "consultation_id": test_data["consultation1_id"],
        "scheduled_date": str(today + timedelta(days=42)),
        "reason": "Third trimester wellness check",
        "instructions": "Standard routine visit"
    }
    res = client.post("/follow-ups/", json=payload_fup3, headers=doctor_hdr)
    assert res.status_code == 201
    fup3 = res.json()
    fup3_id = fup3["id"]
    assert fup3["follow_up_number"] == 3
    print(f"  [PASS] Created Follow-Up #3 (ID: {fup3_id})")

    # 2. Mark as MISSED
    res = client.patch(f"/follow-ups/{fup3_id}/missed", json={"notes": "Patient did not show up and was unreachable via phone."}, headers=doctor_hdr)
    assert res.status_code == 200, f"Mark missed failed: {res.text}"
    missed_fup = res.json()
    assert missed_fup["status"] == "MISSED"
    print(f"  [PASS] Follow-Up ID {fup3_id} marked as MISSED")

    # 3. Attempting to edit or complete missed follow-up -> 400 Bad Request
    res = client.patch(f"/follow-ups/{fup3_id}", json={"reason": "Edit missed"}, headers=doctor_hdr)
    assert res.status_code == 400
    res = client.patch(f"/follow-ups/{fup3_id}/complete", json={"completion_notes": "Complete missed"}, headers=doctor_hdr)
    assert res.status_code == 400
    print("  [PASS] Attempt to edit or complete MISSED follow-up rejected (HTTP 400)")

    # 4. Query upcoming follow-ups
    res = client.get("/follow-ups/upcoming", headers=staff_hdr)
    assert res.status_code == 200, f"Upcoming follow-ups query failed: {res.text}"
    upcoming = res.json()
    assert isinstance(upcoming, list)
    print(f"  [PASS] Upcoming follow-ups queried successfully (Count: {len(upcoming)})")

    # 5. Query patient follow-up history
    res = client.get(f"/follow-ups/patient/{test_data['patient1_id']}", headers=staff_hdr)
    assert res.status_code == 200
    patient_fups = res.json()
    assert len(patient_fups) >= 3, f"Expected at least 3 follow-ups for Patient 1: {len(patient_fups)}"
    print(f"  [PASS] Patient 1 follow-up history retrieved ({len(patient_fups)} records)")

    # 6. Query consultation follow-ups
    res = client.get(f"/follow-ups/consultation/{test_data['consultation1_id']}", headers=staff_hdr)
    assert res.status_code == 200
    consult_fups = res.json()
    assert len(consult_fups) >= 3
    print(f"  [PASS] Consultation 1 follow-ups retrieved ({len(consult_fups)} records)")

    # 7. Query patient progress history
    res = client.get(f"/follow-ups/patient/{test_data['patient1_id']}/progress", headers=staff_hdr)
    assert res.status_code == 200
    progress = res.json()
    assert len(progress) >= 3
    assert progress[0]["follow_up_number"] == 1
    assert progress[0]["symptom_progress"] is not None
    print(f"  [PASS] Patient progress history verified: Follow-Up #1 has visit observation data")

    # 8. Query unified Continuity-of-Care Workspace
    res = client.get(f"/follow-ups/workspace/patient/{test_data['patient1_id']}", headers=staff_hdr)
    assert res.status_code == 200, f"Continuity workspace query failed: {res.text}"
    workspace = res.json()
    assert workspace["patient"]["id"] == test_data["patient1_id"]
    assert workspace["original_consultation"] is not None
    assert workspace["current_prescription"] is not None
    assert len(workspace["follow_ups"]) >= 3
    assert len(workspace["progress_history"]) >= 3
    assert "disclaimer" in workspace
    print(f"  [PASS] Continuity-of-Care Workspace aggregated successfully across all clinical dimensions")


def main():
    print("=" * 70)
    print("AYURAI MODULE 12: FOLLOW-UP MANAGEMENT & CONTINUITY OF CARE VERIFICATION")
    print("=" * 70)

    test_data = setup_test_data()
    fup1_id, fup2_id, fup_p2_id = test_follow_up_creation_and_validation(test_data)
    test_follow_up_lifecycle_and_immutability(test_data, fup1_id, fup2_id)
    test_missed_appointment_and_queries(test_data)

    print("\n" + "=" * 70)
    print("ALL MODULE 12 TESTS PASSED SUCCESSFULLY (100% PASS RATE)!")
    print("=" * 70)


if __name__ == "__main__":
    main()
