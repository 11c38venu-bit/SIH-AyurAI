import logging
from datetime import datetime, timezone
from typing import Any, Optional

from app.core.config import settings
from app.models.ai_case_response import (
    AIProcessingStatus,
    PractitionerReviewStatus,
)
from app.models.ayurvedic_assessment import AyurvedicAssessment
from app.models.case import CaseSession
from app.models.case_response import CaseResponse
from app.models.medical_history import MedicalHistory
from app.schemas.ai_gemini import SourceCategory
from app.services.gemini_case_service import GeminiCaseService

logger = logging.getLogger(__name__)


class MockCaseService:
    """
    Deterministic Mock / Stub AI Provider for offline testing, local dev,
    and fast CI without requiring external API access.
    """

    MODEL_NAME = "MOCK-DEMO"
    MODEL_VERSION = "v1.0.0-stub"

    def process_case_response(
        self,
        case_response: CaseResponse,
        case_session: CaseSession
    ) -> dict[str, Any]:
        raw_text = (case_response.original_response or "").strip()
        lang = case_response.response_language or "en"
        question_code = case_response.question.question_code if case_response.question else ""

        if not raw_text:
            return {
                "processing_status": AIProcessingStatus.COMPLETED,
                "detected_language": lang,
                "standardized_text": "[Empty response provided]",
                "extracted_symptoms": None,
                "extracted_duration": None,
                "extracted_severity": None,
                "extracted_frequency": None,
                "extracted_triggers": None,
                "extracted_associated_factors": None,
                "extracted_medications": None,
                "extracted_conditions": None,
                "extracted_lifestyle_factors": None,
                "ai_notes": "Patient submitted an empty response. No symptoms extracted.",
                "practitioner_review_status": PractitionerReviewStatus.NOT_REVIEWED,
                "model_name": self.MODEL_NAME,
                "model_version": self.MODEL_VERSION,
                "processing_timestamp": datetime.now(timezone.utc),
            }

        if lang == "ta":
            standardized = f"[Tamil Input]: {raw_text} (AI-generated preliminary interpretation — practitioner review required)"
        elif lang == "hi":
            standardized = f"[Hindi Input]: {raw_text} (AI-generated preliminary interpretation — practitioner review required)"
        elif lang in ("ml", "te", "kn"):
            standardized = f"[{lang.upper()} Input]: {raw_text} (AI-generated preliminary interpretation — practitioner review required)"
        else:
            standardized = f"{raw_text} (AI-generated preliminary interpretation — practitioner review required)"

        extracted_symptoms: list[dict[str, Any]] = []
        extracted_duration: Optional[str] = None
        extracted_severity: Optional[str] = None
        extracted_triggers: list[dict[str, Any]] = []

        lower_text = raw_text.lower()

        if any(w in lower_text or w in raw_text for w in ["நாள்", "வார", "மாத", "दिन", "हफ्ते", "महीने", "day", "days", "week", "weeks", "month", "months", "year"]):
            extracted_duration = raw_text

        if any(w in lower_text or w in raw_text for w in ["severe", "கடுமையான", "तेज", "गंभीर", "mild", "moderate"]):
            extracted_severity = "Severe" if any(w in lower_text or w in raw_text for w in ["severe", "கடுமையான", "तेज"]) else "Moderate"

        if question_code in ("CHIEF_COMPLAINT_MAIN", "CURRENT_SYMPTOMS_LIST") or not question_code:
            if raw_text:
                extracted_symptoms.append({
                    "raw_text": raw_text,
                    "normalized_term": raw_text[:50],
                    "confidence": 0.85
                })

        now = datetime.now(timezone.utc)
        return {
            "processing_status": AIProcessingStatus.COMPLETED,
            "detected_language": lang,
            "standardized_text": standardized,
            "extracted_symptoms": extracted_symptoms if extracted_symptoms else None,
            "extracted_duration": extracted_duration,
            "extracted_severity": extracted_severity,
            "extracted_frequency": None,
            "extracted_triggers": extracted_triggers if extracted_triggers else None,
            "extracted_associated_factors": None,
            "extracted_medications": None,
            "extracted_conditions": None,
            "extracted_lifestyle_factors": None,
            "ai_notes": "Preliminary mock extraction — clinician review required before clinical decision.",
            "practitioner_review_status": PractitionerReviewStatus.NOT_REVIEWED,
            "model_name": self.MODEL_NAME,
            "model_version": self.MODEL_VERSION,
            "processing_timestamp": now,
        }

    def generate_case_summary(
        self,
        case_session: CaseSession,
        responses: list[CaseResponse],
        medical_history: Optional[MedicalHistory] = None,
        assessment: Optional[AyurvedicAssessment] = None,
        documents: Optional[list[Any]] = None
    ) -> dict[str, Any]:
        symptom_list: list[dict[str, Any]] = []
        structured_findings: list[dict[str, Any]] = []
        priority_indicators: list[dict[str, Any]] = []

        for r in responses:
            raw = r.original_response or ""
            q_title = r.question.question_text if r.question else f"Question #{r.question_id}"
            symptom_list.append({
                "question": q_title,
                "patient_response": raw,
                "language": r.response_language
            })

            # Check for potential priority indicators safely from raw wording
            lower_r = raw.lower()
            if any(w in lower_r for w in ["severe chest pain", "chest pain", "bleeding", "loss of consciousness", "severe breathing", "unconscious", "shortness of breath"]):
                priority_indicators.append({
                    "indicator": "Potential Severe Symptom Reported",
                    "source": SourceCategory.PATIENT_RESPONSE.value,
                    "evidence": raw[:120],
                    "reason_surfaced": "Patient explicitly reported urgent symptom indicator during intake",
                    "priority_level": "High",
                    "practitioner_review_status": "Practitioner review required."
                })

            structured_findings.append({
                "symptom": q_title,
                "original_wording": raw,
                "standardized_term": r.standardized_response or raw,
                "duration": "Not reported",
                "severity": "Severe" if "severe" in lower_r else "Not reported",
                "frequency": "Not reported",
                "associated_observations": [],
                "source": SourceCategory.PATIENT_RESPONSE.value
            })

        history_items: list[dict[str, Any]] = []
        structured_history: list[dict[str, Any]] = []
        medications: list[dict[str, Any]] = []
        allergies: list[dict[str, Any]] = []
        lifestyle: list[dict[str, Any]] = []

        if medical_history:
            if medical_history.past_medical_conditions:
                history_items.append({"category": "Past Medical Conditions", "details": medical_history.past_medical_conditions})
                structured_history.append({
                    "category": "Past Medical Conditions",
                    "details": medical_history.past_medical_conditions,
                    "source_category": SourceCategory.PATIENT_REPORTED.value
                })
            if medical_history.family_history:
                history_items.append({"category": "Family History", "details": medical_history.family_history})
                structured_history.append({
                    "category": "Family History",
                    "details": medical_history.family_history,
                    "source_category": SourceCategory.PATIENT_REPORTED.value
                })
            if medical_history.current_medications:
                medications.append({"medications": medical_history.current_medications})
                structured_history.append({
                    "category": "Current Medications",
                    "details": medical_history.current_medications,
                    "source_category": SourceCategory.PATIENT_REPORTED.value
                })
            if medical_history.allergies:
                allergies.append({"allergies": medical_history.allergies})
                structured_history.append({
                    "category": "Reported Allergies",
                    "details": medical_history.allergies,
                    "source_category": SourceCategory.PATIENT_REPORTED.value
                })
            if medical_history.lifestyle_history:
                lifestyle.append({"lifestyle": medical_history.lifestyle_history})
                structured_history.append({
                    "category": "Lifestyle & Habits",
                    "details": medical_history.lifestyle_history,
                    "source_category": SourceCategory.PATIENT_REPORTED.value
                })

        # Process document findings
        doc_findings: list[dict[str, Any]] = []
        verified_doc_summaries: list[str] = []
        if documents:
            for doc in documents:
                review_status_raw = str(getattr(doc, "practitioner_review_status", ""))
                is_reviewed = "ACCEPTED" in review_status_raw or "REVIEWED" in review_status_raw
                structured = getattr(doc, "practitioner_corrected_data", None) or getattr(doc, "structured_data", None) or {}
                doc_type = getattr(doc, "document_type", "Medical Document")
                doc_id = getattr(doc, "document_id", getattr(doc, "id", None))

                extracted_items = []
                if isinstance(structured, dict):
                    for lab in structured.get("laboratory_results", []):
                        if isinstance(lab, dict) and "text" in lab:
                            extracted_items.append(f"Lab: {lab['text']}")
                    for med in structured.get("medications", []):
                        if isinstance(med, dict) and "text" in med:
                            extracted_items.append(f"Med: {med['text']}")

                doc_findings.append({
                    "document_id": doc_id,
                    "document_type": doc_type,
                    "document_date": str(getattr(doc, "document_date", "")) if getattr(doc, "document_date", None) else None,
                    "extracted_findings": extracted_items if extracted_items else ["Text extracted via OCR/Document Intelligence"],
                    "source_reference": getattr(doc, "original_filename", f"Doc #{doc_id}"),
                    "extraction_status": str(getattr(doc, "processing_status", "COMPLETED")),
                    "review_status": "Practitioner-reviewed extraction" if is_reviewed else "Unreviewed extraction",
                    "clinical_safety_note": "Extracted from uploaded document — practitioner verification required."
                })
                if is_reviewed:
                    verified_doc_summaries.append(f"Document #{doc_id} ({doc_type}) - Verified by clinician")

        summary_lines = [
            f"Case Consultation #{case_session.id} Intake Synthesis (Patient ID: {case_session.patient_id}):",
            f"- Recorded Responses: {len(responses)} questions answered.",
        ]
        if assessment:
            summary_lines.append(f"- Reference Prakriti: {assessment.prakriti.value} | Vikriti: {assessment.vikriti.value} | Agni: {assessment.agni.value}")
        if allergies:
            summary_lines.append(f"- Recorded Allergies: {medical_history.allergies if medical_history else 'None'}")
        if verified_doc_summaries:
            summary_lines.append(f"- Verified Medical Documents: {'; '.join(verified_doc_summaries)}")

        summary_lines.append("\nNote: AI-assisted summary — practitioner review required. AI output is informational and does not replace professional clinical judgment.")
        summary_text = "\n".join(summary_lines)

        # Assemble refined structured summary dossier
        structured_dossier = {
            "case_overview": {
                "patient_id": case_session.patient_id,
                "case_session_id": case_session.id,
                "chief_complaint": responses[0].original_response if responses else "Not reported",
                "duration": "Not reported",
                "major_reported_concerns": [r.original_response[:60] for r in responses[:3]] if responses else [],
                "patient_language": responses[0].response_language if responses else "en"
            },
            "patient_reported_findings": structured_findings,
            "medical_history": structured_history,
            "document_findings": doc_findings,
            "ayurvedic_reference_data": {
                "prakriti": assessment.prakriti.value if assessment and assessment.prakriti else "Not assessed",
                "vikriti": assessment.vikriti.value if assessment and assessment.vikriti else "Not assessed",
                "agni": assessment.agni.value if assessment and assessment.agni else "Not assessed",
                "clinical_note": "Existing practitioner-entered/reference data only. AI does not compute or infer Dosha classifications."
            },
            "potential_priority_indicators": priority_indicators,
            "information_quality": "SUFFICIENT" if len(responses) >= 3 else ("PARTIAL" if responses else "NOT_AVAILABLE"),
            "source_metadata": {
                "sources_used": [SourceCategory.PATIENT_RESPONSE.value],
                "total_responses": len(responses),
                "has_medical_history": bool(medical_history),
                "has_assessment": bool(assessment),
                "has_documents": bool(documents),
                "provider_mode": "MOCK-DEMO"
            },
            "clinical_safety_note": (
                "AI-assisted summary — practitioner review required. "
                "AI output is informational and does not replace professional clinical judgment."
            )
        }

        return {
            "summary_status": AIProcessingStatus.COMPLETED,
            "summary_text": summary_text,
            "key_symptoms": symptom_list if symptom_list else None,
            "relevant_history": history_items if history_items else None,
            "current_medications": medications if medications else None,
            "reported_allergies": allergies if allergies else None,
            "lifestyle_factors": lifestyle if lifestyle else None,
            "structured_summary": structured_dossier,
            "information_quality": structured_dossier["information_quality"],
            "generated_by_model": self.MODEL_NAME,
            "model_version": self.MODEL_VERSION,
            "practitioner_review_status": PractitionerReviewStatus.NOT_REVIEWED,
        }


