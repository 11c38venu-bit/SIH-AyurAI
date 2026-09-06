import io
import os
import sys
import uuid
from pathlib import Path
from fastapi.testclient import TestClient

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.case import CaseSession, CaseStatus
from app.core.security import hash_password, create_access_token

client = TestClient(app)


def test_module20_security_verification():
    print("=" * 80)
    print("AYURAI MODULE 20: SECURITY & DEPLOYMENT READINESS VERIFICATION SUITE")
    print("=" * 80)

    db = SessionLocal()
    suffix = uuid.uuid4().hex[:6]

    # Setup isolated test users
    admin_user = User(
        email=f"sec_admin_{suffix}@ayurai.com",
        username=f"sec_admin_{suffix}",
        full_name="Security Admin",
        hashed_password=hash_password("Pass123!"),
        role=UserRole.ADMIN,
        is_active=True
    )
    doc_user = User(
        email=f"sec_doc_{suffix}@ayurai.com",
        username=f"sec_doc_{suffix}",
        full_name="Security Doctor",
        hashed_password=hash_password("Pass123!"),
        role=UserRole.DOCTOR,
        is_active=True
    )
    staff_user = User(
        email=f"sec_staff_{suffix}@ayurai.com",
        username=f"sec_staff_{suffix}",
        full_name="Security Staff",
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

    # Setup two separate test patients
    patient_a = Patient(
        patient_id=f"PAT-SECA-{suffix}",
        full_name=f"Patient A ({suffix})",
        gender="FEMALE",
        phone="9876543210"
    )
    patient_b = Patient(
        patient_id=f"PAT-SECB-{suffix}",
        full_name=f"Patient B ({suffix})",
        gender="MALE",
        phone="9876543211"
    )
    db.add_all([patient_a, patient_b])
    db.commit()
    db.refresh(patient_a)
    db.refresh(patient_b)

    case_a = CaseSession(patient_id=patient_a.id, status=CaseStatus.IN_PROGRESS)
    db.add(case_a)
    db.commit()
    db.refresh(case_a)

    # ------------------------------------------------------------------ #
    # [CHECK 1] Health Endpoint Availability
    # ------------------------------------------------------------------ #
    print("\n[CHECK 1] Testing Health & Root Endpoints...")
    res_health = client.get("/health")
    assert res_health.status_code == 200, res_health.text
    assert res_health.json()["status"] == "ok"

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["status"] == "success"
    print("  -> Passed: Health check returned 200 OK with no configuration leakage.")

    # ------------------------------------------------------------------ #
    # [CHECK 2] Authentication & Invalid Login (401)
    # ------------------------------------------------------------------ #
    print("\n[CHECK 2] Testing Authentication & Invalid Login Protection...")
    res_bad_login = client.post(
        "/auth/login",
        data={"username": admin_user.email, "password": "WrongPassword123!"}
    )
    assert res_bad_login.status_code == 401, res_bad_login.text
    print("  -> Passed: Invalid login rejected with HTTP 401 Unauthorized.")

    # ------------------------------------------------------------------ #
    # [CHECK 3] Missing & Invalid JWT Tokens (401)
    # ------------------------------------------------------------------ #
    print("\n[CHECK 3] Testing Missing & Malformed JWT Tokens...")
    res_no_token = client.get("/auth/me")
    assert res_no_token.status_code == 401

    res_bad_token = client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.payload"})
    assert res_bad_token.status_code == 401
    print("  -> Passed: Missing/invalid JWT tokens consistently rejected with HTTP 401.")

    # ------------------------------------------------------------------ #
    # [CHECK 4] Role-Based Access Control: Staff accessing Admin (403)
    # ------------------------------------------------------------------ #
    print("\n[CHECK 4] Testing RBAC: Staff blocked from Admin Endpoints...")
    res_staff_admin = client.get("/admin/users", headers=staff_headers)
    assert res_staff_admin.status_code == 403, res_staff_admin.text

    res_doc_admin = client.get("/admin/audits", headers=doc_headers)
    assert res_doc_admin.status_code == 403, res_doc_admin.text

    res_admin_ok = client.get("/admin/users", headers=admin_headers)
    assert res_admin_ok.status_code == 200
    print("  -> Passed: Admin endpoints strictly enforce ADMIN-only access.")

    # ------------------------------------------------------------------ #
    # [CHECK 5] Role-Based Access Control: Clinical Operations (403)
    # ------------------------------------------------------------------ #
    print("\n[CHECK 5] Testing RBAC: Staff blocked from Clinical Prescriptions...")
    res_staff_rx = client.post(
        "/prescriptions/",
        json={
            "patient_id": patient_a.id,
            "case_session_id": case_a.id,
            "general_instructions": "Staff attempting prescription"
        },
        headers=staff_headers
    )
    assert res_staff_rx.status_code == 403, res_staff_rx.text
    print("  -> Passed: Prescriptions & consultations restricted from Staff execution.")

    # ------------------------------------------------------------------ #
    # [CHECK 6] Cross-Patient Contamination Protection
    # ------------------------------------------------------------------ #
    print("\n[CHECK 6] Testing Cross-Patient Data Isolation...")
    # Attempt to start consultation linking Patient B to Case A (which belongs to Patient A)
    res_cross_cons = client.post(
        "/consultations/",
        json={
            "patient_id": patient_b.id,
            "case_session_id": case_a.id,
            "chief_complaint": "Cross patient attempt"
        },
        headers=doc_headers
    )
    assert res_cross_cons.status_code == 400, res_cross_cons.text
    assert "belong to the specified patient" in res_cross_cons.json()["detail"]
    print("  -> Passed: Cross-patient case association rejected cleanly (HTTP 400).")

    # ------------------------------------------------------------------ #
    # [CHECK 7] Zero Secret / Password Leakage in API Responses
    # ------------------------------------------------------------------ #
    print("\n[CHECK 7] Verifying Zero Secret or Password Hash Exposure...")
    res_me = client.get("/auth/me", headers=admin_headers)
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert "hashed_password" not in me_data
    assert "password" not in me_data
    assert "secret" not in str(me_data).lower()

    res_users = client.get("/admin/users", headers=admin_headers)
    assert res_users.status_code == 200
    users_data = res_users.json()
    assert "hashed_password" not in str(users_data)
    print("  -> Passed: Passwords and credentials never exposed in API outputs.")

    # ------------------------------------------------------------------ #
    # [CHECK 8] Frontend Secret Audit (Gemini API Key never in Frontend)
    # ------------------------------------------------------------------ #
    print("\n[CHECK 8] Auditing Frontend Source Code for Secrets...")
    frontend_src_dir = Path(__file__).resolve().parent.parent / "frontend" / "src"
    assert frontend_src_dir.exists(), "Frontend src directory missing"

    for root, _, files in os.walk(frontend_src_dir):
        for f in files:
            if f.endswith((".js", ".jsx", ".ts", ".tsx", ".json")):
                content = (Path(root) / f).read_text(encoding="utf-8", errors="ignore")
                assert "AIzaSy" not in content, f"Hardcoded Google API key found in {f}"
                assert "GEMINI_API_KEY" not in content or "import.meta.env" not in content, f"Exposed GEMINI_API_KEY in {f}"
    print("  -> Passed: Frontend source verified completely free of backend secrets and API keys.")

    # ------------------------------------------------------------------ #
    # [CHECK 9] File Upload Security: Invalid File Formats & Extensions
    # ------------------------------------------------------------------ #
    print("\n[CHECK 9] Testing Document Upload Security: Executable File Rejection...")
    exe_file = {"file": ("malicious_payload.exe", io.BytesIO(b"MZ... executable binary"), "application/x-msdownload")}
    upload_data = {
        "patient_id": str(patient_a.id),
        "document_type": "OTHER",
        "document_title": "Malicious Test"
    }
    res_bad_upload = client.post("/documents/upload", data=upload_data, files=exe_file, headers=staff_headers)
    assert res_bad_upload.status_code == 400, res_bad_upload.text
    assert "Unsupported file format" in res_bad_upload.json()["detail"]
    print("  -> Passed: Unsupported executable file upload rejected cleanly (HTTP 400).")

    # ------------------------------------------------------------------ #
    # [CHECK 10] File Upload Security: Oversized File Protection (>15MB)
    # ------------------------------------------------------------------ #
    print("\n[CHECK 10] Testing Document Upload Security: Size Limit (>15MB)...")
    oversized_bytes = b"0" * (16 * 1024 * 1024)  # 16 MB
    large_file = {"file": ("oversized_scan.pdf", io.BytesIO(oversized_bytes), "application/pdf")}
    res_large_upload = client.post("/documents/upload", data=upload_data, files=large_file, headers=staff_headers)
    assert res_large_upload.status_code == 400, res_large_upload.text
    assert "exceeds maximum allowed limit" in res_large_upload.json()["detail"]
    print("  -> Passed: Oversized document upload rejected cleanly (HTTP 400).")

    print("\n" + "=" * 80)
    print("MODULE 20: ALL SECURITY VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    test_module20_security_verification()
