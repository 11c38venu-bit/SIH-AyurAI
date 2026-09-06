from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_case_response import AICaseResponse, AIProcessingStatus, PractitionerReviewStatus
from app.models.case import CaseSession, CaseStatus
from app.models.consultation import Consultation, ConsultationStatus
from app.models.document import PatientDocument
from app.models.document_processing import (
    AIExtractionStatus,
    DocumentProcessing,
    DocumentProcessingStatus,
    DocumentReviewStatus,
    ExtractionMethod,
)
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.follow_up_visit import FollowUpVisit
from app.models.medicine import Medicine, MedicineType
from app.models.notification import (
    Notification,
    NotificationChannel,
    NotificationStatus,
    NotificationType,
)
from app.models.patient import Patient
from app.models.patient_progress import ClinicalOutcome, PatientProgress, ProgressTrend
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.prescription_item import PrescriptionItem
from app.models.queue import PatientQueue, QueuePriority, QueueStatus
from app.models.user import User, UserRole
from app.schemas.analytics import (
    AdminDashboardResponse,
    AIProcessingOverviewResponse,
    AIProcessingTrendPoint,
    AIProcessingTrendResponse,
    ConsultationOverviewResponse,
    ConsultationTrendPoint,
    ConsultationTrendResponse,
    DoctorDashboardResponse,
    DoctorWorkloadItem,
    DoctorWorkloadResponse,
    DocumentOverviewResponse,
    ExportSummaryResponse,
    FollowUpOverviewResponse,
    FollowUpTrendPoint,
    FollowUpTrendResponse,
    GranularityType,
    MedicineCategoryDistributionItem,
    MedicineCategoryDistributionResponse,
    NotificationOverviewResponse,
    PatientOverviewResponse,
    PatientTrendResponse,
    PrescriptionOverviewResponse,
    ProgressOverviewResponse,
    ProgressTrendPoint,
    ProgressTrendResponse,
    QueueOverviewResponse,
    QueueTrendPoint,
    QueueTrendResponse,
    StaffDashboardResponse,
    SystemOverviewResponse,
    TimeSeriesDataPoint,
)


# ---------------------------------------------------------------------------
# Date Validation & Rate Calculation Helpers
# ---------------------------------------------------------------------------

def validate_date_range(date_from: Optional[date], date_to: Optional[date]) -> None:
    """
    Validates that date_from is not strictly after date_to.
    Raises HTTP 400 if validation fails.
    """
    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date range: 'date_from' ({date_from}) cannot be after 'date_to' ({date_to})."
        )


def calc_rate(numerator: int, denominator: int) -> Optional[float]:
    """
    Calculates operational percentage rate safely.
    Returns None (JSON null) when denominator is 0 to avoid division-by-zero or misleading 0%.
    """
    if not denominator or denominator <= 0:
        return None
    return round((float(numerator) / float(denominator)) * 100.0, 2)


def get_default_date_range(
    date_from: Optional[date],
    date_to: Optional[date],
    default_days: int = 30
) -> tuple[date, date]:
    """
    Returns date_from and date_to with sensible defaults (last N days) if not provided.
    """
    today_utc = datetime.now(timezone.utc).date()
    end_d = date_to if date_to else today_utc
    start_d = date_from if date_from else (end_d - timedelta(days=default_days))
    return start_d, end_d


# ---------------------------------------------------------------------------
# 1. Doctor Dashboard
# ---------------------------------------------------------------------------

def get_doctor_dashboard_metrics(
    db: Session,
    doctor_id: int,
    is_admin: bool = False
) -> DoctorDashboardResponse:
    today_utc = datetime.now(timezone.utc).date()

    # Queue waiting today
    queue_waiting = (
        db.query(PatientQueue)
        .filter(
            PatientQueue.queue_date == today_utc,
            PatientQueue.status == QueueStatus.WAITING
        )
        .count()
    )

    # Consultations query
    consult_query = db.query(Consultation).filter(func.date(Consultation.created_at) == today_utc)
    if not is_admin:
        consult_query = consult_query.filter(Consultation.doctor_id == doctor_id)

    consultations_today = consult_query.count()
    consultations_completed_today = consult_query.filter(
        Consultation.consultation_status == ConsultationStatus.COMPLETED
    ).count()

    # Distinct patients seen today
    distinct_patients = consult_query.with_entities(Consultation.patient_id).distinct().count()

    # Follow-ups query
    fu_query = db.query(FollowUp)
    if not is_admin:
        fu_query = fu_query.filter(FollowUp.doctor_id == doctor_id)

    follow_ups_today = fu_query.filter(FollowUp.scheduled_date == today_utc).count()
    upcoming_follow_ups = fu_query.filter(
        FollowUp.scheduled_date > today_utc,
        FollowUp.status.in_([FollowUpStatus.SCHEDULED, FollowUpStatus.CONFIRMED])
    ).count()

    # Pending progress records: visits without a linked progress record
    visit_query = db.query(FollowUpVisit).join(FollowUp, FollowUpVisit.follow_up_id == FollowUp.id)
    if not is_admin:
        visit_query = visit_query.filter(FollowUp.doctor_id == doctor_id)
    
    recorded_visit_ids = db.query(PatientProgress.follow_up_visit_id).scalar_subquery()
    pending_progress = visit_query.filter(FollowUpVisit.id.not_in(recorded_visit_ids)).count()


    # Unread notifications
    unread_notifs = (
        db.query(Notification)
        .filter(
            Notification.recipient_user_id == doctor_id,
            Notification.status.in_([
                NotificationStatus.PENDING,
                NotificationStatus.SENT,
                NotificationStatus.DELIVERED
            ])
        )
        .count()
    )

    return DoctorDashboardResponse(
        date=str(today_utc),
        patients_today=distinct_patients,
        queue_waiting=queue_waiting,
        consultations_today=consultations_today,
        consultations_completed_today=consultations_completed_today,
        follow_ups_today=follow_ups_today,
        upcoming_follow_ups=upcoming_follow_ups,
        pending_progress_records=pending_progress,
        unread_notifications=unread_notifs
    )


