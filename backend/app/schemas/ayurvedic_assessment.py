from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.ayurvedic_assessment import (
    AgniType,
    AssessmentStatus,
    PrakritiType,
    VikritiType,
)


# ---------------- Ashtavidha Pariksha Schemas ---------------- #

class AshtavidhaBase(BaseModel):
    nadi: Optional[str] = Field(None, description="Pulse examination observation (e.g., Sarpa/Manduka/Hamsa gati)")
    mutra: Optional[str] = Field(None, description="Urine examination observation (color, frequency, clarity)")
    mala: Optional[str] = Field(None, description="Stool examination observation (consistency, color, floating/sinking)")
    jihva: Optional[str] = Field(None, description="Tongue examination observation (coating, color, moisture, fissures)")
    shabda: Optional[str] = Field(None, description="Voice/speech examination observation (clarity, hoarseness, tone)")
    sparsha: Optional[str] = Field(None, description="Touch/skin examination observation (temperature, dryness, texture)")
    druk: Optional[str] = Field(None, description="Eyes/vision observation (sclera color, luster, secretions)")
    akriti: Optional[str] = Field(None, description="General body build & posture observation (lean, moderate, heavy)")
    notes: Optional[str] = Field(None, description="General examination notes")


class AshtavidhaCreate(AshtavidhaBase):
    pass


class AshtavidhaUpdate(AshtavidhaBase):
    pass


class AshtavidhaResponse(AshtavidhaBase):
    id: int
    assessment_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Dashavidha Pariksha Schemas ---------------- #

class DashavidhaBase(BaseModel):
    prakriti: Optional[str] = Field(None, description="Constitution assessment observation")
    vikriti: Optional[str] = Field(None, description="Morbidity / Pathological state observation")
    sara: Optional[str] = Field(None, description="Tissue excellence / Dhatu essence observation")
    samhana: Optional[str] = Field(None, description="Body compactness / Structural integrity observation")
    pramana: Optional[str] = Field(None, description="Anthropometry / Body proportions observation")
    satmya: Optional[str] = Field(None, description="Habituation / Dietary adaptability observation")
    sattva: Optional[str] = Field(None, description="Mental strength / Psychological resilience observation")
    ahara_shakti: Optional[str] = Field(None, description="Digestive power & food intake capacity observation")
    vyayama_shakti: Optional[str] = Field(None, description="Physical endurance & exercise capacity observation")
    vaya: Optional[str] = Field(None, description="Age-appropriate developmental & vitality state observation")
    notes: Optional[str] = Field(None, description="General Dashavidha examination notes")


class DashavidhaCreate(DashavidhaBase):
    pass


class DashavidhaUpdate(DashavidhaBase):
    pass


class DashavidhaResponse(DashavidhaBase):
    id: int
    assessment_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Ayurvedic Assessment Schemas ---------------- #

class AyurvedicAssessmentBase(BaseModel):
    prakriti: PrakritiType = Field(
        default=PrakritiType.NOT_ASSESSED,
        description="Practitioner-recorded Prakriti (VATA, PITTA, KAPHA, dual-dosha, TRIDOSHA)"
    )
    vikriti: VikritiType = Field(
        default=VikritiType.NOT_ASSESSED,
        description="Practitioner-recorded Vikriti (current doshic imbalance)"
    )
    agni: AgniType = Field(
        default=AgniType.NOT_ASSESSED,
        description="Practitioner-recorded Agni state (SAMA, VISHAMA, TIKSHNA, MANDA)"
    )
    clinical_observation: Optional[str] = Field(None, description="Practitioner clinical observation summary")
    examination_notes: Optional[str] = Field(None, description="Physical examination notes")
    assessment_notes: Optional[str] = Field(None, description="Diagnostic & clinical reasoning notes")
    practitioner_observations: Optional[str] = Field(None, description="Free-text practitioner observations")


class AyurvedicAssessmentCreate(AyurvedicAssessmentBase):
    case_session_id: int = Field(..., description="ID of the consultation case session")
    ashtavidha: Optional[AshtavidhaCreate] = None
    dashavidha: Optional[DashavidhaCreate] = None


class AyurvedicAssessmentUpdate(BaseModel):
    prakriti: Optional[PrakritiType] = None
    vikriti: Optional[VikritiType] = None
    agni: Optional[AgniType] = None
    clinical_observation: Optional[str] = None
    examination_notes: Optional[str] = None
    assessment_notes: Optional[str] = None
    practitioner_observations: Optional[str] = None
    status: Optional[AssessmentStatus] = None


class AyurvedicAssessmentResponse(AyurvedicAssessmentBase):
    id: int
    case_session_id: int
    patient_id: int
    practitioner_id: Optional[int] = None
    status: AssessmentStatus
    is_practitioner_verified: bool
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CompleteAyurvedicAssessmentResponse(BaseModel):
    assessment: AyurvedicAssessmentResponse
    ashtavidha: Optional[AshtavidhaResponse] = None
    dashavidha: Optional[DashavidhaResponse] = None

    model_config = ConfigDict(from_attributes=True)