class AICaseService:
    """
    Pluggable AI Service Provider Manager.
    Dynamically routes case interpretation and synthesis to either:
    - GeminiCaseService (Google Gemini via google-genai)
    - MockCaseService (Deterministic mock/stub)
    """

    def __init__(self):
        self.mock_provider = MockCaseService()
        self.gemini_provider = GeminiCaseService()

    def get_active_provider(self):
        provider_name = (settings.AI_PROVIDER or "mock").strip().lower()
        if provider_name == "gemini":
            return self.gemini_provider
        return self.mock_provider

    def process_case_response(
        self,
        case_response: CaseResponse,
        case_session: CaseSession
    ) -> dict[str, Any]:
        provider = self.get_active_provider()
        return provider.process_case_response(
            case_response=case_response,
            case_session=case_session
        )

    def generate_case_summary(
        self,
        case_session: CaseSession,
        responses: list[CaseResponse],
        medical_history: Optional[MedicalHistory] = None,
        assessment: Optional[AyurvedicAssessment] = None,
        documents: Optional[list[Any]] = None
    ) -> dict[str, Any]:
        provider = self.get_active_provider()
        return provider.generate_case_summary(
            case_session=case_session,
            responses=responses,
            medical_history=medical_history,
            assessment=assessment,
            documents=documents
        )


ai_case_service = AICaseService()