# ---------------------------------------------------------------------------
# 2. Staff Dashboard
# ---------------------------------------------------------------------------

def get_staff_dashboard_metrics(db: Session, staff_user_id: Optional[int] = None) -> StaffDashboardResponse:
    today_utc = datetime.now(timezone.utc).date()

    patients_registered_today = (
        db.query(Patient)
        .filter(func.date(Patient.created_at) == today_utc)
        .count()
    )

    patients_waiting = (
        db.query(PatientQueue)
        .filter(
            PatientQueue.queue_date == today_utc,
            PatientQueue.status == QueueStatus.WAITING
        )
        .count()
    )

    patients_in_consultation = (
        db.query(PatientQueue)
        .filter(
            PatientQueue.queue_date == today_utc,
            PatientQueue.status == QueueStatus.IN_CONSULTATION
        )
        .count()
    )

    completed_consultations = (
        db.query(Consultation)
        .filter(
            func.date(Consultation.created_at) == today_utc,
            Consultation.consultation_status == ConsultationStatus.COMPLETED
        )
        .count()
    )

    pending_cases = (
        db.query(CaseSession)
        .filter(CaseSession.status == CaseStatus.IN_PROGRESS)
        .count()
    )

    todays_follow_ups = (
        db.query(FollowUp)
        .filter(FollowUp.scheduled_date == today_utc)
        .count()
    )

    missed_follow_ups = (
        db.query(FollowUp)
        .filter(
            FollowUp.scheduled_date == today_utc,
            FollowUp.status == FollowUpStatus.MISSED
        )
        .count()
    )

    # Unread staff alerts
    notif_query = db.query(Notification).filter(
        Notification.status.in_([
            NotificationStatus.PENDING,
            NotificationStatus.SENT,
            NotificationStatus.DELIVERED
        ])
    )
    if staff_user_id:
        notif_query = notif_query.filter(
            or_(
                Notification.recipient_user_id == staff_user_id,
                Notification.notification_type == NotificationType.STAFF_ALERT
            )
        )
    else:
        notif_query = notif_query.filter(Notification.notification_type == NotificationType.STAFF_ALERT)
    
    unread_staff_notifs = notif_query.count()

    docs_awaiting = (
        db.query(DocumentProcessing)
        .filter(
            or_(
                DocumentProcessing.processing_status.in_([
                    DocumentProcessingStatus.NOT_PROCESSED,
                    DocumentProcessingStatus.PROCESSING
                ]),
                DocumentProcessing.practitioner_review_status == DocumentReviewStatus.NOT_REVIEWED
            )
        )

        .count()
    )

    return StaffDashboardResponse(
        date=str(today_utc),
        patients_registered_today=patients_registered_today,
        patients_waiting=patients_waiting,
        patients_in_consultation=patients_in_consultation,
        completed_consultations=completed_consultations,
        pending_case_taking_sessions=pending_cases,
        todays_follow_ups=todays_follow_ups,
        missed_follow_ups=missed_follow_ups,
        unread_staff_notifications=unread_staff_notifs,
        documents_awaiting_processing_review=docs_awaiting
    )


# ---------------------------------------------------------------------------
# 3. Admin Dashboard
# ---------------------------------------------------------------------------

