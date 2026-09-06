import argparse
import os
import sys
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.models.patient import Patient  # noqa: F401
from app.models.user import User, UserRole  # noqa: F401
from app.models.queue import PatientQueue  # noqa: F401
from app.models.case import CaseSession  # noqa: F401
from app.models.case_question import CaseQuestion  # noqa: F401
from app.models.case_response import CaseResponse  # noqa: F401
from app.models.ayurvedic_assessment import AyurvedicAssessment  # noqa: F401
from app.models.ashtavidha import AshtavidhaPariksha  # noqa: F401
from app.models.dashavidha import DashavidhaPariksha  # noqa: F401
from app.models.medical_history import MedicalHistory  # noqa: F401
from app.models.document import PatientDocument  # noqa: F401
from app.models.ai_case_response import AICaseResponse  # noqa: F401
from app.models.ai_case_summary import AICaseSummary  # noqa: F401
from app.models.document_processing import DocumentProcessing  # noqa: F401
from app.models.consultation import Consultation  # noqa: F401
from app.models.consultation_audit import ConsultationAudit  # noqa: F401
from app.models.medicine import Medicine, MedicineType  # noqa: F401
from app.models.prescription import Prescription, PrescriptionStatus  # noqa: F401
from app.models.prescription_item import PrescriptionItem  # noqa: F401
from app.models.prescription_audit import PrescriptionAudit  # noqa: F401
from app.models.follow_up import FollowUp, FollowUpStatus  # noqa: F401
from app.models.follow_up_visit import FollowUpVisit  # noqa: F401
from app.models.follow_up_audit import FollowUpAudit  # noqa: F401
from app.models.patient_progress import PatientProgress, ProgressTrend, SymptomSeverity, AdherenceLevel, ClinicalOutcome  # noqa: F401
from app.models.patient_progress_audit import PatientProgressAudit  # noqa: F401
from app.models.notification import Notification, NotificationType, NotificationChannel, NotificationStatus, NotificationPriority  # noqa: F401
from app.models.notification_preference import NotificationPreference  # noqa: F401
from app.models.reminder import Reminder, ReminderType, RecurrenceType  # noqa: F401
from app.models.notification_audit import NotificationAudit  # noqa: F401
from app.models.admin_audit import AdminAudit  # noqa: F401



def init_database() -> None:
    """Create database tables that do not exist yet (without dropping existing tables)."""
    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created successfully.")


def create_initial_admin(
    db: Session,
    email: str = "admin@ayurai.com",
    username: str = "admin",
    full_name: str = "AYURAI Administrator",
    password: str = "Admin@123456",
    role: UserRole = UserRole.ADMIN
) -> User:
    """
    Seed the initial Administrator account if it does not already exist.
    """
    existing_user = (
        db.query(User)
        .filter((User.email == email) | (User.username == username))
        .first()
    )

    if existing_user:
        print(f"Admin user already exists (Email: {existing_user.email}, Role: {existing_user.role.value}). Skipping creation.")
        return existing_user

    admin_user = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=hash_password(password),
        role=role,
        is_active=True
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    print(f"Initial administrator created successfully:")
    print(f"  - Email: {admin_user.email}")
    print(f"  - Username: {admin_user.username}")
    print(f"  - Role: {admin_user.role.value}")
    print(f"  - Status: Active")
    return admin_user


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize AYURAI Database & Seed Admin")
    parser.add_argument("--email", default=os.getenv("INIT_ADMIN_EMAIL", "admin@ayurai.com"), help="Admin email")
    parser.add_argument("--username", default=os.getenv("INIT_ADMIN_USERNAME", "admin"), help="Admin username")
    parser.add_argument("--name", default=os.getenv("INIT_ADMIN_FULL_NAME", "AYURAI Administrator"), help="Admin full name")
    parser.add_argument("--password", default=os.getenv("INIT_ADMIN_PASSWORD", "Admin@123456"), help="Admin password")

    args = parser.parse_args()

    init_database()

    db = SessionLocal()
    try:
        create_initial_admin(
            db=db,
            email=args.email,
            username=args.username,
            full_name=args.name,
            password=args.password
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
