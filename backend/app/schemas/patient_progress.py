from datetime import date as DateType, datetime as DateTimeType
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.patient_progress import (
    AdherenceLevel,
    ClinicalOutcome,
    ProgressTrend,
    SymptomSeverity,
)


class PatientProgressBase(BaseModel):
    symptom_status: ProgressTrend = Field(ProgressTrend.NOT_ASSESSED, description="Observed symptom progression trend")
    symptom_change: Optional[str] = Field(None, description="Descriptive changes in symptoms since last review")
    symptom_severity: SymptomSeverity = Field(SymptomSeverity.NOT_ASSESSED, description="Current symptom severity level")
    patient_reported_improvement: Optional[str] = Field(None, description="Patient self-reported subjective improvements")
    patient_reported_concerns: Optional[str] = Field(None, description="Patient-reported concerns, new symptoms, or discomforts")
    medication_adherence: AdherenceLevel = Field(AdherenceLevel.NOT_REPORTED, description="Reported adherence to prescribed medicines")
    adverse_effects: Optional[str] = Field(None, description="Patient-reported adverse reactions or intolerance")
    lifestyle_adherence: AdherenceLevel = Field(AdherenceLevel.NOT_REPORTED, description="Reported compliance with Vihara and Dinacharya advice")
    dietary_adherence: AdherenceLevel = Field(AdherenceLevel.NOT_REPORTED, description="Reported compliance with Pathya/Apathya dietary advice")
    sleep_status: Optional[str] = Field(None, max_length=100, description="Sleep quality, duration, and patterns")
    appetite_status: Optional[str] = Field(None, max_length=100, description="Appetite / Agni status (e.g. Sama, Manda, Tikshna)")
    digestion_status: Optional[str] = Field(None, max_length=100, description="Digestion and post-meal comfort")
    energy_status: Optional[str] = Field(None, max_length=100, description="Vitality / Ojas and physical energy level")
    bowel_habit_status: Optional[str] = Field(None, max_length=100, description="Bowel regularity, frequency, and stool consistency")
    general_wellbeing: Optional[str] = Field(None, max_length=100, description="Overall subjective sense of health and well-being")
    doctor_observation: Optional[str] = Field(None, description="Doctor clinical physical and examination observations")
    doctor_assessment: Optional[str] = Field(None, description="Doctor synthesis of patient progress")
    clinical_outcome: ClinicalOutcome = Field(ClinicalOutcome.NOT_ASSESSED, description="Doctor-entered clinical outcome assessment")
    next_review_required: bool = Field(False, description="Whether another follow-up is recommended")
    next_review_notes: Optional[str] = Field(None, description="Notes on subsequent review timing or clinical targets")


class PatientProgressCreate(PatientProgressBase):
    patient_id: int = Field(..., description="Target patient ID")
    follow_up_id: int = Field(..., description="Linked follow-up appointment ID")
    follow_up_visit_id: int = Field(..., description="Linked follow-up encounter visit ID (1:1 constraint)")


class PatientProgressUpdate(BaseModel):
    symptom_status: Optional[ProgressTrend] = None
    symptom_change: Optional[str] = None
    symptom_severity: Optional[SymptomSeverity] = None
    patient_reported_improvement: Optional[str] = None
    patient_reported_concerns: Optional[str] = None
    medication_adherence: Optional[AdherenceLevel] = None
    adverse_effects: Optional[str] = None
    lifestyle_adherence: Optional[AdherenceLevel] = None
    dietary_adherence: Optional[AdherenceLevel] = None
    sleep_status: Optional[str] = Field(None, max_length=100)
    appetite_status: Optional[str] = Field(None, max_length=100)
    digestion_status: Optional[str] = Field(None, max_length=100)
    energy_status: Optional[str] = Field(None, max_length=100)
    bowel_habit_status: Optional[str] = Field(None, max_length=100)
    general_wellbeing: Optional[str] = Field(None, max_length=100)
    doctor_observation: Optional[str] = None
    doctor_assessment: Optional[str] = None
    clinical_outcome: Optional[ClinicalOutcome] = None
    next_review_required: Optional[bool] = None
    next_review_notes: Optional[str] = None


class PatientProgressAuditResponse(BaseModel):
    id: int
    progress_id: int
    user_id: Optional[int] = None
    action: str
    changed_fields: Optional[Any] = None
    created_at: Optional[DateTimeType] = None

    model_config = ConfigDict(from_attributes=True)