def get_admin_dashboard_metrics(db: Session) -> AdminDashboardResponse:
    today_utc = datetime.now(timezone.utc).date()
    week_start = today_utc - timedelta(days=7)
    month_start = today_utc - timedelta(days=30)

    total_patients = db.query(Patient).count()
    new_patients_today = db.query(Patient).filter(func.date(Patient.created_at) == today_utc).count()
    new_patients_this_week = db.query(Patient).filter(func.date(Patient.created_at) >= week_start).count()
    new_patients_this_month = db.query(Patient).filter(func.date(Patient.created_at) >= month_start).count()

    total_doctors = db.query(User).filter(User.role == UserRole.DOCTOR).count()
    total_staff = db.query(User).filter(User.role == UserRole.STAFF).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = db.query(User).filter(User.is_active == False).count()

    total_consultations = db.query(Consultation).count()
    total_prescriptions = db.query(Prescription).count()
    total_follow_ups = db.query(FollowUp).count()
    total_notifications = db.query(Notification).count()
    total_documents = db.query(PatientDocument).count()
    total_ai_processing_records = db.query(AICaseResponse).count()

    return AdminDashboardResponse(
        date=str(today_utc),
        total_patients=total_patients,
        new_patients_today=new_patients_today,
        new_patients_this_week=new_patients_this_week,
        new_patients_this_month=new_patients_this_month,
        total_doctors=total_doctors,
        total_staff=total_staff,
        active_users=active_users,
        inactive_users=inactive_users,
        total_consultations=total_consultations,
        total_prescriptions=total_prescriptions,
        total_follow_ups=total_follow_ups,
        total_notifications=total_notifications,
        total_documents=total_documents,
        total_ai_processing_records=total_ai_processing_records
    )


# ---------------------------------------------------------------------------
# 4. Patient Registration Analytics & Trend
# ---------------------------------------------------------------------------

def get_patient_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> PatientOverviewResponse:
    validate_date_range(date_from, date_to)
    today_utc = datetime.now(timezone.utc).date()
    week_start = today_utc - timedelta(days=7)
    month_start = today_utc - timedelta(days=30)

    total_patients = db.query(Patient).count()
    new_patients_today = db.query(Patient).filter(func.date(Patient.created_at) == today_utc).count()
    new_patients_this_week = db.query(Patient).filter(func.date(Patient.created_at) >= week_start).count()
    new_patients_this_month = db.query(Patient).filter(func.date(Patient.created_at) >= month_start).count()

    # Recent registration trend (last 30 days or filtered)
    start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)

    trend_rows = (
        db.query(
            func.date(Patient.created_at).label("reg_date"),
            func.count(Patient.id).label("cnt")
        )
        .filter(
            func.date(Patient.created_at) >= start_d,
            func.date(Patient.created_at) <= end_d
        )
        .group_by(func.date(Patient.created_at))
        .order_by(func.date(Patient.created_at).asc())
        .all()
    )

    trend = [
        TimeSeriesDataPoint(date=str(row.reg_date), count=row.cnt)
        for row in trend_rows
    ]

    return PatientOverviewResponse(
        total_patients=total_patients,
        new_patients_today=new_patients_today,
        new_patients_this_week=new_patients_this_week,
        new_patients_this_month=new_patients_this_month,
        registration_trend=trend
    )


def get_patient_trend_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    granularity: GranularityType = GranularityType.DAILY
) -> PatientTrendResponse:
    validate_date_range(date_from, date_to)
    start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)

    trunc_unit = "day" if granularity == GranularityType.DAILY else ("week" if granularity == GranularityType.WEEKLY else "month")
    
    trend_rows = (
        db.query(
            func.date_trunc(trunc_unit, Patient.created_at).label("period"),
            func.count(Patient.id).label("cnt")
        )
        .filter(
            func.date(Patient.created_at) >= start_d,
            func.date(Patient.created_at) <= end_d
        )
        .group_by(func.date_trunc(trunc_unit, Patient.created_at))
        .order_by(func.date_trunc(trunc_unit, Patient.created_at).asc())
        .all()
    )

    trend = [
        TimeSeriesDataPoint(
            date=row.period.strftime("%Y-%m-%d") if isinstance(row.period, (datetime, date)) else str(row.period)[:10],
            count=row.cnt
        )
        for row in trend_rows
    ]

    return PatientTrendResponse(granularity=granularity.value, trend=trend)


# ---------------------------------------------------------------------------
# 5. Queue Analytics & Trend
# ---------------------------------------------------------------------------

def get_queue_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> QueueOverviewResponse:
    validate_date_range(date_from, date_to)
    today_utc = datetime.now(timezone.utc).date()

    query = db.query(PatientQueue)
    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=0)
        query = query.filter(PatientQueue.queue_date >= start_d, PatientQueue.queue_date <= end_d)
    else:
        query = query.filter(PatientQueue.queue_date == today_utc)

    all_rows = query.all()
    total_today = len(all_rows)

    waiting = sum(1 for r in all_rows if r.status == QueueStatus.WAITING)
    called = sum(1 for r in all_rows if r.status == QueueStatus.CALLED)
    in_consultation = sum(1 for r in all_rows if r.status == QueueStatus.IN_CONSULTATION)
    completed = sum(1 for r in all_rows if r.status == QueueStatus.COMPLETED)
    cancelled = sum(1 for r in all_rows if r.status == QueueStatus.CANCELLED)
    priority_count = sum(1 for r in all_rows if r.priority == QueuePriority.PRIORITY)

    # Average wait time: only if timestamps exist
    wait_times = [
        (r.called_at - r.created_at).total_seconds() / 60.0
        for r in all_rows
        if r.called_at and r.created_at and r.called_at >= r.created_at
    ]
    avg_wait = round(sum(wait_times) / len(wait_times), 1) if wait_times else None

    return QueueOverviewResponse(
        waiting=waiting,
        called=called,
        in_consultation=in_consultation,
        completed=completed,
        cancelled=cancelled,
        total_today=total_today,
        priority_count=priority_count,
        average_wait_time_minutes=avg_wait
    )


