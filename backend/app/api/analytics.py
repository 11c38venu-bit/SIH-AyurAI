from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin, require_doctor, require_staff
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.analytics import (
    AdminDashboardResponse,
    AIProcessingOverviewResponse,
    AIProcessingTrendResponse,
    ConsultationOverviewResponse,
    ConsultationTrendResponse,
    DoctorDashboardResponse,
    DoctorWorkloadResponse,
    DocumentOverviewResponse,
    ExportSummaryResponse,
    FollowUpOverviewResponse,
    FollowUpTrendResponse,
    GranularityType,
    MedicineCategoryDistributionResponse,
    NotificationOverviewResponse,
    PatientOverviewResponse,
    PatientTrendResponse,
    PrescriptionOverviewResponse,
    ProgressOverviewResponse,
    ProgressTrendResponse,
    QueueOverviewResponse,
    QueueTrendResponse,
    RoleDashboardSummaryResponse,
    StaffDashboardResponse,
    SystemOverviewResponse,
)
from app.services.analytics_service import (
    get_admin_dashboard_metrics,
    get_ai_processing_overview_metrics,
    get_ai_processing_trend_metrics,
    get_consultation_overview_metrics,
    get_consultation_trend_metrics,
    get_doctor_dashboard_metrics,
    get_doctor_workload_metrics,
    get_document_overview_metrics,
    get_export_summary,
    get_follow_up_overview_metrics,
    get_follow_up_trend_metrics,
    get_medicine_category_distribution,
    get_notification_overview_metrics,
    get_patient_overview_metrics,
    get_patient_trend_metrics,
    get_prescription_overview_metrics,
    get_progress_overview_metrics,
    get_progress_trend_metrics,
    get_queue_overview_metrics,
    get_queue_trend_metrics,
    get_staff_dashboard_metrics,
    get_system_overview_metrics,
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard APIs"])


# ---------------------------------------------------------------------------
# 1. Role-Specific Dashboards
# ---------------------------------------------------------------------------

@router.get(
    "/doctor/dashboard",
    response_model=DoctorDashboardResponse,
    summary="Doctor Dashboard Metrics (Doctor, Admin)"
)
def get_doctor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Retrieve operational metrics for the authenticated doctor's active daily practice.
    """
    is_admin = current_user.role == UserRole.ADMIN
    return get_doctor_dashboard_metrics(db, current_user.id, is_admin=is_admin)


@router.get(
    "/staff/dashboard",
    response_model=StaffDashboardResponse,
    summary="Staff Operational Dashboard Metrics (Staff, Doctor, Admin)"
)
def get_staff_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve clinic-wide operational workflow metrics for front-desk and triage staff.
    """
    return get_staff_dashboard_metrics(db, staff_user_id=current_user.id)


@router.get(
    "/admin/dashboard",
    response_model=AdminDashboardResponse,
    summary="Admin System & Clinical Overview Dashboard (Admin)"
)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Retrieve high-level system, user, and clinic-wide clinical aggregate counts.
    """
    return get_admin_dashboard_metrics(db)


@router.get(
    "/dashboard/summary",
    response_model=RoleDashboardSummaryResponse,
    summary="Role-Aware Dynamic Dashboard Summary"
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns a role-tailored summary dashboard based on the authenticated user's role.
    """
    if current_user.role == UserRole.ADMIN:
        summary_data = get_admin_dashboard_metrics(db).model_dump()
    elif current_user.role == UserRole.DOCTOR:
        summary_data = get_doctor_dashboard_metrics(db, current_user.id, is_admin=False).model_dump()
    else:
        summary_data = get_staff_dashboard_metrics(db, staff_user_id=current_user.id).model_dump()

    return RoleDashboardSummaryResponse(
        role=current_user.role.value,
        summary=summary_data
    )


# ---------------------------------------------------------------------------
# 2. Patient Registration Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/patients/overview",
    response_model=PatientOverviewResponse,
    summary="Patient Registration Overview & Recent Trend (Staff, Doctor, Admin)"
)
def get_patients_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Descriptive patient registration statistics across today, this week, and this month.
    """
    return get_patient_overview_metrics(db, date_from, date_to)


@router.get(
    "/patients/trend",
    response_model=PatientTrendResponse,
    summary="Patient Registration Trend with Granularity (Staff, Doctor, Admin)"
)
def get_patients_trend(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    granularity: GranularityType = Query(GranularityType.DAILY, description="Time granularity (daily, weekly, monthly)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Graph-ready time-series of patient registrations.
    """
    return get_patient_trend_metrics(db, date_from, date_to, granularity)


