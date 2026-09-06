from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class InformationQuality(str, Enum):
    SUFFICIENT = "SUFFICIENT"
    PARTIAL = "PARTIAL"
    LIMITED = "LIMITED"
    NOT_AVAILABLE = "NOT_AVAILABLE"


class SourceCategory(str, Enum):
    PATIENT_RESPONSE = "PATIENT_RESPONSE"
    MEDICAL_HISTORY = "MEDICAL_HISTORY"
    UPLOADED_DOCUMENT = "UPLOADED_DOCUMENT"
    OCR_EXTRACTION = "OCR_EXTRACTION"
    PRACTITIONER_ASSESSMENT = "PRACTITIONER_ASSESSMENT"
    EXISTING_CASE_DATA = "EXISTING_CASE_DATA"
    PATIENT_REPORTED = "PATIENT_REPORTED"
    DOCUMENT_DERIVED = "DOCUMENT_DERIVED"
    PRACTITIONER_ENTERED = "PRACTITIONER_ENTERED"


class AIExtractedSymptom(BaseModel):
    raw_text: str = Field(..., description="Original phrasing of symptom as mentioned by patient")
    normalized_term: str = Field(..., description="Standardized clinical English term for the symptom")
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0"
    )


class AIExtractedEntity(BaseModel):
    text: str = Field(..., description="Extracted entity text")
    category: Optional[str] = Field(None, description="Category or subtype of the entity")
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0"
    )


class AIGeminiResponsePayload(BaseModel):
    detected_language: str = Field(
        ...,
        description="ISO language code or name (e.g. 'en', 'ta', 'hi', 'ml', 'te', 'kn')"
    )
    standardized_text: str = Field(
        ...,
        description="Faithful English translation and clinical standardization of the patient's response. Do not add diagnoses or opinions."
    )
    extracted_symptoms: Optional[list[AIExtractedSymptom]] = Field(
        default_factory=list,
        description="List of extracted symptoms with confidence scores"
    )
    extracted_duration: Optional[str] = Field(
        None,
        description="Duration of symptom (e.g. '3 days', '2 weeks', 'since yesterday') if mentioned"
    )
    extracted_severity: Optional[str] = Field(
        None,
        description="Severity level (e.g. 'Mild', 'Moderate', 'Severe') if mentioned"
    )
    extracted_frequency: Optional[str] = Field(
        None,
        description="Frequency or timing (e.g. 'Constant', 'Intermittent', 'Post-meal') if mentioned"
    )
    extracted_triggers: Optional[list[AIExtractedEntity]] = Field(
        default_factory=list,
        description="Triggers or aggravating factors mentioned by patient"
    )
    extracted_associated_factors: Optional[list[AIExtractedEntity]] = Field(
        default_factory=list,
        description="Associated symptoms or relieving factors mentioned"
    )
    extracted_medications: Optional[list[AIExtractedEntity]] = Field(
        default_factory=list,
        description="Medications, herbs, or home remedies explicitly mentioned"
    )
    extracted_conditions: Optional[list[AIExtractedEntity]] = Field(
        default_factory=list,
        description="Prior medical conditions explicitly mentioned"
    )
    extracted_lifestyle_factors: Optional[list[AIExtractedEntity]] = Field(
        default_factory=list,
        description="Diet, sleep, activity, or lifestyle habits mentioned"
    )
    uncertainties: Optional[list[str]] = Field(
        default_factory=list,
        description="Ambiguities or incomplete details requiring doctor clarification"
    )
    ai_notes: Optional[str] = Field(
        None,
        description="Preliminary clinical intake notes for the practitioner"
    )


# ---------------- Refined Module 18 Structured Summary Schemas ---------------- #

class AIPatientReportedFinding(BaseModel):
    symptom: str = Field(..., description="Reported symptom or clinical finding")
    original_wording: Optional[str] = Field(None, description="Verbatim/colloquial patient phrasing in original language")
    standardized_term: Optional[str] = Field(None, description="Standardized clinical English term")
    duration: Optional[str] = Field(default="Not reported", description="Duration or timeline if explicitly reported; otherwise 'Not reported'")
    severity: Optional[str] = Field(default="Not reported", description="Severity level if explicitly reported; otherwise 'Not reported'")
    frequency: Optional[str] = Field(default="Not reported", description="Frequency or timing if explicitly reported; otherwise 'Not reported'")
    associated_observations: Optional[list[str]] = Field(default_factory=list, description="Associated patient-reported factors or triggers")
    source: str = Field(default="PATIENT_RESPONSE", description="Source category")


class AIMedicalHistoryItem(BaseModel):
    category: str = Field(..., description="Category (Past Medical Conditions, Allergies, Current Medications, Lifestyle, Family History)")
    details: str = Field(..., description="Recorded clinical information")
    source_category: str = Field(default="PATIENT_REPORTED", description="PATIENT_REPORTED | DOCUMENT_DERIVED | PRACTITIONER_ENTERED")


class AIDocumentFindingItem(BaseModel):
    document_id: Optional[int] = Field(None, description="Document ID reference")
    document_type: Optional[str] = Field(None, description="Document type (e.g. Lab Report, Discharge Summary, Prescription)")
    document_date: Optional[str] = Field(None, description="Date of document if recorded")
    extracted_findings: list[str] = Field(default_factory=list, description="Extracted findings from OCR / document intelligence")
    source_reference: Optional[str] = Field(None, description="Source document reference / filename")
    extraction_status: Optional[str] = Field(None, description="OCR / AI extraction status")
    review_status: str = Field(default="Unreviewed extraction", description="'Unreviewed extraction' or 'Practitioner-reviewed extraction'")
    clinical_safety_note: str = Field(
        default="Extracted from uploaded document — practitioner verification required.",
        description="Safety disclaimer for document-extracted findings"
    )