def get_queue_trend_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    granularity: GranularityType = GranularityType.DAILY
) -> QueueTrendResponse:
    validate_date_range(date_from, date_to)
    start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)

    rows = (
        db.query(PatientQueue)
        .filter(PatientQueue.queue_date >= start_d, PatientQueue.queue_date <= end_d)
        .order_by(PatientQueue.queue_date.asc())
        .all()
    )

    # Aggregate by date bucket
    bucket_map: Dict[str, Dict[str, int]] = {}
    for r in rows:
        d_str = str(r.queue_date)
        if d_str not in bucket_map:
            bucket_map[d_str] = {"registered": 0, "completed": 0, "cancelled": 0, "missed": 0}
        bucket_map[d_str]["registered"] += 1
        if r.status == QueueStatus.COMPLETED:
            bucket_map[d_str]["completed"] += 1
        elif r.status == QueueStatus.CANCELLED:
            bucket_map[d_str]["cancelled"] += 1

    trend = [
        QueueTrendPoint(
            date=d,
            registered=counts["registered"],
            completed=counts["completed"],
            cancelled=counts["cancelled"],
            missed=counts["missed"]
        )
        for d, counts in sorted(bucket_map.items())
    ]

    return QueueTrendResponse(granularity=granularity.value, trend=trend)


# ---------------------------------------------------------------------------
# 6. Consultation Analytics & Trend
# ---------------------------------------------------------------------------

def get_consultation_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> ConsultationOverviewResponse:
    validate_date_range(date_from, date_to)
    query = db.query(Consultation)

    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        query = query.filter(
            func.date(Consultation.created_at) >= start_d,
            func.date(Consultation.created_at) <= end_d
        )

    all_rows = query.all()
    total = len(all_rows)
    draft = sum(1 for r in all_rows if r.consultation_status == ConsultationStatus.DRAFT)
    in_progress = sum(1 for r in all_rows if r.consultation_status == ConsultationStatus.IN_PROGRESS)
    completed = sum(1 for r in all_rows if r.consultation_status == ConsultationStatus.COMPLETED)
    cancelled = sum(1 for r in all_rows if r.consultation_status == ConsultationStatus.CANCELLED)

    comp_rate = calc_rate(completed, total)

    return ConsultationOverviewResponse(
        total_consultations=total,
        draft=draft,
        in_progress=in_progress,
        completed=completed,
        cancelled=cancelled,
        completion_rate=comp_rate
    )


def get_consultation_trend_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    granularity: GranularityType = GranularityType.DAILY
) -> ConsultationTrendResponse:
    validate_date_range(date_from, date_to)
    start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)

    rows = (
        db.query(Consultation)
        .filter(
            func.date(Consultation.created_at) >= start_d,
            func.date(Consultation.created_at) <= end_d
        )
        .all()
    )

    bucket_map: Dict[str, Dict[str, int]] = {}
    for r in rows:
        d_str = str(r.created_at.date() if r.created_at else start_d)
        if d_str not in bucket_map:
            bucket_map[d_str] = {"total": 0, "completed": 0, "cancelled": 0}
        bucket_map[d_str]["total"] += 1
        if r.consultation_status == ConsultationStatus.COMPLETED:
            bucket_map[d_str]["completed"] += 1
        elif r.consultation_status == ConsultationStatus.CANCELLED:
            bucket_map[d_str]["cancelled"] += 1

    trend = [
        ConsultationTrendPoint(
            date=d,
            consultation_count=counts["total"],
            completed_count=counts["completed"],
            cancelled_count=counts["cancelled"]
        )
        for d, counts in sorted(bucket_map.items())
    ]

    return ConsultationTrendResponse(granularity=granularity.value, trend=trend)


# ---------------------------------------------------------------------------
# 7. Doctor Workload
# ---------------------------------------------------------------------------