class PatientProgressPatientSummary(BaseModel):
    id: int
    patient_id: str
    full_name: str
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PatientProgressDoctorSummary(BaseModel):
    id: int
    full_name: str
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class PatientProgressFollowUpSummary(BaseModel):
    id: int
    follow_up_number: int
    scheduled_date: DateType
    status: str

    model_config = ConfigDict(from_attributes=True)


class PatientProgressResponse(PatientProgressBase):
    id: int
    patient_id: int
    follow_up_id: int
    follow_up_visit_id: int
    doctor_id: int
    recorded_at: DateTimeType
    created_at: Optional[DateTimeType] = None
    updated_at: Optional[DateTimeType] = None

    patient: Optional[PatientProgressPatientSummary] = None
    doctor: Optional[PatientProgressDoctorSummary] = None
    follow_up: Optional[PatientProgressFollowUpSummary] = None
    audit_logs: List[PatientProgressAuditResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProgressTimelineItem(BaseModel):
    progress_id: int
    follow_up_id: int
    follow_up_number: int
    visit_id: int
    visit_date: Optional[DateType] = None
    symptom_status: ProgressTrend
    symptom_change: Optional[str] = None
    severity: SymptomSeverity
    medication_adherence: AdherenceLevel
    lifestyle_adherence: AdherenceLevel
    dietary_adherence: AdherenceLevel
    adverse_effects: Optional[str] = None
    general_wellbeing: Optional[str] = None
    doctor_assessment: Optional[str] = None
    clinical_outcome: ClinicalOutcome
    recorded_at: DateTimeType

    model_config = ConfigDict(from_attributes=True)


class SymptomTrendItem(BaseModel):
    date: Optional[DateType] = None
    follow_up_number: int
    status: ProgressTrend
    severity: SymptomSeverity
    symptom_change: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdherenceHistoryItem(BaseModel):
    date: Optional[DateType] = None
    follow_up_number: int
    medication_adherence: AdherenceLevel
    lifestyle_adherence: AdherenceLevel
    dietary_adherence: AdherenceLevel

    model_config = ConfigDict(from_attributes=True)


class AdverseEffectItem(BaseModel):
    date: Optional[DateType] = None
    follow_up_number: int
    adverse_effects: str

    model_config = ConfigDict(from_attributes=True)


class ProgressComparisonResponse(BaseModel):
    from_record: PatientProgressResponse
    to_record: PatientProgressResponse
    changes: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class ProgressSummaryResponse(BaseModel):
    total_recorded_progress: int
    first_progress_date: Optional[DateType] = None
    latest_progress_date: Optional[DateType] = None
    latest_symptom_status: ProgressTrend
    latest_symptom_severity: SymptomSeverity
    latest_adherence: AdherenceLevel
    latest_clinical_outcome: ClinicalOutcome
    improving_observations_count: int
    stable_observations_count: int
    worsening_observations_count: int
    fluctuating_observations_count: int
    not_assessed_observations_count: int

    model_config = ConfigDict(from_attributes=True)


class PatientOutcomeResponse(BaseModel):
    latest_clinical_outcome: ClinicalOutcome
    historical_outcomes: List[Dict[str, Any]]
    latest_symptom_status: ProgressTrend
    latest_severity: SymptomSeverity
    latest_adherence: AdherenceLevel
    total_follow_ups: int
    last_recorded_date: Optional[DateTimeType] = None
    next_review_required: bool
    next_review_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LongitudinalWorkspaceResponse(BaseModel):
    patient: PatientProgressPatientSummary
    initial_consultation: Optional[Any] = None
    latest_assessment: Optional[Any] = None
    latest_prescription: Optional[Any] = None
    latest_progress: Optional[PatientProgressResponse] = None
    progress_timeline: List[ProgressTimelineItem] = []
    symptom_trend: List[SymptomTrendItem] = []
    adherence_history: List[AdherenceHistoryItem] = []
    outcome_history: List[Dict[str, Any]] = []
    upcoming_follow_ups: List[Any] = []
    disclaimer: str = (
        "Longitudinal patient progress records reflect practitioner- and patient-entered clinical observations. "
        "Clinical conclusions and treatment plans must be evaluated and confirmed by a qualified Ayurveda practitioner."
    )

    model_config = ConfigDict(from_attributes=True)
