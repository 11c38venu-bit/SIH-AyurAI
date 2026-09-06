import sys
import uuid
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
from app.models.prescription_audit import PrescriptionAudit
from app.core.security import hash_password, create_access_token

client = TestClient(app)


def setup_test_users_and_data():
    """Sets up isolated test users, patient, case session, and consultation."""
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
            full_name="Vaidya Dr. Sharma",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=True
        )
        db.add(doctor)

        # 3. Staff user
        staff = User(
            email=f"staff_{suffix}@ayurai.com",
            username=f"staff_{suffix}",
            full_name="Clinic Staff Member",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.STAFF,
            is_active=True
        )
        db.add(staff)
        db.flush()

        # 4. Patients (Patient 1 and Patient 2 for cross-patient tests)
        patient1 = Patient(
            patient_id=f"PID-TEST-{suffix}-1",
            full_name="Ramesh Kumar",
            gender="MALE",
            phone=f"98765{suffix[:5]}",
            email=f"ramesh_{suffix}@example.com"
        )
        patient2 = Patient(
            patient_id=f"PID-TEST-{suffix}-2",
            full_name="Priya Nair",
            gender="FEMALE",
            phone=f"98764{suffix[:5]}",
            email=f"priya_{suffix}@example.com"
        )
        db.add(patient1)
        db.add(patient2)
        db.flush()

        # 5. Case Sessions
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

        # 6. Consultation for Patient 1
        consultation1 = Consultation(
            patient_id=patient1.id,
            case_session_id=case1.id,
            doctor_id=doctor.id,
            consultation_status=ConsultationStatus.IN_PROGRESS,
            chief_complaint="Joint pain and morning stiffness",
            diagnosis="Sandhigata Vata (Osteo-arthritis)",
            treatment_plan="Vata-pacifying internal medications and external Taila application"
        )
        db.add(consultation1)
        db.commit()

        # Generate tokens
        admin_token = create_access_token(subject=admin.username, role=admin.role.value, extra_claims={"id": admin.id})
        doctor_token = create_access_token(subject=doctor.username, role=doctor.role.value, extra_claims={"id": doctor.id})
        staff_token = create_access_token(subject=staff.username, role=staff.role.value, extra_claims={"id": staff.id})

        return {
            "admin_token": admin_token,
            "doctor_token": doctor_token,
            "staff_token": staff_token,
            "admin_id": admin.id,
            "doctor_id": doctor.id,
            "staff_id": staff.id,
            "patient1_id": patient1.id,
            "patient2_id": patient2.id,
            "case1_id": case1.id,
            "case2_id": case2.id,
            "consultation1_id": consultation1.id,
            "suffix": suffix
        }
    finally:
        db.close()


def test_medicine_catalog_crud_and_rbac(test_data):
    print("\n--- Testing Ayurvedic Medicine Catalog CRUD & RBAC ---")
    admin_hdr = {"Authorization": f"Bearer {test_data['admin_token']}"}
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    # 1. Staff and Doctor listing medicines
    res = client.get("/medicines/?q=Ashwagandha", headers=doctor_hdr)
    assert res.status_code == 200, f"Doctor list failed: {res.text}"
    items = res.json()
    assert len(items) >= 1, "Expected to find Ashwagandha"
    ashwagandha = items[0]
    print(f"  [PASS] Doctor successfully queried catalog for Ashwagandha (ID: {ashwagandha['id']})")

    # 2. Staff attempting to create new medicine -> 403 Forbidden
    custom_med_payload = {
        "name": "Shankhapushpi Syrup Test",
        "category": "OTHER",
        "formulation": "Syrup",
        "dosage_form": "Liquid",
        "strength": "10 ml",
        "standard_route": "Oral",
        "description": "Nervine tonic"
    }
    res = client.post("/medicines/", json=custom_med_payload, headers=staff_hdr)
    assert res.status_code == 403, f"Staff should be forbidden from creating medicine: {res.status_code}"
    print("  [PASS] Staff rejected from creating medicine (HTTP 403)")

    # 3. Doctor attempting to create new medicine -> 403 Forbidden
    res = client.post("/medicines/", json=custom_med_payload, headers=doctor_hdr)
    assert res.status_code == 403, f"Doctor should be forbidden from creating medicine: {res.status_code}"
    print("  [PASS] Doctor rejected from creating medicine (HTTP 403)")

    # 4. Admin successfully creates custom medicine
    res = client.post("/medicines/", json=custom_med_payload, headers=admin_hdr)
    assert res.status_code == 201, f"Admin create medicine failed: {res.text}"
    created_med = res.json()
    assert created_med["name"] == "Shankhapushpi Syrup Test"
    assert created_med["medicine_code"].startswith("MED-OTH-")
    custom_med_id = created_med["id"]
    print(f"  [PASS] Admin created medicine '{created_med['name']}' with code {created_med['medicine_code']}")

    # 5. Admin updates / deactivates medicine
    res = client.patch(f"/medicines/{custom_med_id}", json={"is_active": False}, headers=admin_hdr)
    assert res.status_code == 200, f"Admin update medicine failed: {res.text}"
    assert res.json()["is_active"] is False
    print(f"  [PASS] Admin deactivated custom medicine ID {custom_med_id}")

    # 6. Verify deactivated medicine is excluded by default in active_only search
    res = client.get("/medicines/?q=Shankhapushpi+Syrup+Test", headers=staff_hdr)
    assert res.status_code == 200
    assert len(res.json()) == 0, "Deactivated medicine should not appear when active_only=True"
    print("  [PASS] Deactivated medicine filtered out from default catalog search")

    return ashwagandha["id"], custom_med_id