def get_doctor_workload_metrics(
    db: Session,
    doctor_id: Optional[int] = None,
    is_admin: bool = False,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> DoctorWorkloadResponse:
    validate_date_range(date_from, date_to)

    doc_query = db.query(User).filter(User.role == UserRole.DOCTOR)
    if not is_admin:
        doc_query = doc_query.filter(User.id == doctor_id)
    elif doctor_id:
        doc_query = doc_query.filter(User.id == doctor_id)

    doctors = doc_query.all()
    workload_items = []

    for doc in doctors:
        # Consultations
        c_query = db.query(Consultation).filter(Consultation.doctor_id == doc.id)
        if date_from or date_to:
            start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
            c_query = c_query.filter(
                func.date(Consultation.created_at) >= start_d,
                func.date(Consultation.created_at) <= end_d
            )
        
        c_rows = c_query.all()
        comp_c = sum(1 for c in c_rows if c.consultation_status == ConsultationStatus.COMPLETED)
        prog_c = sum(1 for c in c_rows if c.consultation_status == ConsultationStatus.IN_PROGRESS)

        # Follow-ups
        f_query = db.query(FollowUp).filter(FollowUp.doctor_id == doc.id)
        if date_from or date_to:
            start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
            f_query = f_query.filter(FollowUp.scheduled_date >= start_d, FollowUp.scheduled_date <= end_d)
        
        f_rows = f_query.all()
        assigned_f = len(f_rows)
        comp_f = sum(1 for f in f_rows if f.status == FollowUpStatus.COMPLETED)

        workload_items.append(
            DoctorWorkloadItem(
                doctor_id=doc.id,
                doctor_name=doc.full_name or doc.username,
                consultations_completed=comp_c,
                consultations_in_progress=prog_c,
                follow_ups_assigned=assigned_f,
                follow_ups_completed=comp_f
            )
        )

    return DoctorWorkloadResponse(doctors=workload_items)


# ---------------------------------------------------------------------------
# 8. Follow-Up Analytics & Trend
# ---------------------------------------------------------------------------

def get_follow_up_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> FollowUpOverviewResponse:
    validate_date_range(date_from, date_to)
    today_utc = datetime.now(timezone.utc).date()

    query = db.query(FollowUp)
    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        query = query.filter(FollowUp.scheduled_date >= start_d, FollowUp.scheduled_date <= end_d)

    all_rows = query.all()
    scheduled = sum(1 for r in all_rows if r.status == FollowUpStatus.SCHEDULED)
    confirmed = sum(1 for r in all_rows if r.status == FollowUpStatus.CONFIRMED)
    completed = sum(1 for r in all_rows if r.status == FollowUpStatus.COMPLETED)
    missed = sum(1 for r in all_rows if r.status == FollowUpStatus.MISSED)
    cancelled = sum(1 for r in all_rows if r.status == FollowUpStatus.CANCELLED)

    due_today = sum(1 for r in all_rows if r.scheduled_date == today_utc)
    upcoming = sum(1 for r in all_rows if r.scheduled_date > today_utc and r.status in (FollowUpStatus.SCHEDULED, FollowUpStatus.CONFIRMED))

    applicable = scheduled + confirmed + completed + missed
    comp_rate = calc_rate(completed, applicable)

    return FollowUpOverviewResponse(
        scheduled=scheduled,
        confirmed=confirmed,
        completed=completed,
        missed=missed,
        cancelled=cancelled,
        due_today=due_today,
        upcoming=upcoming,
        completion_rate=comp_rate
    )


def get_follow_up_trend_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    granularity: GranularityType = GranularityType.DAILY
) -> FollowUpTrendResponse:
    validate_date_range(date_from, date_to)
    start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)

    rows = (
        db.query(FollowUp)
        .filter(FollowUp.scheduled_date >= start_d, FollowUp.scheduled_date <= end_d)
        .order_by(FollowUp.scheduled_date.asc())
        .all()
    )

    bucket_map: Dict[str, Dict[str, int]] = {}
    for r in rows:
        d_str = str(r.scheduled_date)
        if d_str not in bucket_map:
            bucket_map[d_str] = {"scheduled": 0, "completed": 0, "missed": 0, "cancelled": 0}
        bucket_map[d_str]["scheduled"] += 1
        if r.status == FollowUpStatus.COMPLETED:
            bucket_map[d_str]["completed"] += 1
        elif r.status == FollowUpStatus.MISSED:
            bucket_map[d_str]["missed"] += 1
        elif r.status == FollowUpStatus.CANCELLED:
            bucket_map[d_str]["cancelled"] += 1

    trend = [
        FollowUpTrendPoint(
            date=d,
            scheduled=counts["scheduled"],
            completed=counts["completed"],
            missed=counts["missed"],
            cancelled=counts["cancelled"]
        )
        for d, counts in sorted(bucket_map.items())
    ]

    return FollowUpTrendResponse(granularity=granularity.value, trend=trend)


# ---------------------------------------------------------------------------
# 9. Progress Analytics & Trend
# ---------------------------------------------------------------------------

