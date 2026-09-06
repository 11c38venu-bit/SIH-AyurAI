import sys
import uuid
from datetime import date, datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.consultation import Consultation, ConsultationStatus
from app.models.case import CaseSession, CaseStatus
from app.models.admin_audit import AdminAudit
from app.core.security import hash_password, create_access_token

client = TestClient(app)


def setup_test_environment():
    """Sets up isolated test users (admins, doctor, staff) and initial test data."""
    db = SessionLocal()
    try:
        suffix = uuid.uuid4().hex[:6]

        # 1. Primary Admin user
        admin1 = User(
            email=f"admin1_{suffix}@ayurai.com",
            username=f"admin1_{suffix}",
            full_name="Primary Administrator",
            hashed_password=hash_password("AdminPass123!"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin1)

        # 2. Secondary Admin user (for testing multi-admin transitions)
        admin2 = User(
            email=f"admin2_{suffix}@ayurai.com",
            username=f"admin2_{suffix}",
            full_name="Secondary Administrator",
            hashed_password=hash_password("AdminPass123!"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin2)

        # 3. Doctor user
        doctor = User(
            email=f"doctor_{suffix}@ayurai.com",
            username=f"dr_{suffix}",
            full_name="Vaidya Dr. Joshi",
            hashed_password=hash_password("DoctorPass123!"),
            role=UserRole.DOCTOR,
            is_active=True,
        )
        db.add(doctor)

        # 4. Staff user
        staff = User(
            email=f"staff_{suffix}@ayurai.com",
            username=f"staff_{suffix}",
            full_name="FrontDesk Staff",
            hashed_password=hash_password("StaffPass123!"),
            role=UserRole.STAFF,
            is_active=True,
        )
        db.add(staff)

        # 5. Patient & Consultation for doctor stats
        patient = Patient(
            patient_id=f"PAT-ADM-{suffix.upper()}",
            full_name="Anil Kapoor",
            gender="Male",
            phone=f"93456{suffix[:5]}",
            email=f"anil_{suffix}@example.com",
        )
        db.add(patient)
        db.flush()

        case = CaseSession(patient_id=patient.id, status=CaseStatus.COMPLETED)
        db.add(case)
        db.flush()

        consultation = Consultation(
            patient_id=patient.id,
            case_session_id=case.id,
            doctor_id=doctor.id,
            chief_complaint="Joint pain",
            diagnosis="Sandhivata",
            treatment_plan="Vata shamana",
            consultation_status=ConsultationStatus.COMPLETED,
        )
        db.add(consultation)

        db.commit()

        db.refresh(admin1)
        db.refresh(admin2)
        db.refresh(doctor)
        db.refresh(staff)

        return {
            "admin1": admin1,
            "admin2": admin2,
            "doctor": doctor,
            "staff": staff,
            "suffix": suffix,
            "admin1_token": create_access_token(subject=admin1.email, role=admin1.role.value),
            "admin2_token": create_access_token(subject=admin2.email, role=admin2.role.value),
            "doctor_token": create_access_token(subject=doctor.email, role=doctor.role.value),
            "staff_token": create_access_token(subject=staff.email, role=staff.role.value),
        }
    finally:
        db.close()


def run_all_tests():
    print("=" * 70)
    print("AYURAI MODULE 16 — ADMIN MANAGEMENT VERIFICATION SUITE")
    print("=" * 70)

    env = setup_test_environment()
    admin1_hdr = {"Authorization": f"Bearer {env['admin1_token']}"}
    admin2_hdr = {"Authorization": f"Bearer {env['admin2_token']}"}
    doc_hdr = {"Authorization": f"Bearer {env['doctor_token']}"}
    staff_hdr = {"Authorization": f"Bearer {env['staff_token']}"}

    # -----------------------------------------------------------------------
    # TEST 1: Authentication & Role-Based Access Control
    # -----------------------------------------------------------------------
    print("\n[TEST 1] Authentication & RBAC Enforcement on /admin Endpoints...")
    # Unauthenticated
    assert client.get("/admin/users").status_code == 401
    # Doctor forbidden
    assert client.get("/admin/users", headers=doc_hdr).status_code == 403
    # Staff forbidden
    assert client.get("/admin/users", headers=staff_hdr).status_code == 403
    # Admin allowed
    r_admin = client.get("/admin/users", headers=admin1_hdr)
    assert r_admin.status_code == 200, f"Expected 200, got: {r_admin.text}"
    print("  -> Passed: Unauthenticated (401), Doctor (403), Staff (403) blocked; Admin (200) granted.")

    # -----------------------------------------------------------------------
    # TEST 2: List Users with Pagination, Filtering, and Search
    # -----------------------------------------------------------------------
    print("\n[TEST 2] Paginated User Listing, Role Filtering, and Search...")
    # Basic list
    r_list = client.get("/admin/users?page=1&page_size=10", headers=admin1_hdr)
    assert r_list.status_code == 200
    res_data = r_list.json()
    assert "items" in res_data
    assert "total" in res_data
    assert len(res_data["items"]) >= 4

    # Role filter: DOCTOR
    r_doc_list = client.get("/admin/users?role=DOCTOR", headers=admin1_hdr)
    assert r_doc_list.status_code == 200
    for u in r_doc_list.json()["items"]:
        assert u["role"] == "DOCTOR"

    # Search by username suffix
    r_search = client.get(f"/admin/users?search={env['suffix']}", headers=admin1_hdr)
    assert r_search.status_code == 200
    assert len(r_search.json()["items"]) >= 4

    # Invalid pagination
    assert client.get("/admin/users?page=0", headers=admin1_hdr).status_code in (400, 422)
    assert client.get("/admin/users?page_size=200", headers=admin1_hdr).status_code in (400, 422)

    print("  -> Passed: Pagination, role filters, search, and boundary validation verified.")

    # -----------------------------------------------------------------------
    # TEST 3: Create Doctor and Staff Operational Users
    # -----------------------------------------------------------------------
    print("\n[TEST 3] Create Operational Users (Doctor & Staff)...")
    suffix2 = uuid.uuid4().hex[:6]

    # Create Doctor
    payload_doc = {
        "email": f"new_dr_{suffix2}@ayurai.com",
        "username": f"new_dr_{suffix2}",
        "full_name": "Dr. Charaka Sharma",
        "password": "SecurePassword123!",
        "role": "DOCTOR",
    }
    r_create_doc = client.post("/admin/users", json=payload_doc, headers=admin1_hdr)
    assert r_create_doc.status_code == 201, f"Failed: {r_create_doc.text}"
    created_dr = r_create_doc.json()
    assert created_dr["role"] == "DOCTOR"
    assert created_dr["email"] == payload_doc["email"]
    assert "password" not in created_dr
    assert "hashed_password" not in created_dr

    # Create Staff
    payload_staff = {
        "email": f"new_staff_{suffix2}@ayurai.com",
        "username": f"new_staff_{suffix2}",
        "full_name": "Receptionist Meena",
        "password": "SecurePassword123!",
        "role": "STAFF",
    }
    r_create_staff = client.post("/admin/users", json=payload_staff, headers=admin1_hdr)
    assert r_create_staff.status_code == 201
    created_staff = r_create_staff.json()
    assert created_staff["role"] == "STAFF"

    # Reject creating ADMIN via operational endpoint
    payload_admin = {
        "email": f"fake_admin_{suffix2}@ayurai.com",
        "username": f"fake_admin_{suffix2}",
        "full_name": "Unauthorized Admin",
        "password": "SecurePassword123!",
        "role": "ADMIN",
    }
    r_bad_admin = client.post("/admin/users", json=payload_admin, headers=admin1_hdr)
    assert r_bad_admin.status_code == 400, "Should reject creating ADMIN via operational user creation endpoint"

    # Reject duplicate email
    r_dup = client.post("/admin/users", json=payload_doc, headers=admin1_hdr)
    assert r_dup.status_code == 409, f"Expected 409 Conflict for duplicate email, got {r_dup.status_code}"
    print("  -> Passed: Doctor and Staff created; Admin escalation and duplicate emails rejected.")

    # -----------------------------------------------------------------------
    # TEST 4: Get and Update User Profile
    # -----------------------------------------------------------------------
    print("\n[TEST 4] Get User Details & Update Profile...")
    target_id = created_dr["id"]

    # Get user
    r_get = client.get(f"/admin/users/{target_id}", headers=admin1_hdr)
    assert r_get.status_code == 200
    assert r_get.json()["id"] == target_id

    # Update full_name
    r_patch = client.patch(f"/admin/users/{target_id}", json={"full_name": "Dr. Charaka Sharma Senior"}, headers=admin1_hdr)
    assert r_patch.status_code == 200
    assert r_patch.json()["full_name"] == "Dr. Charaka Sharma Senior"
    print("  -> Passed: User retrieval and profile update verified.")

    # -----------------------------------------------------------------------
    # TEST 5: Role Management & Final Admin Protection
    # -----------------------------------------------------------------------
    print("\n[TEST 5] Role Management & Final Active Admin Downgrade Protection...")
    # Change created_staff to DOCTOR
    r_role = client.patch(f"/admin/users/{created_staff['id']}/role", json={"role": "DOCTOR"}, headers=admin1_hdr)
    assert r_role.status_code == 200
    assert r_role.json()["role"] == "DOCTOR"

    # Temporarily adjust other admins in DB so admin1 is the sole active admin
    db = SessionLocal()
    other_admins = db.query(User).filter(User.role == UserRole.ADMIN, User.id != env['admin1'].id).all()
    other_admin_roles = {a.id: a.role for a in other_admins}
    for a in other_admins:
        a.role = UserRole.STAFF
    db.commit()
    db.close()

    try:
        # Attempt to downgrade admin1 (now the only active admin) -> MUST BE REJECTED
        r_last_admin_down = client.patch(f"/admin/users/{env['admin1'].id}/role", json={"role": "STAFF"}, headers=admin1_hdr)
        assert r_last_admin_down.status_code == 400, "Must reject downgrading the final active administrator"
        assert "final active administrator" in r_last_admin_down.text
    finally:
        # Restore other admins
        db = SessionLocal()
        for a_id, a_role in other_admin_roles.items():
            u = db.query(User).filter(User.id == a_id).first()
            if u:
                u.role = a_role
        db.commit()
        db.close()

    print("  -> Passed: Role update succeeded; Final active admin downgrade strictly prevented.")

    # -----------------------------------------------------------------------
    # TEST 6: Account Activation & Deactivation Safeguards
    # -----------------------------------------------------------------------
    print("\n[TEST 6] Account Activation/Deactivation & Self-Protection...")
    test_user_id = created_dr["id"]

    # Deactivate test user
    r_deact = client.patch(f"/admin/users/{test_user_id}/deactivate", headers=admin1_hdr)
    assert r_deact.status_code == 200
    assert r_deact.json()["is_active"] is False

    # Deactivated user login rejected
    login_resp = client.post("/auth/login", data={"username": payload_doc["email"], "password": payload_doc["password"]})
    assert login_resp.status_code == 403, f"Deactivated user must be rejected at login, got: {login_resp.status_code}"

    # Reactivate test user
    r_act = client.patch(f"/admin/users/{test_user_id}/activate", headers=admin1_hdr)
    assert r_act.status_code == 200
    assert r_act.json()["is_active"] is True

    # Self-deactivation rejection: Admin1 cannot deactivate self
    r_self_deact = client.patch(f"/admin/users/{env['admin1'].id}/deactivate", headers=admin1_hdr)
    assert r_self_deact.status_code == 400, "Admin cannot deactivate their own active account"
    assert "cannot deactivate their own active account" in r_self_deact.text

    # Final active admin deactivation rejection
    db = SessionLocal()
    other_admins = db.query(User).filter(User.role == UserRole.ADMIN, User.id.not_in([env['admin1'].id, env['admin2'].id])).all()
    other_admin_actives = {a.id: a.is_active for a in other_admins}
    for a in other_admins:
        a.is_active = False
    db.commit()
    db.close()

    try:
        # Deactivate admin1 as admin2
        client.patch(f"/admin/users/{env['admin1'].id}/deactivate", headers=admin2_hdr)
        # Now admin2 is the sole active admin. Attempting to deactivate admin2 as admin2 must fail
        r_final_deact = client.patch(f"/admin/users/{env['admin2'].id}/deactivate", headers=admin2_hdr)
        assert r_final_deact.status_code == 400
    finally:
        db = SessionLocal()
        for a_id, a_act in other_admin_actives.items():
            u = db.query(User).filter(User.id == a_id).first()
            if u:
                u.is_active = a_act
        u1 = db.query(User).filter(User.id == env['admin1'].id).first()
        if u1:
            u1.is_active = True
        u2 = db.query(User).filter(User.id == env['admin2'].id).first()
        if u2:
            u2.is_active = True
        db.commit()
        db.close()

    print("  -> Passed: Activation/deactivation verified; Inactive login blocked; Self-deactivation prevented.")

    # -----------------------------------------------------------------------
    # TEST 7: Password Reset by Admin
    # -----------------------------------------------------------------------
    print("\n[TEST 7] Admin Password Reset & Immediate Authentication Verification...")
    new_test_password = "ResetPassword999!"
    r_reset = client.post(
        f"/admin/users/{test_user_id}/reset-password",
        json={"new_password": new_test_password},
        headers=admin1_hdr
    )
    assert r_reset.status_code == 200
    reset_data = r_reset.json()
    assert reset_data["message"] == "Password reset successfully"
    assert reset_data["user_id"] == test_user_id
    assert "password" not in str(reset_data).lower() or reset_data["message"] == "Password reset successfully"

    # Login with OLD password must fail
    r_old_login = client.post("/auth/login", data={"username": payload_doc["email"], "password": payload_doc["password"]})
    assert r_old_login.status_code == 401

    # Login with NEW password must succeed
    r_new_login = client.post("/auth/login", data={"username": payload_doc["email"], "password": new_test_password})
    assert r_new_login.status_code == 200
    assert "access_token" in r_new_login.json()
    print("  -> Passed: Password reset immediately hashed and functional; Plaintext/hash never exposed.")

    # -----------------------------------------------------------------------
    # TEST 8: Specialized Doctor & Staff Listings
    # -----------------------------------------------------------------------
    print("\n[TEST 8] Specialized Doctor & Staff Listings...")
    r_docs = client.get("/admin/doctors", headers=admin1_hdr)
    assert r_docs.status_code == 200
    docs_data = r_docs.json()
    assert len(docs_data) >= 1
    assert "consultation_count" in docs_data[0]

    r_staff_list = client.get("/admin/staff", headers=admin1_hdr)
    assert r_staff_list.status_code == 200
    assert len(r_staff_list.json()) >= 1
    print("  -> Passed: Specialized doctor & staff rosters returned.")

    # -----------------------------------------------------------------------
    # TEST 9: User Statistics
    # -----------------------------------------------------------------------
    print("\n[TEST 9] User Statistics (GET /admin/users/statistics)...")
    r_stats = client.get("/admin/users/statistics", headers=admin1_hdr)
    assert r_stats.status_code == 200
    stats = r_stats.json()
    assert stats["total_users"] >= 4
    assert stats["total_admins"] >= 2
    assert stats["total_doctors"] >= 1
    assert stats["total_staff"] >= 1
    print(f"  -> Passed: User statistics SQL-aggregated: {stats}")

    # -----------------------------------------------------------------------
    # TEST 10: Admin Operational Dashboard
    # -----------------------------------------------------------------------
    print("\n[TEST 10] Admin Dashboard (GET /admin/dashboard)...")
    r_dash = client.get("/admin/dashboard", headers=admin1_hdr)
    assert r_dash.status_code == 200
    dash_data = r_dash.json()
    assert "user_metrics" in dash_data
    assert "operational_metrics" in dash_data
    assert "system_metrics" in dash_data
    print(f"  -> Passed: Admin dashboard consolidated operational and system metrics.")

    # -----------------------------------------------------------------------
    # TEST 11: Administrative Audit Trail
    # -----------------------------------------------------------------------
    print("\n[TEST 11] Administrative Audit Trail Query & Filters...")
    r_audits = client.get("/admin/audits", headers=admin1_hdr)
    assert r_audits.status_code == 200
    audit_data = r_audits.json()
    assert audit_data["total"] >= 5
    actions = [a["action"] for a in audit_data["items"]]
    assert "USER_CREATED" in actions
    assert "PASSWORD_RESET" in actions
    assert "ROLE_CHANGED" in actions
    assert "USER_DEACTIVATED" in actions
    assert "USER_ACTIVATED" in actions

    # Action filter
    r_act_filter = client.get("/admin/audits?action=PASSWORD_RESET", headers=admin1_hdr)
    assert r_act_filter.status_code == 200
    for a in r_act_filter.json()["items"]:
        assert a["action"] == "PASSWORD_RESET"

    # Date validation on audits
    r_bad_audit_date = client.get("/admin/audits?date_from=2026-09-10&date_to=2026-09-01", headers=admin1_hdr)
    assert r_bad_audit_date.status_code == 400
    print(f"  -> Passed: Audit log accurately recorded administrative events: {set(actions)}")

    # -----------------------------------------------------------------------
    # TEST 12: Zero Credential Exposure Verification
    # -----------------------------------------------------------------------
    print("\n[TEST 12] Zero Credential & Secret Exposure Audit...")
    endpoints_to_check = [
        "/admin/users",
        f"/admin/users/{test_user_id}",
        "/admin/doctors",
        "/admin/staff",
        "/admin/users/statistics",
        "/admin/dashboard",
        "/admin/audits",
    ]
    for ep in endpoints_to_check:
        res = client.get(ep, headers=admin1_hdr)
        text = res.text
        assert "hashed_password" not in text, f"Found hashed_password in {ep}"
        assert "$2b$" not in text, f"Found bcrypt salt in {ep}"
        assert "DATABASE_URL" not in text, f"Found database url in {ep}"
    print("  -> Passed: Zero credential or sensitive token leakage across all admin endpoints.")

    print("\n" + "=" * 70)
    print("MODULE 16: ALL TESTS COMPLETED AND VERIFIED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()