def test_prescription_creation_and_snapshots(test_data, active_med_id, inactive_med_id):
    print("\n--- Testing Prescription Creation, RBAC & Snapshot Capture ---")
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    # 1. Staff attempting to create prescription -> 403 Forbidden
    rx_payload = {
        "patient_id": test_data["patient1_id"],
        "case_session_id": test_data["case1_id"],
        "consultation_id": test_data["consultation1_id"],
        "general_instructions": "Take all medicines with warm water after meals.",
        "dietary_advice": "Pathya: Warm, freshly cooked meals, mung soup. Apathya: Cold foods, curd at night.",
        "lifestyle_advice": "Vihara: Avoid cold breeze, gentle walking.",
        "follow_up_instructions": "Review in clinic after 14 days.",
        "items": [
            {
                "medicine_id": active_med_id,
                "dosage": "5 grams",
                "frequency": "Twice daily (BD)",
                "timing": "After food",
                "route": "Oral",
                "duration": "14 days",
                "quantity": "100 grams",
                "anupana": "Warm milk (Ksheera)",
                "special_instructions": "Take with 1 spoon of honey and warm milk"
            }
        ]
    }
    res = client.post("/prescriptions/", json=rx_payload, headers=staff_hdr)
    assert res.status_code == 403, f"Staff should not be able to create prescription: {res.status_code}"
    print("  [PASS] Staff blocked from creating prescription (HTTP 403)")

    # 2. Cross-patient validation: Mismatched Patient and Case Session -> 400 Bad Request
    mismatched_payload = dict(rx_payload)
    mismatched_payload["case_session_id"] = test_data["case2_id"]  # Belongs to patient 2!
    res = client.post("/prescriptions/", json=mismatched_payload, headers=doctor_hdr)
    assert res.status_code == 400, f"Mismatched patient/case should fail: {res.status_code}"
    print(f"  [PASS] Cross-patient mismatch correctly rejected: {res.json()['detail']}")

    # 3. Prescribing deactivated medicine -> 400 Bad Request
    inactive_med_payload = dict(rx_payload)
    inactive_med_payload["items"] = [
        {
            "medicine_id": inactive_med_id,
            "dosage": "10 ml",
            "frequency": "Twice daily",
            "timing": "After food",
            "route": "Oral",
            "duration": "7 days"
        }
    ]
    res = client.post("/prescriptions/", json=inactive_med_payload, headers=doctor_hdr)
    assert res.status_code == 400, f"Prescribing inactive medicine should fail: {res.status_code}"
    print(f"  [PASS] Deactivated medicine prescription rejected: {res.json()['detail']}")

    # 4. Doctor successfully creates valid draft prescription
    res = client.post("/prescriptions/", json=rx_payload, headers=doctor_hdr)
    assert res.status_code == 201, f"Doctor prescription creation failed: {res.text}"
    rx = res.json()
    assert rx["prescription_status"] == "DRAFT"
    assert rx["prescription_number"].startswith(f"RX-")
    assert len(rx["items"]) == 1
    assert rx["items"][0]["medicine_name_snapshot"] == "Ashwagandha Churna"
    assert rx["items"][0]["anupana"] == "Warm milk (Ksheera)"
    assert len(rx["audit_logs"]) >= 1
    assert rx["audit_logs"][0]["action"] == "CREATED"
    print(f"  [PASS] Draft prescription created: {rx['prescription_number']} (ID: {rx['id']})")
    print(f"  [PASS] Snapshot captured: '{rx['items'][0]['medicine_name_snapshot']}' | Formulation: '{rx['items'][0]['formulation_snapshot']}'")

    return rx["id"]