# ---------------------------------------------------------------------------
# 3. Queue Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/queue/overview",
    response_model=QueueOverviewResponse,
    summary="Queue Status Overview & Average Wait Time (Staff, Doctor, Admin)"
)
def get_queue_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Daily and periodic queue token counts by lifecycle status and priority.
    """
    return get_queue_overview_metrics(db, date_from, date_to)


@router.get(
    "/queue/trend",
    response_model=QueueTrendResponse,
    summary="Queue Throughput Trend (Staff, Doctor, Admin)"
)
def get_queue_trend(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    granularity: GranularityType = Query(GranularityType.DAILY, description="Time granularity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Time-series trend of queue token registrations, completions, and cancellations.
    """
    return get_queue_trend_metrics(db, date_from, date_to, granularity)


# ---------------------------------------------------------------------------
# 4. Consultation Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/consultations/overview",
    response_model=ConsultationOverviewResponse,
    summary="Consultation Status Overview & Operational Completion Rate (Doctor, Staff, Admin)"
)
def get_consultations_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Aggregate counts of clinical consultations by status (DRAFT, IN_PROGRESS, COMPLETED, CANCELLED).
    """
    return get_consultation_overview_metrics(db, date_from, date_to)


@router.get(
    "/consultations/trend",
    response_model=ConsultationTrendResponse,
    summary="Consultation Activity Trend (Doctor, Staff, Admin)"
)
def get_consultations_trend(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    granularity: GranularityType = Query(GranularityType.DAILY, description="Time granularity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Time-series trend of consultation encounters over time.
    """
    return get_consultation_trend_metrics(db, date_from, date_to, granularity)


# ---------------------------------------------------------------------------
# 5. Doctor Workload
# ---------------------------------------------------------------------------