def get_progress_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> ProgressOverviewResponse:
    validate_date_range(date_from, date_to)
    query = db.query(PatientProgress)

    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        query = query.filter(
            func.date(PatientProgress.created_at) >= start_d,
            func.date(PatientProgress.created_at) <= end_d
        )

    all_rows = query.all()
    total = len(all_rows)

    improving = sum(1 for r in all_rows if r.symptom_change == ProgressTrend.IMPROVING)
    stable = sum(1 for r in all_rows if r.symptom_change == ProgressTrend.STABLE)
    worsening = sum(1 for r in all_rows if r.symptom_change == ProgressTrend.WORSENING)
    fluctuating = sum(1 for r in all_rows if r.symptom_change == ProgressTrend.FLUCTUATING)
    not_assessed = sum(1 for r in all_rows if r.symptom_change == ProgressTrend.NOT_ASSESSED)

    out_improved = sum(1 for r in all_rows if r.clinical_outcome == ClinicalOutcome.IMPROVED)
    out_stable = sum(1 for r in all_rows if r.clinical_outcome == ClinicalOutcome.STABLE)
    out_not_improved = sum(1 for r in all_rows if r.clinical_outcome == ClinicalOutcome.NOT_IMPROVED)
    out_worsened = sum(1 for r in all_rows if r.clinical_outcome == ClinicalOutcome.WORSENED)
    out_inconclusive = sum(1 for r in all_rows if r.clinical_outcome == ClinicalOutcome.INCONCLUSIVE)
    out_not_assessed = sum(1 for r in all_rows if r.clinical_outcome == ClinicalOutcome.NOT_ASSESSED)

    return ProgressOverviewResponse(
        total_progress_records=total,
        improving_observations=improving,
        stable_observations=stable,
        worsening_observations=worsening,
        fluctuating_observations=fluctuating,
        not_assessed_observations=not_assessed,
        outcome_improved=out_improved,
        outcome_stable=out_stable,
        outcome_not_improved=out_not_improved,
        outcome_worsened=out_worsened,
        outcome_inconclusive=out_inconclusive,
        outcome_not_assessed=out_not_assessed
    )


def get_progress_trend_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    granularity: GranularityType = GranularityType.DAILY
) -> ProgressTrendResponse:
    validate_date_range(date_from, date_to)
    start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)

    rows = (
        db.query(PatientProgress)
        .filter(
            func.date(PatientProgress.created_at) >= start_d,
            func.date(PatientProgress.created_at) <= end_d
        )
        .all()
    )

    bucket_map: Dict[str, Dict[str, int]] = {}
    for r in rows:
        d_str = str(r.created_at.date() if r.created_at else start_d)
        if d_str not in bucket_map:
            bucket_map[d_str] = {"improving": 0, "stable": 0, "worsening": 0, "fluctuating": 0, "not_assessed": 0}
        if r.symptom_change == ProgressTrend.IMPROVING:
            bucket_map[d_str]["improving"] += 1
        elif r.symptom_change == ProgressTrend.STABLE:
            bucket_map[d_str]["stable"] += 1
        elif r.symptom_change == ProgressTrend.WORSENING:
            bucket_map[d_str]["worsening"] += 1
        elif r.symptom_change == ProgressTrend.FLUCTUATING:
            bucket_map[d_str]["fluctuating"] += 1
        else:
            bucket_map[d_str]["not_assessed"] += 1

    trend = [
        ProgressTrendPoint(
            date=d,
            improving=counts["improving"],
            stable=counts["stable"],
            worsening=counts["worsening"],
            fluctuating=counts["fluctuating"],
            not_assessed=counts["not_assessed"]
        )
        for d, counts in sorted(bucket_map.items())
    ]

    return ProgressTrendResponse(granularity=granularity.value, trend=trend)


# ---------------------------------------------------------------------------
# 10. Prescription Analytics & Medicine Categories
# ---------------------------------------------------------------------------

def get_prescription_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> PrescriptionOverviewResponse:
    validate_date_range(date_from, date_to)
    query = db.query(Prescription)

    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        query = query.filter(
            func.date(Prescription.created_at) >= start_d,
            func.date(Prescription.created_at) <= end_d
        )

    all_rows = query.all()
    total = len(all_rows)
    draft = sum(1 for r in all_rows if r.prescription_status == PrescriptionStatus.DRAFT)
    finalized = sum(1 for r in all_rows if r.prescription_status == PrescriptionStatus.FINALIZED)
    cancelled = sum(1 for r in all_rows if r.prescription_status == PrescriptionStatus.CANCELLED)

    # Categories breakdown
    cat_query = (
        db.query(
            Medicine.category,
            func.count(PrescriptionItem.id)
        )
        .join(PrescriptionItem, PrescriptionItem.medicine_id == Medicine.id)
        .join(Prescription, PrescriptionItem.prescription_id == Prescription.id)
    )
    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        cat_query = cat_query.filter(
            func.date(Prescription.created_at) >= start_d,
            func.date(Prescription.created_at) <= end_d
        )
    cat_rows = cat_query.group_by(Medicine.category).all()
    cat_dict = {cat.value if hasattr(cat, "value") else str(cat): count for cat, count in cat_rows}

    return PrescriptionOverviewResponse(
        total_prescriptions=total,
        draft=draft,
        finalized=finalized,
        cancelled=cancelled,
        prescriptions_by_medicine_category=cat_dict
    )