def test_prescription_update_and_finalization_immutability(test_data, rx_id, active_med_id):
    print("\n--- Testing Prescription Updates, Finalization & Immutability ---")
    admin_hdr = {"Authorization": f"Bearer {test_data['admin_token']}"}
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    # 1. Doctor updates draft prescription (adds second item)
    update_payload = {
        "lifestyle_advice": "Vihara: Daily Abhyanga with warm Mahanarayana Taila before bath.",
        "items": [
            {
                "medicine_id": active_med_id,
                "dosage": "5 grams",
                "frequency": "Twice daily (BD)",
                "timing": "After food",
                "route": "Oral",
                "duration": "21 days",
                "quantity": "150 grams",
                "anupana": "Warm milk",
                "special_instructions": "Take morning and night"
            },
            {
                "medicine_name_snapshot": "Yogaraja Guggulu",
                "formulation_snapshot": "Tablet",
                "strength_snapshot": "500 mg",
                "dosage": "2 tablets",
                "frequency": "Twice daily (BD)",
                "timing": "After food",
                "route": "Oral",
                "duration": "21 days",
                "quantity": "84 tablets",
                "anupana": "Warm water",
                "special_instructions": "Take with lukewarm water"
            }
        ]
    }
    res = client.patch(f"/prescriptions/{rx_id}", json=update_payload, headers=doctor_hdr)
    assert res.status_code == 200, f"Update draft prescription failed: {res.text}"
    updated_rx = res.json()
    assert len(updated_rx["items"]) == 2
    assert updated_rx["items"][1]["medicine_name_snapshot"] == "Yogaraja Guggulu"
    print(f"  [PASS] Updated draft prescription with 2 items. Audit logs count: {len(updated_rx['audit_logs'])}")

    # 2. Staff views prescription -> 200 OK
    res = client.get(f"/prescriptions/{rx_id}", headers=staff_hdr)
    assert res.status_code == 200
    assert res.json()["id"] == rx_id
    print("  [PASS] Staff successfully retrieved prescription details")

    # 3. Staff attempts to finalize -> 403 Forbidden
    res = client.patch(f"/prescriptions/{rx_id}/finalize", headers=staff_hdr)
    assert res.status_code == 403
    print("  [PASS] Staff blocked from finalizing prescription (HTTP 403)")

    # 4. Doctor finalizes prescription
    res = client.patch(f"/prescriptions/{rx_id}/finalize", headers=doctor_hdr)
    assert res.status_code == 200, f"Finalize prescription failed: {res.text}"
    finalized_rx = res.json()
    assert finalized_rx["prescription_status"] == "FINALIZED"
    assert finalized_rx["finalized_at"] is not None
    print(f"  [PASS] Prescription {finalized_rx['prescription_number']} finalized successfully at {finalized_rx['finalized_at']}")

    # 5. Attempting to modify finalized prescription -> 400 Bad Request
    res = client.patch(f"/prescriptions/{rx_id}", json={"general_instructions": "New instruction"}, headers=doctor_hdr)
    assert res.status_code == 400, f"Editing finalized prescription must be rejected: {res.status_code}"
    print(f"  [PASS] Attempt to modify finalized prescription rejected: {res.json()['detail']}")

    # 6. Attempting to finalize already finalized prescription -> 400 Bad Request
    res = client.patch(f"/prescriptions/{rx_id}/finalize", headers=doctor_hdr)
    assert res.status_code == 400
    print(f"  [PASS] Attempt to re-finalize rejected: {res.json()['detail']}")

    # 7. Snapshot preservation check: Deactivate active_med_id in master catalog, verify finalized snapshot remains
    client.patch(f"/medicines/{active_med_id}", json={"is_active": False}, headers=admin_hdr)
    res = client.get(f"/prescriptions/{rx_id}", headers=staff_hdr)
    assert res.status_code == 200
    item1 = res.json()["items"][0]
    assert item1["medicine_name_snapshot"] == "Ashwagandha Churna", "Snapshot must remain intact even if master is deactivated"
    print(f"  [PASS] Snapshot '{item1['medicine_name_snapshot']}' verified immutable after master medicine deactivation")

    # Re-activate medicine for other tests
    client.patch(f"/medicines/{active_med_id}", json={"is_active": True}, headers=admin_hdr)


