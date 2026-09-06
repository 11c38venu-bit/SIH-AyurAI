import enum
from datetime import date as DateType, datetime as DateTimeType
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class GranularityType(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class TimeSeriesDataPoint(BaseModel):
    date: str
    count: int


# ---------------------------------------------------------------------------
# Dashboard Schemas
# ---------------------------------------------------------------------------

class DoctorDashboardResponse(BaseModel):
    date: str
    patients_today: int
    queue_waiting: int
    consultations_today: int
    consultations_completed_today: int
    follow_ups_today: int
    upcoming_follow_ups: int
    pending_progress_records: int
    unread_notifications: int

    model_config = ConfigDict(from_attributes=True)


class StaffDashboardResponse(BaseModel):
    date: str
    patients_registered_today: int
    patients_waiting: int
    patients_in_consultation: int
    completed_consultations: int
    pending_case_taking_sessions: int
    todays_follow_ups: int
    missed_follow_ups: int
    unread_staff_notifications: int
    documents_awaiting_processing_review: int

    model_config = ConfigDict(from_attributes=True)


class AdminDashboardResponse(BaseModel):
    date: str
    total_patients: int
    new_patients_today: int
    new_patients_this_week: int
    new_patients_this_month: int
    total_doctors: int
    total_staff: int
    active_users: int
    inactive_users: int
    total_consultations: int
    total_prescriptions: int
    total_follow_ups: int
    total_notifications: int
    total_documents: int
    total_ai_processing_records: int

    model_config = ConfigDict(from_attributes=True)


class RoleDashboardSummaryResponse(BaseModel):
    role: str
    summary: Dict[str, Any]


# ---------------------------------------------------------------------------
# Patient Analytics Schemas
# ---------------------------------------------------------------------------

class PatientOverviewResponse(BaseModel):
    total_patients: int
    new_patients_today: int
    new_patients_this_week: int
    new_patients_this_month: int
    registration_trend: List[TimeSeriesDataPoint]


class PatientTrendResponse(BaseModel):
    granularity: str
    trend: List[TimeSeriesDataPoint]


# ---------------------------------------------------------------------------
# Queue Analytics Schemas
# ---------------------------------------------------------------------------

class QueueOverviewResponse(BaseModel):
    waiting: int
    called: int
    in_consultation: int
    completed: int
    cancelled: int
    total_today: int
    priority_count: int
    average_wait_time_minutes: Optional[float] = None


class QueueTrendPoint(BaseModel):
    date: str
    registered: int
    completed: int
    cancelled: int
    missed: int


class QueueTrendResponse(BaseModel):
    granularity: str
    trend: List[QueueTrendPoint]


# ---------------------------------------------------------------------------
# Consultation Analytics Schemas
# ---------------------------------------------------------------------------

class ConsultationOverviewResponse(BaseModel):
    total_consultations: int
    draft: int
    in_progress: int
    completed: int
    cancelled: int
    completion_rate: Optional[float] = None


class ConsultationTrendPoint(BaseModel):
    date: str
    consultation_count: int
    completed_count: int
    cancelled_count: int


class ConsultationTrendResponse(BaseModel):
    granularity: str
    trend: List[ConsultationTrendPoint]


# ---------------------------------------------------------------------------
# Doctor Workload Schemas
# ---------------------------------------------------------------------------

class DoctorWorkloadItem(BaseModel):
    doctor_id: int
    doctor_name: str
    consultations_completed: int
    consultations_in_progress: int
    follow_ups_assigned: int
    follow_ups_completed: int


class DoctorWorkloadResponse(BaseModel):
    doctors: List[DoctorWorkloadItem]


# ---------------------------------------------------------------------------
# Follow-Up Analytics Schemas
# ---------------------------------------------------------------------------

class FollowUpOverviewResponse(BaseModel):
    scheduled: int
    confirmed: int
    completed: int
    missed: int
    cancelled: int
    due_today: int
    upcoming: int
    completion_rate: Optional[float] = None


class FollowUpTrendPoint(BaseModel):
    date: str
    scheduled: int
    completed: int
    missed: int
    cancelled: int


class FollowUpTrendResponse(BaseModel):
    granularity: str
    trend: List[FollowUpTrendPoint]


# ---------------------------------------------------------------------------
# Progress Analytics Schemas
# ---------------------------------------------------------------------------

class ProgressOverviewResponse(BaseModel):
    note: str = "Practitioner-entered observations"
    total_progress_records: int
    improving_observations: int
    stable_observations: int
    worsening_observations: int
    fluctuating_observations: int
    not_assessed_observations: int
    outcome_improved: int
    outcome_stable: int
    outcome_not_improved: int
    outcome_worsened: int
    outcome_inconclusive: int
    outcome_not_assessed: int


class ProgressTrendPoint(BaseModel):
    date: str
    improving: int
    stable: int
    worsening: int
    fluctuating: int
    not_assessed: int


class ProgressTrendResponse(BaseModel):
    note: str = "Practitioner-entered observation counts"
    granularity: str
    trend: List[ProgressTrendPoint]


# ---------------------------------------------------------------------------
# Prescription Analytics Schemas
# ---------------------------------------------------------------------------

class PrescriptionOverviewResponse(BaseModel):
    total_prescriptions: int
    draft: int
    finalized: int
    cancelled: int
    prescriptions_by_medicine_category: Dict[str, int]


class MedicineCategoryDistributionItem(BaseModel):
    category: str
    count: int


class MedicineCategoryDistributionResponse(BaseModel):
    note: str = "Prescription usage statistics only"
    categories: List[MedicineCategoryDistributionItem]


# ---------------------------------------------------------------------------
# Document Analytics Schemas
# ---------------------------------------------------------------------------

class DocumentOverviewResponse(BaseModel):
    total_documents: int
    pdf_count: int
    image_count: int
    processed_count: int
    pending_processing: int
    failed_processing: int
    ai_reviewed: int
    ocr_processed: int


# ---------------------------------------------------------------------------
# AI Processing Analytics Schemas
# ---------------------------------------------------------------------------

class AIProcessingOverviewResponse(BaseModel):
    provider: str
    total_ai_processing_requests: int
    completed: int
    failed: int
    pending: int
    processing: int
    reviewed: int
    accepted: int
    corrected: int
    rejected: int


class AIProcessingTrendPoint(BaseModel):
    date: str
    processed: int
    completed: int
    failed: int
    reviewed: int


class AIProcessingTrendResponse(BaseModel):
    granularity: str
    trend: List[AIProcessingTrendPoint]


# ---------------------------------------------------------------------------
# Notification Analytics Schemas
# ---------------------------------------------------------------------------

class NotificationOverviewResponse(BaseModel):
    total_notifications: int
    pending: int
    sent: int
    delivered: int
    read: int
    failed: int
    cancelled: int
    unread: int
    channel_breakdown: Dict[str, int]


# ---------------------------------------------------------------------------
# System & Export Schemas
# ---------------------------------------------------------------------------

class SystemOverviewResponse(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    patients: int
    consultations: int
    prescriptions: int
    follow_ups: int
    documents: int
    notifications: int
    ai_processing_records: int


class ExportSummaryResponse(BaseModel):
    exported_at: str
    filter_range: Dict[str, Optional[str]]
    summary: Dict[str, Any]