def get_medicine_category_distribution(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> MedicineCategoryDistributionResponse:
    validate_date_range(date_from, date_to)
    cat_query = (
        db.query(
            Medicine.category,
            func.count(PrescriptionItem.id).label("cnt")
        )
        .join(PrescriptionItem, PrescriptionItem.medicine_id == Medicine.id)
        .join(Prescription, PrescriptionItem.prescription_id == Prescription.id)
    )
    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        cat_query = cat_query.filter(
            func.date(Prescription.created_at) >= start_d,
            func.date(Prescription.created_at) <= end_d
        )
    cat_rows = cat_query.group_by(Medicine.category).order_by(func.count(PrescriptionItem.id).desc()).all()

    items = [
        MedicineCategoryDistributionItem(
            category=cat.value if hasattr(cat, "value") else str(cat),
            count=cnt
        )
        for cat, cnt in cat_rows
    ]

    return MedicineCategoryDistributionResponse(categories=items)


# ---------------------------------------------------------------------------
# 11. Document Analytics
# ---------------------------------------------------------------------------

def get_document_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> DocumentOverviewResponse:
    validate_date_range(date_from, date_to)
    doc_query = db.query(PatientDocument)

    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        doc_query = doc_query.filter(
            func.date(PatientDocument.created_at) >= start_d,
            func.date(PatientDocument.created_at) <= end_d
        )

    all_docs = doc_query.all()
    total = len(all_docs)
    pdf_count = sum(1 for d in all_docs if d.mime_type and "pdf" in d.mime_type.lower())
    image_count = sum(1 for d in all_docs if d.mime_type and any(img in d.mime_type.lower() for img in ["image", "png", "jpeg", "jpg"]))

    # Processing stats
    proc_query = db.query(DocumentProcessing)
    all_proc = proc_query.all()

    processed_count = sum(1 for p in all_proc if p.processing_status == DocumentProcessingStatus.COMPLETED)
    pending_proc = sum(1 for p in all_proc if p.processing_status in (DocumentProcessingStatus.NOT_PROCESSED, DocumentProcessingStatus.PROCESSING))
    failed_proc = sum(1 for p in all_proc if p.processing_status == DocumentProcessingStatus.FAILED)
    ai_reviewed = sum(1 for p in all_proc if p.practitioner_review_status in (DocumentReviewStatus.REVIEWED, DocumentReviewStatus.ACCEPTED, DocumentReviewStatus.CORRECTED))
    ocr_processed = sum(1 for p in all_proc if p.extraction_method == ExtractionMethod.OCR)


    return DocumentOverviewResponse(
        total_documents=total,
        pdf_count=pdf_count,
        image_count=image_count,
        processed_count=processed_count,
        pending_processing=pending_proc,
        failed_processing=failed_proc,
        ai_reviewed=ai_reviewed,
        ocr_processed=ocr_processed
    )


# ---------------------------------------------------------------------------
# 12. AI Processing Analytics & Trend
# ---------------------------------------------------------------------------

def get_ai_processing_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> AIProcessingOverviewResponse:
    validate_date_range(date_from, date_to)
    query = db.query(AICaseResponse)

    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        query = query.filter(
            func.date(AICaseResponse.created_at) >= start_d,
            func.date(AICaseResponse.created_at) <= end_d
        )

    all_rows = query.all()
    total = len(all_rows)

    completed = sum(1 for r in all_rows if r.processing_status == AIProcessingStatus.COMPLETED)
    failed = sum(1 for r in all_rows if r.processing_status == AIProcessingStatus.FAILED)
    pending = sum(1 for r in all_rows if r.processing_status == AIProcessingStatus.PENDING)
    processing = sum(1 for r in all_rows if r.processing_status == AIProcessingStatus.PROCESSING)

    reviewed = sum(1 for r in all_rows if r.practitioner_review_status in (PractitionerReviewStatus.REVIEWED, PractitionerReviewStatus.ACCEPTED, PractitionerReviewStatus.CORRECTED))
    accepted = sum(1 for r in all_rows if r.practitioner_review_status == PractitionerReviewStatus.ACCEPTED)
    corrected = sum(1 for r in all_rows if r.practitioner_review_status == PractitionerReviewStatus.CORRECTED)
    rejected = sum(1 for r in all_rows if r.practitioner_review_status == PractitionerReviewStatus.REJECTED)

    provider = getattr(settings, "AI_PROVIDER", "gemini")

    return AIProcessingOverviewResponse(
        provider=provider,
        total_ai_processing_requests=total,
        completed=completed,
        failed=failed,
        pending=pending,
        processing=processing,
        reviewed=reviewed,
        accepted=accepted,
        corrected=corrected,
        rejected=rejected
    )


def get_ai_processing_trend_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    granularity: GranularityType = GranularityType.DAILY
) -> AIProcessingTrendResponse:
    validate_date_range(date_from, date_to)
    start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)

    rows = (
        db.query(AICaseResponse)
        .filter(
            func.date(AICaseResponse.created_at) >= start_d,
            func.date(AICaseResponse.created_at) <= end_d
        )
        .all()
    )

    bucket_map: Dict[str, Dict[str, int]] = {}
    for r in rows:
        d_str = str(r.created_at.date() if r.created_at else start_d)
        if d_str not in bucket_map:
            bucket_map[d_str] = {"processed": 0, "completed": 0, "failed": 0, "reviewed": 0}
        bucket_map[d_str]["processed"] += 1
        if r.processing_status == AIProcessingStatus.COMPLETED:
            bucket_map[d_str]["completed"] += 1
        elif r.processing_status == AIProcessingStatus.FAILED:
            bucket_map[d_str]["failed"] += 1
        if r.practitioner_review_status in (PractitionerReviewStatus.REVIEWED, PractitionerReviewStatus.ACCEPTED, PractitionerReviewStatus.CORRECTED):
            bucket_map[d_str]["reviewed"] += 1


    trend = [
        AIProcessingTrendPoint(
            date=d,
            processed=counts["processed"],
            completed=counts["completed"],
            failed=counts["failed"],
            reviewed=counts["reviewed"]
        )
        for d, counts in sorted(bucket_map.items())
    ]

    return AIProcessingTrendResponse(granularity=granularity.value, trend=trend)