def test_prescription_cancellation_and_queries(test_data, active_med_id):
    print("\n--- Testing Prescription Cancellation & Query Endpoints ---")
    doctor_hdr = {"Authorization": f"Bearer {test_data['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {test_data['staff_token']}"}

    # 1. Create a second prescription to test cancellation
    rx2_payload = {
        "patient_id": test_data["patient1_id"],
        "case_session_id": test_data["case1_id"],
        "consultation_id": test_data["consultation1_id"],
        "general_instructions": "Alternative prescription for acute symptoms",
        "items": [
            {
                "medicine_id": active_med_id,
                "dosage": "3 grams",
                "frequency": "Once daily at night",
                "timing": "Bedtime",
                "route": "Oral",
                "duration": "7 days"
            }
        ]
    }
    res = client.post("/prescriptions/", json=rx2_payload, headers=doctor_hdr)
    assert res.status_code == 201
    rx2 = res.json()
    rx2_id = rx2["id"]

    # 2. Staff attempts to cancel -> 403 Forbidden
    res = client.patch(f"/prescriptions/{rx2_id}/cancel", json={"cancellation_reason": "Test cancel"}, headers=staff_hdr)
    assert res.status_code == 403
    print("  [PASS] Staff blocked from cancelling prescription (HTTP 403)")

    # 3. Doctor cancels prescription with valid reason
    cancel_payload = {"cancellation_reason": "Patient developed gastric discomfort; switching formulation."}
    res = client.patch(f"/prescriptions/{rx2_id}/cancel", json=cancel_payload, headers=doctor_hdr)
    assert res.status_code == 200, f"Cancel prescription failed: {res.text}"
    cancelled_rx = res.json()
    assert cancelled_rx["prescription_status"] == "CANCELLED"
    assert cancelled_rx["cancellation_reason"] == cancel_payload["cancellation_reason"]
    assert cancelled_rx["cancelled_at"] is not None
    print(f"  [PASS] Prescription cancelled: Reason '{cancelled_rx['cancellation_reason']}'")

    # 4. Attempting to edit or finalize cancelled prescription -> 400 Bad Request
    res = client.patch(f"/prescriptions/{rx2_id}", json={"general_instructions": "Try edit"}, headers=doctor_hdr)
    assert res.status_code == 400
    res = client.patch(f"/prescriptions/{rx2_id}/finalize", headers=doctor_hdr)
    assert res.status_code == 400
    print("  [PASS] Modification and finalization of cancelled prescription strictly blocked (HTTP 400)")

    # 5. Query prescriptions by patient
    res = client.get(f"/prescriptions/patient/{test_data['patient1_id']}", headers=staff_hdr)
    assert res.status_code == 200
    patient_rxs = res.json()
    assert len(patient_rxs) >= 2, f"Expected at least 2 prescriptions for patient: {len(patient_rxs)}"
    print(f"  [PASS] Successfully queried {len(patient_rxs)} prescriptions for patient ID {test_data['patient1_id']}")

    # 6. Query prescriptions by consultation
    res = client.get(f"/prescriptions/consultation/{test_data['consultation1_id']}", headers=staff_hdr)
    assert res.status_code == 200
    consultation_rxs = res.json()
    assert len(consultation_rxs) >= 2
    print(f"  [PASS] Successfully queried {len(consultation_rxs)} prescriptions for consultation ID {test_data['consultation1_id']}")

    # 7. Query prescriptions by case
    res = client.get(f"/prescriptions/case/{test_data['case1_id']}", headers=staff_hdr)
    assert res.status_code == 200
    case_rxs = res.json()
    assert len(case_rxs) >= 2
    print(f"  [PASS] Successfully queried {len(case_rxs)} prescriptions for case ID {test_data['case1_id']}")


def main():
    print("=" * 70)
    print("AYURAI MODULE 11: AYURVEDIC MEDICINES & PRESCRIPTION MANAGEMENT VERIFICATION")
    print("=" * 70)

    test_data = setup_test_users_and_data()
    active_med_id, inactive_med_id = test_medicine_catalog_crud_and_rbac(test_data)
    rx_id = test_prescription_creation_and_snapshots(test_data, active_med_id, inactive_med_id)
    test_prescription_update_and_finalization_immutability(test_data, rx_id, active_med_id)
    test_prescription_cancellation_and_queries(test_data, active_med_id)

    print("\n" + "=" * 70)
    print("ALL MODULE 11 TESTS PASSED SUCCESSFULLY (100% PASS RATE)!")
    print("=" * 70)


if __name__ == "__main__":
    main()
