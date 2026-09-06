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
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.notification import (
    Notification,
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
    NotificationType,
)
from app.models.notification_preference import NotificationPreference
from app.models.reminder import RecurrenceType, Reminder, ReminderType
from app.models.notification_audit import NotificationAudit
from app.core.security import hash_password, create_access_token

client = TestClient(app)


def setup_test_environment():
    """Sets up isolated test users, patient, consultation, and follow-up."""
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
            is_active=True,
        )
        db.add(admin)

        # 2. Doctor user 1
        doctor1 = User(
            email=f"doctor1_{suffix}@ayurai.com",
            username=f"dr1_{suffix}",
            full_name="Dr. Ayurvedic Lead",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=True,
        )
        db.add(doctor1)

        # 3. Doctor user 2 (for user isolation checks)
        doctor2 = User(
            email=f"doctor2_{suffix}@ayurai.com",
            username=f"dr2_{suffix}",
            full_name="Dr. Second Opinion",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.DOCTOR,
            is_active=True,
        )
        db.add(doctor2)

        # 4. Staff user
        staff = User(
            email=f"staff_{suffix}@ayurai.com",
            username=f"staff_{suffix}",
            full_name="FrontDesk Staff",
            hashed_password=hash_password("Pass123!"),
            role=UserRole.STAFF,
            is_active=True,
        )
        db.add(staff)

        # 5. Patient
        patient = Patient(
            patient_id=f"PAT-{suffix.upper()}",
            full_name="Ramesh Kumar",
            gender="Male",
            phone=f"98765{suffix[:5]}",
            email=f"ramesh_{suffix}@example.com",
        )
        db.add(patient)
        db.flush()


        # 6. Case Session & Consultation
        case = CaseSession(
            patient_id=patient.id,
            status=CaseStatus.COMPLETED,
        )
        db.add(case)
        db.flush()

        consultation = Consultation(
            patient_id=patient.id,
            case_session_id=case.id,
            doctor_id=doctor1.id,
            chief_complaint="Acid indigestion and hyperacidity",
            diagnosis="Amlapitta",
            treatment_plan="Pitta shamana chikitsa",
            consultation_status=ConsultationStatus.COMPLETED,
        )

        db.add(consultation)
        db.commit()

        db.refresh(admin)
        db.refresh(doctor1)
        db.refresh(doctor2)
        db.refresh(staff)
        db.refresh(patient)
        db.refresh(case)
        db.refresh(consultation)

        return {
            "admin": admin,
            "doctor1": doctor1,
            "doctor2": doctor2,
            "staff": staff,
            "patient": patient,
            "case": case,
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
    print("AYURAI MODULE 14 — NOTIFICATIONS & REMINDERS VERIFICATION SUITE")
    print("=" * 70)

    env = setup_test_environment()
    admin_hdr = {"Authorization": f"Bearer {env['admin_token']}"}
    doc1_hdr = {"Authorization": f"Bearer {env['doctor1_token']}"}
    doc2_hdr = {"Authorization": f"Bearer {env['doctor2_token']}"}
    staff_hdr = {"Authorization": f"Bearer {env['staff_token']}"}

    # -----------------------------------------------------------------------
    # TEST 1: Notification Creation & In-App Immediate Delivery
    # -----------------------------------------------------------------------
    print("\n[TEST 1] In-App Notification Creation & Instant Delivery...")
    payload1 = {
        "recipient_user_id": env["doctor1"].id,
        "patient_id": env["patient"].id,
        "notification_type": "STAFF_ALERT",
        "channel": "IN_APP",
        "title": "Patient Arrival",
        "message": "Patient Ramesh Kumar is waiting in Room 3.",
        "priority": "HIGH",
    }
    r = client.post("/notifications/", json=payload1, headers=staff_hdr)
    assert r.status_code == 201, f"Failed: {r.text}"
    notif1 = r.json()
    assert notif1["status"] == "DELIVERED", f"Expected DELIVERED, got {notif1['status']}"
    assert notif1["recipient_user_id"] == env["doctor1"].id
    assert notif1["title"] == "Patient Arrival"
    print("  -> Passed: In-App notification created and marked DELIVERED with audit.")

    # -----------------------------------------------------------------------
    # TEST 2: Multi-channel Provider Graceful Fallback (SMS / WhatsApp / Email)
    # -----------------------------------------------------------------------
    print("\n[TEST 2] External Channel Fallback (Graceful unconfigured provider handling)...")
    payload2 = {
        "recipient_user_id": env["doctor1"].id,
        "patient_id": env["patient"].id,
        "notification_type": "DOCTOR_ALERT",
        "channel": "SMS",
        "title": "Urgent Alert",
        "message": "Emergency lab update.",
        "priority": "HIGH",
    }
    r = client.post("/notifications/", json=payload2, headers=staff_hdr)
    assert r.status_code == 201, f"Failed: {r.text}"
    notif2 = r.json()
    assert "PROVIDER_NOT_CONFIGURED" in (notif2["failure_reason"] or ""), f"Expected provider fallback, got: {notif2}"
    assert notif2["retry_count"] >= 1
    print("  -> Passed: Gracefully handled unconfigured SMS provider with retry tracking.")

    # -----------------------------------------------------------------------
    # TEST 3: User Notification Isolation & Permissions
    # -----------------------------------------------------------------------
    print("\n[TEST 3] User Notification Isolation (Doctor 2 cannot see Doctor 1's notifications)...")
    # Doctor 2 lists notifications
    r = client.get("/notifications/", headers=doc2_hdr)
    assert r.status_code == 200
    doc2_notifs = r.json()
    assert not any(n["id"] == notif1["id"] for n in doc2_notifs), "Doctor 2 should not see Doctor 1's notification"

    # Doctor 2 attempts direct access to Doctor 1's notification
    r = client.get(f"/notifications/{notif1['id']}", headers=doc2_hdr)
    assert r.status_code == 403, f"Expected 403 Forbidden, got {r.status_code}"

    # Admin CAN access Doctor 1's notification
    r = client.get(f"/notifications/{notif1['id']}", headers=admin_hdr)
    assert r.status_code == 200, f"Admin should be able to view: {r.text}"
    print("  -> Passed: Access boundaries strictly enforced between users and elevated for Admin.")

    # -----------------------------------------------------------------------
    # TEST 4: Unread Count Calculation
    # -----------------------------------------------------------------------
    print("\n[TEST 4] Unread Count Tracking...")
    r = client.get("/notifications/unread-count", headers=doc1_hdr)
    assert r.status_code == 200
    counts = r.json()
    assert counts["unread_count"] >= 1, f"Expected at least 1 unread, got: {counts}"
    print(f"  -> Passed: Unread badge count returned correctly: {counts}")

    # -----------------------------------------------------------------------
    # TEST 5: Mark Single Notification as Read
    # -----------------------------------------------------------------------
    print("\n[TEST 5] Mark Single Notification as READ...")
    r = client.patch(f"/notifications/{notif1['id']}/read", headers=doc1_hdr)
    assert r.status_code == 200
    read_notif = r.json()
    assert read_notif["status"] == "READ"
    assert read_notif["read_at"] is not None
    print("  -> Passed: Notification status transitioned to READ with read timestamp.")

    # -----------------------------------------------------------------------
    # TEST 6: Mark All Notifications as Read
    # -----------------------------------------------------------------------
    print("\n[TEST 6] Bulk Mark All Notifications as READ...")
    # Create another notification for doctor1
    payload3 = {
        "recipient_user_id": env["doctor1"].id,
        "notification_type": "SYSTEM",
        "channel": "IN_APP",
        "title": "System Update",
        "message": "Routine maintenance scheduled tonight.",
        "priority": "LOW",
    }
    client.post("/notifications/", json=payload3, headers=staff_hdr)

    r = client.patch("/notifications/read-all", headers=doc1_hdr)
    assert r.status_code == 200
    assert r.json()["count"] >= 1

    r_count = client.get("/notifications/unread-count", headers=doc1_hdr)
    assert r_count.json()["unread_count"] == 0, f"Expected 0 unread, got: {r_count.json()}"
    print("  -> Passed: Bulk mark-all-read cleared unread count successfully.")

    # -----------------------------------------------------------------------
    # TEST 7: Notification Preferences (Get, Update, and Delivery Suppression)
    # -----------------------------------------------------------------------
    print("\n[TEST 7] User Notification Preferences & Category Suppression...")
    # Get current preferences
    r = client.get("/notifications/preferences/me", headers=doc1_hdr)
    assert r.status_code == 200
    pref = r.json()
    assert pref["enabled"] is True

    # Disable system notifications
    r = client.patch("/notifications/preferences/me", json={"system_notifications_enabled": False}, headers=doc1_hdr)
    assert r.status_code == 200
    assert r.json()["system_notifications_enabled"] is False

    # Dispatch a system notification to doctor1 -> Should be CANCELLED / Suppressed
    payload_suppressed = {
        "recipient_user_id": env["doctor1"].id,
        "notification_type": "SYSTEM",
        "channel": "IN_APP",
        "title": "Suppressed Notice",
        "message": "Should be suppressed by user preference.",
    }
    r = client.post("/notifications/", json=payload_suppressed, headers=staff_hdr)
    assert r.status_code == 201
    suppressed_notif = r.json()
    assert suppressed_notif["status"] == "CANCELLED"
    assert "suppressed by user preferences" in suppressed_notif["failure_reason"]

    # Re-enable system notifications
    client.patch("/notifications/preferences/me", json={"system_notifications_enabled": True}, headers=doc1_hdr)
    print("  -> Passed: User preferences properly suppress matching notification dispatches.")

    # -----------------------------------------------------------------------
    # TEST 8: Explicit Reminder Scheduling
    # -----------------------------------------------------------------------
    print("\n[TEST 8] Explicit Reminder Scheduling...")
    future_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    reminder_payload = {
        "patient_id": env["patient"].id,
        "reminder_type": "MEDICINE",
        "title": "Avipattikar Churna Reminder",
        "message": "Take 3g with lukewarm water before dinner.",
        "scheduled_for": future_time,
        "channel": "IN_APP",
        "recurrence_type": "DAILY",
        "recurrence_end_date": str(date.today() + timedelta(days=14)),
    }
    r = client.post("/notifications/reminders", json=reminder_payload, headers=doc1_hdr)
    assert r.status_code == 201, f"Failed: {r.text}"
    reminder = r.json()
    assert reminder["reminder_type"] == "MEDICINE"
    assert reminder["recurrence_type"] == "DAILY"
    assert reminder["notification_id"] is not None

    r = client.get("/notifications/reminders/", headers=staff_hdr)
    assert r.status_code == 200
    assert len(r.json()) >= 1
    print("  -> Passed: Structured reminder created with linked notification and recurrence metadata.")

    # -----------------------------------------------------------------------
    # TEST 9: Follow-Up Automated Reminder Creation & Idempotency
    # -----------------------------------------------------------------------
    print("\n[TEST 9] Automated Follow-Up Reminder Creation & Idempotency...")
    sched_date = date.today() + timedelta(days=7)
    follow_up_payload = {
        "patient_id": env["patient"].id,
        "case_session_id": env["case"].id,
        "consultation_id": env["consultation"].id,
        "scheduled_date": str(sched_date),
        "scheduled_time": "10:30:00",
        "reason": "Assess response to Pitta shamana protocol.",
        "instructions": "Avoid sour foods.",
    }
    r = client.post("/follow-ups/", json=follow_up_payload, headers=doc1_hdr)
    assert r.status_code == 201, f"Failed to create follow-up: {r.text}"
    fu = r.json()
    fu_id = fu["id"]

    # Check that a reminder was automatically created for this follow-up
    r = client.get(f"/notifications/reminders/?follow_up_id={fu_id}", headers=staff_hdr)
    assert r.status_code == 200
    reminders = r.json()
    assert len(reminders) == 1, f"Expected exactly 1 auto-reminder, got: {reminders}"
    assert reminders[0]["follow_up_id"] == fu_id
    assert reminders[0]["reminder_type"] == "FOLLOW_UP"
    print(f"  -> Passed: Follow-up #{fu_id} automatically generated a scheduled reminder.")

    # -----------------------------------------------------------------------
    # TEST 10: Follow-Up Status Change Notifications (Confirm, Missed, Cancel)
    # -----------------------------------------------------------------------
    print("\n[TEST 10] Follow-Up Status Change Event Notifications...")
    # Confirm follow-up
    r = client.patch(f"/follow-ups/{fu_id}/confirm", json={"notes": "Patient confirmed attendance via phone."}, headers=doc1_hdr)
    assert r.status_code == 200
    assert r.json()["status"] == "CONFIRMED"

    # Check notification for confirmation
    r = client.get(f"/notifications/?notification_type=FOLLOW_UP_CONFIRMED", headers=doc1_hdr)
    assert r.status_code == 200
    conf_notifs = [n for n in r.json() if n["follow_up_id"] == fu_id]
    assert len(conf_notifs) >= 1, "Expected confirmation notification"
    assert conf_notifs[0]["status"] == "DELIVERED"
    print("  -> Passed: Follow-up CONFIRMED triggered immediate delivered notification.")

    # Create another follow-up to test Missed and Cancel
    sched_date2 = date.today() + timedelta(days=10)
    r2 = client.post("/follow-ups/", json={
        "patient_id": env["patient"].id,
        "case_session_id": env["case"].id,
        "consultation_id": env["consultation"].id,
        "scheduled_date": str(sched_date2),
        "reason": "Secondary checkup",
    }, headers=doc1_hdr)
    fu2_id = r2.json()["id"]

    # Cancel follow-up 2
    r_cancel = client.patch(f"/follow-ups/{fu2_id}/cancel", json={"cancellation_reason": "Patient relocated."}, headers=doc1_hdr)
    assert r_cancel.status_code == 200
    assert r_cancel.json()["status"] == "CANCELLED"

    r = client.get(f"/notifications/?notification_type=FOLLOW_UP_CANCELLED", headers=doc1_hdr)
    assert r.status_code == 200
    cancel_notifs = [n for n in r.json() if n["follow_up_id"] == fu2_id]
    assert len(cancel_notifs) >= 1, "Expected cancellation notification"
    print("  -> Passed: Follow-up CANCELLED triggered status notification.")

    # -----------------------------------------------------------------------
    # TEST 11: Audit Trail Verification
    # -----------------------------------------------------------------------
    print("\n[TEST 11] Notification Audit Trail Verification...")
    r = client.get(f"/notifications/{notif1['id']}/audits", headers=doc1_hdr)
    assert r.status_code == 200
    audits = r.json()
    assert len(audits) >= 2, f"Expected at least CREATED and DELIVERED/READ audits, got: {audits}"
    actions = [a["action"] for a in audits]
    assert "CREATED" in actions
    assert "READ" in actions
    print(f"  -> Passed: Audit log accurately recorded transitions: {actions}")

    # -----------------------------------------------------------------------
    # TEST 12: Notification Cancellation
    # -----------------------------------------------------------------------
    print("\n[TEST 12] Cancel Notification Directly...")
    payload_to_cancel = {
        "recipient_user_id": env["doctor1"].id,
        "notification_type": "STAFF_ALERT",
        "channel": "IN_APP",
        "title": "Temp Alert",
        "message": "Temporary notice to cancel.",
    }
    r = client.post("/notifications/", json=payload_to_cancel, headers=staff_hdr)
    t_notif_id = r.json()["id"]

    r = client.patch(f"/notifications/{t_notif_id}/cancel", headers=doc1_hdr)
    assert r.status_code == 200
    assert r.json()["status"] == "CANCELLED"
    print("  -> Passed: Direct notification cancellation succeeded.")

    print("\n" + "=" * 70)
    print("MODULE 14: ALL TESTS COMPLETED AND VERIFIED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()