# ---------------------------------------------------------------------------
# 13. Notification Analytics
# ---------------------------------------------------------------------------

def get_notification_overview_metrics(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> NotificationOverviewResponse:
    validate_date_range(date_from, date_to)
    query = db.query(Notification)

    if date_from or date_to:
        start_d, end_d = get_default_date_range(date_from, date_to, default_days=30)
        query = query.filter(
            func.date(Notification.created_at) >= start_d,
            func.date(Notification.created_at) <= end_d
        )

    all_rows = query.all()
    total = len(all_rows)

    pending = sum(1 for r in all_rows if r.status == NotificationStatus.PENDING)
    sent = sum(1 for r in all_rows if r.status == NotificationStatus.SENT)
    delivered = sum(1 for r in all_rows if r.status == NotificationStatus.DELIVERED)
    read_cnt = sum(1 for r in all_rows if r.status == NotificationStatus.READ)
    failed = sum(1 for r in all_rows if r.status == NotificationStatus.FAILED)
    cancelled = sum(1 for r in all_rows if r.status == NotificationStatus.CANCELLED)
    unread = sum(1 for r in all_rows if r.status in (NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.DELIVERED))

    # Channel breakdown
    channel_counts = {
        "IN_APP": sum(1 for r in all_rows if r.channel == NotificationChannel.IN_APP),
        "EMAIL": sum(1 for r in all_rows if r.channel == NotificationChannel.EMAIL),
        "SMS": sum(1 for r in all_rows if r.channel == NotificationChannel.SMS),
        "WHATSAPP": sum(1 for r in all_rows if r.channel == NotificationChannel.WHATSAPP),
    }

    return NotificationOverviewResponse(
        total_notifications=total,
        pending=pending,
        sent=sent,
        delivered=delivered,
        read=read_cnt,
        failed=failed,
        cancelled=cancelled,
        unread=unread,
        channel_breakdown=channel_counts
    )


# ---------------------------------------------------------------------------
# 14. System Overview & Export Summary
# ---------------------------------------------------------------------------

def get_system_overview_metrics(db: Session) -> SystemOverviewResponse:
    return SystemOverviewResponse(
        total_users=db.query(User).count(),
        active_users=db.query(User).filter(User.is_active == True).count(),
        inactive_users=db.query(User).filter(User.is_active == False).count(),
        patients=db.query(Patient).count(),
        consultations=db.query(Consultation).count(),
        prescriptions=db.query(Prescription).count(),
        follow_ups=db.query(FollowUp).count(),
        documents=db.query(PatientDocument).count(),
        notifications=db.query(Notification).count(),
        ai_processing_records=db.query(AICaseResponse).count()
    )


def get_export_summary(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> ExportSummaryResponse:
    validate_date_range(date_from, date_to)
    now_iso = datetime.now(timezone.utc).isoformat()

    patients_ov = get_patient_overview_metrics(db, date_from, date_to).model_dump()
    consultations_ov = get_consultation_overview_metrics(db, date_from, date_to).model_dump()
    prescriptions_ov = get_prescription_overview_metrics(db, date_from, date_to).model_dump()
    follow_ups_ov = get_follow_up_overview_metrics(db, date_from, date_to).model_dump()
    queue_ov = get_queue_overview_metrics(db, date_from, date_to).model_dump()

    consolidated = {
        "patients": patients_ov,
        "consultations": consultations_ov,
        "prescriptions": prescriptions_ov,
        "follow_ups": follow_ups_ov,
        "queue": queue_ov,
    }

    return ExportSummaryResponse(
        exported_at=now_iso,
        filter_range={
            "date_from": str(date_from) if date_from else None,
            "date_to": str(date_to) if date_to else None,
        },
        summary=consolidated
    )