class AIAyurvedicReferenceData(BaseModel):
    prakriti: str = Field(default="Not assessed", description="Reference Prakriti classification entered by clinician")
    vikriti: str = Field(default="Not assessed", description="Reference Vikriti classification entered by clinician")
    agni: str = Field(default="Not assessed", description="Reference Agni state entered by clinician")
    ashtavidha_pariksha: Optional[dict[str, Any]] = Field(None, description="Reference Ashtavidha 8-fold examination findings")
    dashavidha_pariksha: Optional[dict[str, Any]] = Field(None, description="Reference Dashavidha 10-fold examination findings")
    clinical_note: str = Field(
        default="Existing practitioner-entered/reference data only. AI does not compute or infer Dosha classifications.",
        description="Ayurveda safety note"
    )


class AIPotentialPriorityIndicator(BaseModel):
    indicator: str = Field(..., description="Name of potential priority indicator / red flag")
    source: str = Field(..., description="Source: PATIENT_RESPONSE | MEDICAL_HISTORY | UPLOADED_DOCUMENT")
    evidence: str = Field(..., description="Exact or near-exact patient wording or document finding")
    reason_surfaced: str = Field(..., description="Reason this indicator was surfaced for clinical review")
    priority_level: str = Field(default="Moderate", description="Priority level: High | Moderate | Standard")
    practitioner_review_status: str = Field(
        default="Practitioner review required.",
        description="Review status indicating practitioner must evaluate finding"
    )


class AICaseOverview(BaseModel):
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    patient_language: Optional[str] = None
    chief_complaint: Optional[str] = None
    duration: Optional[str] = None
    major_reported_concerns: list[str] = Field(default_factory=list)
    case_session_id: Optional[int] = None


class AIRefinedSummaryPayload(BaseModel):
    case_overview: Optional[AICaseOverview] = None
    summary_text: str = Field(
        ...,
        description="Concise, factual clinical intake synthesis summarizing the patient's reported symptoms, timeline, and intake responses."
    )
    patient_reported_findings: list[AIPatientReportedFinding] = Field(
        default_factory=list,
        description="Structured patient-reported symptoms and findings"
    )
    medical_history: list[AIMedicalHistoryItem] = Field(
        default_factory=list,
        description="Structured past medical history with source attribution"
    )
    document_findings: list[AIDocumentFindingItem] = Field(
        default_factory=list,
        description="Findings derived from uploaded documents & OCR"
    )
    ayurvedic_reference_data: Optional[AIAyurvedicReferenceData] = None
    potential_priority_indicators: list[AIPotentialPriorityIndicator] = Field(
        default_factory=list,
        description="Structured potential priority indicators / safety alerts for practitioner review"
    )
    information_quality: str = Field(
        default="PARTIAL",
        description="Information completeness metric: SUFFICIENT | PARTIAL | LIMITED | NOT_AVAILABLE (Reflects intake data completeness, NOT clinical confidence)"
    )
    source_metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Summary of data sources utilized in synthesis"
    )
    clinical_safety_note: str = Field(
        default="AI-assisted summary — practitioner review required. AI output is informational and does not replace professional clinical judgment.",
        description="Mandatory clinical safety disclaimer"
    )
    clinical_notes_for_practitioner: Optional[str] = Field(
        None,
        description="Assistive notes for doctor review"
    )


class AIGeminiSummaryPayload(BaseModel):
    """
    Unified summary schema ensuring backwards compatibility with Module 8 tests
    while supporting the refined Module 18 multi-source clinical dimensions.
    """
    summary_text: str = Field(
        ...,
        description="Concise, factual clinical intake synthesis summarizing the patient's reported symptoms, timeline, and intake responses."
    )
    key_symptoms: Optional[list[dict[str, Any]]] = Field(
        default_factory=list,
        description="Structured key symptoms"
    )
    relevant_history: Optional[list[dict[str, Any]]] = Field(
        default_factory=list,
        description="Relevant past medical/family history mentioned"
    )
    current_medications: Optional[list[dict[str, Any]]] = Field(
        default_factory=list,
        description="Current medications reported"
    )
    reported_allergies: Optional[list[dict[str, Any]]] = Field(
        default_factory=list,
        description="Reported allergies"
    )
    lifestyle_factors: Optional[list[dict[str, Any]]] = Field(
        default_factory=list,
        description="Reported dietary and lifestyle habits"
    )
    clinical_notes_for_practitioner: Optional[str] = Field(
        None,
        description="Assistive notes for doctor review"
    )
    # Refined Module 18 Dimensions
    case_overview: Optional[AICaseOverview] = None
    patient_reported_findings: Optional[list[AIPatientReportedFinding]] = Field(default_factory=list)
    medical_history_items: Optional[list[AIMedicalHistoryItem]] = Field(default_factory=list)
    document_findings: Optional[list[AIDocumentFindingItem]] = Field(default_factory=list)
    ayurvedic_reference_data: Optional[AIAyurvedicReferenceData] = None
    potential_priority_indicators: Optional[list[AIPotentialPriorityIndicator]] = Field(default_factory=list)
    information_quality: Optional[str] = "PARTIAL"
    source_metadata: Optional[dict[str, Any]] = Field(default_factory=dict)
    clinical_safety_note: Optional[str] = (
        "AI-assisted summary — practitioner review required. "
        "AI output is informational and does not replace professional clinical judgment."
    )