@router.get(
    "/doctors/workload",
    response_model=DoctorWorkloadResponse,
    summary="Doctor Workload Metrics (Doctor: self only, Admin: all)"
)
def get_doctors_workload(
    doctor_id: Optional[int] = Query(None, description="Doctor ID filter (Admin only)"),
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Operational workload counts for doctors. Doctors can only view their own workload.
    """
    is_admin = current_user.role == UserRole.ADMIN
    target_doctor_id = current_user.id if not is_admin else doctor_id
    return get_doctor_workload_metrics(db, target_doctor_id, is_admin=is_admin, date_from=date_from, date_to=date_to)


# ---------------------------------------------------------------------------
# 6. Follow-Up Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/follow-ups/overview",
    response_model=FollowUpOverviewResponse,
    summary="Follow-Up Appointment Overview & Operational Completion Rate (Staff, Doctor, Admin)"
)
def get_follow_ups_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Operational follow-up scheduling, completion, missed, and cancellation statistics.
    """
    return get_follow_up_overview_metrics(db, date_from, date_to)


@router.get(
    "/follow-ups/trend",
    response_model=FollowUpTrendResponse,
    summary="Follow-Up Appointment Activity Trend (Staff, Doctor, Admin)"
)
def get_follow_ups_trend(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    granularity: GranularityType = Query(GranularityType.DAILY, description="Time granularity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Time-series trend of scheduled, completed, missed, and cancelled follow-ups.
    """
    return get_follow_up_trend_metrics(db, date_from, date_to, granularity)


# ---------------------------------------------------------------------------
# 7. Progress Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/progress/overview",
    response_model=ProgressOverviewResponse,
    summary="Practitioner-Entered Progress Observation Overview (Doctor, Admin)"
)
def get_progress_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Descriptive counts of practitioner-entered progress observations and outcomes.
    """
    return get_progress_overview_metrics(db, date_from, date_to)


@router.get(
    "/progress/trend",
    response_model=ProgressTrendResponse,
    summary="Practitioner-Entered Progress Trend (Doctor, Admin)"
)
def get_progress_trend(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    granularity: GranularityType = Query(GranularityType.DAILY, description="Time granularity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Time-series counts of practitioner-entered progress changes (Improving, Stable, Worsening).
    """
    return get_progress_trend_metrics(db, date_from, date_to, granularity)


# ---------------------------------------------------------------------------
# 8. Prescription Analytics & Medicine Categories
# ---------------------------------------------------------------------------

@router.get(
    "/prescriptions/overview",
    response_model=PrescriptionOverviewResponse,
    summary="Prescription Status & Category Distribution Overview (Doctor, Admin)"
)
def get_prescriptions_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Prescription counts by status and medicine category usage.
    """
    return get_prescription_overview_metrics(db, date_from, date_to)


@router.get(
    "/prescriptions/categories",
    response_model=MedicineCategoryDistributionResponse,
    summary="Prescribed Medicine Category Usage Distribution (Doctor, Admin)"
)
def get_prescriptions_categories(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Prescription formulation and category distribution counts (Churna, Vati, Kwath, Taila, etc.).
    """
    return get_medicine_category_distribution(db, date_from, date_to)


# ---------------------------------------------------------------------------
# 9. Document Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/documents/overview",
    response_model=DocumentOverviewResponse,
    summary="Medical Document Processing & Review Overview (Staff, Doctor, Admin)"
)
def get_documents_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Medical document file types, OCR processing status, and AI review counts.
    """
    return get_document_overview_metrics(db, date_from, date_to)


# ---------------------------------------------------------------------------
# 10. AI Processing Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/ai/overview",
    response_model=AIProcessingOverviewResponse,
    summary="AI Case Processing Operational Overview (Doctor, Admin)"
)
def get_ai_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Operational statistics on AI-assisted case processing, completions, and practitioner reviews.
    """
    return get_ai_processing_overview_metrics(db, date_from, date_to)


@router.get(
    "/ai/trend",
    response_model=AIProcessingTrendResponse,
    summary="AI Processing Activity Trend (Doctor, Admin)"
)
def get_ai_trend(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    granularity: GranularityType = Query(GranularityType.DAILY, description="Time granularity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Time-series trend of AI case responses processed, completed, and reviewed.
    """
    return get_ai_processing_trend_metrics(db, date_from, date_to, granularity)


# ---------------------------------------------------------------------------
# 11. Notification Analytics
# ---------------------------------------------------------------------------

@router.get(
    "/notifications/overview",
    response_model=NotificationOverviewResponse,
    summary="Notification Delivery Status & Channel Breakdown (Staff, Doctor, Admin)"
)
def get_notifications_overview(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Multi-channel notification volume, delivery status, and channel breakdowns.
    """
    return get_notification_overview_metrics(db, date_from, date_to)


# ---------------------------------------------------------------------------
# 12. System Health & Export Summary (Admin Only)
# ---------------------------------------------------------------------------

@router.get(
    "/system/overview",
    response_model=SystemOverviewResponse,
    summary="System Health & Entity Record Summary (Admin)"
)
def get_system_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Operational system record counts across all core tables. Secrets and credentials are never exposed.
    """
    return get_system_overview_metrics(db)


@router.get(
    "/export/summary",
    response_model=ExportSummaryResponse,
    summary="Export-Ready Analytics Summary (Admin)"
)
def get_export_summary_endpoint(
    date_from: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Consolidated structured JSON payload suitable for report exports.
    """
    return get_export_summary(db, date_from, date_to)
